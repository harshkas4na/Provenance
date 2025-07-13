// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/*//////////////////////////////////////////////////////////////
                    1. NAMOSHI NAME SERVICE MOCK
//////////////////////////////////////////////////////////////*/

contract MockNamoshiNameService {
    mapping(string => address) public domainOwners;
    mapping(string => uint256) public domainExpiry;
    
    event DomainRegistered(address indexed owner, string name, uint256 expires);
    event DomainRenewed(address indexed owner, string name, uint256 expires);
    
    /**
     * @notice Register a .btc domain (triggers reputation event)
     */
    function registerDomain(string calldata name) external payable {
        require(msg.value >= 0.001 ether, "Insufficient payment");
        require(domainOwners[name] == address(0), "Domain already registered");
        
        uint256 expires = block.timestamp + 365 days;
        domainOwners[name] = msg.sender;
        domainExpiry[name] = expires;
        
        emit DomainRegistered(msg.sender, name, expires);
    }
    
    /**
     * @notice Renew an existing domain (triggers reputation event)
     */
    function renewDomain(string calldata name) external payable {
        require(msg.value >= 0.0005 ether, "Insufficient payment");
        require(domainOwners[name] == msg.sender, "Not domain owner");
        
        uint256 expires = domainExpiry[name] + 365 days;
        domainExpiry[name] = expires;
        
        emit DomainRenewed(msg.sender, name, expires);
    }
    
    /**
     * @notice Demo function - register multiple domains quickly
     */
    function demoRegisterDomains(string[] calldata names) external payable {
        for (uint i = 0; i < names.length; i++) {
            if (domainOwners[names[i]] == address(0)) {
                uint256 expires = block.timestamp + 365 days;
                domainOwners[names[i]] = msg.sender;
                domainExpiry[names[i]] = expires;
                emit DomainRegistered(msg.sender, names[i], expires);
            }
        }
    }
}

/*//////////////////////////////////////////////////////////////
                    2. SATSUMA DEX MOCK
//////////////////////////////////////////////////////////////*/

contract MockSatsumaDEX {
    mapping(address => mapping(address => uint256)) public liquidityBalances;
    uint256 public totalSwaps;
    
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    
    /**
     * @notice Simulate a token swap (triggers reputation event)
     */
    function swap(
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address to
    ) external {
        require(amount0Out > 0 || amount1Out > 0, "Insufficient output");
        
        totalSwaps++;
        
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
    
    /**
     * @notice Add liquidity to pool (triggers reputation event)
     */
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");
        
        liquidityBalances[msg.sender][address(0)] += amount0;
        liquidityBalances[msg.sender][address(1)] += amount1;
        
        emit Mint(msg.sender, amount0, amount1);
    }
    
    /**
     * @notice Demo function - perform multiple swaps
     */
    function demoSwaps(uint256 count, uint256 baseAmount) external {
        for (uint i = 0; i < count; i++) {
            uint256 amountOut = baseAmount + (i * 1 ether);
            emit Swap(msg.sender, baseAmount, 0, 0, amountOut, msg.sender);
        }
    }
    
    /**
     * @notice Demo function - add liquidity multiple times
     */
    function demoLiquidity(uint256 count, uint256 baseAmount) external {
        for (uint i = 0; i < count; i++) {
            uint256 amount = baseAmount + (i * 0.5 ether);
            emit Mint(msg.sender, amount, amount);
        }
    }
}

/*//////////////////////////////////////////////////////////////
                    3. SPINE LENDING MOCK
//////////////////////////////////////////////////////////////*/

