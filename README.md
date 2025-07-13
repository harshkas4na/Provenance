# 🏛️ Provenance: An On-Chain Reputation System for Citrea

**Provenance is a comprehensive, on-chain reputation scoring system built for Citrea, the first ZK-Rollup on Bitcoin.** It transforms user activities across the entire Citrea DeFi ecosystem into a unified, transparent reputation score. This score unlocks tangible benefits like undercollateralized lending, enhanced governance weight, and exclusive protocol incentives.

[](https://opensource.org/licenses/MIT)
[](https://getfoundry.sh/)
[](https://nextjs.org/)

-----

## 🎯 Core Concepts: More Than a Sybil Score

Provenance is fundamentally different from binary identity solutions like Humanode. While those systems answer *"Is this a real person?"*, Provenance answers ***"Is this a good person to do business with?"***

Think of it like the difference between a government ID and a credit score:

  * **Identity Verification (like Humanode):** Proves you are a unique individual. It's a one-time check.
  * **Provenance Reputation Score:** Measures your on-chain behavior, trustworthiness, and engagement over time. It's a continuous, dynamic score.

Our system provides deep, ecosystem-specific behavioral intelligence, making it a complementary and essential layer for a mature DeFi ecosystem.

## 🏗️ System Architecture

The entire system is designed for transparency and decentralization. The smart contract holds all the scoring logic, while the backend's only job is to watch for events and relay them. This ensures that the rules for reputation are public and cannot be manipulated off-chain.

```
[User Actions on dApps] → [Protocol Events Emitted] → [Backend Event Relay] → [Provenance SBT Contract] → [Reputation Score Updated]
```

## 🛠️ Technology Stack

  * **Smart Contracts**: Solidity, [Foundry](https://getfoundry.sh/)
  * **Backend**: Node.js, Express, [Ethers.js](https://ethers.io/)
  * **Frontend**: Next.js, React, TypeScript, Tailwind CSS
  * **Blockchain**: [Citrea Testnet](https://citrea.xyz/)

## 🚀 Getting Started

Follow these steps to set up, deploy, and run the entire Provenance application locally.

### Prerequisites

  * [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
  * [Node.js](https://nodejs.org/) (v18 or later) and npm
  * [Git](https://git-scm.com/)

### 1\. Clone & Install Dependencies

First, clone the repository and install the necessary dependencies for both the smart contracts and the backend/frontend.

```bash
# Clone the repository
git clone <your-repo-url>
cd provenance

# Install Foundry smart contract dependencies
forge install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to the root directory
cd ..
```

### 2\. Configure Your Environment

You need a private key from a wallet funded with Citrea Testnet ETH.

1.  **Create a `.env` file** in the root directory of the project:
    ```bash
    cp .env.example .env
    ```
2.  **Add your private key** to the `.env` file:
    ```
    PRIVATE_KEY=your_private_key_here
    CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
    ```
    *This `.env` file is used by Foundry to deploy the contracts.*

### 3\. Deploy the Smart Contracts

Use the Foundry script to deploy the `ReputationSBT` contract and all the mock protocol contracts to the Citrea Testnet.

```bash
forge script script/Deploy.s.sol --rpc-url citrea_testnet --broadcast --verify
```

After the script runs, it will print the addresses of all the newly deployed contracts.

### 4\. Update Backend and Frontend Configuration

1.  **Copy the contract addresses** from the deployment output.
2.  **Update the `backend/.env` file**: Paste the new addresses into your `backend/.env` file. This tells the event relay which contracts to watch.
3.  **Update the `frontend/lib/contracts.ts` file**: Paste the new addresses into the placeholder constants at the top of this file.

## 🏃 Running the Application

### 1\. Start the Backend Event Relay

The backend service watches for events from the mock protocols and updates the `ReputationSBT` contract.

```bash
cd backend
npm run dev
```

You should see a confirmation that the relay has started and is polling for events.

### 2\. Start the Frontend Application

In a new terminal, run the frontend.

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the application.

### 3\. Test the Full Flow

1.  Connect your wallet on the frontend.
2.  Navigate to the **Playground**.
3.  Click one of the "Simulate" buttons (e.g., "Simulate: Register Domain").
4.  Approve the transaction in your wallet.
5.  Watch the backend terminal. You should see it detect the event and relay it to the `ReputationSBT` contract.
6.  Navigate to the **Dashboard**. Your reputation score should now be updated with the points from the action you just performed.

## ❗ Troubleshooting: The Citrea Event Log Issue

During development, we identified a platform-level issue with the Citrea Testnet RPC where event logs are not reliably returned in transaction receipts, even for successful transactions. The `logs` array often comes back empty.

If your backend is not detecting events even after a successful transaction, this is the likely cause.

**Solution:**

The official recommendation for reliable event data on Citrea is to use a dedicated data indexer.

1.  **Contact Citrea Support**: Report the issue in their official [Discord server](https://www.google.com/search?q=https://discord.com/invite/citrea) to get the latest status.
2.  **Use a Data Indexer**: The most robust workaround is to use an indexer like **Goldsky**, which is an official partner. You can deploy a subgraph that reads event data directly from the chain and provides a reliable GraphQL API for your backend to query. This bypasses the public RPC's limitations.

-----

## 🤝 Contributing

Contributions are welcome\! If you'd like to help improve Provenance, please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/your-amazing-feature`).
5.  Open a new Pull Request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.