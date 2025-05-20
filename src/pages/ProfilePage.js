import React from 'react';
import styled from 'styled-components';
import UserProfile from '../components/UserProfile';
import { useUser } from '../utils/UserContext';
import { useWallet } from '../utils/WalletContext';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text);
`;

const ConnectPrompt = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  margin-top: 40px;
`;

const ProfilePage = () => {
  const { isLoggedIn } = useUser();
  const { isConnected } = useWallet();

  return (
    <PageContainer>
      <PageTitle>User Profile</PageTitle>
      
      {isConnected ? (
        <UserProfile />
      ) : (
        <ConnectPrompt>
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view and manage your profile.</p>
        </ConnectPrompt>
      )}
    </PageContainer>
  );
};

export default ProfilePage;