import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Heading, Text, Flex, Button } from '../styles/StyledComponents';
import treasuryBalanceService from '../utils/TreasuryBalanceService';

// Import crypto icons
import btcIcon from '../assets/btc.svg';
import ethIcon from '../assets/eth.svg';
import solIcon from '../assets/sol.svg';

const CounterCard = styled(Card)`
  position: relative;
  overflow: hidden;
  padding: 24px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.9) 0%, rgba(15, 22, 36, 0.95) 100%);
  border: 1px solid rgba(108, 92, 231, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 90% 10%, rgba(108, 92, 231, 0.15) 0%, transparent 70%);
    z-index: 0;
  }
`;

const CounterContent = styled.div`
  position: relative;
  z-index: 1;
`;

const TotalAmount = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin: 16px 0;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const RefreshButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
  margin-top: 16px;
`;

const CryptoBreakdown = styled.div`
  margin-top: 16px;
`;

const CryptoItem = styled(Flex)`
  margin-bottom: 12px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const CryptoIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const CryptoName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const CryptoBalance = styled.div`
  font-weight: 500;
  color: var(--text-secondary);
`;

const CryptoValue = styled.div`
  font-weight: 600;
  color: var(--primary);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 22, 36, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  backdrop-filter: blur(2px);
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TreasuryBalanceCounter = () => {
  const [balanceData, setBalanceData] = useState({
    balances: { btc: 0, eth: 0, sol: 0 },
    prices: { btc: 0, eth: 0, sol: 0 },
    usdValues: { btc: 0, eth: 0, sol: 0 },
    totalUSD: 0,
    lastUpdated: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  const fetchBalances = async () => {
    console.log('%c[DEBUG-UI] Starting balance fetch...', 'background: #4b0082; color: #fff');
    console.log('%c[DEBUG-UI] Current timestamp:', 'background: #4b0082; color: #fff', new Date().toISOString());
    setIsLoading(true);
    setError(null);

    try {
      console.log('%c[DEBUG-UI] Calling treasuryBalanceService.fetchAllBalances()', 'background: #4b0082; color: #fff');
      console.time('UI-Balance-Fetch');
      const data = await treasuryBalanceService.fetchAllBalances();
      console.timeEnd('UI-Balance-Fetch');
      console.log('%c[DEBUG-UI] Received data from service:', 'background: #4b0082; color: #fff', JSON.stringify(data));

      // Validate the data before setting it
      console.log('%c[DEBUG-UI] Validating data...', 'background: #4b0082; color: #fff');
      if (!data || typeof data !== 'object') {
        console.error('%c[DEBUG-UI] Invalid data format:', 'background: #f00; color: #fff', data);
        throw new Error('Invalid data returned from service');
      }

      // Log raw data for debugging
      console.log('%c[DEBUG-UI] Raw balances from service:', 'background: #4b0082; color: #fff', {
        btc: data.balances?.btc,
        eth: data.balances?.eth,
        sol: data.balances?.sol
      });

      // Ensure all required properties exist
      const validatedData = {
        balances: {
          btc: parseFloat(data.balances?.btc || 0),
          eth: parseFloat(data.balances?.eth || 0),
          sol: parseFloat(data.balances?.sol || 0)
        },
        prices: {
          btc: parseFloat(data.prices?.btc || 0),
          eth: parseFloat(data.prices?.eth || 0),
          sol: parseFloat(data.prices?.sol || 0)
        },
        usdValues: {
          btc: parseFloat(data.usdValues?.btc || 0),
          eth: parseFloat(data.usdValues?.eth || 0),
          sol: parseFloat(data.usdValues?.sol || 0)
        },
        totalUSD: parseFloat(data.totalUSD || 0),
        lastUpdated: data.lastUpdated || new Date()
      };

      // Check for zero balances
      if (validatedData.balances.eth === 0) {
        console.warn('%c[DEBUG-UI] WARNING: ETH balance is zero!', 'background: #f00; color: #fff');
      }

      if (validatedData.balances.sol === 0) {
        console.warn('%c[DEBUG-UI] WARNING: SOL balance is zero!', 'background: #f00; color: #fff');
      }

      // We're only showing actual balances from the blockchain
      // No fallbacks or fake data

      console.log('Validated balance data:', validatedData);
      setBalanceData(validatedData);
    } catch (err) {
      console.error('Error fetching treasury balances:', err);
      setError('Failed to fetch current balances. Please try again later.');

      // Set all balances to 0 - only show actual balances
      setBalanceData({
        balances: { btc: 0, eth: 0, sol: 0 },
        prices: { btc: 0, eth: 0, sol: 0 },
        usdValues: { btc: 0, eth: 0, sol: 0 },
        totalUSD: 0,
        lastUpdated: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle debug mode with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchBalances();

    // Set up interval to refresh balances every 5 minutes
    const intervalId = setInterval(fetchBalances, 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatCrypto = (value, symbol) => {
    const precision = symbol === 'BTC' ? 8 : 6;
    return `${parseFloat(value).toFixed(precision)} ${symbol}`;
  };

  const cryptoData = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: btcIcon },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: ethIcon },
    { id: 'sol', name: 'Solana', symbol: 'SOL', icon: solIcon }
  ];

  return (
    <CounterCard>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      <CounterContent>
        <Heading level={3}>Total Funds Raised</Heading>

        <TotalAmount>
          {formatCurrency(balanceData.totalUSD)}
        </TotalAmount>

        <Text size="14px" mb="8px">
          {balanceData.lastUpdated
            ? `Last updated: ${balanceData.lastUpdated.toLocaleString()}`
            : 'Fetching latest balances...'}
        </Text>

        {error && (
          <Text size="14px" mb="16px" style={{ color: 'var(--error)' }}>
            {error}
          </Text>
        )}

        <CryptoBreakdown>
          <Text size="16px" mb="16px" style={{ fontWeight: 600 }}>
            Treasury Balances
          </Text>

          {cryptoData.map(crypto => (
            <CryptoItem key={crypto.id} justify="space-between" align="center">
              <Flex align="center">
                <CryptoIcon src={crypto.icon} alt={crypto.name} />
                <CryptoName>{crypto.name}</CryptoName>
              </Flex>

              <Flex direction="column" align="flex-end">
                <CryptoBalance>
                  {formatCrypto(balanceData.balances[crypto.id], crypto.symbol)}
                </CryptoBalance>
                <CryptoValue>
                  {formatCurrency(balanceData.usdValues[crypto.id])}
                </CryptoValue>
              </Flex>
            </CryptoItem>
          ))}
        </CryptoBreakdown>

        {/* Debug information - press Ctrl+Shift+D to toggle */}
        {debugMode && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4 style={{ color: 'yellow', marginBottom: '8px' }}>Debug Info</h4>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: '#aaa',
              fontSize: '10px'
            }}>
              {JSON.stringify({
                balances: balanceData.balances,
                prices: balanceData.prices,
                usdValues: balanceData.usdValues,
                totalUSD: balanceData.totalUSD
              }, null, 2)}
            </pre>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#aaa' }}>
              <p>BTC Addresses:</p>
              <ul style={{ marginLeft: '15px' }}>
                <li>Legacy: 1Kr3GkJnBZeeQZZoiYjHoxhZjDsSby9d4p</li>
                <li>Taproot: bc1pl6sq6srs5vuczd7ard896cc57gg4h3mdnvjsg4zp5zs2rawqmtgsp4hh08</li>
                <li>Segwit: bc1qu7suxfua5x46e59e7a56vd8wuj3a8qj06qr42j</li>
              </ul>
              <p>ETH Address: 0x8262ab131e3f52315d700308152e166909ecfa47</p>
              <p>SOL Address: 2n8etcRuK49GUMXWi2QRtQ8YwS6nTDEUjfX7LcvKFyiV</p>
            </div>
          </div>
        )}

        <RefreshButton secondary onClick={fetchBalances}>
          Refresh Balances
        </RefreshButton>
      </CounterContent>
    </CounterCard>
  );
};

export default TreasuryBalanceCounter;
