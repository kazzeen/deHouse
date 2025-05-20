import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Container, Flex, Text } from '../styles/StyledComponents';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: var(--card-bg);
  padding: 60px 0 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1; /* Lower z-index than header */
`;

const rainbowGradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const FooterLogo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
`;

const LogoPrefix = styled.span`
  color: var(--text-primary);
`;

const LogoGradient = styled.span`
  background: linear-gradient(90deg, #3f87a6, #ebf8e1, #f69d3c, #561423, #3f87a6);
  background-size: 300% 300%;
  animation: ${rainbowGradientAnimation} 6s linear infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;

  &:hover {
    animation: ${rainbowGradientAnimation} 3s linear infinite;
  }
`;

const FooterSection = styled.div`
  margin-bottom: 30px;
`;

const FooterHeading = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
`;

const FooterLink = styled(Link)`
  display: block;
  color: var(--text-secondary);
  margin-bottom: 12px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  &:hover {
    color: var(--primary);
  }
`;

const SocialLinks = styled(Flex)`
  margin-top: 16px;
`;

const SocialIcon = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--primary);
    transform: translateY(-3px);
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: 14px;
`;

const Footer = () => {
  // Function to handle navigation
  const handleNavigation = (path) => {
    window.location.hash = path; // Force navigation using hash
  };

  return (
    <FooterContainer>
      <Container>
        <Flex justify="space-between" wrap="wrap">
          <FooterSection style={{ flex: '1 1 300px' }}>
            <FooterLogo><LogoPrefix>de</LogoPrefix><LogoGradient>House</LogoGradient></FooterLogo>
            <Text>
              A community owned RWA DAO treasury that accepts donations and rewards contributors with points for future perks.
            </Text>

            <SocialLinks gap="12px">
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer">X</SocialIcon>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer">D</SocialIcon>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer">T</SocialIcon>
              <SocialIcon href="#" target="_blank" rel="noopener noreferrer">G</SocialIcon>
            </SocialLinks>
          </FooterSection>

          <FooterSection style={{ flex: '1 1 200px' }}>
            <FooterHeading>Quick Links</FooterHeading>
            <FooterLink to="/" onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}>Home</FooterLink>
            <FooterLink to="/donate" onClick={(e) => { e.preventDefault(); handleNavigation('/donate'); }}>Donate</FooterLink>
            <FooterLink to="/leaderboard" onClick={(e) => { e.preventDefault(); handleNavigation('/leaderboard'); }}>Leaderboard</FooterLink>
            <FooterLink to="/about" onClick={(e) => { e.preventDefault(); handleNavigation('/about'); }}>About</FooterLink>
          </FooterSection>

          <FooterSection style={{ flex: '1 1 200px' }}>
            <FooterHeading>Supported Crypto</FooterHeading>
            <FooterLink to="/donate?crypto=btc" onClick={(e) => { e.preventDefault(); handleNavigation('/donate?crypto=btc'); }}>Bitcoin (BTC)</FooterLink>
            <FooterLink to="/donate?crypto=eth" onClick={(e) => { e.preventDefault(); handleNavigation('/donate?crypto=eth'); }}>Ethereum (ETH)</FooterLink>
            <FooterLink to="/donate?crypto=sol" onClick={(e) => { e.preventDefault(); handleNavigation('/donate?crypto=sol'); }}>Solana (SOL)</FooterLink>
            <FooterLink to="/donate?crypto=usdc" onClick={(e) => { e.preventDefault(); handleNavigation('/donate?crypto=usdc'); }}>Stablecoins</FooterLink>
          </FooterSection>

          <FooterSection style={{ flex: '1 1 200px' }}>
            <FooterHeading>Resources</FooterHeading>
            <FooterLink href="#">Documentation</FooterLink>
            <FooterLink href="#">FAQ</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms of Service</FooterLink>
          </FooterSection>
        </Flex>

        <Copyright>
          © {new Date().getFullYear()} deHouse. All rights reserved.
        </Copyright>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
