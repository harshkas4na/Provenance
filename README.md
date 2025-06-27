# 📊 Citrea Reputation System

**The first comprehensive on-chain reputation scoring system for Bitcoin's first Zero-Knowledge Rollup.**

Transform user activities across the entire Citrea ecosystem into a unified, gamified reputation score that enables undercollateralized lending, governance weight, and protocol incentives.

---

## 🎯 **Project Overview**

This repository contains:
- **ReputationSBT.sol** - Smart contract that handles all scoring logic
- **Backend Event Relay** - Monitors protocol events and relays to smart contract
- **Mock Protocol Contracts** - Demo versions of Citrea ecosystem protocols
- **API Server** - REST endpoints for reputation queries

## 🏗️ **System Architecture**

```
[User Actions] → [Protocol Events] → [Backend Relay] → [Smart Contract] → [Reputation Update]
```

The smart contract contains ALL scoring logic, while the backend simply monitors and relays events. This ensures transparency and prevents gaming.

---

## 📋 **Prerequisites**

Before starting, ensure you have:

- **Foundry** installed ([Installation Guide](https://book.getfoundry.sh/getting-started/installation))
- **Node.js** v18+ and npm
- **Git** for cloning
- **Citrea Testnet** setup with test ETH

### Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Verify Installation
```bash
forge --version
cast --version
anvil --version
```

---

## 🚀 **Step-by-Step Setup**

### Step 1: Clone and Initialize Project

```bash
# Clone the repository
git clone <your-repo-url>
cd citrea-reputation-system

# Initialize foundry project
forge init --force

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts
```

### Step 2: Project Structure Setup

```bash
# Create the proper directory structure
mkdir -p src script test backend/src

# Move contracts to src/
# (Assuming you have the contracts ready)
```

Your structure should look like:
```
citrea-reputation-system/
├── src/
│   ├── ReputationSBT.sol
│   └── MockProtocols.sol
├── script/
│   └── Deploy.s.sol
├── test/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
└── foundry.toml
```

### Step 3: Configure Foundry

Create/update `foundry.toml`:
```bash
cat > foundry.toml << 'EOF'
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = ["@openzeppelin/=lib/openzeppelin-contracts/"]

[rpc_endpoints]
citrea_testnet = "https://rpc.testnet.citrea.xyz"

[etherscan]
citrea_testnet = { key = "your-api-key", url = "https://explorer.testnet.citrea.xyz" }
EOF
```

### Step 4: Setup Backend Environment

```bash
# Navigate to backend directory
cd backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install ethers express cors dotenv @types/node @types/express @types/cors typescript ts-node nodemon

# Install dev dependencies
npm install --save-dev @types/node @types/express @types/cors typescript ts-node nodemon prettier eslint

# Create package.json scripts
cat > package.json << 'EOF'
{
  "name": "citrea-reputation-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/eventRelay.js",
    "dev": "ts-node src/eventRelay.ts",
    "dev:watch": "nodemon --exec ts-node src/eventRelay.ts"
  },
  "dependencies": {
    "ethers": "^6.14.4",
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.3",
    "@types/express": "^5.0.3",
    "@types/cors": "^2.8.19",
    "typescript": "^5.8.3",
    "ts-node": "^10.9.2",
    "nodemon": "^3.1.10"
  }
}
EOF

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create environment file template
cat > .env.example << 'EOF'
# Citrea Network
CITREA_RPC_URL=https://rpc.testnet.citrea.xyz

# Private key for backend wallet (needs to be authorized as relay)
PRIVATE_KEY=your_private_key_here

# Deployed contract addresses (fill after deployment)
REPUTATION_CONTRACT_ADDRESS=
NAMOSHI_CONTRACT_ADDRESS=
SATSUMA_CONTRACT_ADDRESS=
SPINE_CONTRACT_ADDRESS=
MINT_PARK_CONTRACT_ADDRESS=
ASIGNA_CONTRACT_ADDRESS=
DVOTE_CONTRACT_ADDRESS=

# API Configuration
PORT=3001
EOF

# Copy to actual .env (you'll update this after deployment)
cp .env.example .env
```

### Step 5: Create Deployment Script

```bash
# Go back to project root
cd ..

# Create deployment script
cat > script/Deploy.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ReputationSBT.sol";
import "../src/MockProtocols.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from:", deployer);
        console.log("Balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy ReputationSBT
        console.log("\n=== DEPLOYING REPUTATION SYSTEM ===");
        ReputationSBT reputationSBT = new ReputationSBT();
        console.log("ReputationSBT deployed at:", address(reputationSBT));
        
        // 2. Deploy Mock Protocol Factory
        console.log("\n=== DEPLOYING MOCK PROTOCOLS ===");
        MockProtocolFactory factory = new MockProtocolFactory();
        console.log("MockProtocolFactory deployed at:", address(factory));
        
        // 3. Deploy all protocols
        factory.deployAllProtocols();
        
        // 4. Get addresses
        (
            address namoshi,
            address satsuma,
            address spine,
            address mintpark,
            address asigna,
            address dvote
        ) = factory.getAllAddresses();
        
        console.log("Namoshi deployed at:", namoshi);
        console.log("Satsuma deployed at:", satsuma);
        console.log("Spine deployed at:", spine);
        console.log("MintPark deployed at:", mintpark);
        console.log("Asigna deployed at:", asigna);
        console.log("DVote deployed at:", dvote);
        
        // 5. Deploy orchestrator
        DemoOrchestrator orchestrator = new DemoOrchestrator(
            namoshi, satsuma, spine, mintpark, asigna, dvote
        );
        console.log("DemoOrchestrator deployed at:", address(orchestrator));
        
        // 6. Authorize deployer as relay
        reputationSBT.setAuthorizedRelay(deployer, true);
        console.log("Authorized deployer as relay");
        
        vm.stopBroadcast();
        
        // 7. Print env vars
        console.log("\n=== UPDATE YOUR .env FILE ===");
        console.log("REPUTATION_CONTRACT_ADDRESS=", vm.toString(address(reputationSBT)));
        console.log("NAMOSHI_CONTRACT_ADDRESS=", vm.toString(namoshi));
        console.log("SATSUMA_CONTRACT_ADDRESS=", vm.toString(satsuma));
        console.log("SPINE_CONTRACT_ADDRESS=", vm.toString(spine));
        console.log("MINT_PARK_CONTRACT_ADDRESS=", vm.toString(mintpark));
        console.log("ASIGNA_CONTRACT_ADDRESS=", vm.toString(asigna));
        console.log("DVOTE_CONTRACT_ADDRESS=", vm.toString(dvote));
    }
}
EOF
```

---

## 🔑 **Deployment Process**

### Step 1: Setup Private Key

```bash
# Create .env file in project root
cat > .env << 'EOF'
PRIVATE_KEY=your_private_key_here
EOF

# Make sure you have test ETH on Citrea testnet
# Get from: https://citrea.xyz (faucet section)
```

### Step 2: Compile Contracts

```bash
# Compile all contracts
forge build

# Check for any compilation errors
forge compile --force
```

### Step 3: Deploy to Citrea Testnet

```bash
# Deploy all contracts
forge script script/Deploy.s.sol --rpc-url citrea_testnet --broadcast --verify

# If verification fails, deploy without verify first:
forge script script/Deploy.s.sol --rpc-url citrea_testnet --broadcast
```

### Step 4: Update Backend Environment

After deployment, update `backend/.env` with the printed addresses:

```bash
# Edit backend/.env and add the deployed addresses
cd backend
nano .env
```

Update with the addresses from deployment output:
```env
CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
PRIVATE_KEY=your_private_key_here
REPUTATION_CONTRACT_ADDRESS=0x... # From deployment output
NAMOSHI_CONTRACT_ADDRESS=0x...
SATSUMA_CONTRACT_ADDRESS=0x...
SPINE_CONTRACT_ADDRESS=0x...
MINT_PARK_CONTRACT_ADDRESS=0x...
ASIGNA_CONTRACT_ADDRESS=0x...
DVOTE_CONTRACT_ADDRESS=0x...
PORT=3001
```

---

## 🧪 **Testing & Demo**

### Step 1: Start Backend Monitoring

```bash
# In backend directory
cd backend
npm install
npm run dev
```

You should see:
```
🚀 Starting Event Relay for Citrea Reputation System...
✅ Connected to ReputationSBT contract, owner: 0x...
📡 Setting up listeners for namoshi at 0x...
👁️ Now watching 6 protocols for events
🌐 Reputation API server running on http://localhost:3001
```

### Step 2: Generate Test Events

Open a new terminal and run:

```bash
# Create a test script
cat > script/Demo.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MockProtocols.sol";

contract Demo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get deployed addresses from environment
        address namoshiAddr = vm.envAddress("NAMOSHI_CONTRACT_ADDRESS");
        address satsumaAddr = vm.envAddress("SATSUMA_CONTRACT_ADDRESS");
        address spineAddr = vm.envAddress("SPINE_CONTRACT_ADDRESS");
        address mintparkAddr = vm.envAddress("MINT_PARK_CONTRACT_ADDRESS");
        address asignaAddr = vm.envAddress("ASIGNA_CONTRACT_ADDRESS");
        address dvoteAddr = vm.envAddress("DVOTE_CONTRACT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Register domain
        MockNamoshiNameService(namoshiAddr).registerDomain{value: 0.001 ether}("alice");
        
        // 2. Trade on DEX
        MockSatsumaDEX(satsumaAddr).swap(1 ether, 0, 0, 0.95 ether, msg.sender);
        
        // 3. Use lending
        MockSpineLending(spineAddr).deposit{value: 0.01 ether}(5 ether);
        
        // 4. Mint NFT
        MockMintParkNFT(mintparkAddr).mintNFT{value: 0.1 ether}(0.1 ether);
        
        // 5. Execute multisig
        MockAsignaMultisig(asignaAddr).executeTransaction(msg.sender, 0, "");
        
        // 6. Vote on governance
        MockDVoteGovernance(dvoteAddr).createProposal("Test proposal");
        MockDVoteGovernance(dvoteAddr).vote(1, 1);
        
        vm.stopBroadcast();
        
        console.log("Demo transactions sent! Check backend logs for event processing.");
    }
}
EOF

# Run the demo
forge script script/Demo.s.sol --rpc-url citrea_testnet --broadcast
```

### Step 3: Check Results

Watch your backend terminal - you should see events being processed:
```
📈 Detected: namoshi.DomainRegistered | User: 0x... | Value: 1
🔗 Relayed to contract: 0x...
✅ Confirmed: namoshi.DomainRegistered for 0x... (1 value)
```

Query the API:
```bash
# Check reputation score
curl http://localhost:3001/reputation/YOUR_WALLET_ADDRESS

# Expected response:
{
  "success": true,
  "data": {
    "address": "0x...",
    "totalScore": 241,
    "breakdown": {
      "namoshi": 50,
      "dex": 1,
      "lending": 30,
      "nft": 20,
      "multisig": 100,
      "governance": 75
    }
  }
}
```

### Step 4: Stress Test with Mass Activity

```bash
# Create mass activity script
cat > script/MassDemo.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MockProtocols.sol";

contract MassDemo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address orchestratorAddr = vm.envAddress("DEMO_ORCHESTRATOR_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        DemoOrchestrator orchestrator = DemoOrchestrator(orchestratorAddr);
        
        // Generate lots of activity
        orchestrator.generateMassActivity{value: 2 ether}();
        
        vm.stopBroadcast();
        
        console.log("Mass activity generated! Check reputation score increase.");
    }
}
EOF

# Run mass demo
forge script script/MassDemo.s.sol --rpc-url citrea_testnet --broadcast
```

---

## 📊 **API Usage**

### Available Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get user reputation
curl http://localhost:3001/reputation/0x742d35Cc6aF12CC4469Dbb97Afb2D14a1fbEE524

# System statistics
curl http://localhost:3001/stats
```

### Response Format

```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6aF12CC4469Dbb97Afb2D14a1fbEE524",
    "totalScore": 1847,
    "breakdown": {
      "namoshi": 125,
      "dex": 312,
      "lending": 445,
      "nft": 130,
      "multisig": 400,
      "governance": 435
    }
  }
}
```

---

## 🎮 **Advanced Demo Scenarios**

### Scenario 1: New User Journey

```bash
cat > script/NewUser.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MockProtocols.sol";

