import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Section, Heading, Text, Button, Flex, Card, Input, Divider, Badge } from '../styles/StyledComponents';
import WalletConnectButton from '../components/WalletConnectButton';
import { useWallet } from '../utils/WalletContext';
import { useDonation } from '../utils/DonationContext';

// Admin section styling
const AdminSection = styled(Card)`
  margin-top: 32px;
  background-color: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
`;

const AdminButton = styled(Button)`
  background-color: #d32f2f;
  &:hover {
    background-color: #b71c1c;
  }
`;

const LeaderboardSection = styled(Section)`
  background-color: var(--background);
`;

const LeaderboardCard = styled(Card)`
  margin-bottom: 32px;
`;

const LeaderboardHeader = styled(Flex)`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LeaderboardTable = styled.div`
  width: 100%;
`;

const TableHeader = styled(Flex)`
  padding: 16px;
  background-color: rgba(15, 22, 36, 0.5);
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 600;
`;

const TableRow = styled(Flex)`
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(108, 92, 231, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const RankCell = styled.div`
  width: 80px;
  font-weight: 600;
  color: ${props => {
    if (props.rank === 1) return 'gold';
    if (props.rank === 2) return 'silver';
    if (props.rank === 3) return '#cd7f32'; // bronze
    return 'var(--text-primary)';
  }};
`;

const AddressCell = styled.div`
  flex: 1;
`;

const PointsCell = styled.div`
  width: 120px;
  text-align: right;
  font-weight: 600;
  color: var(--primary);
`;

const DonationsCell = styled.div`
  width: 120px;
  text-align: right;
`;

const FilterContainer = styled(Flex)`
  margin-bottom: 24px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
`;

const Pagination = styled(Flex)`
  margin-top: 32px;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--card-bg)'};
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary)' : 'var(--primary-dark)'};
  }
`;

const UserStatsCard = styled(Card)`
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.1) 0%, rgba(0, 206, 201, 0.1) 100%);
  border: 1px solid rgba(108, 92, 231, 0.2);
`;

const StatBox = styled.div`
  text-align: center;
  padding: 16px;
  background-color: rgba(26, 35, 50, 0.5);
  border-radius: 8px;
  
  h3 {
    font-size: 32px;
    color: var(--primary);
    margin-bottom: 8px;
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
  }
`;

const LeaderboardPage = () => {
  const { isConnected, walletAddress } = useWallet();
  const { donations, totalPoints, totalDonated, isLoading, leaderboard, loadUserRank, clearDatabase } = useDonation();
  
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Format leaderboard data for display
  const formatLeaderboardData = (data) => {
    return data.map((item, index) => ({
      rank: index + 1,
      address: item.walletAddress || 'unknown', // Ensure we have a valid address - don't normalize here
      points: item.points || 0,
      donations: item.donationCount || 0,
      cryptos: item.cryptos || [] // Use actual cryptos from item
    }));
  };
  
  // Handle database clearing
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(null);
  
  const handleClearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear the entire database? This action cannot be undone.')) {
      setIsClearing(true);
      setClearSuccess(null);
      try {
        const result = await clearDatabase();
        setClearSuccess(result);
      } catch (error) {
        console.error('Error clearing database:', error);
        setClearSuccess(false);
      } finally {
        setIsClearing(false);
      }
    }
  };
  
  // Leaderboard data from context
  const leaderboardData = formatLeaderboardData(leaderboard);
  
  // Filter data based on search query and time filter
  useEffect(() => {
    setLoading(true);
    if (searchQuery.trim() === '') {
      setFilteredData(leaderboardData);
    } else {
      const filtered = leaderboardData.filter(item => {
        // Case-insensitive search for Ethereum addresses (lowercase)
        // Case-sensitive search for Solana addresses (preserve case)
        // Check if the address contains the search query in any case form
        const addressLower = item.address.toLowerCase();
        const queryLower = searchQuery.toLowerCase();
        
        // Try both case-sensitive and case-insensitive matching
        return addressLower.includes(queryLower) || 
               item.address.includes(searchQuery);
      });
      setFilteredData(filtered);
    }
    setLoading(false);
  }, [searchQuery, timeFilter, leaderboardData]);
  
  // Initialize filtered data
  useEffect(() => {
    setFilteredData(leaderboardData);
  }, [leaderboardData]);
  
  // Find user's rank when connected
  useEffect(() => {
    const fetchUserRank = async () => {
      if (isConnected && walletAddress) {
        // Use the loadUserRank function from DonationContext
        const rank = await loadUserRank();
        setUserRank(rank);
      } else {
        setUserRank(null);
      }
    };
    
    fetchUserRank();
  }, [isConnected, walletAddress, totalPoints]);
  
  const truncateAddress = (address) => {
    // More robust address handling to prevent glitches
    if (!address) return 'Unknown Address';
    if (typeof address !== 'string') return 'Invalid Address';
    
    // Trim whitespace but preserve case for Solana addresses
    // Solana addresses start with a capital letter and maintain case sensitivity
    const trimmedAddress = address.trim();
    
    // If it's too short or empty after trimming, return a placeholder
    if (!trimmedAddress || trimmedAddress.length < 5) return 'Invalid Address';
    
    // For short addresses, just return them as is
    if (trimmedAddress.length <= 15) return trimmedAddress;
    
    // For normal addresses, truncate with ellipsis while preserving case
    return `${trimmedAddress.substring(0, 8)}...${trimmedAddress.substring(trimmedAddress.length - 8)}`;
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setCurrentPage(1);
    // In a real app, this would fetch different data based on the time filter
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real app, this would fetch the appropriate page of data
  };
  
  const renderUserStats = () => {
    if (!isConnected) {
      return (
        <Card>
          <Heading level={3}>Your Contribution Status</Heading>
          <Text mb="24px">Connect your wallet to see your donation history and leaderboard position.</Text>
          
          <Flex justify="center">
            <WalletConnectButton />
          </Flex>
        </Card>
      );
    }
    
    return (
      <UserStatsCard>
        <Heading level={3}>Your Contribution Status</Heading>
        <Text mb="24px">
          {walletAddress && truncateAddress(walletAddress)}
        </Text>
        
        <Flex gap="24px" wrap="wrap">
          <StatBox style={{ flex: '1 1 200px' }}>
            <h3>{totalPoints.toLocaleString()}</h3>
            <p>Total Points</p>
          </StatBox>
          
          <StatBox style={{ flex: '1 1 200px' }}>
            <h3>${totalDonated.toFixed(2)}</h3>
            <p>Total Donated</p>
          </StatBox>
          
          <StatBox style={{ flex: '1 1 200px' }}>
            <h3>{userRank ? `#${userRank}` : '-'}</h3>
            <p>Current Rank</p>
          </StatBox>
        </Flex>
        
        {donations.length > 0 ? (
          <div style={{ marginTop: '24px' }}>
            <Heading level={4}>Recent Donations</Heading>
            <LeaderboardTable>
              <TableHeader>
                <div style={{ flex: '1' }}>Date</div>
                <div style={{ flex: '1' }}>Amount</div>
                <div style={{ flex: '1', textAlign: 'right' }}>Points</div>
              </TableHeader>
              
              {donations.map((donation, index) => (
                <TableRow key={index}>
                  <div style={{ flex: '1' }}>{new Date(donation.timestamp).toLocaleDateString()}</div>
                  <div style={{ flex: '1' }}>
                    {donation.amount} {donation.currency.toUpperCase()}
                  </div>
                  <div style={{ flex: '1', textAlign: 'right', color: 'var(--primary)', fontWeight: '600' }}>
                    {donation.points.toLocaleString()}
                  </div>
                </TableRow>
              ))}
            </LeaderboardTable>
          </div>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: '24px' }}>
            No donations found. Make your first donation to earn points!
          </Text>
        )}
        
        <Flex justify="center" style={{ marginTop: '24px' }}>
          <Button onClick={() => window.location.href = '/donate'}>Make a Donation</Button>
        </Flex>
      </UserStatsCard>
    );
  };
  
  return (
    <LeaderboardSection>
      <Container>
        <Heading level={1}>Donation Leaderboard</Heading>
        <Text size="18px" mb="40px">
          Top contributors to the deHouse DAO Treasury. Every $0.10 donated earns 10 points.
        </Text>
        
        <LeaderboardCard>
          <LeaderboardHeader justify="space-between" align="center">
            <Heading level={3} style={{ marginBottom: 0 }}>Top Contributors</Heading>
            
            <FilterContainer gap="16px">
              <Button 
                secondary={timeFilter !== 'all'} 
                onClick={() => handleTimeFilterChange('all')}
              >
                All Time
              </Button>
              <Button 
                secondary={timeFilter !== 'month'} 
                onClick={() => handleTimeFilterChange('month')}
              >
                This Month
              </Button>
              <Button 
                secondary={timeFilter !== 'week'} 
                onClick={() => handleTimeFilterChange('week')}
              >
                This Week
              </Button>
            </FilterContainer>
          </LeaderboardHeader>
          
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput 
              placeholder="Search by wallet address" 
              value={searchQuery}
              onChange={handleSearch}
            />
          </SearchContainer>
          
          <LeaderboardTable>
            <TableHeader>
              <RankCell>Rank</RankCell>
              <AddressCell>Wallet Address</AddressCell>
              <DonationsCell>Donations</DonationsCell>
              <PointsCell>Points</PointsCell>
            </TableHeader>
            
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.rank}>
                  <RankCell rank={item.rank}>#{item.rank}</RankCell>
                  <AddressCell>
                    <Flex align="center">
                      <Text mb="0">{truncateAddress(item.address)}</Text>
                      <Flex gap="4px" style={{ marginLeft: '12px' }}>
                        {item.cryptos.map(crypto => (
                          <Badge key={crypto} type="primary" style={{ fontSize: '10px', padding: '2px 6px' }}>{crypto}</Badge>
                        ))}
                      </Flex>
                    </Flex>
                  </AddressCell>
                  <DonationsCell>{item.donations || 0}</DonationsCell>
                  <PointsCell>{(item.points || 0).toLocaleString()}</PointsCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <AddressCell style={{ textAlign: 'center' }}>
                  <Text mb="0">No results found</Text>
                </AddressCell>
              </TableRow>
            )}
          </LeaderboardTable>
          
          <Pagination justify="center" gap="8px">
            <PageButton onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>&lt;</PageButton>
            <PageButton active={currentPage === 1} onClick={() => handlePageChange(1)}>1</PageButton>
            <PageButton active={currentPage === 2} onClick={() => handlePageChange(2)}>2</PageButton>
            <PageButton active={currentPage === 3} onClick={() => handlePageChange(3)}>3</PageButton>
            <PageButton>...</PageButton>
            <PageButton onClick={() => handlePageChange(10)}>10</PageButton>
            <PageButton onClick={() => handlePageChange(Math.min(10, currentPage + 1))}>&gt;</PageButton>
          </Pagination>
        </LeaderboardCard>
        
        {renderUserStats()}
        
        {/* Admin Section */}
        <AdminSection>
          <Heading level={3}>Admin Controls</Heading>
          <Text mb="24px">
            Warning: These actions are irreversible and will affect all users.
          </Text>
          
          <Flex gap="16px" direction="column">
            <AdminButton 
              onClick={handleClearDatabase}
              disabled={isClearing}
            >
              {isClearing ? 'Clearing Database...' : 'Clear Database'}
            </AdminButton>
            
            {clearSuccess === true && (
              <Text style={{ color: 'green' }}>Database cleared successfully!</Text>
            )}
            
            {clearSuccess === false && (
              <Text style={{ color: 'red' }}>Failed to clear database. Check console for errors.</Text>
            )}
          </Flex>
        </AdminSection>
      </Container>
    </LeaderboardSection>
  );
};

export default LeaderboardPage;
