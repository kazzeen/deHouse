import { openDB } from 'idb';

// Database service for storing and retrieving donation data
class DatabaseService {
  constructor() {
    this.dbPromise = this.initDatabase();
  }

  // Initialize the database
  async initDatabase() { /* ... same as before ... */
    console.log('[DB] Initializing database deHouseDB...');
    return openDB('deHouseDB', 2, {
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

}

const databaseService = new DatabaseService();
export default databaseService;