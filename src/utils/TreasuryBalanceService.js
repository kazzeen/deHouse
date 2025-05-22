/**
 * Service for fetching treasury wallet balances and calculating total funds raised
 */

// Constants for treasury wallet addresses
const BTC_ADDRESSES = {
  legacy: '1Kr3GkJnBZeeQZZoiYjHoxhZjDsSby9d4p',
  taproot: 'bc1pl6sq6srs5vuczd7ard896cc57gg4h3mdnvjsg4zp5zs2rawqmtgsp4hh08',
  segwit: 'bc1qu7suxfua5x46e59e7a56vd8wuj3a8qj06qr42j'
};

const ETH_ADDRESS = '0x8262ab131e3f52315d700308152e166909ecfa47';
const SOL_ADDRESS = '2n8etcRuK49GUMXWi2QRtQ8YwS6nTDEUjfX7LcvKFyiV';

// API endpoints
const BLOCKSTREAM_API = 'https://blockstream.info/api';
const BLOCKCHAIN_INFO_API = 'https://blockchain.info';

// Ethereum APIs - multiple reliable sources
const ETHERSCAN_API = 'https://api.etherscan.io/api';
const ETHERSCAN_API_KEY = 'NSZCD6S4TKVJ3WVF2K27DCCH41EV5NKBFY'; // Using a valid API key
const BLOCKCHAIR_ETH_API = 'https://api.blockchair.com/ethereum';
const ETHPLORER_API = 'https://api.ethplorer.io';
const ALCHEMY_ETH_API = 'https://eth-mainnet.g.alchemy.com/v2';
const ALCHEMY_API_KEY = 'demo'; // Using demo key for public endpoint

// Solana APIs - multiple reliable sources with fallbacks
const SOLANA_RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',           // Official Solana RPC
  'https://solana-mainnet.rpc.extrnode.com',      // ExtrNode RPC
  'https://solana.api.chainstack.com/primary',    // Chainstack RPC
  'https://mainnet.solana-rpc.com',               // Community RPC
  'https://solana-api.projectserum.com',          // Project Serum RPC
  'https://ssc-dao.genesysgo.net',                // GenesysGo RPC
  'https://rpc.ankr.com/solana',                  // Ankr RPC
  'https://solana-mainnet.g.alchemy.com/v2/demo', // Alchemy RPC (demo)
  'https://solana.getblock.io/mainnet/',          // GetBlock RPC
  'https://solana.blockdaemon.com/rpc/v1'         // Blockdaemon RPC
];

// Third-party API services for Solana
const SOLSCAN_API = 'https://public-api.solscan.io';
const SOLFLARE_API = 'https://api.solflare.com';
const SHYFT_API = 'https://api.shyft.to/sol/v1';
const SHYFT_API_KEY = '7rVeSXle8oRlKWe';
const HELIUS_API = 'https://mainnet.helius-rpc.com/?api-key=15319106-f1a1-4a5a-9c38-863bb1f2e247';
const QUICKNODE_API = 'https://solana-mainnet.core.chainstack.com/15319106-f1a1-4a5a-9c38-863bb1f2e247';
const TRITON_API = 'https://triton.api.metaplex.com/';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

class TreasuryBalanceService {
  constructor() {
    this.prices = {
      btc: 0,
      eth: 0,
      sol: 0
    };
    this.balances = {
      btc: 0,
      eth: 0,
      sol: 0
    };
    this.lastUpdated = null;
  }

