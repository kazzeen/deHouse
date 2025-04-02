import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context for wallet state
export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [chainId, setChainId] = useState('');
  const [balance, setBalance] = useState(0);
  
  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      // Check for Ethereum provider (MetaMask, etc.)
      if (window.ethereum) {
        try {
          // Get connected accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletType('ethereum');
            setIsConnected(true);
            
            // Get chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(chainId);
            
            // Get balance
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            setBalance(parseInt(balance, 16) / 1e18); // Convert from wei to ETH
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', handleChainChanged);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
      
      // Check for Solana wallet (Phantom, etc.)
      if (window.solana) {
        try {
          if (window.solana.isConnected) {
            setWalletAddress(window.solana.publicKey.toString());
            setWalletType('solana');
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking Solana wallet connection:', error);
        }
      }
    };
    
    checkConnection();
    
    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);
  
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setWalletAddress(accounts[0]);
    }
  };
  
  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    // Reload the page to avoid any state inconsistencies
    window.location.reload();
  };
  
  const connectEthereumWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        setWalletAddress(accounts[0]);
        setWalletType('ethereum');
        setIsConnected(true);
        
        // Get chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chainId);
        
        // Get balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        setBalance(parseInt(balance, 16) / 1e18); // Convert from wei to ETH
        
        return true;
      } catch (error) {
        console.error('Error connecting to Ethereum wallet:', error);
        return false;
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet to connect.');
      return false;
    }
  };
  
  const connectSolanaWallet = async () => {
    if (window.solana) {
      try {
        await window.solana.connect();
        
        setWalletAddress(window.solana.publicKey.toString());
        setWalletType('solana');
        setIsConnected(true);
        
        return true;
      } catch (error) {
        console.error('Error connecting to Solana wallet:', error);
        return false;
      }
    } else {
      alert('Please install Phantom or another Solana wallet to connect.');
      return false;
    }
  };
  
  const disconnectWallet = () => {
    if (walletType === 'solana' && window.solana) {
      window.solana.disconnect();
    }
    
    setIsConnected(false);
    setWalletAddress('');
    setWalletType('');
    setChainId('');
    setBalance(0);
  };
  
  const connectWallet = async (type = 'ethereum') => {
    if (type === 'ethereum') {
      return await connectEthereumWallet();
    } else if (type === 'solana') {
      return await connectSolanaWallet();
    }
    return false;
  };
  
  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        walletType,
        chainId,
        balance,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);
