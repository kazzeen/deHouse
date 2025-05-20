import { openDB } from 'idb';

// Database service for storing and retrieving donation data
class DatabaseService {
  constructor() {
    this.dbPromise = this.initDatabase();
  }

  // Initialize the database
  async initDatabase() {
    console.log('[DB] Initializing database deHouseDB...');
    return openDB('deHouseDB', 3, { // Increment version to 3 for the new users store
      upgrade: (db, oldVersion, newVersion, transaction) => {
        console.log(`[DB] Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        // Donations Store
        let donationStore = db.objectStoreNames.contains('donations') ? transaction.objectStore('donations') : db.createObjectStore('donations', { keyPath: 'id' });
        if (!donationStore.indexNames.contains('walletAddress')) donationStore.createIndex('walletAddress', 'walletAddress', { unique: false });
        if (!donationStore.indexNames.contains('timestamp')) donationStore.createIndex('timestamp', 'timestamp', { unique: false });
        if (!donationStore.indexNames.contains('txHash')) { try { donationStore.createIndex('txHash', 'txHash', { unique: true }); } catch (e) { console.error("[DB] Failed create unique txHash index", e);}}
        
        // Leaderboard Store
        let leaderboardStore = db.objectStoreNames.contains('leaderboard') ? transaction.objectStore('leaderboard') : db.createObjectStore('leaderboard', { keyPath: 'walletAddress' });
        if (!leaderboardStore.indexNames.contains('points')) leaderboardStore.createIndex('points', 'points', { unique: false });
        
        // Users Store - New in version 3
        if (oldVersion < 3) {
          console.log("[DB] Creating users store...");
          let usersStore = db.objectStoreNames.contains('users') ? transaction.objectStore('users') : db.createObjectStore('users', { keyPath: 'walletAddress' });
          if (!usersStore.indexNames.contains('username')) usersStore.createIndex('username', 'username', { unique: true });
          if (!usersStore.indexNames.contains('lastLogin')) usersStore.createIndex('lastLogin', 'lastLogin', { unique: false });
          console.log("[DB] Users store created.");
        }
        
        console.log("[DB] Database upgrade complete.");
      },
      blocked: () => { console.error('[DB] Database is blocked.'); alert('Database access blocked. Please close other tabs/windows accessing this page and refresh.'); },
      blocking: () => { console.warn('[DB] Database upgrade blocked. Close other tabs.'); },
      terminated: () => { console.error('[DB] Database connection terminated.'); }
    }).catch(err => { console.error("[DB] Failed to open database:", err); throw err; });
  }

  // Add a donation and update leaderboard atomically
  async addDonation(donation) {
    // Stricter validation at entry point
    if (!donation || !donation.walletAddress || !donation.txHash || !donation.id || donation.points == null || isNaN(donation.points) || donation.usdValue == null || isNaN(donation.usdValue)) {
      console.error('[DB AddDonation] Invalid or incomplete donation data provided:', donation);
      throw new Error('Invalid or incomplete donation data for addDonation');
    }

    const db = await this.dbPromise;
    const tx = db.transaction(['donations', 'leaderboard'], 'readwrite');
    const donationStore = tx.objectStore('donations');
    const leaderboardStore = tx.objectStore('leaderboard');
    const normalizedWalletAddress = donation.walletAddress.toLowerCase(); // Normalize ONCE

    console.log(`[DB AddDonation] START Tx for Donation ID: ${donation.id} (TxHash: ${donation.txHash})`);

    try {
        // Prepare donation object with normalized address
        const donationToStore = { ...donation, walletAddress: normalizedWalletAddress };

        // 1. Add donation record
        console.log(`[DB AddDonation] Adding donation record:`, donationToStore);
        await donationStore.add(donationToStore);
        console.log(`[DB AddDonation] Added donation record ${donation.id}.`);

        // 2. Update leaderboard (pass normalized address)
        console.log(`[DB AddDonation] Updating leaderboard for ${normalizedWalletAddress}`);
        await this.updateLeaderboardInternal(leaderboardStore, normalizedWalletAddress, donation.points, donation.usdValue);

        // 3. Commit
        await tx.done;
        console.log(`[DB AddDonation] SUCCESS Tx committed for ${donation.id}.`);
        return donationToStore; // Return the stored object

    } catch (error) {
        console.error(`[DB AddDonation] FAIL Tx for ${donation.id} (Tx: ${donation.txHash}):`, error.name, error.message);
        // No need to abort, tx.done failing handles it.
        if (error.name === 'ConstraintError') {
             console.warn(`[DB AddDonation] ConstraintError (Likely Duplicate Tx): ${donation.txHash}`);
             return null; // Indicate duplicate gracefully
        }
        throw error; // Re-throw other critical errors
    }
  }

  // Internal leaderboard update (more logging)
  async updateLeaderboardInternal(leaderboardStore, normalizedWalletAddress, pointsToAdd, usdValueToAdd) {
      console.log(`[DB LB Update] Processing update for ${normalizedWalletAddress} | PointsToAdd: ${pointsToAdd} | USDToAdd: ${usdValueToAdd}`);
      const existingEntry = await leaderboardStore.get(normalizedWalletAddress);

      const currentPoints = existingEntry?.points || 0;
      const currentDonated = existingEntry?.totalDonated || 0;
      const currentCount = existingEntry?.donationCount || 0;

      console.log(`[DB LB Update] Existing data for ${normalizedWalletAddress}:`, existingEntry || '<None>');

      const newEntry = {
        walletAddress: normalizedWalletAddress,
        points: currentPoints + pointsToAdd,
        totalDonated: currentDonated + usdValueToAdd,
        donationCount: currentCount + 1,
        lastDonation: Date.now(),
      };

      // Sanity checks
      if (isNaN(newEntry.points) || isNaN(newEntry.totalDonated) || isNaN(newEntry.donationCount) || newEntry.points < 0 || newEntry.totalDonated < 0) {
           console.error("[DB LB Update] Calculated invalid (NaN or negative) value for leaderboard entry:", newEntry, "Existing:", existingEntry);
           throw new Error(`Cannot update leaderboard with invalid calculated value for ${normalizedWalletAddress}.`);
      }

      console.log(`[DB LB Update] Putting new/updated entry for ${normalizedWalletAddress}:`, newEntry);
      await leaderboardStore.put(newEntry); // Insert or update
      console.log(`[DB LB Update] Successfully put entry for ${normalizedWalletAddress}`);
  }

  // --- Other methods (getDonationsByWallet, getAllDonations, transactionExists, getLeaderboard, getUserRank, getUserStats) ---
  // Ensure they use normalized addresses (lowercase) for lookups where applicable
  // and include basic try/catch logging.

  async getDonationsByWallet(walletAddress) { /* ... ensure lowercase filtering ... */
    if (!walletAddress) return [];
    const db = await this.dbPromise; const normalizedAddress = walletAddress.toLowerCase();
    try { const all = await db.getAllFromIndex('donations', 'walletAddress'); return all.filter(d => d.walletAddress === normalizedAddress); } // Safest filter
    catch (e) { console.error(`[DB getDonationsByWallet] Error for ${normalizedAddress}:`, e); return []; }
  }
  async getAllDonations() { /* ... add try/catch ... */
    const db = await this.dbPromise; try { return await db.getAll('donations'); } catch(e) { console.error("[DB getAllDonations] Error:", e); return []; }
  }
  async transactionExists(txHash) { /* ... add try/catch ... */
    if (!txHash) return false; const db = await this.dbPromise;
    try { const res = await db.getFromIndex('donations', 'txHash', txHash); return !!res; }
    catch(e) { console.error(`[DB transactionExists] Error for ${txHash}:`, e); return false; }
  }
  async getLeaderboard() {
    console.log("[DB] Fetching leaderboard data...");
    const db = await this.dbPromise;
    try {
      const all = await db.getAll('leaderboard');
      console.log(`[DB] Found ${all.length} leaderboard entries.`);

      // Ensure all entries have valid wallet addresses and points
      const validEntries = all.filter(entry => {
        // More strict validation to prevent glitches
        return entry &&
               typeof entry.walletAddress === 'string' &&
               entry.walletAddress.trim() !== '' &&
               !isNaN(entry.points) &&
               entry.points >= 0;
      });
      console.log(`[DB] Valid entries: ${validEntries.length} of ${all.length}`);

      const sorted = validEntries.sort((a, b) => (b.points || 0) - (a.points || 0) || (a.lastDonation || 0) - (b.lastDonation || 0));
      console.log("[DB] Top 5 Leaderboard:", sorted.slice(0, 5).map(e => ({addr: e.walletAddress, pts: e.points}))); // Log relevant parts
      return sorted;
    } catch (e) { console.error("[DB getLeaderboard] Error:", e); return []; }
  }
  async getUserRank(walletAddress) { /* ... ensure lowercase ... */
    if (!walletAddress) return null; const normAddr = walletAddress.toLowerCase();
    try { const board = await this.getLeaderboard(); const idx = board.findIndex(e => e.walletAddress === normAddr); const rank = idx !== -1 ? idx + 1 : null; console.log(`[DB getUserRank] Rank for ${normAddr}: ${rank}`); return rank; }
    catch (e) { console.error(`[DB getUserRank] Error for ${normAddr}:`, e); return null; }
  }
  async getUserStats(walletAddress) { /* ... ensure lowercase, add try/catch ... */
    const def = { points: 0, totalDonated: 0, donationCount: 0, lastDonation: 0 }; if (!walletAddress) return def; const normAddr = walletAddress.toLowerCase(); const db = await this.dbPromise;
    try { const entry = await db.get('leaderboard', normAddr); console.log(`[DB getUserStats] Stats for ${normAddr}:`, entry || def); return entry || def; }
    catch (e) { console.error(`[DB getUserStats] Error for ${normAddr}:`, e); return def; }
  }

  // Clear the entire database (both donations and leaderboard)
  async clearDatabase() {
    console.log('[DB] Clearing entire database...');
    const db = await this.dbPromise;
    try {
      // Use a transaction to ensure atomicity
      const tx = db.transaction(['donations', 'leaderboard'], 'readwrite');

      // Clear both stores
      await tx.objectStore('donations').clear();
      console.log('[DB] Donations store cleared');

      await tx.objectStore('leaderboard').clear();
      console.log('[DB] Leaderboard store cleared');

      // Wait for transaction to complete
      await tx.done;
      console.log('[DB] Database successfully cleared');
      return true;
    } catch (error) {
      console.error('[DB] Error clearing database:', error);
      return false;
    }
  }

  // Directly update the leaderboard with a donation
  async directUpdateLeaderboard(walletAddress, points, usdValue) {
    if (!walletAddress) {
      console.error('[DB] Cannot update leaderboard without wallet address');
      return false;
    }

    // Normalize the wallet address
    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log(`[DB] Directly updating leaderboard for ${normalizedWalletAddress} with ${points} points and $${usdValue} USD`);

    const db = await this.dbPromise;
    try {
      // Use a transaction to ensure atomicity
      const tx = db.transaction(['leaderboard'], 'readwrite');
      const leaderboardStore = tx.objectStore('leaderboard');

      // Get the existing entry for this wallet address
      const existingEntry = await leaderboardStore.get(normalizedWalletAddress);

      // Create a new entry or update the existing one
      const newEntry = {
        walletAddress: normalizedWalletAddress,
        points: (existingEntry?.points || 0) + points,
        totalDonated: (existingEntry?.totalDonated || 0) + usdValue,
        donationCount: (existingEntry?.donationCount || 0) + 1,
        lastDonation: Date.now()
      };

      // Sanity checks
      if (isNaN(newEntry.points) || isNaN(newEntry.totalDonated) || isNaN(newEntry.donationCount) || newEntry.points < 0 || newEntry.totalDonated < 0) {
        console.error('[DB] Calculated invalid (NaN or negative) value for leaderboard entry:', newEntry, 'Existing:', existingEntry);
        throw new Error(`Cannot update leaderboard with invalid calculated value for ${normalizedWalletAddress}.`);
      }

      // Update the leaderboard
      console.log(`[DB] Putting new/updated entry for ${normalizedWalletAddress}:`, newEntry);
      await leaderboardStore.put(newEntry);

      // Wait for transaction to complete
      await tx.done;
      console.log(`[DB] Successfully updated leaderboard for ${normalizedWalletAddress}`);
      return true;
    } catch (error) {
      console.error(`[DB] Error updating leaderboard for ${normalizedWalletAddress}:`, error);
      return false;
    }
  }

  // ===== USER ACCOUNT METHODS =====

  // Register a new user or update existing user
  async registerUser(walletAddress, userData = {}) {
    if (!walletAddress) {
      console.error('[DB] Cannot register user without wallet address');
      return false;
    }

    // Normalize the wallet address
    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log(`[DB] Registering/updating user for wallet: ${normalizedWalletAddress}`);

    // Check if this is the admin wallet address
    const isAdmin = normalizedWalletAddress === 'fh9cjfz3gvffbnvlviyfxxpnm52xwbygeeuLp2qovc2t'.toLowerCase();

    const db = await this.dbPromise;
    try {
      // Check if user already exists
      const existingUser = await db.get('users', normalizedWalletAddress);
      
      // Prepare user data
      const timestamp = Date.now();
      const userToStore = {
        walletAddress: normalizedWalletAddress,
        username: userData.username || existingUser?.username || `user_${normalizedWalletAddress.substring(0, 8)}`,
        email: userData.email || existingUser?.email || '',
        profileImage: userData.profileImage || existingUser?.profileImage || '',
        bio: userData.bio || existingUser?.bio || '',
        createdAt: existingUser?.createdAt || timestamp,
        lastLogin: timestamp,
        isAdmin: isAdmin, // Set admin flag based on wallet address
        settings: userData.settings || existingUser?.settings || {}
      };

      // Validate username if provided
      if (userData.username && userData.username !== existingUser?.username) {
        // Check if username is already taken
        const usernameIndex = db.transaction('users').store.index('username');
        const existingUsername = await usernameIndex.get(userData.username);
        if (existingUsername && existingUsername.walletAddress !== normalizedWalletAddress) {
          console.error(`[DB] Username '${userData.username}' is already taken`);
          return { success: false, error: 'Username already taken' };
        }
      }

      // Store user data
      await db.put('users', userToStore);
      console.log(`[DB] Successfully registered/updated user for ${normalizedWalletAddress}`);
      return { success: true, user: userToStore };
    } catch (error) {
      console.error(`[DB] Error registering user for ${normalizedWalletAddress}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get user by wallet address
  async getUser(walletAddress) {
    if (!walletAddress) {
      console.error('[DB] Cannot get user without wallet address');
      return null;
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();
    const db = await this.dbPromise;
    
    try {
      const user = await db.get('users', normalizedWalletAddress);
      console.log(`[DB] Retrieved user for ${normalizedWalletAddress}:`, user || 'Not found');
      return user;
    } catch (error) {
      console.error(`[DB] Error getting user for ${normalizedWalletAddress}:`, error);
      return null;
    }
  }

  // Login user (update last login timestamp)
  async loginUser(walletAddress) {
    if (!walletAddress) {
      console.error('[DB] Cannot login user without wallet address');
      return { success: false, error: 'Wallet address required' };
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log(`[DB] Logging in user with wallet: ${normalizedWalletAddress}`);

    // Check if this is the admin wallet address
    const isAdmin = normalizedWalletAddress === 'fh9cjfz3gvffbnvlviyfxxpnm52xwbygeeuLp2qovc2t'.toLowerCase();
    console.log(`[DB] Admin check for ${normalizedWalletAddress}: ${isAdmin}`);

    const db = await this.dbPromise;
    try {
      // Check if user exists
      const existingUser = await db.get('users', normalizedWalletAddress);
      
      if (!existingUser) {
        // Auto-register new user on first login
        console.log(`[DB] User not found, auto-registering: ${normalizedWalletAddress}`);
        const result = await this.registerUser(normalizedWalletAddress);
        
        // Add admin flag if this is the admin wallet
        if (isAdmin && result.success) {
          result.user.isAdmin = true;
          await db.put('users', result.user);
          console.log(`[DB] Set admin privileges for ${normalizedWalletAddress}`);
        }
        
        return result;
      }
      
      // Update last login timestamp and admin status
      existingUser.lastLogin = Date.now();
      existingUser.isAdmin = isAdmin; // Always update admin status on login
      await db.put('users', existingUser);
      
      console.log(`[DB] User logged in successfully: ${normalizedWalletAddress}${isAdmin ? ' (Admin)' : ''}`);
      return { success: true, user: existingUser };
    } catch (error) {
      console.error(`[DB] Error logging in user for ${normalizedWalletAddress}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateUserProfile(walletAddress, profileData) {
    if (!walletAddress || !profileData) {
      console.error('[DB] Cannot update user profile without wallet address and profile data');
      return { success: false, error: 'Wallet address and profile data required' };
    }

    const normalizedWalletAddress = walletAddress.toLowerCase();
    console.log(`[DB] Updating profile for wallet: ${normalizedWalletAddress}`);

    return await this.registerUser(normalizedWalletAddress, profileData);
  }

  // Get all users
  async getAllUsers() {
    console.log('[DB] Fetching all users...');
    const db = await this.dbPromise;
    
    try {
      const users = await db.getAll('users');
      console.log(`[DB] Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      console.error('[DB] Error getting all users:', error);
      return [];
    }
  }

  // Get total amount raised from all donations
  async getTotalRaisedAmount() {
    console.log('[DB] Calculating total raised amount...');
    const db = await this.dbPromise;
    try {
      const leaderboardEntries = await db.getAll('leaderboard');
      const totalRaised = leaderboardEntries.reduce((sum, entry) => {
        // Ensure totalDonated is a number and add it to the sum
        const donatedAmount = parseFloat(entry.totalDonated);
        return sum + (isNaN(donatedAmount) ? 0 : donatedAmount);
      }, 0);
      console.log(`[DB] Total raised amount: $${totalRaised.toFixed(2)}`);
      return totalRaised;
    } catch (error) {
      console.error('[DB] Error calculating total raised amount:', error);
      return 0; // Return 0 in case of an error
    }
  }

}

const databaseService = new DatabaseService();
export default databaseService;