contract NewUser is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Small activities for new user
        MockNamoshiNameService(vm.envAddress("NAMOSHI_CONTRACT_ADDRESS"))
            .registerDomain{value: 0.001 ether}("newbie");
            
        MockSatsumaDEX(vm.envAddress("SATSUMA_CONTRACT_ADDRESS"))
            .swap(0.1 ether, 0, 0, 0.095 ether, msg.sender);
            
        MockDVoteGovernance(vm.envAddress("DVOTE_CONTRACT_ADDRESS"))
            .vote(1, 1);
        
        vm.stopBroadcast();
        
        console.log("New user journey completed!");
    }
}
EOF

forge script script/NewUser.s.sol --rpc-url citrea_testnet --broadcast
```

### Scenario 2: DeFi Power User

```bash
cat > script/PowerUser.s.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MockProtocols.sol";

contract PowerUser is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Large activities
        MockSpineLending(vm.envAddress("SPINE_CONTRACT_ADDRESS"))
            .deposit{value: 0.1 ether}(100 ether);  // $100k
            
        MockSatsumaDEX(vm.envAddress("SATSUMA_CONTRACT_ADDRESS"))
            .addLiquidity(50 ether, 50 ether);  // $100k LP
            
        MockMintParkNFT(vm.envAddress("MINT_PARK_CONTRACT_ADDRESS"))
            .mintNFT{value: 5 ether}(5 ether);  // $5k NFT
        
        vm.stopBroadcast();
        
        console.log("Power user activities completed!");
    }
}
EOF

