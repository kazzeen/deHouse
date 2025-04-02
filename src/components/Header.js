import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Container, Flex, Heading, Text } from '../styles/StyledComponents';
import WalletConnectButton from './WalletConnectButton';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.header`
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(15, 22, 36, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const rainbowGradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
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

const NavLinks = styled.nav`
  display: flex;
  gap: 32px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover, &.active {
    color: var(--text-primary);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 24px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Container>
        <Flex justify="space-between" align="center">
          <Logo><LogoPrefix>de</LogoPrefix><LogoGradient>House</LogoGradient></Logo>
          
          <NavLinks>
            <NavLink to="/" className="active">Home</NavLink>
            <NavLink to="/donate">Donate</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/about">About</NavLink>
          </NavLinks>
          
          <WalletConnectButton />
          
          <MobileMenuButton>☰</MobileMenuButton>
        </Flex>
      </Container>
    </HeaderContainer>
  );
};

export default Header;
