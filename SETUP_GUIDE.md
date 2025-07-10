# Token Factory DApp Setup Guide

## Overview
This is a complete Web3 Token Factory DApp that allows you to create ERC-20 tokens using a smart contract deployed on a local Hardhat network. All transactions are free since they use test ETH on the local network.

## What's Deployed
- **TokenFactory Contract**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **SimpleDEX Contract**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Sample Tokens Already Created**:
  - USDC: `0xa16E02E87b7454126E5E10d957A927A7F5B5d2be`
  - WBTC: `0xB7A5bd0345EF1Cc5E66bf61BdeC17D2461fBd968`
  - LINK: `0xeEBe00Ac0756308ac4AaBfD76c05c4F3088B8883`

## Setup Instructions

### 1. Connect MetaMask to Local Network
1. Open MetaMask
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Add a network manually"
4. Enter the following details:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: (leave empty)
5. Click "Save"

**Important**: Use `127.0.0.1:8545` instead of `localhost:8545` to avoid potential DNS issues.

### 2. Import Test Account
To get test ETH for transactions, import one of the test accounts:
1. In MetaMask, click on your account icon
2. Select "Import Account"
3. Choose "Private Key"
4. Enter one of these private keys (each has 10,000 test ETH):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   This corresponds to account: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### 3. Access the DApp
1. Make sure the frontend is running: `cd frontend && npm run dev`
2. Open http://localhost:3000 in your browser
3. Click "Connect MetaMask"
4. Select the Hardhat Local network in MetaMask
5. Approve the connection

## Features Available

### 1. View Existing Tokens
- See all tokens created by the factory
- View your own created tokens
- Click on any token to see details and your balance

### 2. Create New Tokens
- Fill in the token creation form:
  - **Token Name**: e.g., "My Awesome Token"
  - **Token Symbol**: e.g., "MAT"
  - **Initial Supply**: e.g., "1000000"
- Click "Create Token"
- Confirm the transaction in MetaMask (costs ~0.01 test ETH)
- Wait for confirmation

### 3. Token Information
- View token details (name, symbol, contract address)
- Check your balance of any token
- See who created each token

## Important Notes

- **Free Transactions**: All transactions use test ETH and are completely free
- **Local Network Only**: This setup only works on your local machine
- **Test Accounts**: The private keys are publicly known - never use them on mainnet
- **Reset Data**: If you restart the Hardhat node, all data will be reset

## Troubleshooting

### MetaMask Issues
- If transactions fail, try resetting your account in MetaMask (Settings > Advanced > Reset Account)
- Make sure you're connected to the "Hardhat Local" network
- Ensure you have test ETH in your account

### Network Issues
- Make sure the Hardhat node is running (`npx hardhat node` in the hardhat-backend folder)
- Check that the frontend is running (`npm run dev` in the frontend folder)
- Verify the RPC URL is http://localhost:8545

### Contract Issues
- If contracts seem unavailable, redeploy them: `npx hardhat run scripts/deploy.ts --network localhost`
- Check that the contract addresses in the frontend match the deployed addresses

## Architecture

### Smart Contracts (Hardhat Backend)
- **TokenFactory.sol**: Creates new ERC-20 tokens
- **SimpleDEX.sol**: Basic DEX functionality (for future features)
- **MyToken.sol**: ERC-20 token template

### Frontend (Next.js + Wagmi)
- **React Components**: Modern UI with Tailwind CSS
- **Wagmi Integration**: Web3 hooks for blockchain interaction
- **TypeScript**: Type-safe development
- **MetaMask Connection**: Seamless wallet integration

## Next Steps
You can extend this DApp by:
- Adding token transfer functionality
- Implementing the DEX features
- Adding token burning/minting capabilities
- Creating a token marketplace
- Adding more advanced token features (pausable, mintable, etc.)
