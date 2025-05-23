import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Flex, Text } from '../styles/StyledComponents';

// Wallet addresses
const WALLET_ADDRESSES = {
  btc: 'bc1qu7suxfua5x46e59e7a56vd8wuj3a8qj06qr42j',
  eth: '0x8262ab131e3f52315d700308152e166909ecfa47',
  sol: '2n8etcRuK49GUMXWi2QRtQ8YwS6nTDEUjfX7LcvKFyiV'
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(15, 22, 36, 0.95) 100%);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(108, 92, 231, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 90% 10%, rgba(108, 92, 231, 0.15) 0%, transparent 70%);
    z-index: 0;
    border-radius: 16px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
  
  &:hover {
    color: white;
  }
`;

const QRCodeContainer = styled.div`
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const QRCodeImage = styled.div`
  width: 200px;
  height: 200px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const AddressContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  width: 100%;
  word-break: break-all;
  position: relative;
`;

const CopyButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  margin-top: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #5a4cbe;
  }
`;

const CryptoLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
`;

const QRCodeModal = ({ isOpen, onClose, cryptoType, cryptoName, cryptoIcon }) => {
  const [copied, setCopied] = useState(false);
  const address = WALLET_ADDRESSES[cryptoType];
  
  // Generate QR code URL using an external service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <CryptoLabel>
          <img src={cryptoIcon} alt={cryptoName} />
          <h3>{cryptoName} Wallet</h3>
        </CryptoLabel>
        
        <QRCodeContainer>
          <QRCodeImage>
            <img src={qrCodeUrl} alt={`${cryptoName} QR Code`} />
          </QRCodeImage>
          
          <Text size="14px" style={{ textAlign: 'center', marginBottom: '8px' }}>
            Scan this QR code to donate {cryptoName}
          </Text>
          
          <AddressContainer>
            <Text size="14px" style={{ wordBreak: 'break-all' }}>
              {address}
            </Text>
          </AddressContainer>
          
          <CopyButton onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Address'}
          </CopyButton>
        </QRCodeContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QRCodeModal;
