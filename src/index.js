import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './utils/UserContext';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import { WalletProvider } from './utils/WalletContext';
import { DonationProvider } from './utils/DonationContext';

const App = () => {
  return (
    <WalletProvider>
      <UserProvider>
      <DonationProvider>
        <Router>
          <GlobalStyle />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999
          }}>
            <Header />
          </div>
          <main style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '80px' /* Add margin to accommodate fixed header */
          }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </DonationProvider>
      </UserProvider>
    </WalletProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
