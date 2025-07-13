"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationAPI = exports.EventRelay = void 0;
// src/eventRelay.ts - Now with Manual Polling for Citrea Compatibility
const ethers_1 = require("ethers");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/*//////////////////////////////////////////////////////////////
                    EVENT RELAY SERVICE
//////////////////////////////////////////////////////////////*/
class EventRelay {
    constructor() {
        this.targetContracts = new Map();
        this.processedEvents = new Set();
        this.lastCheckedBlock = 0;
        // Initialize provider and wallet
        this.provider = new ethers_1.JsonRpcProvider(process.env.CITREA_RPC_URL || 'https://rpc.testnet.citrea.xyz');
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY environment variable is required');
        }
        this.wallet = new ethers_1.Wallet(process.env.PRIVATE_KEY, this.provider);
        // Initialize reputation contract
        this.reputationContract = new ethers_1.Contract(process.env.REPUTATION_CONTRACT_ADDRESS, this.getReputationABI(), this.wallet);
        // Initialize target contracts
        this.initializeTargetContracts();
    }
    /*//////////////////////////////////////////////////////////////
                    CONTRACT CONFIGURATIONS
    //////////////////////////////////////////////////////////////*/
    initializeTargetContracts() {
        // Namoshi Name Service
        if (process.env.NAMOSHI_CONTRACT_ADDRESS) {
            this.targetContracts.set('namoshi', {
                address: process.env.NAMOSHI_CONTRACT_ADDRESS,
                abi: this.getNamoshiABI(),
                events: [
                    {
                        name: 'DomainRegistered',
                        userField: 'owner',
                        fixedValue: 1
                    },
                    {
                        name: 'DomainRenewed',
                        userField: 'owner',
                        fixedValue: 1
                    }
                ]
            });
        }
        // Satsuma DEX
        if (process.env.SATSUMA_CONTRACT_ADDRESS) {
            this.targetContracts.set('dex', {
                address: process.env.SATSUMA_CONTRACT_ADDRESS,
                abi: this.getSatsumaABI(),
                events: [
                    {
                        name: 'Swap',
                        userField: 'sender',
                        valueField: 'amount0Out'
                    },
                    {
                        name: 'Mint',
                        userField: 'sender',
                        valueField: 'amount0'
                    }
                ]
            });
        }
        // Spine Lending
        if (process.env.SPINE_CONTRACT_ADDRESS) {
            this.targetContracts.set('lending', {
                address: process.env.SPINE_CONTRACT_ADDRESS,
                abi: this.getSpineABI(),
                events: [
                    {
                        name: 'Deposit',
                        userField: 'user',
                        valueField: 'amount'
                    },
                    {
                        name: 'Borrow',
                        userField: 'user',
                        valueField: 'amount'
                    },
                    {
                        name: 'Repay',
                        userField: 'user',
                        valueField: 'amount'
                    }
                ]
            });
        }
        // Mint Park NFT
        if (process.env.MINT_PARK_CONTRACT_ADDRESS) {
            this.targetContracts.set('nft', {
                address: process.env.MINT_PARK_CONTRACT_ADDRESS,
                abi: this.getMintParkABI(),
                events: [
                    {
                        name: 'Transfer',
                        userField: 'to',
                        valueField: 'price'
                    }
                ]
            });
        }
        // Asigna Multisig
        if (process.env.ASIGNA_CONTRACT_ADDRESS) {
            this.targetContracts.set('multisig', {
                address: process.env.ASIGNA_CONTRACT_ADDRESS,
                abi: this.getAsignaABI(),
                events: [
                    {
                        name: 'ExecutionSuccess',
                        userField: 'executor',
                        fixedValue: 1
                    }
                ]
            });
        }
    }
    /*//////////////////////////////////////////////////////////////
                        MAIN RELAY FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    startRelay() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🚀 Starting Event Relay for Citrea Reputation System...');
            try {
                // Verify reputation contract connection
                const contractOwner = yield this.reputationContract.owner();
                console.log('✅ Connected to ReputationSBT contract, owner:', contractOwner);
                // Get the current block number to start polling from
                this.lastCheckedBlock = yield this.provider.getBlockNumber();
                console.log(`🔍 Starting to poll for events from block ${this.lastCheckedBlock}`);
                // Start the polling loop
                this.startPolling();
            }
            catch (error) {
                console.error('❌ Failed to start event relay:', error);
                throw error;
            }
        });
    }
    startPolling() {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.pollForEvents();
            }
            catch (error) {
                console.error('Error during polling cycle:', error);
            }
        }), 10000); // Poll every 10 seconds
    }
    pollForEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentBlock = yield this.provider.getBlockNumber();
            if (currentBlock <= this.lastCheckedBlock) {
                return; // No new blocks to check
            }
            console.log(`Checking blocks from ${this.lastCheckedBlock + 1} to ${currentBlock}`);
            for (const [protocolName, config] of this.targetContracts.entries()) {
                const contract = new ethers_1.Contract(config.address, config.abi, this.provider);
                for (const eventConfig of config.events) {
                    const events = yield contract.queryFilter(eventConfig.name, this.lastCheckedBlock + 1, currentBlock);
                    for (const event of events) {
                        if (event instanceof ethers_1.EventLog) {
                            yield this.handleEvent(protocolName, eventConfig, event);
                        }
                    }
                }
            }
            this.lastCheckedBlock = currentBlock;
        });
    }
    handleEvent(protocolName, eventConfig, event // Changed from EventLog to any to avoid type error
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            const eventId = `${event.transactionHash}-${event.logIndex}`;
            if (this.processedEvents.has(eventId)) {
                return;
            }
            this.processedEvents.add(eventId);
            try {
                const { user, value } = this.extractEventData(protocolName, eventConfig, event);
                if (!user || !ethers_1.ethers.isAddress(user)) {
                    console.log(`⚠️  Invalid user address from ${protocolName}.${eventConfig.name}`);
                    return;
                }
                console.log(`📈 Detected: ${protocolName}.${eventConfig.name} | User: ${user} | Value: ${value}`);
                yield this.relayToContract(user, protocolName, eventConfig.name, value, event.transactionHash, event.blockNumber);
            }
            catch (error) {
                console.error(`❌ Error handling event ${eventId}:`, error);
                this.processedEvents.delete(eventId);
            }
        });
    }
    /*//////////////////////////////////////////////////////////////
                        EVENT DATA EXTRACTION
    //////////////////////////////////////////////////////////////*/
    extractEventData(protocolName, eventConfig, event) {
        const { args } = event;
        const user = args[eventConfig.userField];
        if (!user) {
            throw new Error(`User field '${eventConfig.userField}' not found in event`);
        }
        let value;
        if (eventConfig.fixedValue !== undefined) {
            value = eventConfig.fixedValue;
        }
        else if (eventConfig.valueField) {
            value = this.extractValueFromField(protocolName, eventConfig, args);
        }
        else {
            value = 1;
        }
        return { user, value };
    }
    extractValueFromField(protocolName, eventConfig, args) {
        try {
            switch (protocolName) {
                case 'dex':
                    if (eventConfig.name === 'Swap') {
                        const amount0Out = args.amount0Out ? Number(ethers_1.ethers.formatEther(args.amount0Out)) : 0;
                        const amount1Out = args.amount1Out ? Number(ethers_1.ethers.formatEther(args.amount1Out)) : 0;
                        return Math.floor(Math.max(amount0Out, amount1Out) * 1000);
                    }
                    else if (eventConfig.name === 'Mint') {
                        const amount0 = args.amount0 ? Number(ethers_1.ethers.formatEther(args.amount0)) : 0;
                        const amount1 = args.amount1 ? Number(ethers_1.ethers.formatEther(args.amount1)) : 0;
                        return Math.floor((amount0 + amount1) * 1000);
                    }
                    break;
                case 'lending':
                    const amount = args[eventConfig.valueField];
                    return amount ? Math.floor(Number(ethers_1.ethers.formatEther(amount)) * 1000) : 0;
                case 'nft':
                    if (args.price) {
                        return Math.floor(Number(ethers_1.ethers.formatEther(args.price)) * 1000);
                    }
                    return 1000;
                default:
                    const fieldValue = args[eventConfig.valueField];
                    return fieldValue ? Math.floor(Number(ethers_1.ethers.formatEther(fieldValue)) * 1000) : 1;
            }
            return 1;
        }
        catch (error) {
            console.warn(`Failed to extract value for ${protocolName}.${eventConfig.name}:`, error);
            return 1;
        }
    }
    /*//////////////////////////////////////////////////////////////
                    SMART CONTRACT INTERACTION
    //////////////////////////////////////////////////////////////*/
    relayToContract(user, protocol, eventType, value, transactionHash, blockNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const gasEstimate = yield this.reputationContract.processProtocolEvent.estimateGas(user, protocol, eventType, value, transactionHash, blockNumber);
                const tx = yield this.reputationContract.processProtocolEvent(user, protocol, eventType, value, transactionHash, blockNumber, {
                    gasLimit: Math.floor(Number(gasEstimate) * 1.2)
                });
                console.log(`🔗 Relayed to contract: ${tx.hash}`);
                const receipt = yield tx.wait();
                console.log(`✅ Confirmed: ${protocol}.${eventType} for ${user} (${value} value)`);
            }
            catch (error) {
                if ((_a = error.reason) === null || _a === void 0 ? void 0 : _a.includes('Event already processed')) {
                    console.log(`⚠️  Event already processed: ${transactionHash}`);
                    return;
                }
                console.error(`❌ Failed to relay to contract:`, error);
                throw error;
            }
        });
    }
    /*//////////////////////////////////////////////////////////////
                        CONTRACT ABIs
    //////////////////////////////////////////////////////////////*/
    getReputationABI() {
        return [
            "function owner() view returns (address)",
            "function processProtocolEvent(address user, string protocol, string eventType, uint256 value, bytes32 transactionHash, uint256 blockNumber)",
            "function getReputationScore(address user) view returns (uint256)",
            "function getProtocolScore(address user, string protocol) view returns (uint256)",
            "event EventProcessed(address indexed user, string indexed protocol, string indexed eventType, uint256 value, uint256 pointsAwarded, bytes32 transactionHash)"
        ];
    }
    getNamoshiABI() {
        return [
            "event DomainRegistered(address indexed owner, string name, uint256 expires)",
            "event DomainRenewed(address indexed owner, string name, uint256 expires)"
        ];
    }
    getSatsumaABI() {
        return [
            "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
            "event Mint(address indexed sender, uint256 amount0, uint256 amount1)"
        ];
    }
    getSpineABI() {
        return [
            "event Deposit(address indexed user, uint256 amount)",
            "event Withdraw(address indexed user, uint256 amount)",
            "event Borrow(address indexed user, uint256 amount)",
            "event Repay(address indexed user, uint256 amount)"
        ];
    }
    getMintParkABI() {
        return [
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price)"
        ];
    }
    getAsignaABI() {
        return [
            "event ExecutionSuccess(address indexed executor, bytes32 txHash, uint256 payment)"
        ];
    }
    /*//////////////////////////////////////////////////////////////
                            API METHODS
    //////////////////////////////////////////////////////////////*/
    getReputationScore(userAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalScore = yield this.reputationContract.getReputationScore(userAddress);
                const protocols = ['namoshi', 'dex', 'lending', 'nft', 'multisig', 'governance'];
                const breakdown = {};
                for (const protocol of protocols) {
                    breakdown[protocol] = Number(yield this.reputationContract.getProtocolScore(userAddress, protocol));
                }
                return {
                    address: userAddress,
                    totalScore: Number(totalScore),
                    breakdown
                };
            }
            catch (error) {
                console.error(`Failed to get reputation for ${userAddress}:`, error);
                return null;
            }
        });
    }
    stopRelay() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🛑 Stopping event relay...');
            this.provider.removeAllListeners();
            console.log('✅ Event relay stopped');
        });
    }
}
exports.EventRelay = EventRelay;
/*//////////////////////////////////////////////////////////////
                        EXPRESS API SERVER
//////////////////////////////////////////////////////////////*/
class ReputationAPI {
    constructor(relay) {
        this.relay = relay;
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    setupRoutes() {
        this.app.get('/reputation/:address', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const address = req.params.address;
                if (!ethers_1.ethers.isAddress(address)) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid Ethereum address'
                    });
                    return;
                }
                const reputation = yield this.relay.getReputationScore(address);
                if (!reputation) {
                    res.status(404).json({
                        success: false,
                        error: 'No reputation found'
                    });
                    return;
                }
                res.json({ success: true, data: reputation });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        }));
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        });
        this.app.get('/stats', (req, res) => {
            res.json({
                success: true,
                data: {
                    protocolsMonitored: this.relay['targetContracts'].size,
                    eventsProcessed: this.relay['processedEvents'].size,
                    uptime: process.uptime()
                }
            });
        });
    }
    start(port = 3001) {
        this.app.listen(port, () => {
            console.log(`🌐 Reputation API server running on http://localhost:${port}`);
            console.log(`📊 Endpoints:`);
            console.log(`   GET /reputation/:address - Get user reputation`);
            console.log(`   GET /health - Health check`);
            console.log(`   GET /stats - System statistics`);
        });
    }
}
exports.ReputationAPI = ReputationAPI;
/*//////////////////////////////////////////////////////////////
                        MAIN EXECUTION
//////////////////////////////////////////////////////////////*/
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const relay = new EventRelay();
            const api = new ReputationAPI(relay);
            yield relay.startRelay();
            const port = parseInt(process.env.PORT || '3001');
            api.start(port);
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
                console.log('\n🛑 Received shutdown signal...');
                yield relay.stopRelay();
                process.exit(0);
            }));
        }
        catch (error) {
            console.error('❌ Failed to start application:', error);
            process.exit(1);
        }
    });
}
if (require.main === module) {
    main();
}
