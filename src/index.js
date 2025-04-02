import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { WalletProvider } from './utils/WalletContext';
import { DonationProvider } from './utils/DonationContext';

const App = () => {
  return (
    <WalletProvider>
      <DonationProvider>
        <Router>
          <GlobalStyle />
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </DonationProvider>
    </WalletProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
