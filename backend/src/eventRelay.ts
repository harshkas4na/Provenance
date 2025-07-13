// src/eventRelay.ts - Now with Manual Polling for Citrea Compatibility
import { ethers, Contract, JsonRpcProvider, Wallet, EventLog } from 'ethers';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

/*//////////////////////////////////////////////////////////////
                        TYPE DEFINITIONS
//////////////////////////////////////////////////////////////*/

interface ContractConfig {
    address: string;
    abi: any[];
    events: EventConfig[];
}

interface EventConfig {
    name: string;
    userField: string;    // Which event arg contains user address
    valueField?: string;  // Which event arg contains value (optional)
    fixedValue?: number;  // Use fixed value if no value field
}

interface ExtractedData {
    user: string;
    value: number;
}

/*//////////////////////////////////////////////////////////////
                    EVENT RELAY SERVICE
//////////////////////////////////////////////////////////////*/

export class EventRelay {
    private provider: JsonRpcProvider;
    private wallet: Wallet;
    private reputationContract: Contract;
    private targetContracts: Map<string, ContractConfig> = new Map();
    private processedEvents: Set<string> = new Set();
    private lastCheckedBlock: number = 0;

    constructor() {
        // Initialize provider and wallet
        this.provider = new JsonRpcProvider(
            process.env.CITREA_RPC_URL || 'https://rpc.testnet.citrea.xyz'
        );
        
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY environment variable is required');
        }
        
        this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
        
        // Initialize reputation contract
        this.reputationContract = new Contract(
            process.env.REPUTATION_CONTRACT_ADDRESS!,
            this.getReputationABI(),
            this.wallet
        );
        
