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
const ETHERSCAN_API = 'https://api.etherscan.io/api';
const ETHERSCAN_API_KEY = 'NSZCD6S4TKVJ3WVF2K27DCCH41EV5NKBFY'; // Using a valid API key
const BLOCKCHAIR_ETH_API = 'https://api.blockchair.com/ethereum';
const ETHPLORER_API = 'https://api.ethplorer.io';

// Solana APIs
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const SOLANA_FM_API = 'https://api.solana.fm/v0';
const SOLSCAN_API = 'https://public-api.solscan.io';
const SOLFLARE_API = 'https://api.solflare.com';
const SHYFT_API = 'https://api.shyft.to/sol/v1';
const SHYFT_API_KEY = '7rVeSXle8oRlKWe';

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

      // First try Etherscan API with a valid API key
      try {
        console.log('Fetching ETH balance from Etherscan...');
        const etherscanUrl = `${ETHERSCAN_API}?module=account&action=balance&address=${ETH_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
        const response = await fetch(etherscanUrl);

        if (response.ok) {
          const data = await response.json();
          console.log('Etherscan API response:', JSON.stringify(data));

          if (data.status === '1') {
            // Convert from wei to ETH
            const balanceETH = parseInt(data.result) / 1e18;
            console.log('ETH balance from Etherscan:', balanceETH);

            // Now fetch ERC-20 token balances (USDC, USDT, DAI)
            try {
              console.log('Fetching ETH token balances from Etherscan...');
              const tokenUrl = `${ETHERSCAN_API}?module=account&action=tokentx&address=${ETH_ADDRESS}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
              const tokenResponse = await fetch(tokenUrl);

              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                console.log('Etherscan token API response:', JSON.stringify(tokenData));

                // Process token data if needed
                // For now, we'll just use the ETH balance
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

      // Try Blockchair API
      try {
        console.log('Fetching ETH balance from Blockchair...');
        const blockchairUrl = `${BLOCKCHAIR_ETH_API}/dashboards/address/${ETH_ADDRESS}`;
        const response = await fetch(blockchairUrl);

        if (response.ok) {
          const data = await response.json();
          console.log('Blockchair API response:', JSON.stringify(data));

          if (data.data && data.data[ETH_ADDRESS]) {
            const addressData = data.data[ETH_ADDRESS];
            const balanceWei = addressData.address.balance || 0;
            const balanceETH = balanceWei / 1e18;

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
        const response = await fetch(ethplorerUrl);

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

      // Try Web3 API (Infura)
      try {
        console.log('Fetching ETH balance from Web3 API...');
        const web3Url = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'; // Public Infura endpoint

        const response = await fetch(web3Url, {
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
          console.log('Web3 API response:', JSON.stringify(data));

          if (data.result) {
            // Convert hex result to decimal and then to ETH
            const balanceWei = parseInt(data.result, 16);
            const balanceETH = balanceWei / 1e18;

            console.log('ETH balance from Web3 API:', balanceETH);

            this.balances.eth = balanceETH;
            return balanceETH;
          }
        } else {
          console.warn('Web3 API response not OK:', response.status);
        }
      } catch (web3Error) {
        console.warn('Web3 API error:', web3Error);
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
   * Fetch Solana balance
   */
  async fetchSolanaBalance() {
    try {
      console.log('Fetching Solana balance for address:', SOL_ADDRESS);

      // Try Shyft API first - this is a reliable third-party REST API for Solana
      try {
        console.log('Fetching SOL balance from Shyft API...');
        const shyftUrl = `${SHYFT_API}/wallet/all_tokens?network=mainnet-beta&wallet=${SOL_ADDRESS}`;

        const response = await fetch(shyftUrl, {
          method: 'GET',
          headers: {
            'x-api-key': SHYFT_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Shyft API response:', JSON.stringify(data));

          if (data.result && Array.isArray(data.result.tokens)) {
            // Find the native SOL token in the tokens array
            const solToken = data.result.tokens.find(token =>
              token.address === 'So11111111111111111111111111111111111111112' || // Native SOL token address
              token.symbol === 'SOL' ||
              token.name === 'Solana'
            );

            if (solToken && solToken.balance) {
              const balanceSOL = parseFloat(solToken.balance);
              console.log('SOL balance from Shyft API:', balanceSOL);

              this.balances.sol = balanceSOL;
              return balanceSOL;
            }

            // If we can't find the SOL token specifically, check the native balance
            if (data.result.native_balance) {
              const nativeBalanceSOL = parseFloat(data.result.native_balance);
              console.log('Native SOL balance from Shyft API:', nativeBalanceSOL);

              this.balances.sol = nativeBalanceSOL;
              return nativeBalanceSOL;
            }
          }
        } else {
          console.warn('Shyft API response not OK:', response.status);
        }
      } catch (shyftError) {
        console.warn('Shyft API error:', shyftError);
      }

      // Try Shyft API with a different endpoint
      try {
        console.log('Fetching SOL balance from Shyft API (balance endpoint)...');
        const shyftBalanceUrl = `${SHYFT_API}/wallet/balance?network=mainnet-beta&wallet=${SOL_ADDRESS}&token=So11111111111111111111111111111111111111112`;

        const response = await fetch(shyftBalanceUrl, {
          method: 'GET',
          headers: {
            'x-api-key': SHYFT_API_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Shyft API balance endpoint response:', JSON.stringify(data));

          if (data.result && data.result.balance) {
            const balanceSOL = parseFloat(data.result.balance);
            console.log('SOL balance from Shyft API balance endpoint:', balanceSOL);

            this.balances.sol = balanceSOL;
            return balanceSOL;
          }
        } else {
          console.warn('Shyft API balance endpoint response not OK:', response.status);
        }
      } catch (shyftBalanceError) {
        console.warn('Shyft API balance endpoint error:', shyftBalanceError);
      }

      // Try Solscan API
      try {
        console.log('Fetching SOL balance from Solscan...');
        const response = await fetch(`https://public-api.solscan.io/account/${SOL_ADDRESS}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Get SOL balance in lamports and convert to SOL
          const balanceSOL = (data.lamports || 0) / 1e9;

          this.balances.sol = balanceSOL;
          console.log('SOL balance from Solscan:', balanceSOL);
          return balanceSOL;
        }
      } catch (solscanError) {
        console.warn('Solscan API error:', solscanError);
      }

      // Try Solana RPC directly
      try {
        console.log('Fetching SOL balance from RPC...');
        const response = await fetch(SOLANA_RPC, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [SOL_ADDRESS]
          })
        });

        if (response.ok) {
          const data = await response.json();

          if (!data.error && data.result) {
            // Convert from lamports to SOL
            const balanceSOL = data.result.value / 1e9;

            this.balances.sol = balanceSOL;
            console.log('SOL balance from RPC:', balanceSOL);
            return balanceSOL;
          }
        }
      } catch (rpcError) {
        console.warn('Solana RPC error:', rpcError);
      }

      // Try Solflare API
      try {
        console.log('Fetching SOL balance from Solflare...');
        const response = await fetch(`https://api.solflare.com/v0/account/${SOL_ADDRESS}`);

        if (response.ok) {
          const data = await response.json();

          if (data.lamports) {
            const balanceSOL = data.lamports / 1e9;

            this.balances.sol = balanceSOL;
            console.log('SOL balance from Solflare:', balanceSOL);
            return balanceSOL;
          }
        }
      } catch (solflareError) {
        console.warn('Solflare API error:', solflareError);
      }

      // If all APIs fail, return 0 - we only want to show actual balances
      console.log('All SOL APIs failed, returning 0');
      this.balances.sol = 0;
      return 0;
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

      // Process results and ensure we have values - only use actual balances
      if (results[0].status === 'fulfilled') {
        this.balances.btc = results[0].value;
      } else {
        console.warn('BTC balance fetch failed:', results[0].reason);
        // Set to 0 if fetch failed
        this.balances.btc = 0;
      }

      if (results[1].status === 'fulfilled') {
        this.balances.eth = results[1].value;
      } else {
        console.warn('ETH balance fetch failed:', results[1].reason);
        // Set to 0 if fetch failed
        this.balances.eth = 0;
      }

      if (results[2].status === 'fulfilled') {
        this.balances.sol = results[2].value;
      } else {
        console.warn('SOL balance fetch failed:', results[2].reason);
        // Set to 0 if fetch failed
        this.balances.sol = 0;
      }

      // Ensure we have valid prices
      if (!this.prices.btc || this.prices.btc <= 0) this.prices.btc = 60000;
      if (!this.prices.eth || this.prices.eth <= 0) this.prices.eth = 3000;
      if (!this.prices.sol || this.prices.sol <= 0) this.prices.sol = 100;

      // Calculate USD values
      const usdValues = {
        btc: this.balances.btc * this.prices.btc,
        eth: this.balances.eth * this.prices.eth,
        sol: this.balances.sol * this.prices.sol
      };

      const totalUSD = Object.values(usdValues).reduce((sum, value) => sum + value, 0);

      this.lastUpdated = new Date();

      // Log the final values for debugging
      console.log('Final balances:', {
        btc: this.balances.btc,
        eth: this.balances.eth,
        sol: this.balances.sol
      });
      console.log('USD values:', usdValues);
      console.log('Total USD:', totalUSD);

      return {
        balances: { ...this.balances }, // Return a copy to prevent external modification
        prices: { ...this.prices },
        usdValues,
        totalUSD,
        lastUpdated: this.lastUpdated
      };
    } catch (error) {
      console.error('Error fetching all balances:', error);

      // Set all balances to 0 if there was an error - only show actual balances
      this.balances.btc = 0;
      this.balances.eth = 0;
      this.balances.sol = 0;

      // Ensure we have valid prices
      if (!this.prices.btc || this.prices.btc <= 0) this.prices.btc = 60000;
      if (!this.prices.eth || this.prices.eth <= 0) this.prices.eth = 3000;
      if (!this.prices.sol || this.prices.sol <= 0) this.prices.sol = 100;

      // Calculate USD values
      const usdValues = {
        btc: this.balances.btc * this.prices.btc,
        eth: this.balances.eth * this.prices.eth,
        sol: this.balances.sol * this.prices.sol
      };

      const totalUSD = Object.values(usdValues).reduce((sum, value) => sum + value, 0);

      this.lastUpdated = new Date();

      console.log('Using fallback values due to error');
      console.log('Fallback balances:', this.balances);
      console.log('Fallback USD values:', usdValues);
      console.log('Fallback total USD:', totalUSD);

      return {
        balances: { ...this.balances },
        prices: { ...this.prices },
        usdValues,
        totalUSD,
        lastUpdated: this.lastUpdated
      };
    }
  }
}

export default new TreasuryBalanceService();
