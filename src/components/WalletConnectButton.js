import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../styles/StyledComponents';
import { useWallet } from '../utils/WalletContext';

const WalletButtonContainer = styled.div`
  position: relative;
`;

const WalletButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WalletIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--background);
`;

const WalletAddress = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const WalletDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 240px;
  z-index: 100;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background-color: rgba(108, 92, 231, 0.1);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const WalletTypeSelector = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 240px;
  z-index: 100;
  overflow: hidden;
  padding: 8px;
`;

const WalletTypeButton = styled(Button)`
  width: 100%;
  margin-bottom: 8px;
  justify-content: flex-start;
  padding: 10px 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WalletConnectButton = () => {
  const { isConnected, walletAddress, walletType, connectWallet, disconnectWallet } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
  
  const handleConnectClick = () => {
    if (!isConnected) {
      setWalletSelectorOpen(true);
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };
  
  const handleWalletSelect = async (type) => {
    setWalletSelectorOpen(false);
    const success = await connectWallet(type);
    if (success) {
      // Connection successful
    }
  };
  
  const handleDisconnect = () => {
    disconnectWallet();
    setDropdownOpen(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        alert('Address copied to clipboard!');
        setDropdownOpen(false);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const viewOnExplorer = () => {
    let explorerUrl = '';
    
    if (walletType === 'ethereum') {
      explorerUrl = `https://etherscan.io/address/${walletAddress}`;
    } else if (walletType === 'solana') {
      explorerUrl = `https://explorer.solana.com/address/${walletAddress}`;
    }
    
    if (explorerUrl) {
      window.open(explorerUrl, '_blank');
      setDropdownOpen(false);
    }
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.wallet-container')) {
        setDropdownOpen(false);
        setWalletSelectorOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <WalletButtonContainer className="wallet-container">
      <WalletButton onClick={handleConnectClick}>
        {isConnected ? (
          <>
            <WalletIcon>{walletType.charAt(0).toUpperCase()}</WalletIcon>
            <WalletAddress>{truncateAddress(walletAddress)}</WalletAddress>
          </>
        ) : (
          'Connect Wallet'
        )}
      </WalletButton>
      
      {walletSelectorOpen && !isConnected && (
        <WalletTypeSelector>
          <WalletTypeButton onClick={() => handleWalletSelect('ethereum')}>
            Ethereum Wallet (MetaMask)
          </WalletTypeButton>
          <WalletTypeButton onClick={() => handleWalletSelect('solana')}>
            Solana Wallet (Phantom)
          </WalletTypeButton>
        </WalletTypeSelector>
      )}
      
      {dropdownOpen && isConnected && (
        <WalletDropdown>
          <DropdownItem>
            <WalletIcon>{walletType.charAt(0).toUpperCase()}</WalletIcon>
            <div>
              <div style={{ fontWeight: 600 }}>Connected</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{truncateAddress(walletAddress)}</div>
            </div>
          </DropdownItem>
          <DropdownItem onClick={viewOnExplorer}>View on Explorer</DropdownItem>
          <DropdownItem onClick={copyToClipboard}>Copy Address</DropdownItem>
          <DropdownItem onClick={handleDisconnect}>Disconnect</DropdownItem>
        </WalletDropdown>
      )}
    </WalletButtonContainer>
  );
};

export default WalletConnectButton;