forge script script/PowerUser.s.sol --rpc-url citrea_testnet --broadcast
```

---

## 🔧 **Maintenance & Updates**

### Update Scoring Rules

```bash
# Create admin script to update scoring
cast send $REPUTATION_CONTRACT_ADDRESS \
  "setScoringRule(string,string,uint256,uint256,uint256,uint256,bool)" \
  "dex" "Swap" 2 2000 150 5000 true \
  --rpc-url citrea_testnet \
  --private-key $PRIVATE_KEY
```

### Add New Protocol

```bash
# Add new protocol support
cast send $REPUTATION_CONTRACT_ADDRESS \
  "addProtocol(string)" \
  "newprotocol" \
  --rpc-url citrea_testnet \
  --private-key $PRIVATE_KEY
```

### Query Contract State

```bash
# Check current scoring rules
cast call $REPUTATION_CONTRACT_ADDRESS \
  "getScoringRule(string,string)" \
  "dex" "Swap" \
  --rpc-url citrea_testnet

# Check user reputation
cast call $REPUTATION_CONTRACT_ADDRESS \
  "getReputationScore(address)" \
  $USER_ADDRESS \
  --rpc-url citrea_testnet
```

---

## 🐛 **Troubleshooting**

### Backend Not Detecting Events
```bash
# Check if backend wallet is authorized
cast call $REPUTATION_CONTRACT_ADDRESS \
  "authorizedRelays(address)" \
  $BACKEND_WALLET_ADDRESS \
  --rpc-url citrea_testnet

