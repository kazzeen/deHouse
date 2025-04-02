import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Section, Heading, Text, Button, Flex, Card, Input, Divider } from '../styles/StyledComponents';
import WalletConnectButton from '../components/WalletConnectButton';
import { useWallet } from '../utils/WalletContext';
import { useDonation } from '../utils/DonationContext';
import { QRCodeSVG } from 'qrcode.react';

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
  const { isConnected, walletAddress, walletType } = useWallet();
  const { recordDonation, verifyDonation, isLoading } = useDonation();
  
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [btcAddressType, setBtcAddressType] = useState('legacy');
  const [stablecoinNetwork, setStablecoinNetwork] = useState('eth');
  const [donationAmount, setDonationAmount] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  
  // Mock exchange rates for demonstration
  const exchangeRates = {
    btc: 60000,
    eth: 3000,
    sol: 150,
    usdc: 1
  };
  
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
  
  // Check URL parameters for crypto selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cryptoParam = urlParams.get('crypto');
    if (cryptoParam && cryptoInfo[cryptoParam]) {
      setSelectedCrypto(cryptoParam);
    }
  }, []);
  
  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto);
    setDonationAmount('');
    setPointsEarned(0);
    setUsdValue(0);
    setDonationSuccess(false);
    setVerificationStatus('');
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
      // In a real implementation, this would verify the transaction on the blockchain
      // For now, we'll simulate verification and recording
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 34);
      
      // First record the donation to ensure points are added
      const donation = await recordDonation(parseFloat(donationAmount), selectedCrypto);
      
      // Then verify it (in a real app, verification would happen first)
      const verified = await verifyDonation(mockTxHash, selectedCrypto);
      
      if (verified || donation) {
        setDonationSuccess(true);
        setVerificationStatus('success');
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Error verifying donation:', error);
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
        <Heading level={1}>Donate to deHouse DAO Treasury</Heading>
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
              <Button style={{ marginTop: '16px' }} onClick={() => window.location.href = '/leaderboard'}>
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
