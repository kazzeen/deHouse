# deHouse - Web3 Crypto Donation Platform

deHouse is a modern Web3 crypto donation website with a DAO treasury that accepts donations in multiple cryptocurrencies and rewards contributors with points on a leaderboard.

## Features

- **Multi-Chain Support**: Accept donations in Bitcoin (BTC), Ethereum (ETH), Solana (SOL), and Stablecoins (USDC, USDT, DAI)
- **Wallet Integration**: Connect with multiple wallet types including MetaMask, Phantom, and more
- **Point System**: Earn 10 points for every $0.10 worth of crypto donated
- **Leaderboard**: Track top contributors and your personal donation stats
- **Modern UI**: Sleek dark-themed interface with responsive design

## Cryptocurrency Addresses

The platform accepts donations to the following addresses:

### Bitcoin (BTC)
- Legacy: `1Kr3GkJnBZeeQZZoiYjHoxhZjDsSby9d4p`
- Taproot: `bc1pl6sq6srs5vuczd7ard896cc57gg4h3mdnvjsg4zp5zs2rawqmtgsp4hh08`
- Native Segwit: `bc1qu7suxfua5x46e59e7a56vd8wuj3a8qj06qr42j`

### Ethereum (ETH)
- `0x8262ab131e3f52315d700308152e166909ecfa47`

### Solana (SOL)
- `2n8etcRuK49GUMXWi2QRtQ8YwS6nTDEUjfX7LcvKFyiV`



### Stablecoins (USDC, USDT, DAI)
- Use the Ethereum address: `0x8262ab131e3f52315d700308152e166909ecfa47`

## Project Structure

```
deHouse/
├── public/              # Public assets
├── src/                 # Source code
│   ├── assets/          # Images and SVG icons
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── styles/          # Global styles and styled components
│   ├── utils/           # Utility functions and context providers
│   └── index.js         # Application entry point
├── dist/                # Production build
├── webpack.config.js    # Webpack configuration
└── package.json         # Project dependencies
```

## Technology Stack

- **Frontend**: React, React Router
- **Styling**: Styled Components
- **Web3 Integration**: Web3.js, Ethers.js, Solana Web3.js
- **Build Tools**: Webpack, Babel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Build for production:
   ```
   npm run build
   ```

## Deployed Website

The website is deployed and accessible at:
[https://pfrrybuh.manus.space](https://pfrrybuh.manus.space)

## License

This project is licensed under the ISC License.
