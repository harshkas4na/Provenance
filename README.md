# 📊 Event Data Extraction Strategy & Reliability Analysis

## 🎯 How We Extract Scoring Data from Events

### **The Core Principle: Events Tell the Complete Story**

Every DeFi action creates a blockchain event that contains **all the information** needed for reputation scoring:
- **WHO** performed the action (user address)
- **WHAT** they did (event type)  
- **HOW MUCH** value was involved (amounts, prices)
- **WHEN** it happened (block timestamp)
- **WHERE** it happened (contract address, transaction hash)

---

## 📋 Protocol-by-Protocol Event Mapping

### **1. Namoshi Name Service (Identity)**

**Events We Monitor:**
```solidity
event DomainRegistered(address indexed owner, string name, uint256 expires);
event DomainRenewed(address indexed owner, string name, uint256 expires);
```

**Data Extraction:**
```typescript
// Registration Event
{
    user: event.args.owner,        // WHO: 0x742d35Cc...
    value: 1                       // WHAT: Binary action (registered or not)
}

// Renewal Event  
{
    user: event.args.owner,        // WHO: 0x742d35Cc...
    value: 1                       // WHAT: Binary action (renewed or not)
}
```

**Scoring Logic:**
- **Base Points**: 50 for registration, 25 for renewal
- **Value Scaling**: None (binary actions)
- **Daily Limit**: 200 points (max 4 domains per day)
- **Minimum**: Must be valid domain registration

**Why This Works:**
✅ Domain registration is a clear commitment to the ecosystem
✅ Higher points for new registrations vs renewals
✅ Daily limits prevent domain squatting for points

---

### **2. DEX Trading (Satsuma/Citrus Swap)**

**Events We Monitor:**
```solidity
event Swap(
    address indexed sender,
    uint256 amount0In,
    uint256 amount1In, 
    uint256 amount0Out,
    uint256 amount1Out,
    address indexed to
);

event Mint(address indexed sender, uint256 amount0, uint256 amount1);
```

**Data Extraction:**
```typescript
// Swap Event
{
    user: event.args.sender,                    // WHO: Trader
    value: Math.max(amount0Out, amount1Out)     // WHAT: Output amount (swap size)
}

// LP Provision Event
{
    user: event.args.sender,                    // WHO: LP provider
    value: amount0 + amount1                    // WHAT: Total liquidity added
}
```

**Scoring Logic:**
- **Swap**: 1 base + 0.001 per unit value, max 100/day, min $10
- **LP**: 10 base + 0.01 per unit value, max 50/day, min $100

**Why This Works:**
✅ Larger trades indicate more committed users
✅ LP provision is more valuable than simple swapping
✅ Minimum thresholds prevent dust transaction farming

---

### **3. Lending (Spine)**

**Events We Monitor:**
```solidity
event Deposit(address indexed user, uint256 amount);
event Borrow(address indexed user, uint256 amount);
event Repay(address indexed user, uint256 amount);
```

**Data Extraction:**
```typescript
// All lending events follow same pattern
{
    user: event.args.user,          // WHO: Lender/borrower
    value: event.args.amount        // WHAT: Amount deposited/borrowed/repaid
}
```

**Scoring Logic:**
- **Deposit**: 20 base + 0.01 per unit, max 200/day, min $100
- **Borrow**: 50 base + 0.005 per unit, max 300/day, min $100
- **Repay**: 30 base + 0.005 per unit, max 300/day, min $10

**Why This Works:**
✅ Borrowing shows higher engagement than just depositing
✅ Repaying loans demonstrates responsibility
✅ Amount scaling rewards larger capital deployment

---

### **4. NFT Marketplace (Mint Park)**

**Events We Monitor:**
```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
// Plus custom events with price data:
event Sale(address indexed buyer, uint256 indexed tokenId, uint256 price);
```

**Data Extraction:**
```typescript
// NFT Purchase
{
    user: event.args.to,           // WHO: NFT buyer (ignoring mints from 0x0)
    value: event.args.price || 1000 // WHAT: Purchase price or default value
}
```

**Scoring Logic:**
- **Purchase**: 10 base + 0.1 per unit price, max 50/day, min $1

**Why This Works:**
✅ NFT purchases show cultural engagement with ecosystem
✅ Higher-value purchases get more points
✅ Daily limits prevent wash trading

---

### **5. Multisig Security (Asigna)**

**Events We Monitor:**
```solidity
event ExecutionSuccess(bytes32 indexed txHash, uint256 payment);
event AddedOwner(address owner);
event SetupComplete(address[] owners, uint256 threshold);
```

**Data Extraction:**
```typescript
// Multisig Usage
{
    user: event.args.executor || event.args.owner,  // WHO: Multisig user
    value: 1                                        // WHAT: Security action
}
```

**Scoring Logic:**
- **Execution**: 100 base points, max 500/day
- **Setup**: 200 base points, max 200/day

**Why This Works:**
✅ Multisig usage indicates sophisticated, security-conscious users
✅ High base points reflect importance of security practices
✅ These users are typically higher-value for protocols

---

### **6. DAO Governance (DVote)**

**Events We Monitor:**
```solidity
event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight);
event ProposalCreated(uint256 proposalId, address proposer, string description);
```

**Data Extraction:**
```typescript
// Governance Participation
{
    user: event.args.voter || event.args.proposer,  // WHO: Participant
    value: event.args.weight || 1                   // WHAT: Voting weight
}
```

**Scoring Logic:**
- **Vote**: 25 base + 0.0001 per weight, max 100/day
- **Proposal**: 50 base points, max 50/day

**Why This Works:**
✅ Governance participation shows long-term ecosystem commitment
✅ Voting weight scaling rewards larger stakeholders
✅ Creating proposals shows leadership

