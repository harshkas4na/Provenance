// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationSBT - The Brain of the System
 * @notice Soulbound token that handles ALL scoring logic and data processing
 * @dev Backend only relays events, contract does everything else
 */
contract ReputationSBT is ERC721, Ownable {
    
    /*//////////////////////////////////////////////////////////////
                            STRUCTS & ENUMS
    //////////////////////////////////////////////////////////////*/
    
    struct UserReputation {
        uint256 totalScore;
        uint256 lastUpdated;
        mapping(string => uint256) protocolScores; // protocol => score
        mapping(string => mapping(string => uint256)) dailyUsage; // protocol => eventType => points used today
        mapping(string => mapping(string => uint256)) lastActionDay; // protocol => eventType => day number
    }
    
    struct ScoringRule {
        uint256 basePoints;      // Base points for this action
        uint256 multiplier;      // Multiplier for value-based scoring (scaled by 1e6)
        uint256 maxPerDay;       // Maximum points per day for this action
        uint256 minValue;        // Minimum value to earn points
        bool isActive;           // Rule can be enabled/disabled
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    
    uint256 private _tokenIdCounter;
    mapping(address => UserReputation) public userReputations;
    mapping(address => uint256) public userTokenIds;
    mapping(address => bool) public authorizedRelays;
    
    // Scoring rules: protocol => eventType => rule
    mapping(string => mapping(string => ScoringRule)) public scoringRules;
    
    // Prevent duplicate event processing
    mapping(bytes32 => bool) public processedEvents;
    
    // Track supported protocols
    string[] public supportedProtocols;
    mapping(string => bool) public isProtocolSupported;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    
    event EventProcessed(
        address indexed user,
        string indexed protocol,
        string indexed eventType,
        uint256 value,
        uint256 pointsAwarded,
        bytes32 transactionHash
    );
    
    event ReputationUpdated(
        address indexed user,
        string indexed protocol,
        uint256 newProtocolScore,
        uint256 newTotalScore
    );
    
    event ScoringRuleUpdated(
        string indexed protocol,
        string indexed eventType,
        uint256 basePoints,
        uint256 multiplier,
        uint256 maxPerDay,
        uint256 minValue
    );

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/
    
    modifier onlyAuthorizedRelay() {
        require(authorizedRelays[msg.sender] || msg.sender == owner(), "Not authorized relay");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    
    constructor() ERC721("Citrea Reputation Score", "CRS") {
        _initializeDefaultRules();
    }

    /*//////////////////////////////////////////////////////////////
                        CORE FUNCTION: EVENT PROCESSING
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Main function called by backend to process protocol events
     * @param user Address of user who performed the action
     * @param protocol Protocol name (e.g., "namoshi", "dex", "lending")
     * @param eventType Event type (e.g., "DomainRegistered", "Swap", "Deposit")
     * @param value Extracted value from event (amount, price, etc.)
     * @param transactionHash Original transaction hash for deduplication
     * @param blockNumber Block number for validation
     */
    function processProtocolEvent(
        address user,
        string calldata protocol,
        string calldata eventType,
        uint256 value,
        bytes32 transactionHash,
        uint256 blockNumber
    ) external onlyAuthorizedRelay {
        // Input validation
        require(user != address(0), "Invalid user address");
        require(bytes(protocol).length > 0, "Invalid protocol");
        require(bytes(eventType).length > 0, "Invalid event type");
        require(isProtocolSupported[protocol], "Protocol not supported");
        
        // Prevent duplicate processing
        require(!processedEvents[transactionHash], "Event already processed");
        processedEvents[transactionHash] = true;
        
        // Validate event is not too old (prevent replay attacks)
        require(blockNumber + 1000 > block.number, "Event too old");
        
        // Calculate points based on scoring rules
        uint256 points = _calculatePoints(protocol, eventType, value, user);
        
        if (points > 0) {
            // Ensure user has reputation NFT
            _ensureUserExists(user);
            
            // Update user's scores
            _updateUserScore(user, protocol, points);
            
            // Update daily usage tracking
            _updateDailyUsage(user, protocol, eventType, points);
        }
        
        emit EventProcessed(user, protocol, eventType, value, points, transactionHash);
    }

    /*//////////////////////////////////////////////////////////////
                        SCORING LOGIC (THE BRAIN)
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Calculate points for a specific protocol event
     * @dev This is where all the scoring intelligence lives
     */
    function _calculatePoints(
        string memory protocol,
        string memory eventType,
        uint256 value,
        address user
    ) internal view returns (uint256) {
        ScoringRule memory rule = scoringRules[protocol][eventType];
        
        // Check if rule exists and is active
        if (!rule.isActive) return 0;
        
        // Check minimum value threshold
        if (value < rule.minValue) return 0;
        
        // Calculate base points + value bonus
        uint256 points = rule.basePoints;
        if (rule.multiplier > 0) {
            // Scale multiplier by 1e6 for precision
            uint256 bonus = (value * rule.multiplier) / 1e6;
            points += bonus;
        }
        
        // Apply daily limit
        uint256 dailyUsed = _getDailyUsage(user, protocol, eventType);
        if (dailyUsed >= rule.maxPerDay) {
            return 0; // Already hit daily limit
        }
        
        uint256 remainingDaily = rule.maxPerDay - dailyUsed;
        return points > remainingDaily ? remainingDaily : points;
    }
    
    /**
     * @notice Get daily usage for user/protocol/event combination
     */
    function _getDailyUsage(
        address user,
        string memory protocol,
        string memory eventType
    ) internal view returns (uint256) {
        uint256 currentDay = block.timestamp / 86400; // Current day number
        uint256 lastDay = userReputations[user].lastActionDay[protocol][eventType];
        
        if (lastDay < currentDay) {
            return 0; // New day, reset usage
        }
        
        return userReputations[user].dailyUsage[protocol][eventType];
    }
    
    /**
     * @notice Update daily usage tracking
     */
    function _updateDailyUsage(
        address user,
        string memory protocol,
        string memory eventType,
        uint256 points
    ) internal {
        uint256 currentDay = block.timestamp / 86400;
        
        // Reset if new day
        if (userReputations[user].lastActionDay[protocol][eventType] < currentDay) {
            userReputations[user].dailyUsage[protocol][eventType] = 0;
            userReputations[user].lastActionDay[protocol][eventType] = currentDay;
        }
        
        // Add points to daily usage
        userReputations[user].dailyUsage[protocol][eventType] += points;
    }

    /*//////////////////////////////////////////////////////////////
                        USER SCORE MANAGEMENT
    //////////////////////////////////////////////////////////////*/
    
    function _ensureUserExists(address user) internal {
        if (userTokenIds[user] == 0) {
            _mintReputation(user);
        }
    }
    
    function _mintReputation(address user) internal {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(user, tokenId);
        userTokenIds[user] = tokenId;
        userReputations[user].lastUpdated = block.timestamp;
    }
    
    function _updateUserScore(address user, string memory protocol, uint256 points) internal {
        UserReputation storage rep = userReputations[user];
        
        // Update protocol-specific score
        rep.protocolScores[protocol] += points;
        
        // Recalculate total score across all protocols
        uint256 newTotal = 0;
        for (uint256 i = 0; i < supportedProtocols.length; i++) {
            newTotal += rep.protocolScores[supportedProtocols[i]];
        }
        rep.totalScore = newTotal;
        rep.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(user, protocol, rep.protocolScores[protocol], rep.totalScore);
    }

    /*//////////////////////////////////////////////////////////////
                        ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    /**
     * @notice Add or update scoring rule for protocol/event combination
     */
    function setScoringRule(
        string calldata protocol,
        string calldata eventType,
        uint256 basePoints,
        uint256 multiplier,
        uint256 maxPerDay,
        uint256 minValue,
        bool isActive
    ) external onlyOwner {
        scoringRules[protocol][eventType] = ScoringRule({
            basePoints: basePoints,
            multiplier: multiplier,
            maxPerDay: maxPerDay,
            minValue: minValue,
            isActive: isActive
        });
        
        emit ScoringRuleUpdated(protocol, eventType, basePoints, multiplier, maxPerDay, minValue);
    }
    
    /**
     * @notice Add supported protocol
     */
    function addProtocol(string calldata protocol) external onlyOwner {
        if (!isProtocolSupported[protocol]) {
            supportedProtocols.push(protocol);
            isProtocolSupported[protocol] = true;
        }
    }
    
    /**
     * @notice Set authorized relay (backend)
     */
    function setAuthorizedRelay(address relay, bool authorized) external onlyOwner {
        authorizedRelays[relay] = authorized;
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function getReputationScore(address user) external view returns (uint256) {
        return userReputations[user].totalScore;
    }
    
    function getProtocolScore(address user, string calldata protocol) external view returns (uint256) {
        return userReputations[user].protocolScores[protocol];
    }
    
    function getDailyUsage(address user, string calldata protocol, string calldata eventType) 
        external view returns (uint256) {
        return _getDailyUsage(user, protocol, eventType);
    }
    
    function getScoringRule(string calldata protocol, string calldata eventType) 
        external view returns (ScoringRule memory) {
        return scoringRules[protocol][eventType];
    }

    /*//////////////////////////////////////////////////////////////
                        SOULBOUND TOKEN LOGIC
    //////////////////////////////////////////////////////////////*/
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal pure override {
        require(from == address(0), "Soulbound: transfer not allowed");
    }
    
    function approve(address, uint256) public pure override {
        revert("Soulbound: approval not allowed");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approval not allowed");
    }

    /*//////////////////////////////////////////////////////////////
                        INITIALIZE DEFAULT RULES
    //////////////////////////////////////////////////////////////*/
    
    function _initializeDefaultRules() internal {
        // Add supported protocols
        supportedProtocols.push("namoshi");
        supportedProtocols.push("dex");
        supportedProtocols.push("lending");
        supportedProtocols.push("nft");
        supportedProtocols.push("multisig");
        supportedProtocols.push("governance");
        
        for (uint256 i = 0; i < supportedProtocols.length; i++) {
            isProtocolSupported[supportedProtocols[i]] = true;
        }
        
        // Namoshi scoring rules
        scoringRules["namoshi"]["DomainRegistered"] = ScoringRule(50, 0, 200, 1, true);
        scoringRules["namoshi"]["DomainRenewed"] = ScoringRule(25, 0, 100, 1, true);
        
        // DEX scoring rules  
        scoringRules["dex"]["Swap"] = ScoringRule(1, 1000, 100, 10000, true); // 0.001 multiplier
        scoringRules["dex"]["Mint"] = ScoringRule(10, 10000, 50, 100000, true); // 0.01 multiplier
        
        // Lending scoring rules
        scoringRules["lending"]["Deposit"] = ScoringRule(20, 10000, 200, 100000, true);
        scoringRules["lending"]["Borrow"] = ScoringRule(50, 5000, 300, 100000, true);
        scoringRules["lending"]["Repay"] = ScoringRule(30, 5000, 300, 10000, true);
        
        // NFT scoring rules
        scoringRules["nft"]["Transfer"] = ScoringRule(10, 100000, 50, 1000, true); // 0.1 multiplier
        
        // Multisig scoring rules
        scoringRules["multisig"]["ExecutionSuccess"] = ScoringRule(100, 0, 500, 1, true);
        
        // Governance scoring rules
        scoringRules["governance"]["VoteCast"] = ScoringRule(25, 100, 100, 1, true); // 0.0001 multiplier
    }
}