  /**
   * Fetch current cryptocurrency prices from CoinGecko
   */
  async fetchPrices() {
    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      this.prices = {
        btc: data.bitcoin?.usd || 0,
        eth: data.ethereum?.usd || 0,
        sol: data.solana?.usd || 0
      };

      console.log('Fetched prices:', this.prices);
      return this.prices;
    } catch (error) {
      console.error('Error fetching cryptocurrency prices:', error);
      return this.prices;
    }
  }

  /**
   * Fetch Bitcoin balance for a specific address
   */
  async fetchBitcoinBalance(address) {
    try {
      // Try primary API first (Blockstream)
      try {
        const response = await fetch(`${BLOCKSTREAM_API}/address/${address}`);

        if (response.ok) {
          const data = await response.json();
          // Convert from satoshis to BTC
          const balanceSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
          console.log(`Blockstream API balance for ${address}: ${balanceSats} sats`);
          return balanceSats;
        }
      } catch (blockstreamError) {
        console.warn(`Blockstream API error for ${address}:`, blockstreamError);
        // Continue to fallback
      }

      // Fallback to blockchain.info API
      console.log(`Trying fallback API for ${address}...`);
      const fallbackResponse = await fetch(`${BLOCKCHAIN_INFO_API}/balance?active=${address}&cors=true`);

      if (!fallbackResponse.ok) {
        throw new Error(`Blockchain.info API error: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();

      if (!fallbackData[address]) {
        throw new Error(`No data returned for address ${address}`);
      }

      const balanceSats = fallbackData[address].final_balance;
      console.log(`Blockchain.info API balance for ${address}: ${balanceSats} sats`);
      return balanceSats;
    } catch (error) {
      console.error(`Error fetching Bitcoin balance for ${address}:`, error);
      return 0;
    }
  }

  /**
   * Fetch total Bitcoin balance across all treasury addresses
   */
  async fetchTotalBitcoinBalance() {
    try {
      const balances = await Promise.all([
        this.fetchBitcoinBalance(BTC_ADDRESSES.legacy),
        this.fetchBitcoinBalance(BTC_ADDRESSES.taproot),
        this.fetchBitcoinBalance(BTC_ADDRESSES.segwit)
      ]);

      // Sum all balances and convert from satoshis to BTC
      const totalSatoshis = balances.reduce((sum, balance) => sum + balance, 0);
      const totalBTC = totalSatoshis / 100000000; // Convert satoshis to BTC

      this.balances.btc = totalBTC;
      console.log('Total BTC balance:', totalBTC);
      return totalBTC;
    } catch (error) {
      console.error('Error fetching total Bitcoin balance:', error);
      return 0;
    }
  }

  /**
   * Fetch Ethereum balance
   */
  async fetchEthereumBalance() {
    try {
      console.log('Fetching Ethereum balance for address:', ETH_ADDRESS);

      // First try Etherscan API with a valid API key - most reliable source
      try {
        console.log('Fetching ETH balance from Etherscan...');
        const etherscanUrl = `${ETHERSCAN_API}?module=account&action=balance&address=${ETH_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(etherscanUrl, { timeout: 10000 });

        if (response.ok) {
          const data = await response.json();
          console.log('Etherscan API response:', JSON.stringify(data));

          if (data.status === '1' && data.result) {
            // Convert from wei to ETH (ensure we're using BigInt for large numbers)
            const balanceWei = BigInt(data.result);
            const balanceETH = Number(balanceWei) / 1e18;
            console.log('ETH balance from Etherscan:', balanceETH);

            // Now fetch ERC-20 token balances (USDC, USDT, DAI)
            try {
              console.log('Fetching ETH token balances from Etherscan...');
              const tokenUrl = `${ETHERSCAN_API}?module=account&action=tokenbalance&contractaddress=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&address=${ETH_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
              const tokenResponse = await fetch(tokenUrl);

              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                console.log('Etherscan USDC token API response:', JSON.stringify(tokenData));
                // USDC has 6 decimals
                if (tokenData.status === '1' && tokenData.result) {
                  const usdcBalance = Number(tokenData.result) / 1e6;
                  console.log('USDC balance:', usdcBalance);
                }
              }
            } catch (tokenError) {
              console.warn('Etherscan token API error:', tokenError);
            }

            this.balances.eth = balanceETH;
            return balanceETH;
          }
        } else {
          console.warn('Etherscan API response not OK:', response.status);
        }
      } catch (etherscanError) {
        console.warn('Etherscan API error:', etherscanError);
      }

      // Try Alchemy API - highly reliable alternative
      try {
        console.log('Fetching ETH balance from Alchemy...');
        const alchemyUrl = `${ALCHEMY_ETH_API}/${ALCHEMY_API_KEY}`;

        const response = await fetch(alchemyUrl, {
          timeout: 10000, // Added 10-second timeout
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBalance',
            params: [ETH_ADDRESS, 'latest']
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Alchemy API response:', JSON.stringify(data));

          if (data.result) {
            // Convert hex result to decimal and then to ETH
            const balanceWei = BigInt(data.result);
            const balanceETH = Number(balanceWei) / 1e18;

            console.log('ETH balance from Alchemy API:', balanceETH);

            this.balances.eth = balanceETH;
            return balanceETH;
          }
        } else {
          console.warn('Alchemy API response not OK:', response.status);
        }
      } catch (alchemyError) {
        console.warn('Alchemy API error:', alchemyError);
      }

      // Try Blockchair API
      try {
        console.log('Fetching ETH balance from Blockchair...');
        const blockchairUrl = `${BLOCKCHAIR_ETH_API}/dashboards/address/${ETH_ADDRESS}`;
        const response = await fetch(blockchairUrl, { timeout: 10000 }); // Added 10-second timeout

        if (response.ok) {
          const data = await response.json();
          console.log('Blockchair API response:', JSON.stringify(data));

          if (data.data && data.data[ETH_ADDRESS]) {
            const addressData = data.data[ETH_ADDRESS];
            const balanceWei = BigInt(addressData.address.balance || '0');
            const balanceETH = Number(balanceWei) / 1e18;

            console.log('ETH balance from Blockchair:', balanceETH);

            this.balances.eth = balanceETH;
            return balanceETH;
          }
        } else {
          console.warn('Blockchair API response not OK:', response.status);
        }
      } catch (blockchairError) {
        console.warn('Blockchair API error:', blockchairError);
      }

      // Try Ethplorer API
      try {
        console.log('Fetching ETH balance from Ethplorer...');
        const ethplorerUrl = `${ETHPLORER_API}/getAddressInfo/${ETH_ADDRESS}?apiKey=freekey`;
        const response = await fetch(ethplorerUrl, { timeout: 10000 }); // Added 10-second timeout

        if (response.ok) {
          const data = await response.json();
          console.log('Ethplorer API response:', JSON.stringify(data));

          // Get ETH balance
          const balanceETH = data.ETH?.balance || 0;
          console.log('ETH balance from Ethplorer:', balanceETH);

          // Also check for ERC-20 tokens (USDC, USDT, DAI)
          let tokenBalances = 0;
          if (data.tokens && Array.isArray(data.tokens)) {
            // Look for stablecoins
            const stablecoins = data.tokens.filter(token =>
              token.tokenInfo.symbol === 'USDC' ||
              token.tokenInfo.symbol === 'USDT' ||
              token.tokenInfo.symbol === 'DAI'
            );

            // Add their balances (converted to USD)
            stablecoins.forEach(token => {
              const decimals = parseInt(token.tokenInfo.decimals);
              const balance = token.balance / Math.pow(10, decimals);
              tokenBalances += balance; // Stablecoins are ~$1
              console.log(`${token.tokenInfo.symbol} balance:`, balance);
            });
          }

          // For now, we'll just use the ETH balance without adding tokens
          this.balances.eth = balanceETH;
          return balanceETH;
        } else {
          console.warn('Ethplorer API response not OK:', response.status);
        }
      } catch (ethplorerError) {
        console.warn('Ethplorer API error:', ethplorerError);
      }

      // Try Infura API
      try {
        console.log('Fetching ETH balance from Infura...');
        const infuraUrl = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'; // Public Infura endpoint

        const response = await fetch(infuraUrl, {
          timeout: 10000, // Added 10-second timeout
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBalance',
            params: [ETH_ADDRESS, 'latest']
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Infura API response:', JSON.stringify(data));

          if (data.result) {
            // Convert hex result to decimal and then to ETH
            const balanceWei = BigInt(data.result);
            const balanceETH = Number(balanceWei) / 1e18;

            console.log('ETH balance from Infura API:', balanceETH);

            this.balances.eth = balanceETH;
            return balanceETH;
          }
        } else {
          console.warn('Infura API response not OK:', response.status);
        }
      } catch (infuraError) {
        console.warn('Infura API error:', infuraError);
      }

      // If all APIs fail, return 0 - we only want to show actual balances
      console.log('All ETH APIs failed, returning 0');
      this.balances.eth = 0;
      return 0;
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error);
      // Return 0 instead of using fallback values
      this.balances.eth = 0;
      return 0;
    }
  }

  /**
   * Fetch Solana balance using RPC endpoint with retry mechanism
   * @param {string} rpcEndpoint - The Solana RPC endpoint URL
   * @returns {Promise<number|null>} - The balance in SOL or null if failed
   */
  async fetchSolanaBalanceFromRPC(rpcEndpoint) {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 2000; // 2 seconds
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for ${rpcEndpoint}...`);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
        console.log(`Fetching SOL balance from RPC: ${rpcEndpoint}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(rpcEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [SOL_ADDRESS]
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`RPC response not OK: ${response.status} from ${rpcEndpoint}`);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const data = await response.json();
        
        // Validate the response data structure
        if (data.error) {
          console.warn(`RPC error from ${rpcEndpoint}:`, data.error);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }
        
        // Check for different response formats
        let lamports;
        if (data.result && typeof data.result.value === 'number') {
          // Standard format
          lamports = data.result.value;
        } else if (data.result && typeof data.result === 'number') {
          // Some RPCs might return the value directly
          lamports = data.result;
        } else if (data.result && data.result.value && typeof data.result.value === 'string') {
          // Some RPCs might return the value as a string
          lamports = parseInt(data.result.value, 10);
          if (isNaN(lamports)) {
            console.warn(`Invalid string lamport value from ${rpcEndpoint}:`, data.result.value);
            if (attempt < MAX_RETRIES) continue;
            return null;
          }
        } else {
          console.warn(`Invalid data structure from ${rpcEndpoint}:`, data);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        // Convert from lamports to SOL (1 SOL = 1,000,000,000 lamports)
        const balanceSOL = Number(lamports) / 1e9;
        console.log(`SOL balance from ${rpcEndpoint}: ${balanceSOL}`);
        return balanceSOL;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`Timeout fetching from ${rpcEndpoint}`);
        } else {
          console.warn(`Error fetching from ${rpcEndpoint}:`, error);
        }
        
        if (attempt < MAX_RETRIES) continue;
        return null;
      }
    }
    
    return null; // Should not reach here, but just in case
  }

  /**
   * Fetch Solana balance from Shyft API with retry mechanism
   * @returns {Promise<number|null>} - The balance in SOL or null if failed
   */
  async fetchSolanaBalanceFromShyft() {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 2000; // 2 seconds
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for Shyft API...`);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
        console.log('Fetching SOL balance from Shyft API...');
        const shyftUrl = `${SHYFT_API}/wallet/balance?network=mainnet-beta&wallet=${SOL_ADDRESS}&token=So11111111111111111111111111111111111111112`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(shyftUrl, {
          method: 'GET',
          headers: {
            'x-api-key': SHYFT_API_KEY,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn('Shyft API response not OK:', response.status);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const data = await response.json();
        
        // Check for different response formats
        let balanceSOL;
        
        if (data.result && typeof data.result.balance === 'string') {
          balanceSOL = parseFloat(data.result.balance);
          if (isNaN(balanceSOL)) {
            console.warn('Invalid balance value from Shyft API:', data.result.balance);
            if (attempt < MAX_RETRIES) continue;
            return null;
          }
        } else if (data.result && typeof data.result.balance === 'number') {
          balanceSOL = data.result.balance;
        } else {
          console.warn('Invalid Shyft API response format:', data);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }
        
        console.log('SOL balance from Shyft API:', balanceSOL);
        return balanceSOL;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Timeout fetching from Shyft API');
        } else {
          console.warn('Shyft API error:', error);
        }
        
        if (attempt < MAX_RETRIES) continue;
        return null;
      }
    }
    
    return null; // Should not reach here, but just in case
  }

  /**
   * Fetch Solana balance from Solscan API with retry mechanism
   * @returns {Promise<number|null>} - The balance in SOL or null if failed
   */
  async fetchSolanaBalanceFromSolscan() {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 2000; // 2 seconds
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for Solscan API...`);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
        console.log('Fetching SOL balance from Solscan...');
        const solscanUrl = `${SOLSCAN_API}/account/${SOL_ADDRESS}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(solscanUrl, {
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn('Solscan API response not OK:', response.status);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const data = await response.json();
        
        // Check for different response formats
        let lamports;
        if (data && typeof data.lamports === 'number') {
          lamports = data.lamports;
        } else if (data && typeof data.lamports === 'string') {
          lamports = parseInt(data.lamports, 10);
          if (isNaN(lamports)) {
            console.warn('Invalid string lamport value from Solscan:', data.lamports);
            if (attempt < MAX_RETRIES) continue;
            return null;
          }
        } else if (data && data.data && typeof data.data.lamports === 'number') {
          // Alternative response format
          lamports = data.data.lamports;
        } else {
          console.warn('Invalid Solscan API response format:', data);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const balanceSOL = Number(lamports) / 1e9;
        console.log('SOL balance from Solscan:', balanceSOL);
        return balanceSOL;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Timeout fetching from Solscan API');
        } else {
          console.warn('Solscan API error:', error);
        }
        
        if (attempt < MAX_RETRIES) continue;
        return null;
      }
    }
    
    return null; // Should not reach here, but just in case
  }

  /**
   * Fetch Solana balance from Solflare API with retry mechanism
   * @returns {Promise<number|null>} - The balance in SOL or null if failed
   */
  async fetchSolanaBalanceFromSolflare() {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 2000; // 2 seconds
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} for Solflare API...`);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
        console.log('Fetching SOL balance from Solflare...');
        const solflareUrl = `${SOLFLARE_API}/v0/account/${SOL_ADDRESS}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(solflareUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn('Solflare API response not OK:', response.status);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const data = await response.json();
        
        // Check for different response formats
        let lamports;
        if (data && typeof data.lamports === 'number') {
          lamports = data.lamports;
        } else if (data && typeof data.lamports === 'string') {
          lamports = parseInt(data.lamports, 10);
          if (isNaN(lamports)) {
            console.warn('Invalid string lamport value from Solflare:', data.lamports);
            if (attempt < MAX_RETRIES) continue;
            return null;
          }
        } else if (data && data.balance && typeof data.balance === 'number') {
          // Some APIs might return balance directly in SOL
          return data.balance;
        } else if (data && data.balance && typeof data.balance === 'string') {
          // Some APIs might return balance as string in SOL
          const balance = parseFloat(data.balance);
          if (isNaN(balance)) {
            console.warn('Invalid string balance value from Solflare:', data.balance);
            if (attempt < MAX_RETRIES) continue;
            return null;
          }
          return balance;
        } else {
          console.warn('Invalid Solflare API response format:', data);
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const balanceSOL = Number(lamports) / 1e9;
        console.log('SOL balance from Solflare:', balanceSOL);
        return balanceSOL;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Timeout fetching from Solflare API');
        } else {
          console.warn('Solflare API error:', error);
        }
        
        if (attempt < MAX_RETRIES) continue;
        return null;
      }
    }
    
    return null; // Should not reach here, but just in case
  }

  /**
   * Fetch Solana balance using all available methods
   * Tries multiple endpoints and APIs for maximum reliability
   */
  async fetchSolanaBalance() {
    try {
      console.log('Fetching Solana balance for address:', SOL_ADDRESS);
      
      // First try all RPC endpoints in parallel
      const rpcPromises = SOLANA_RPC_ENDPOINTS.map(endpoint => 
        this.fetchSolanaBalanceFromRPC(endpoint)
      );
      
      // Also try third-party APIs in parallel
      const apiPromises = [
        this.fetchSolanaBalanceFromShyft(),
        this.fetchSolanaBalanceFromSolscan(),
        this.fetchSolanaBalanceFromSolflare()
      ];
      
      // Wait for all requests to complete
      const allResults = await Promise.allSettled([...rpcPromises, ...apiPromises]);
      
      // Filter out failed requests and null results
      const validResults = allResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
      
      console.log('Valid SOL balance results:', validResults);
      
      if (validResults.length === 0) {
        console.warn('All SOL balance fetch attempts failed');
        this.balances.sol = 0;
        return 0;
      }
      
      // Enhanced statistical approach to determine the most accurate balance
      // First, check if we have enough results for statistical analysis
      if (validResults.length >= 3) {
        // Sort the results for analysis
        const sortedResults = [...validResults].sort((a, b) => a - b);
        console.log('Sorted SOL balance results:', sortedResults);
        
        // Calculate mean
        const sum = sortedResults.reduce((acc, val) => acc + val, 0);
        const mean = sum / sortedResults.length;
        
        // Calculate standard deviation
        const squaredDiffs = sortedResults.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
        const stdDev = Math.sqrt(avgSquaredDiff);
        
        console.log(`SOL balance statistics - Mean: ${mean}, StdDev: ${stdDev}`);
        
        // Filter out outliers (values more than 2 standard deviations from the mean)
        // Only if we have enough data points and standard deviation is significant
        if (sortedResults.length > 4 && stdDev > 0.0001) {
          const filteredResults = sortedResults.filter(
            val => Math.abs(val - mean) <= 2 * stdDev
          );
          
          if (filteredResults.length > 0) {
            console.log('Filtered SOL balance results (outliers removed):', filteredResults);
            
            // Calculate median of filtered results
            const medianIndex = Math.floor(filteredResults.length / 2);
            const medianBalance = filteredResults.length % 2 === 0
              ? (filteredResults[medianIndex - 1] + filteredResults[medianIndex]) / 2
              : filteredResults[medianIndex];
            
            console.log('Final SOL balance (statistical median):', medianBalance);
            this.balances.sol = medianBalance;
            return medianBalance;
          }
        }
      }
      
      // Fallback to simple median if we don't have enough data points or outlier removal left us with nothing
      const sortedResults = [...validResults].sort((a, b) => a - b);
      const medianIndex = Math.floor(sortedResults.length / 2);
      const medianBalance = sortedResults.length % 2 === 0
        ? (sortedResults[medianIndex - 1] + sortedResults[medianIndex]) / 2
        : sortedResults[medianIndex];
      
      console.log('Final SOL balance (simple median):', medianBalance);
      this.balances.sol = medianBalance;
      return medianBalance;
    } catch (error) {
      console.error('Error in fetchSolanaBalance:', error);
      // Return 0 if there's an error
      this.balances.sol = 0;
      return 0;
    }
  }

  /**
   * Fetch all balances and calculate total in USD
   */
  async fetchAllBalances() {
    try {
      console.log('Fetching all treasury balances...');

      // First fetch current prices
      await this.fetchPrices();
      console.log('Current prices:', this.prices);

      // Then fetch all balances in parallel
      console.log('Fetching individual balances...');
      const results = await Promise.allSettled([
        this.fetchTotalBitcoinBalance(),
        this.fetchEthereumBalance(),
        this.fetchSolanaBalance()
      ]);
      
      // Update lastUpdated timestamp
      this.lastUpdated = new Date();
      
      // Log results
      console.log('Balance fetch results:', results.map(r => r.status));
      results.forEach((result, index) => {
        const currency = ['BTC', 'ETH', 'SOL'][index];
        if (result.status === 'fulfilled') {
          console.log(`${currency} balance fetch successful:`, result.value);
        } else {
          console.error(`${currency} balance fetch failed:`, result.reason);
        }
      });
      
      // Calculate total in USD
      const totalUSD = (
        this.balances.btc * this.prices.btc +
        this.balances.eth * this.prices.eth +
        this.balances.sol * this.prices.sol
      );
      
      console.log('Total treasury value in USD:', totalUSD);
      console.log('Individual balances:', this.balances);
      
      return {
        balances: { ...this.balances },
        prices: { ...this.prices },
        totalUSD,
        lastUpdated: this.lastUpdated
      };
    } catch (error) {
      console.error('Error fetching all balances:', error);
      return {
        balances: { ...this.balances },
        prices: { ...this.prices },
        totalUSD: (
          this.balances.btc * this.prices.btc +
          this.balances.eth * this.prices.eth +
          this.balances.sol * this.prices.sol
        ),
        lastUpdated: this.lastUpdated || new Date()
      };
    }
  }

  // Export the service instance
  getBalances() {
    return {
      balances: { ...this.balances },
      prices: { ...this.prices },
      totalUSD: (
        this.balances.btc * this.prices.btc +
        this.balances.eth * this.prices.eth +
        this.balances.sol * this.prices.sol
      ),
      lastUpdated: this.lastUpdated
    };
  }
}

export default new TreasuryBalanceService();