---

## 🔍 Why Event Data is Reliable for Scoring

### **1. Cryptographic Guarantees**

**Events are part of blockchain consensus:**
```
Transaction → Execution → Events Emitted → Block Hash → Chain State
```

- Events are **included in transaction receipts**
- Transaction receipts are **hashed into block headers**
- Block headers are **secured by proof-of-work/stake**
- **Cannot be faked** without controlling majority of network

### **2. Complete Information**

**Every meaningful action generates events:**
```solidity
function swap(uint amountIn, address tokenA, address tokenB) external {
    // ... swap logic ...
    
    emit Swap(msg.sender, amountIn, amountOut, tokenA, tokenB);
    //      ↑ WHO      ↑ HOW MUCH  ↑ WHAT
}
```

**Events contain ALL data needed for scoring:**
- ✅ **User identity** (msg.sender is cryptographically verified)
- ✅ **Action type** (event name defines what happened)
- ✅ **Value/amount** (transaction parameters)
- ✅ **Timing** (block timestamp)
- ✅ **Context** (contract address, transaction hash)

### **3. Real-Time & Immutable**

```typescript
// Events are emitted immediately when transaction executes
contract.on('Swap', (sender, amount, event) => {
    // This fires within seconds of user action
    // Event data is immutable once confirmed
});
```

**Benefits:**
- ✅ **Real-time processing** (no polling delays)
- ✅ **Immutable history** (cannot be changed retroactively)
- ✅ **Guaranteed delivery** (WebSocket auto-reconnects)

### **4. Standard Patterns**

**Most DeFi protocols follow similar event patterns:**

| Action Type | Standard Event Pattern | Example |
|-------------|------------------------|---------|
| **Token Transfer** | `Transfer(from, to, amount)` | ERC20/721 |
| **DEX Trade** | `Swap(user, amountIn, amountOut)` | Uniswap V2/V3 |
| **Lending** | `Deposit(user, amount)` | Compound/Aave |
| **Governance** | `VoteCast(voter, proposal, support)` | OpenZeppelin Governor |

This standardization makes event processing **predictable and reliable**.

---

## 🎮 Anti-Gaming Through Event Analysis

### **1. Value Thresholds Prevent Dust Attacks**

```typescript
// Scoring rule with minimum value
scoringRules["dex"]["Swap"] = {
    basePoints: 1,
    multiplier: 1000,     // 0.001 points per unit
    maxPerDay: 100,
    minValue: 10000,      // Must be > $10 equivalent
    isActive: true
};
```

**This prevents:**
- 🚫 1000 tiny $0.01 swaps = 0 points (below minimum)
- ✅ 1 large $1000 swap = 2 points (1 base + 1 bonus)

### **2. Daily Limits Prevent Spam**

```solidity
function _getDailyUsage(address user, string protocol, string eventType) 
    internal view returns (uint256) {
    uint256 currentDay = block.timestamp / 86400;
    uint256 lastDay = userReputations[user].lastActionDay[protocol][eventType];
    
    if (lastDay < currentDay) return 0; // New day, reset
    return userReputations[user].dailyUsage[protocol][eventType];
}
```

**This prevents:**
- 🚫 Infinite point farming through repetitive actions
- ✅ Encourages diverse activity across protocols

### **3. Transaction Hash Deduplication**

```solidity
mapping(bytes32 => bool) public processedEvents;

function processProtocolEvent(..., bytes32 transactionHash, ...) {
    require(!processedEvents[transactionHash], "Event already processed");
    processedEvents[transactionHash] = true;
    // ...
}
```

**This prevents:**
- 🚫 Processing same transaction multiple times
- 🚫 Replay attacks with old transaction data

---

## 📈 Score Calculation Examples

### **Example 1: Active DeFi User**

**Day 1 Activity:**
```
1. Register domain "alice.btc" → 50 points (namoshi)
2. Swap $500 worth of tokens → 1.5 points (dex: 1 base + 0.5 bonus)
3. Deposit $1000 to lending → 30 points (lending: 20 base + 10 bonus)
4. Buy NFT for $50 → 15 points (nft: 10 base + 5 bonus)

Total Day 1: 96.5 points
```

**Day 2 Activity:**
```
1. Provide $2000 in liquidity → 30 points (dex: 10 base + 20 bonus)
2. Borrow $800 → 54 points (lending: 50 base + 4 bonus)
3. Vote on DAO proposal → 25 points (governance)

Total Day 2: 109 points
Running Total: 205.5 points
```

### **Example 2: Gaming Attempt (Fails)**

**Attempted Gaming:**
```
1. 100 tiny $1 swaps → 0 points (below $10 minimum)
2. Register 10 domains → 200 points max (daily limit reached after 4 domains)
3. Spam NFT trades → Limited by daily cap

Result: Minimal points despite high activity
```

---

## ✅ Conclusion: Events Are Perfect for Reputation

**Event-based scoring is not just reliable - it's ideal because:**

1. **🔒 Cryptographically Secure** - Cannot be faked or manipulated
2. **📊 Complete Data** - Contains all information needed for fair scoring  
3. **⚡ Real-Time** - Immediate processing as actions happen
4. **🎯 Precise** - Exact amounts, users, and contexts
5. **🛡️ Anti-Gaming** - Built-in protection against manipulation
6. **📈 Scalable** - Works across any number of protocols
7. **🔄 Standardized** - Similar patterns across all DeFi protocols

**The beauty of this system is its simplicity:** Users perform normal DeFi actions, events are automatically emitted by protocols, our backend relays the data, and the smart contract calculates fair, anti-gamed reputation scores.

**No special integrations needed, no data can be faked, no complex off-chain infrastructure required.** Just pure, reliable blockchain events driving a sophisticated reputation system.