contract MockSpineLending {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    
    /**
     * @notice Deposit funds (triggers reputation event)
     */
    function deposit(uint256 amount) external payable {
        require(amount > 0, "Invalid amount");
        deposits[msg.sender] += amount;
        
        emit Deposit(msg.sender, amount);
    }
    
    /**
     * @notice Borrow funds (triggers reputation event)
     */
    function borrow(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(deposits[msg.sender] >= amount * 2, "Insufficient collateral");
        
        borrows[msg.sender] += amount;
        
        emit Borrow(msg.sender, amount);
    }
    
    /**
     * @notice Repay borrowed funds (triggers reputation event)
     */
    function repay(uint256 amount) external payable {
        require(amount > 0, "Invalid amount");
        require(borrows[msg.sender] >= amount, "Repay amount too high");
        
        borrows[msg.sender] -= amount;
        
        emit Repay(msg.sender, amount);
    }
    
    /**
     * @notice Demo function - full lending cycle
     */
    function demoLendingCycle(uint256 depositAmount, uint256 borrowAmount) external payable {
        // Deposit
        deposits[msg.sender] += depositAmount;
        emit Deposit(msg.sender, depositAmount);
        
        // Borrow
        borrows[msg.sender] += borrowAmount;
        emit Borrow(msg.sender, borrowAmount);
        
        // Partial repay
        uint256 repayAmount = borrowAmount / 2;
        borrows[msg.sender] -= repayAmount;
        emit Repay(msg.sender, repayAmount);
    }
}

/*//////////////////////////////////////////////////////////////
                    4. MINT PARK NFT MARKETPLACE MOCK
//////////////////////////////////////////////////////////////*/

contract MockMintParkNFT is ERC721 {
    uint256 private _tokenIdCounter;
    mapping(uint256 => uint256) public nftPrices;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);
    
    constructor() ERC721("MintPark NFT", "MPNFT") {}
    
    /**
     * @notice Mint NFT (triggers reputation event via Transfer)
     */
    function mintNFT(uint256 price) external payable {
        require(price > 0, "Invalid price");
        require(msg.value >= price, "Insufficient payment");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        nftPrices[tokenId] = price;
        
        _safeMint(msg.sender, tokenId);
        
        // Override the Transfer event to include price
        emit Transfer(address(0), msg.sender, tokenId, price);
    }
    
    /**
     * @notice Buy NFT from another user (triggers reputation event)
     */
    function buyNFT(uint256 tokenId, uint256 price) external payable {
        require(msg.value >= price, "Insufficient payment");
        address currentOwner = ownerOf(tokenId);
        require(currentOwner != msg.sender, "Already own this NFT");
        
        nftPrices[tokenId] = price;
        _transfer(currentOwner, msg.sender, tokenId);
        
        // Override the Transfer event to include price
        emit Transfer(currentOwner, msg.sender, tokenId, price);
    }
    
    /**
     * @notice Demo function - mint multiple NFTs
     */
    function demoMintMultiple(uint256 count, uint256 basePrice) external payable {
        for (uint i = 0; i < count; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            uint256 price = basePrice + (i * 0.1 ether);
            nftPrices[tokenId] = price;
            
            _safeMint(msg.sender, tokenId);
            emit Transfer(address(0), msg.sender, tokenId, price);
        }
    }
    
    // Override the standard Transfer event to not conflict
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal {
        // We'll emit our custom Transfer event manually
        // super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}

/*//////////////////////////////////////////////////////////////
                    5. ASIGNA MULTISIG MOCK
//////////////////////////////////////////////////////////////*/

contract MockAsignaMultisig {
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredConfirmations;
    uint256 public transactionCount;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        mapping(address => bool) confirmations;
        uint256 confirmationCount;
    }
    
    mapping(uint256 => Transaction) public transactions;
    
    event ExecutionSuccess(address indexed executor, bytes32 txHash, uint256 payment);
    event AddedOwner(address owner);
    event SetupComplete(address[] owners, uint256 threshold);
    
    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length >= _required && _required > 0, "Invalid setup");
        
        for (uint i = 0; i < _owners.length; i++) {
            owners.push(_owners[i]);
            isOwner[_owners[i]] = true;
        }
        requiredConfirmations = _required;
        
        emit SetupComplete(_owners, _required);
    }
    
    /**
     * @notice Execute a multisig transaction (triggers reputation event)
     */
    function executeTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) external {
        require(isOwner[msg.sender], "Not an owner");
        
        // Simple execution for demo (skip confirmation process)
        transactionCount++;
        bytes32 txHash = keccak256(abi.encodePacked(to, value, data, transactionCount));
        
        emit ExecutionSuccess(msg.sender, txHash, value);
    }
    
    /**
     * @notice Demo function - execute multiple transactions
     */
    function demoExecuteMultiple(uint256 count) external {
        require(isOwner[msg.sender], "Not an owner");
        
        for (uint i = 0; i < count; i++) {
            transactionCount++;
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, i, transactionCount));
            emit ExecutionSuccess(msg.sender, txHash, 0);
        }
    }
    
    /**
     * @notice Add new owner (triggers reputation event for setup)
     */
    function addOwner(address newOwner) external {
        require(isOwner[msg.sender], "Not an owner");
        require(!isOwner[newOwner], "Already an owner");
        
        owners.push(newOwner);
        isOwner[newOwner] = true;
        
        emit AddedOwner(newOwner);
    }
}

