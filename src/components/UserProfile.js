import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useUser } from '../utils/UserContext';
import { useWallet } from '../utils/WalletContext';
import { Button } from '../styles/StyledComponents';

const ProfileContainer = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--background);
  font-weight: bold;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Username = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
`;

const WalletAddress = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  word-break: break-all;
`;

const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--text);
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--text);
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
  
  &.error {
    background-color: rgba(255, 0, 0, 0.1);
    border: 1px solid rgba(255, 0, 0, 0.3);
    color: #ff6b6b;
  }
  
  &.success {
    background-color: rgba(0, 255, 0, 0.1);
    border: 1px solid rgba(0, 255, 0, 0.3);
    color: #51cf66;
  }
`;

const UserProfile = () => {
  const { currentUser, isLoading, error, updateProfile } = useUser();
  const { walletAddress, walletType } = useWallet();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Initialize form data when user data loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setIsEditing(false);
        setStatusMessage('Profile updated successfully!');
        setMessageType('success');
      } else {
        setStatusMessage(`Failed to update profile: ${result.error}`);
        setMessageType('error');
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
      setMessageType('error');
    }
  };
  
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };
  
  if (isLoading) {
    return <ProfileContainer>Loading user profile...</ProfileContainer>;
  }
  
  if (!currentUser) {
    return (
      <ProfileContainer>
        <h2>User Profile</h2>
        <p>Please connect your wallet to view your profile.</p>
      </ProfileContainer>
    );
  }
  
  return (
    <ProfileContainer>
      {!isEditing ? (
        <>
          <ProfileHeader>
            <ProfileAvatar>
              {walletType === 'ethereum' ? 'E' : walletType === 'solana' ? 'S' : 'W'}
            </ProfileAvatar>
            <ProfileInfo>
              <Username>{currentUser.username}</Username>
              <WalletAddress>
                Wallet: {truncateAddress(walletAddress)}
              </WalletAddress>
              {currentUser.email && (
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  Email: {currentUser.email}
                </div>
              )}
            </ProfileInfo>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </ProfileHeader>
          
          {currentUser.bio && (
            <div>
              <h3>About</h3>
              <p>{currentUser.bio}</p>
            </div>
          )}
          
          {statusMessage && (
            <Message className={messageType}>{statusMessage}</Message>
          )}
        </>
      ) : (
        <>
          <h2>Edit Profile</h2>
          <ProfileForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="bio">Bio (optional)</Label>
              <TextArea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setIsEditing(false)}
                style={{ backgroundColor: 'transparent', border: '1px solid var(--text-secondary)' }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </ProfileForm>
          
          {statusMessage && (
            <Message className={messageType}>{statusMessage}</Message>
          )}
        </>
      )}
    </ProfileContainer>
  );
};

export default UserProfile;