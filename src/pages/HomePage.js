import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, Section, Heading, Text, Button, Flex, Card, Grid } from '../styles/StyledComponents';
import WalletConnectButton from '../components/WalletConnectButton';
import TreasuryBalanceCounter from '../components/TreasuryBalanceCounter';
import { useNavigate, Link } from 'react-router-dom';

// Import crypto icons
import btcIcon from '../assets/btc.svg';
import ethIcon from '../assets/eth.svg';
import solIcon from '../assets/sol.svg';
import usdcIcon from '../assets/usdc.svg';

const HeroSection = styled(Section)`
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(15, 22, 36, 0.95) 0%, rgba(26, 35, 50, 0.95) 100%);
  background-size: cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 30%, rgba(108, 92, 231, 0.15) 0%, transparent 50%);
  }
`;

const HeroContent = styled.div`
  max-width: 650px;
  position: relative;
  z-index: 2;
`;

const HeroButtons = styled(Flex)`
  margin-top: 40px;
`;

const StatsContainer = styled(Flex)`
  margin-top: 80px;
  background: rgba(26, 35, 50, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0 24px;

  &:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  h3 {
    font-size: 36px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    color: var(--text-secondary);
  }
`;

const FeaturesSection = styled(Section)`
  background-color: var(--background);
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: 40px 24px;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 24px;
    color: var(--primary);
  }
`;

const CryptoSection = styled(Section)`
  background-color: rgba(26, 35, 50, 0.5);
`;

const CryptoCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 24px;

  img {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
`;

const HeroLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  align-items: center;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const cryptoData = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: btcIcon },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: ethIcon },
    { id: 'sol', name: 'Solana', symbol: 'SOL', icon: solIcon },
    { id: 'usdc', name: 'Stablecoins', symbol: 'USDC/USDT/DAI', icon: usdcIcon }
  ];

  return (
    <>
      <HeroSection>
        <Container>
          <HeroLayout>
            <HeroContent>
              <Heading level={1}>Support Our DAO Treasury with Crypto Donations</Heading>
              <Text size="20px">
                Join our community by donating cryptocurrency to the deHouse DAO treasury.
                Every donation earns you points on our leaderboard and helps fund our mission.
              </Text>

              <HeroButtons gap="16px">
                <WalletConnectButton />
                <Button secondary onClick={() => navigate('/leaderboard')}>View Leaderboard</Button>
              </HeroButtons>

              <StatsContainer justify="space-between">
                <StatItem>
                  <h3>$5K+</h3>
                  <p>Total Donations</p>
                </StatItem>
                <StatItem>
                  <h3>10+</h3>
                  <p>Contributors</p>
                </StatItem>
                <StatItem>
                  <h3>3</h3>
                  <p>Supported Chains</p>
                </StatItem>
              </StatsContainer>
            </HeroContent>

            {/* Treasury Balance Counter */}
            <TreasuryBalanceCounter />
          </HeroLayout>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <Heading level={2} style={{ textAlign: 'center' }}>Why Donate to deHouse?</Heading>
          <Text size="18px" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
            Our DAO treasury supports various initiatives and rewards contributors with truly decentralized RWA ownership and future perks.
          </Text>

          <Grid columns={3} gap="32px">
            <FeatureCard>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Heading level={3}>Multi-Chain Support</Heading>
              <Text>
                Donate using your preferred cryptocurrency across multiple blockchains including Bitcoin, Ethereum, and Solana.
              </Text>
            </FeatureCard>

            <FeatureCard>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <Heading level={3}>Complete Transparency</Heading>
              <Text>
                All donations are processed directly on-chain with no intermediaries, ensuring maximum transparency.
              </Text>
            </FeatureCard>

            <FeatureCard>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <Heading level={3}>Leaderboard Ranking</Heading>
              <Text>
                Earn 10 points for every $0.10 worth of crypto donated and climb our contributor leaderboard to gain a top rank to earn future rewards.
              </Text>
            </FeatureCard>
          </Grid>
        </Container>
      </FeaturesSection>

      <CryptoSection>
        <Container>
          <Heading level={2} style={{ textAlign: 'center' }}>Supported Cryptocurrencies</Heading>
          <Text size="18px" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
            We accept donations in multiple cryptocurrencies across different blockchains.
          </Text>

          <Grid columns={4} gap="24px" style={{ justifyItems: 'center' }}>
            {cryptoData.map(crypto => (
              <CryptoCard key={crypto.id}>
                <img src={crypto.icon} alt={crypto.name} />
                <Heading level={4}>{crypto.name}</Heading>
                <Text mb="8px">{crypto.symbol}</Text>
                <Button secondary onClick={() => navigate(`/donate?crypto=${crypto.id}`)}>
                  Donate {crypto.symbol.split('/')[0]}
                </Button>
              </CryptoCard>
            ))}
          </Grid>
        </Container>
      </CryptoSection>
    </>
  );
};

export default HomePage;