/*//////////////////////////////////////////////////////////////
                    6. DVOTE GOVERNANCE MOCK
//////////////////////////////////////////////////////////////*/

contract MockDVoteGovernance {
    struct Proposal {
        string description;
        uint256 voteCount;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votes;
        bool active;
    }
    
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    mapping(address => uint256) public votingPower;
    
    event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight);
    event ProposalCreated(uint256 proposalId, address proposer, string description);
    
    /**
     * @notice Create a new proposal (triggers reputation event)
     */
    function createProposal(string calldata description) external {
        proposalCount++;
        proposals[proposalCount].description = description;
        proposals[proposalCount].active = true;
        
        emit ProposalCreated(proposalCount, msg.sender, description);
    }
    
    /**
     * @notice Vote on a proposal (triggers reputation event)
     */
    function vote(uint256 proposalId, uint8 support) external {
        require(proposals[proposalId].active, "Proposal not active");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        
        uint256 weight = votingPower[msg.sender];
        if (weight == 0) weight = 1; // Default voting power
        
        proposals[proposalId].hasVoted[msg.sender] = true;
        proposals[proposalId].votes[msg.sender] = weight;
        proposals[proposalId].voteCount += weight;
        
        emit VoteCast(msg.sender, proposalId, support, weight);
    }
    
    /**
     * @notice Set voting power for demo purposes
     */
    function setVotingPower(address voter, uint256 power) external {
        votingPower[voter] = power;
    }
    
    /**
     * @notice Demo function - create proposal and vote
     */
    function demoGovernanceCycle(string calldata description, uint256 voterCount) external {
        // Create proposal
        proposalCount++;
        proposals[proposalCount].description = description;
        proposals[proposalCount].active = true;
        emit ProposalCreated(proposalCount, msg.sender, description);
        
        // Cast multiple votes
        for (uint i = 0; i < voterCount; i++) {
            uint256 weight = 1 + i;
            emit VoteCast(msg.sender, proposalCount, 1, weight);
        }
    }
}

/*//////////////////////////////////////////////////////////////
                    DEPLOYMENT FACTORY
//////////////////////////////////////////////////////////////*/