# Authorize if needed
cast send $REPUTATION_CONTRACT_ADDRESS \
  "setAuthorizedRelay(address,bool)" \
  $BACKEND_WALLET_ADDRESS true \
  --rpc-url citrea_testnet \
  --private-key $PRIVATE_KEY
```

### Contract Interaction Issues
```bash
# Check contract owner
cast call $REPUTATION_CONTRACT_ADDRESS \
  "owner()" \
  --rpc-url citrea_testnet

# Check if events are being emitted
cast logs --rpc-url citrea_testnet \
  --address $SATSUMA_CONTRACT_ADDRESS \
  --from-block latest
```

### API Not Responding
```bash
# Check if backend is running
curl -I http://localhost:3001/health

# Check backend logs for errors
cd backend && npm run dev
```

---

## 🎯 **Success Metrics**

After running the setup, you should achieve:

✅ **Smart Contracts Deployed** - All contracts on Citrea testnet  
✅ **Backend Running** - Real-time event monitoring active  
✅ **Events Processing** - Console showing event detection and processing  
✅ **API Functional** - REST endpoints returning reputation data  
✅ **Anti-Gaming Working** - Daily limits preventing spam  
✅ **Multi-Protocol Support** - Scores from all 6 protocol types  

---

## 📈 **What's Next?**

1. **Mainnet Deployment** - Deploy when Citrea mainnet launches (Q1 2025)
2. **Real Protocol Integration** - Connect with actual Citrea protocols
3. **Frontend Dashboard** - Build user-facing reputation interface
4. **Lending Integration** - Partner with protocols for undercollateralized loans
5. **Advanced Features** - Time decay, reputation staking, cross-chain support

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 **Support**

- **Discord**: [Citrea Community](https://discord.gg/citrea)
- **Twitter**: [@CitreaReputation](https://twitter.com/CitreaReputation)
- **Email**: support@citrea-reputation.com

---

**Built with ❤️ for the Bitcoin DeFi ecosystem** 🚀