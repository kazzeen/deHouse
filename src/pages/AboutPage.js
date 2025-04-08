import React from 'react';
import styled from 'styled-components';
import { Container, Section, Heading, Text, Flex, Card } from '../styles/StyledComponents';

const TeamMemberCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 30px;
`;

const TeamMemberAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--text-primary);
`;

const TeamMemberName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const TeamMemberRole = styled.p`
  font-size: 16px;
  color: var(--primary);
  margin-bottom: 16px;
`;

const AboutPage = () => {
  return (
    <>
      <Section>
        <Container>
          <Heading level={2}>About deHouse</Heading>
          <Text size="18px" mb="32px">
            deHouse is a revolutionary Web3 crypto donation platform that connects donors with causes they care about while leveraging blockchain technology for transparency and accountability.
          </Text>
          
          <Flex direction="column" gap="48px">
            <div>
              <Heading level={3}>Our Mission</Heading>
              <Text>
                Our mission is to create a transparent, efficient, and rewarding donation ecosystem that empowers both donors and recipients. By utilizing blockchain technology, we ensure that every donation is traceable, secure, and reaches its intended destination.
              </Text>
            </div>
            
            <div>
              <Heading level={3}>How It Works</Heading>
              <Text>
                deHouse accepts multiple cryptocurrencies including Bitcoin, Ethereum, Solana, and various stablecoins. When you donate, your contribution is recorded on the blockchain and you receive deHouse points proportional to your donation amount. These points contribute to your ranking on our leaderboard and may unlock special benefits in the future.
              </Text>
            </div>
            
            <div>
              <Heading level={3}>DAO Treasury</Heading>
              <Text>
                All donations are managed through our Decentralized Autonomous Organization (DAO) treasury. This ensures that funds are allocated according to community consensus and maintains the highest level of transparency. DAO members can propose and vote on funding allocations to various causes and projects.
              </Text>
            </div>
          </Flex>
        </Container>
      </Section>
      
      <Section style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <Container>
          <Heading level={2}>Our Team</Heading>
          <Text size="18px" mb="48px">
            Meet the passionate individuals behind deHouse who are dedicated to revolutionizing charitable giving through blockchain technology.
          </Text>
          
          <Flex justify="center" wrap="wrap" gap="30px">
            <TeamMemberCard>
              <TeamMemberAvatar>CS</TeamMemberAvatar>
              <TeamMemberName>Christian Swan</TeamMemberName>
              <TeamMemberRole>Founder & CEO</TeamMemberRole>
              <Text>
                Blockchain enthusiast with 8+ years of experience in fintech and crypto projects.
              </Text>
            </TeamMemberCard>
            
            <TeamMemberCard>
              <TeamMemberAvatar>PA</TeamMemberAvatar>
              <TeamMemberName>Parkash Acharya</TeamMemberName>
              <TeamMemberRole>CTO</TeamMemberRole>
              <Text>
                Full-stack developer specializing in Web3 technologies and smart contract development.
              </Text>
            </TeamMemberCard>
            
            <TeamMemberCard>
              <TeamMemberAvatar>RH</TeamMemberAvatar>
              <TeamMemberName>Richard Portorico</TeamMemberName>
              <TeamMemberRole>Head of Partnerships</TeamMemberRole>
              <Text>
                Former non-profit director with extensive experience in building strategic relationships.
              </Text>
            </TeamMemberCard>
          </Flex>
        </Container>
      </Section>
    </>
  );
};

export default AboutPage;