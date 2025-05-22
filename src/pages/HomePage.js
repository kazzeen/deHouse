import React from 'react';
import styled from 'styled-components';
import { Container, Section, Heading, Text, Button, Flex, Card, Grid } from '../styles/StyledComponents';
import WalletConnectButton from '../components/WalletConnectButton';
import TreasuryBalanceCounter from '../components/TreasuryBalanceCounter';
import { useNavigate } from 'react-router-dom';

// Import crypto icons
import btcIcon from '../assets/btc.svg';
import ethIcon from '../assets/eth.svg';
import solIcon from '../assets/sol.svg';
import usdcIcon from '../assets/usdc.svg';

const HeroSection = styled(Section)`
  min-height: 90vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(15, 22, 36, 0.5) 0%, rgba(26, 35, 50, 0.5) 100%);
  background-size: cover;
  position: relative;
  overflow: hidden;
  padding: 100px 0;

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
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    flex-direction: column;
    align-items: center;
  }
`;

const HeroLeftColumn = styled.div`
  max-width: 550px;

  @media (max-width: 992px) {
    max-width: 100%;
    margin-bottom: 40px;
    text-align: center;
  }
`;

const HeroRightColumn = styled.div`
  width: 400px;

  @media (max-width: 992px) {
    width: 100%;
    max-width: 450px;
  }
`;

const HeroButtons = styled(Flex)`
  margin-top: 40px;

  @media (max-width: 992px) {
    justify-content: center;
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

const GoalsSection = styled(Section)`
  background: linear-gradient(135deg, rgba(15, 22, 36, 0.4) 0%, rgba(26, 35, 50, 0.4) 100%);
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const GoalCard = styled(Card)`
  padding: 32px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(26, 35, 50, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(108, 92, 231, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(108, 92, 231, 0.15) 0%, transparent 70%);
    z-index: 0;
  }
`;

const CryptoSection = styled(Section)`
  background-color: rgba(25, 32, 44, 0.06);
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

const HomePage = () => {
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
          <HeroContent>
            <HeroLeftColumn>
              <Heading level={1}>Join deHouse and Donate to Empower Our DAO Community</Heading>
               <Text size="20px"> Donate Assets, Earn Points, Unlock Future Rewards!</Text>
               <Text size="20px"> Fuel the Future of the deHouse DAO. Every donation earns you points on our leaderboard and helps fund our mission of revolutionizing the RWA industry.
              </Text>

              <HeroButtons gap="16px">
                <WalletConnectButton />
                <Button secondary onClick={() => navigate('/leaderboard')}>View Leaderboard</Button>
              </HeroButtons>
            </HeroLeftColumn>

            <HeroRightColumn>
              <TreasuryBalanceCounter />
            </HeroRightColumn>
          </HeroContent>
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

      <GoalsSection>
        <Container>
          <Heading level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>Our Mission</Heading>
          <GoalCard>
            <div style={{ marginBottom: '24px', opacity: '0.8' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <Text size="20px" style={{ lineHeight: '1.6', position: 'relative', zIndex: '1' }}>
              "Our mission is to strategically build and manage a diverse portfolio of assets, properties and products, harnessing the collective strength of our DAO to create exceptional value and meaningful rewards for all our contributors.
We are dedicated to uniting our community’s resources together to acquire and grow our treasury's assets, ensuring that the prosperity generated by our DAO benefits each and every one of our members."
            </Text>
          </GoalCard>
        </Container>
      </GoalsSection>

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