contract MockProtocolFactory {
    address public namoshiService;
    address public satsumaDEX;
    address public spineLending;
    address public mintParkNFT;
    address public asignaMultisig;
    address public dVoteGovernance;
    
    event AllProtocolsDeployed(
        address namoshi,
        address satsuma,
        address spine,
        address mintpark,
        address asigna,
        address dvote
    );
    
    /**
     * @notice Deploy all mock protocols at once
     */
    function deployAllProtocols() external {
        // Deploy all contracts
        namoshiService = address(new MockNamoshiNameService());
        satsumaDEX = address(new MockSatsumaDEX());
        spineLending = address(new MockSpineLending());
        mintParkNFT = address(new MockMintParkNFT());
        
        // Deploy multisig with msg.sender as owner
        address[] memory owners = new address[](1);
        owners[0] = msg.sender;
        asignaMultisig = address(new MockAsignaMultisig(owners, 1));
        
        dVoteGovernance = address(new MockDVoteGovernance());
        
        emit AllProtocolsDeployed(
            namoshiService,
            satsumaDEX,
            spineLending,
            mintParkNFT,
            asignaMultisig,
            dVoteGovernance
        );
    }
    
    /**
     * @notice Get all deployed contract addresses
     */
    function getAllAddresses() external view returns (
        address,
        address,
        address,
        address,
        address,
        address
    ) {
        return (
            namoshiService,
            satsumaDEX,
            spineLending,
            mintParkNFT,
            asignaMultisig,
            dVoteGovernance
        );
    }
}

/*//////////////////////////////////////////////////////////////
                    DEMO ORCHESTRATOR
//////////////////////////////////////////////////////////////*/

contract DemoOrchestrator {
    MockNamoshiNameService public namoshi;
    MockSatsumaDEX public satsuma;
    MockSpineLending public spine;
    MockMintParkNFT public mintpark;
    MockAsignaMultisig public asigna;
    MockDVoteGovernance public dvote;
    
    constructor(
        address _namoshi,
        address _satsuma,
        address _spine,
        address _mintpark,
        address _asigna,
        address _dvote
    ) {
        namoshi = MockNamoshiNameService(_namoshi);
        satsuma = MockSatsumaDEX(_satsuma);
        spine = MockSpineLending(_spine);
        mintpark = MockMintParkNFT(_mintpark);
        asigna = MockAsignaMultisig(_asigna);
        dvote = MockDVoteGovernance(_dvote);
    }
    
    /**
     * @notice Perform a complete user journey across all protocols
     * This will generate events for reputation scoring
     */
    function performUserJourney() external payable {
        // 1. Register domain name
        namoshi.registerDomain{value: 0.001 ether}("demo-user");
        
        // 2. Trade on DEX
        satsuma.swap(1 ether, 0, 0, 0.95 ether, msg.sender);
        satsuma.addLiquidity(2 ether, 2 ether);
        
        // 3. Use lending protocol
        spine.deposit{value: 0.01 ether}(5 ether);
        spine.borrow(2 ether);
        spine.repay{value: 0.005 ether}(1 ether);
        
        // 4. Buy NFT
        mintpark.mintNFT{value: 0.1 ether}(0.1 ether);
        
        // 5. Execute multisig transaction
        asigna.executeTransaction(msg.sender, 0, "");
        
        // 6. Participate in governance
        dvote.createProposal("Improve protocol efficiency");
        dvote.vote(1, 1); // Vote yes on first proposal
    }
    
    /**
     * @notice Generate lots of activity for stress testing
     */
    function generateMassActivity() external payable {
        // Multiple domain registrations
        string[] memory domains = new string[](3);
        domains[0] = "user1";
        domains[1] = "user2";
        domains[2] = "user3";
        namoshi.demoRegisterDomains{value: 0.003 ether}(domains);
        
        // Multiple DEX activities
        satsuma.demoSwaps(5, 1 ether);
        satsuma.demoLiquidity(3, 1 ether);
        
        // Lending cycle
        spine.demoLendingCycle{value: 0.01 ether}(10 ether, 4 ether);
        
        // Multiple NFT mints
        mintpark.demoMintMultiple{value: 0.5 ether}(5, 0.1 ether);
        
        // Multiple multisig executions
        asigna.demoExecuteMultiple(3);
        
        // Governance activity
        dvote.demoGovernanceCycle("Mass demo proposal", 5);
    }
}