import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Section, Heading, Text, Button, Flex, Card, Input, Divider } from '../styles/StyledComponents';
import WalletConnectButton from '../components/WalletConnectButton';
import { useWallet } from '../utils/WalletContext';
import { useDonation } from '../utils/DonationContext';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import databaseService from '../utils/DatabaseService';

// Import crypto icons
import btcIcon from '../assets/btc.svg';
import ethIcon from '../assets/eth.svg';
import solIcon from '../assets/sol.svg';
import usdcIcon from '../assets/usdc.svg';

const DonateSection = styled(Section)`
  background-color: var(--background);
`;

const CryptoCard = styled(Card)`
  margin-bottom: 32px;
`;

const CryptoHeader = styled(Flex)`
  margin-bottom: 24px;
`;

const CryptoIcon = styled.img`
  width: 48px;
  height: 48px;
  margin-right: 16px;
`;

const AddressContainer = styled.div`
  background-color: rgba(15, 22, 36, 0.5);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  position: relative;
`;

const AddressText = styled.code`
  color: var(--text-secondary);
  font-size: 14px;
  word-break: break-all;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(108, 92, 231, 0.2);
  color: var(--primary);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(108, 92, 231, 0.3);
  }
`;

const QRCodeContainer = styled.div`
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 24px;
  text-align: center;
`;

const QRCodeLabel = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #333;
`;

const AmountInput = styled(Flex)`
  margin-bottom: 24px;
`;

const SuccessMessage = styled.div`
  background-color: rgba(0, 184, 148, 0.1);
  border: 1px solid var(--success);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