        // Initialize target contracts
        this.initializeTargetContracts();
    }

    /*//////////////////////////////////////////////////////////////
                    CONTRACT CONFIGURATIONS
    //////////////////////////////////////////////////////////////*/

    private initializeTargetContracts(): void {
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

    public async startRelay(): Promise<void> {
        console.log('🚀 Starting Event Relay for Citrea Reputation System...');
        
        try {
            // Verify reputation contract connection
            const contractOwner = await this.reputationContract.owner();
            console.log('✅ Connected to ReputationSBT contract, owner:', contractOwner);

            // Get the current block number to start polling from
            this.lastCheckedBlock = await this.provider.getBlockNumber();
            console.log(`🔍 Starting to poll for events from block ${this.lastCheckedBlock}`);
            
            // Start the polling loop
            this.startPolling();
            
        } catch (error) {
            console.error('❌ Failed to start event relay:', error);
            throw error;
        }
    }

    private startPolling(): void {
        setInterval(async () => {
            try {
                await this.pollForEvents();
            } catch (error) {
                console.error('Error during polling cycle:', error);
            }
        }, 10000); // Poll every 10 seconds
    }

    private async pollForEvents(): Promise<void> {
        const currentBlock = await this.provider.getBlockNumber();
        if (currentBlock <= this.lastCheckedBlock) {
            return; // No new blocks to check
        }

        console.log(`Checking blocks from ${this.lastCheckedBlock + 1} to ${currentBlock}`);

        for (const [protocolName, config] of this.targetContracts.entries()) {
            const contract = new Contract(config.address, config.abi, this.provider);
            for (const eventConfig of config.events) {
                const events = await contract.queryFilter(eventConfig.name, this.lastCheckedBlock + 1, currentBlock);
                for (const event of events) {
                    if (event instanceof EventLog) {
                        await this.handleEvent(protocolName, eventConfig, event);
                    }
                }
            }
        }

        this.lastCheckedBlock = currentBlock;
    }

    private async handleEvent(
        protocolName: string,
        eventConfig: EventConfig,
        event: any // Changed from EventLog to any to avoid type error
    ): Promise<void> {
        const eventId = `${event.transactionHash}-${event.logIndex}`;
        
        if (this.processedEvents.has(eventId)) {
            return;
        }
        this.processedEvents.add(eventId);

        try {
            const { user, value } = this.extractEventData(protocolName, eventConfig, event);
            
            if (!user || !ethers.isAddress(user)) {
                console.log(`⚠️  Invalid user address from ${protocolName}.${eventConfig.name}`);
                return;
            }

            console.log(`📈 Detected: ${protocolName}.${eventConfig.name} | User: ${user} | Value: ${value}`);

            await this.relayToContract(
                user,
                protocolName,
                eventConfig.name,
                value,
                event.transactionHash,
                event.blockNumber
            );
            
        } catch (error) {
            console.error(`❌ Error handling event ${eventId}:`, error);
            this.processedEvents.delete(eventId);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        EVENT DATA EXTRACTION
    //////////////////////////////////////////////////////////////*/

    private extractEventData(
        protocolName: string,
        eventConfig: EventConfig,
        event: EventLog
    ): ExtractedData {
        const { args } = event;
        
        const user = args[eventConfig.userField];
        if (!user) {
            throw new Error(`User field '${eventConfig.userField}' not found in event`);
        }

        let value: number;
        
        if (eventConfig.fixedValue !== undefined) {
            value = eventConfig.fixedValue;
        } else if (eventConfig.valueField) {
            value = this.extractValueFromField(protocolName, eventConfig, args);
        } else {
            value = 1;
        }

        return { user, value };
    }

    private extractValueFromField(
        protocolName: string,
        eventConfig: EventConfig,
        args: any
    ): number {
        try {
            switch (protocolName) {
                case 'dex':
                    if (eventConfig.name === 'Swap') {
                        const amount0Out = args.amount0Out ? Number(ethers.formatEther(args.amount0Out)) : 0;
                        const amount1Out = args.amount1Out ? Number(ethers.formatEther(args.amount1Out)) : 0;
                        return Math.floor(Math.max(amount0Out, amount1Out) * 1000);
                    } else if (eventConfig.name === 'Mint') {
                        const amount0 = args.amount0 ? Number(ethers.formatEther(args.amount0)) : 0;
                        const amount1 = args.amount1 ? Number(ethers.formatEther(args.amount1)) : 0;
                        return Math.floor((amount0 + amount1) * 1000);
                    }
                    break;

                case 'lending':
                    const amount = args[eventConfig.valueField!];
                    return amount ? Math.floor(Number(ethers.formatEther(amount)) * 1000) : 0;

                case 'nft':
                    if (args.price) {
                        return Math.floor(Number(ethers.formatEther(args.price)) * 1000);
                    }
                    return 1000;

                default:
                    const fieldValue = args[eventConfig.valueField!];
                    return fieldValue ? Math.floor(Number(ethers.formatEther(fieldValue)) * 1000) : 1;
            }

            return 1;
            
        } catch (error) {
            console.warn(`Failed to extract value for ${protocolName}.${eventConfig.name}:`, error);
            return 1;
        }
    }

    /*//////////////////////////////////////////////////////////////
                    SMART CONTRACT INTERACTION
    //////////////////////////////////////////////////////////////*/

    private async relayToContract(
        user: string,
        protocol: string,
        eventType: string,
        value: number,
        transactionHash: string,
        blockNumber: number
    ): Promise<void> {
        try {
            const gasEstimate = await this.reputationContract.processProtocolEvent.estimateGas(
                user,
                protocol,
                eventType,
                value,
                transactionHash,
                blockNumber
            );

            const tx = await this.reputationContract.processProtocolEvent(
                user,
                protocol,
                eventType,
                value,
                transactionHash,
                blockNumber,
                {
                    gasLimit: Math.floor(Number(gasEstimate) * 1.2)
                }
            );

            console.log(`🔗 Relayed to contract: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Confirmed: ${protocol}.${eventType} for ${user} (${value} value)`);
            
        } catch (error: any) {
            if (error.reason?.includes('Event already processed')) {
                console.log(`⚠️  Event already processed: ${transactionHash}`);
                return;
            }
            
            console.error(`❌ Failed to relay to contract:`, error);
            throw error;
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CONTRACT ABIs
    //////////////////////////////////////////////////////////////*/

    private getReputationABI() {
        return [
            "function owner() view returns (address)",
            "function processProtocolEvent(address user, string protocol, string eventType, uint256 value, bytes32 transactionHash, uint256 blockNumber)",
            "function getReputationScore(address user) view returns (uint256)",
            "function getProtocolScore(address user, string protocol) view returns (uint256)",
            "event EventProcessed(address indexed user, string indexed protocol, string indexed eventType, uint256 value, uint256 pointsAwarded, bytes32 transactionHash)"
        ];
    }

    private getNamoshiABI() {
        return [
            "event DomainRegistered(address indexed owner, string name, uint256 expires)",
            "event DomainRenewed(address indexed owner, string name, uint256 expires)"
        ];
    }

    private getSatsumaABI() {
        return [
            "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
            "event Mint(address indexed sender, uint256 amount0, uint256 amount1)"
        ];
    }

    private getSpineABI() {
        return [
            "event Deposit(address indexed user, uint256 amount)",
            "event Withdraw(address indexed user, uint256 amount)",
            "event Borrow(address indexed user, uint256 amount)",
            "event Repay(address indexed user, uint256 amount)"
        ];
    }

    private getMintParkABI() {
        return [
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price)"
        ];
    }

    private getAsignaABI() {
        return [
            "event ExecutionSuccess(address indexed executor, bytes32 txHash, uint256 payment)"
        ];
    }

    /*//////////////////////////////////////////////////////////////
                            API METHODS
    //////////////////////////////////////////////////////////////*/

    public async getReputationScore(userAddress: string): Promise<any> {
        try {
            const totalScore = await this.reputationContract.getReputationScore(userAddress);
            
            const protocols = ['namoshi', 'dex', 'lending', 'nft', 'multisig', 'governance'];
            const breakdown: any = {};
            
            for (const protocol of protocols) {
                breakdown[protocol] = Number(await this.reputationContract.getProtocolScore(userAddress, protocol));
            }

            return {
                address: userAddress,
                totalScore: Number(totalScore),
                breakdown
            };
        } catch (error) {
            console.error(`Failed to get reputation for ${userAddress}:`, error);
            return null;
        }
    }

    public async stopRelay(): Promise<void> {
        console.log('🛑 Stopping event relay...');
        this.provider.removeAllListeners();
        console.log('✅ Event relay stopped');
    }
}

/*//////////////////////////////////////////////////////////////
                        EXPRESS API SERVER
//////////////////////////////////////////////////////////////*/

export class ReputationAPI {
    private app: express.Application;
    private relay: EventRelay;

    constructor(relay: EventRelay) {
        this.relay = relay;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        this.app.get('/reputation/:address', async (req: Request, res: Response) => {
            try {
                const address = req.params.address;
                
                if (!ethers.isAddress(address)) {
                    res.status(400).json({ 
                        success: false, 
                        error: 'Invalid Ethereum address' 
                    });
                    return;
                }

                const reputation = await this.relay.getReputationScore(address);
                
                if (!reputation) {
                    res.status(404).json({
                        success: false,
                        error: 'No reputation found'
                    });
                    return;
                }

                res.json({ success: true, data: reputation });
                
            } catch (error: any) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
        });

        this.app.get('/health', (req: Request, res: Response) => {
            res.json({ 
                success: true, 
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        });

        this.app.get('/stats', (req: Request, res: Response) => {
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

    public start(port: number = 3001): void {
        this.app.listen(port, () => {
            console.log(`🌐 Reputation API server running on http://localhost:${port}`);
            console.log(`📊 Endpoints:`);
            console.log(`   GET /reputation/:address - Get user reputation`);
            console.log(`   GET /health - Health check`);
            console.log(`   GET /stats - System statistics`);
        });
    }
}

/*//////////////////////////////////////////////////////////////
                        MAIN EXECUTION
//////////////////////////////////////////////////////////////*/

async function main() {
    try {
        const relay = new EventRelay();
        const api = new ReputationAPI(relay);
        
        await relay.startRelay();
        
        const port = parseInt(process.env.PORT || '3001');
        api.start(port);
        
        process.on('SIGINT', async () => {
            console.log('\n🛑 Received shutdown signal...');
            await relay.stopRelay();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Failed to start application:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}