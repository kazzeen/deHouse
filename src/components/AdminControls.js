import React from 'react';
import styled from 'styled-components';
import { useUser } from '../utils/UserContext';
import { Button } from '../styles/StyledComponents';

const AdminPanel = styled.div`
  background-color: var(--card-bg);
  border: 1px solid var(--primary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
`;

const AdminTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  margin: 0;
`;

const AdminContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AdminControls = ({ children }) => {
  const { isAdmin } = useUser();

  // Only render the admin panel if the user is an admin
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminPanel>
      <AdminHeader>
        <AdminTitle>Admin Controls</AdminTitle>
      </AdminHeader>
      <AdminContent>
        {children}
      </AdminContent>
    </AdminPanel>
  );
};

// A simple button component specifically for admin actions
export const AdminButton = ({ onClick, children, ...props }) => {
  return (
    <Button onClick={onClick} {...props}>
      {children}
    </Button>
  );
};

export default AdminControls;