`;

const DonatePage = () => {
  const navigate = useNavigate();
  const { isConnected, walletAddress, walletType } = useWallet();
  const { recordDonation, verifyDonation, isLoading, loadUserData, loadLeaderboard } = useDonation();

  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [btcAddressType, setBtcAddressType] = useState('legacy');
  const [stablecoinNetwork, setStablecoinNetwork] = useState('eth');
  const [donationAmount, setDonationAmount] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  // State for live exchange rates
  const [exchangeRates, setExchangeRates] = useState({
    btc: 60000, // Default fallback values
    eth: 3000,
    sol: 150,
    usdc: 1
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState(null);

  const cryptoAddresses = {
    btc: {
      legacy: '1Kr3GkJnBZeeQZZoiYjHoxhZjDsSby9d4p',
      taproot: 'bc1pl6sq6srs5vuczd7ard896cc57gg4h3mdnvjsg4zp5zs2rawqmtgsp4hh08',
      segwit: 'bc1qu7suxfua5x46e59e7a56vd8wuj3a8qj06qr42j'
    },
    eth: '0x8262ab131e3f52315d700308152e166909ecfa47',
    sol: '2n8etcRuK49GUMXWi2QRtQ8YwS6nTDEUjfX7LcvKFyiV',
    usdc: {
      eth: '0x8262ab131e3f52315d700308152e166909ecfa47', // ETH address for ERC-20 stablecoins
      sol: '2n8etcRuK49GUMXWi2QRtQ8YwS6nTDEUjfX7LcvKFyiV'  // SOL address for SPL stablecoins
    }
  };

  const cryptoInfo = {
    btc: { name: 'Bitcoin', symbol: 'BTC', icon: btcIcon },
    eth: { name: 'Ethereum', symbol: 'ETH', icon: ethIcon },
    sol: { name: 'Solana', symbol: 'SOL', icon: solIcon },
    usdc: { name: 'Stablecoins', symbol: 'USDC/USDT/DAI', icon: usdcIcon }
  };

  // Function to fetch current cryptocurrency prices
  const fetchCryptoPrices = async () => {
    setIsLoadingPrices(true);
    setPriceError(null);

    try {
      // Using CoinGecko API to get current prices
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd'
      );

      if (response.ok) {
        const data = await response.json();
        const newRates = {
          btc: data.bitcoin?.usd || exchangeRates.btc,
          eth: data.ethereum?.usd || exchangeRates.eth,
          sol: data.solana?.usd || exchangeRates.sol,
          usdc: 1 // Stablecoins are always ~$1
        };

        setExchangeRates(newRates);
        setLastUpdated(new Date());

        // If donation amount is already entered, recalculate with new rates
        if (donationAmount) {
          const usd = donationAmount * newRates[selectedCrypto];
          setUsdValue(usd);
          const points = Math.floor(usd * 100);
          setPointsEarned(points);
        }
      } else {
        throw new Error('Failed to fetch prices');
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      setPriceError('Failed to fetch current prices. Using estimated values.');
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Check URL parameters for crypto selection and fetch prices on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cryptoParam = urlParams.get('crypto');
    if (cryptoParam && cryptoInfo[cryptoParam]) {
      setSelectedCrypto(cryptoParam);
    }

    // Fetch prices when component mounts
    fetchCryptoPrices();

    // Set up interval to refresh prices every 60 seconds
    const intervalId = setInterval(fetchCryptoPrices, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setDonationAmount('');
    setPointsEarned(0);
    setUsdValue(0);
    setDonationSuccess(false);
    setVerificationStatus('');

    // Refresh prices when crypto is changed
    fetchCryptoPrices();
  };

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setDonationAmount(amount);

    // Calculate USD value
    const usd = amount * exchangeRates[selectedCrypto];
    setUsdValue(usd);

    // Calculate points (10 points per $0.10)
    const points = Math.floor(usd * 100);
    setPointsEarned(points);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Address copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const getCurrentAddress = () => {
    if (selectedCrypto === 'btc') {
      return cryptoAddresses.btc[btcAddressType];
    }
    if (selectedCrypto === 'usdc') {
      // For stablecoins, use the selected network (eth or sol)
      return cryptoAddresses.usdc[stablecoinNetwork];
    }
    return cryptoAddresses[selectedCrypto];
  };

  // This is a completely direct method to add a wallet to the leaderboard
  // It bypasses all blockchain verification and directly updates the database
  const addWalletToLeaderboard = async (walletToAdd, donationAmount, cryptoCurrency) => {
    try {
      // Normalize the wallet address
      const normalizedWallet = walletToAdd.toLowerCase();

      // Get the current exchange rate for the selected cryptocurrency
      const rate = exchangeRates[cryptoCurrency];
      const usdValue = parseFloat(donationAmount) * rate;
      const points = Math.floor(usdValue * 100); // 100 points per $1

      console.log(`DIRECT ADD: Adding wallet ${normalizedWallet} with ${points} points ($${usdValue} USD)`);

      // Generate a unique ID for this donation
      const donationId = `direct_${Date.now().toString(16)}_${Math.random().toString(16).substring(2, 8)}`;

      // 1. Directly add an entry to the leaderboard store
      const db = await databaseService.dbPromise;
      const tx = db.transaction(['leaderboard', 'donations'], 'readwrite');

      // Get existing leaderboard entry if any
      const leaderboardStore = tx.objectStore('leaderboard');
      const existingEntry = await leaderboardStore.get(normalizedWallet);

      // Create new or update existing entry
      const newEntry = {
        walletAddress: normalizedWallet,
        points: (existingEntry?.points || 0) + points,
        totalDonated: (existingEntry?.totalDonated || 0) + usdValue,
        donationCount: (existingEntry?.donationCount || 0) + 1,
        lastDonation: Date.now()
      };

      // Update the leaderboard
      await leaderboardStore.put(newEntry);

      // 2. Also add a donation record
      const donationStore = tx.objectStore('donations');
      const donationData = {
        id: donationId,
        timestamp: Date.now(),
        walletAddress: normalizedWallet,
        amount: parseFloat(donationAmount),
        currency: cryptoCurrency.toUpperCase(),
        usdValue: usdValue,
        points: points,
        txHash: `direct_${donationId}`,
        chain: cryptoCurrency === 'sol' ? 'SOL' : (cryptoCurrency === 'btc' ? 'BTC' : 'ETH'),
      };

      await donationStore.add(donationData);

      // Wait for transaction to complete
      await tx.done;

      console.log('DIRECT ADD: Successfully added wallet to leaderboard and recorded donation');
      return true;
    } catch (error) {
      console.error('DIRECT ADD: Error adding wallet to leaderboard:', error);
      return false;
    }
  };

  const handleVerifyDonation = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    setVerificationStatus('verifying');

    try {
      // Prompt user for transaction hash
      const txHash = prompt('Please enter the transaction hash of your donation:');
      
      if (!txHash || txHash.trim() === '') {
        alert('Transaction hash is required to verify your donation');
        setVerificationStatus('');
        return;
      }
      
      // Use the verifyDonation method from DonationContext to verify the transaction
      const result = await verifyDonation(txHash, selectedCrypto);
      
      if (result.verified) {
        console.log('Donation verified successfully');
        
        // Reload user data and leaderboard to reflect the changes
        await loadUserData();
        await loadLeaderboard();
        
        setDonationSuccess(true);
        setVerificationStatus('success');
      } else {
        console.error('Donation verification failed:', result.message);
        alert(`Verification failed: ${result.message || 'Could not verify transaction'}`);
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Error processing donation:', error);
      setVerificationStatus('failed');
    }
  };

  const renderAddressOptions = () => {
    if (selectedCrypto === 'btc') {
      return (
        <>
          <Heading level={4}>Choose Bitcoin Address Type</Heading>
          <Flex gap="16px" style={{ marginBottom: '24px' }}>
            <Button
              secondary={btcAddressType !== 'legacy'}
              onClick={() => setBtcAddressType('legacy')}
            >
              Legacy
            </Button>
            <Button
              secondary={btcAddressType !== 'taproot'}
              onClick={() => setBtcAddressType('taproot')}
            >
              Taproot
            </Button>
            <Button
              secondary={btcAddressType !== 'segwit'}
              onClick={() => setBtcAddressType('segwit')}
            >
              Native Segwit
            </Button>
          </Flex>
        </>
      );
    }

    if (selectedCrypto === 'usdc') {
      return (
        <>
          <Heading level={4}>Choose Network for Stablecoins</Heading>
          <Flex gap="16px" style={{ marginBottom: '24px' }}>
            <Button
              secondary={stablecoinNetwork !== 'eth'}
              onClick={() => setStablecoinNetwork('eth')}
            >
              Ethereum (ERC-20)
            </Button>
            <Button
              secondary={stablecoinNetwork !== 'sol'}
              onClick={() => setStablecoinNetwork('sol')}
            >
              Solana (SPL)
            </Button>
          </Flex>
        </>
      );
    }

    return null;
  };

  return (
    <DonateSection>
      <Container>
        <Heading level={1}>Donate to the deHouse DAO Treasury</Heading>
        <Text size="18px" mb="40px">
          Support our mission by donating cryptocurrency. Every $0.10 worth of crypto earns you 10 points on our leaderboard.
        </Text>

        <Flex gap="24px" wrap="wrap" style={{ marginBottom: '40px' }}>
          {Object.keys(cryptoInfo).map(crypto => (
            <Button
              key={crypto}
              secondary={selectedCrypto !== crypto}
              onClick={() => handleCryptoSelect(crypto)}
            >
              {cryptoInfo[crypto].name}
            </Button>
          ))}
        </Flex>

        <CryptoCard>
          <CryptoHeader align="center">
            <CryptoIcon src={cryptoInfo[selectedCrypto].icon} alt={cryptoInfo[selectedCrypto].name} />
            <div>
              <Heading level={3}>{cryptoInfo[selectedCrypto].name} Donation</Heading>
              <Text>Send {cryptoInfo[selectedCrypto].symbol} to the address below</Text>
            </div>
          </CryptoHeader>

          {donationSuccess ? (
            <SuccessMessage>
              <Heading level={4}>Donation Verified Successfully!</Heading>
              <Text mb="8px">Thank you for your donation. Your points have been added to your account.</Text>
              <Text mb="0">You earned <strong>{pointsEarned} points</strong> for your donation of {donationAmount} {cryptoInfo[selectedCrypto].symbol.split('/')[0]}.</Text>
              <Button style={{ marginTop: '16px' }} onClick={() => navigate('/leaderboard')}>
                View Leaderboard
              </Button>
            </SuccessMessage>
          ) : (
            <>
              {renderAddressOptions()}

              <AddressContainer>
                <AddressText>
                  {getCurrentAddress()}
                </AddressText>
                <CopyButton onClick={() => copyToClipboard(getCurrentAddress())}>Copy</CopyButton>
              </AddressContainer>

              <Flex justify="center" style={{ marginBottom: '24px' }}>
                <QRCodeContainer>
                  <QRCodeSVG
                    value={getCurrentAddress()}
                    size={180}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                    includeMargin={false}
                  />
                  <QRCodeLabel>Scan to send {cryptoInfo[selectedCrypto].symbol.split('/')[0]}</QRCodeLabel>
                </QRCodeContainer>
              </Flex>

              <Divider />

              <Heading level={4}>Donation Amount</Heading>
              <Text mb="16px">
                Enter the amount you plan to donate to calculate your points
              </Text>

              {/* Price information */}
              <Flex justify="center" align="center" style={{ marginBottom: '16px' }}>
                <Text size="14px" mb="0" style={{ color: 'var(--text-secondary)' }}>
                  Current {cryptoInfo[selectedCrypto].name} Price: ${exchangeRates[selectedCrypto].toLocaleString()} USD
                  {lastUpdated && (
                    <span> · Updated {lastUpdated.toLocaleString()}</span>
                  )}
                  {isLoadingPrices && (
                    <span> · Refreshing...</span>
                  )}
                </Text>
                <Button
                  style={{
                    marginLeft: '8px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--primary)'
                  }}
                  onClick={fetchCryptoPrices}
                  disabled={isLoadingPrices}
                >
                  Refresh
                </Button>
              </Flex>

              {priceError && (
                <Text size="14px" mb="16px" style={{ color: 'var(--warning)', textAlign: 'center' }}>
                  {priceError}
                </Text>
              )}

              <AmountInput align="center" gap="16px">
                <Input
                  type="number"
                  placeholder="0.00"
                  style={{ maxWidth: '200px' }}
                  value={donationAmount}
                  onChange={handleAmountChange}
                />
                <Text size="18px" mb="0">{cryptoInfo[selectedCrypto].symbol.split('/')[0]}</Text>
                <Text size="18px" mb="0">≈ ${usdValue.toFixed(2)} USD</Text>
                <Text size="18px" mb="0" style={{ color: 'var(--primary)' }}>{pointsEarned} Points</Text>
              </AmountInput>

              <Text>
                After sending your donation, connect your wallet to verify the transaction and claim your points.
              </Text>

              <Flex justify="center" style={{ marginTop: '32px' }}>
                {!isConnected ? (
                  <WalletConnectButton />
                ) : (
                  <Button
                    onClick={handleVerifyDonation}
                    disabled={isLoading || verificationStatus === 'verifying'}
                  >
                    {verificationStatus === 'verifying' ? 'Verifying...' : 'Verify Donation'}
                  </Button>
                )}
              </Flex>

              {verificationStatus === 'failed' && (
                <Text style={{ color: 'var(--error)', textAlign: 'center', marginTop: '16px' }}>
                  Verification failed. Please make sure you've sent the donation and try again.
                </Text>
              )}
            </>
          )}
        </CryptoCard>
      </Container>
    </DonateSection>
  );
};

export default DonatePage;
