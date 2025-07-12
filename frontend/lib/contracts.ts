import { ethers } from 'ethers'

/*//////////////////////////////////////////////////////////////
                    CONTRACT ADDRESSES
//////////////////////////////////////////////////////////////*/

export const CONTRACT_ADDRESSES = {
  REPUTATION_SBT: '0x1234567890123456789012345678901234567890',
  NAMOSHI: '0x2345678901234567890123456789012345678901',
  SATSUMA: '0x3456789012345678901234567890123456789012',
  SPINE: '0x4567890123456789012345678901234567890123',
  MINT_PARK: '0x5678901234567890123456789012345678901234',
  ASIGNA: '0x6789012345678901234567890123456789012345',
  DVOTE: '0x7890123456789012345678901234567890123456'
} as const

/*//////////////////////////////////////////////////////////////
                    CONTRACT ABIs
//////////////////////////////////////////////////////////////*/

export const REPUTATION_SBT_ABI = [
  "function owner() view returns (address)",
  "function processProtocolEvent(address user, string protocol, string eventType, uint256 value, bytes32 transactionHash, uint256 blockNumber)",
  "function getReputationScore(address user) view returns (uint256)",
  "function getProtocolScore(address user, string protocol) view returns (uint256)",
  "event EventProcessed(address indexed user, string indexed protocol, string indexed eventType, uint256 value, uint256 pointsAwarded, bytes32 transactionHash)"
] as const

export const NAMOSHI_ABI = [
  "function registerDomain(string name) payable returns (bool)",
  "function renewDomain(string name) payable returns (bool)",
  "function getDomainOwner(string name) view returns (address)",
  "function getDomainExpiry(string name) view returns (uint256)",
  "event DomainRegistered(address indexed owner, string name, uint256 expires)",
  "event DomainRenewed(address indexed owner, string name, uint256 expires)"
] as const

export const SATSUMA_ABI = [
  "function swap(uint256 amount0In, uint256 amount1In, uint256 amount0OutMin, uint256 amount1OutMin, address to) returns (uint256[], uint256[])",
  "function addLiquidity(uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address to) payable returns (uint256, uint256, uint256)",
  "function removeLiquidity(uint256 liquidity, uint256 amount0Min, uint256 amount1Min, address to) returns (uint256, uint256)",
  "function getReserves() view returns (uint256, uint256, uint32)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
  "event Mint(address indexed sender, uint256 amount0, uint256 amount1)"
] as const

export const SPINE_ABI = [
  "function deposit(uint256 amount) payable returns (bool)",
  "function withdraw(uint256 amount) returns (bool)",
  "function borrow(uint256 amount) returns (bool)",
  "function repay(uint256 amount) payable returns (bool)",
  "function getBalance(address user) view returns (uint256)",
  "function getBorrowBalance(address user) view returns (uint256)",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdraw(address indexed user, uint256 amount)",
  "event Borrow(address indexed user, uint256 amount)",
  "event Repay(address indexed user, uint256 amount)"
] as const

export const MINT_PARK_ABI = [
  "function mint(address to, string memory tokenURI) payable returns (uint256)",
  "function transfer(address from, address to, uint256 tokenId) returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price)"
] as const

export const ASIGNA_ABI = [
  "function submitTransaction(address destination, uint256 value, bytes data) returns (uint256)",
  "function confirmTransaction(uint256 transactionId) returns (bool)",
  "function executeTransaction(uint256 transactionId) returns (bool)",
  "function getTransactionCount() view returns (uint256)",
  "function isConfirmed(uint256 transactionId) view returns (bool)",
  "event ExecutionSuccess(address indexed executor, bytes32 txHash, uint256 payment)"
] as const

export const DVOTE_ABI = [
  "function createProposal(string description, uint256 votingPeriod) returns (uint256)",
  "function vote(uint256 proposalId, bool support) returns (bool)",
  "function executeProposal(uint256 proposalId) returns (bool)",
  "function getProposal(uint256 proposalId) view returns (string, uint256, uint256, uint256, bool)",
  "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
  "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight)"
] as const

/*//////////////////////////////////////////////////////////////
                    CONTRACT GETTER FUNCTIONS
//////////////////////////////////////////////////////////////*/

export function getReputationSBTContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.REPUTATION_SBT, REPUTATION_SBT_ABI, signer)
}

export function getNamoshiContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.NAMOSHI, NAMOSHI_ABI, signer)
}

export function getSatsumaContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.SATSUMA, SATSUMA_ABI, signer)
}

export function getSpineContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.SPINE, SPINE_ABI, signer)
}

export function getMintParkContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.MINT_PARK, MINT_PARK_ABI, signer)
}

export function getAsignaContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.ASIGNA, ASIGNA_ABI, signer)
}

export function getDVoteContract(signer: ethers.JsonRpcSigner): ethers.Contract {
  return new ethers.Contract(CONTRACT_ADDRESSES.DVOTE, DVOTE_ABI, signer)
}

/*//////////////////////////////////////////////////////////////
                    REPUTATION CONTRACT FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function getReputationScore(address: string, signer: ethers.JsonRpcSigner): Promise<number> {
  try {
    const contract = getReputationSBTContract(signer)
    const score = await contract.getReputationScore(address)
    return Number(score) // Convert BigInt to number
  } catch (error) {
    console.error('Error getting reputation score:', error)
    throw error
  }
}

export async function getProtocolScore(address: string, protocol: string, signer: ethers.JsonRpcSigner): Promise<number> {
  try {
    const contract = getReputationSBTContract(signer)
    const score = await contract.getProtocolScore(address, protocol)
    return Number(score) // Convert BigInt to number
  } catch (error) {
    console.error(`Error getting ${protocol} score:`, error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    NAMOSHI CONTRACT FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function registerDomain(domainName: string, signer: ethers.JsonRpcSigner): Promise<ethers.TransactionResponse> {
  try {
    const contract = getNamoshiContract(signer)
    const tx = await contract.registerDomain(domainName, {
      value: ethers.parseEther("0.001") // Send 0.001 ETH with the transaction
    })
    return tx
  } catch (error) {
    console.error('Error registering domain:', error)
    throw error
  }
}

export async function renewDomain(domainName: string, signer: ethers.JsonRpcSigner): Promise<ethers.TransactionResponse> {
  try {
    const contract = getNamoshiContract(signer)
    const tx = await contract.renewDomain(domainName, {
      value: ethers.parseEther("0.001") // Send 0.001 ETH with the transaction
    })
    return tx
  } catch (error) {
    console.error('Error renewing domain:', error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    SATSUMA DEX FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function swapTokens(
  amount0In: string,
  amount1In: string,
  amount0OutMin: string,
  amount1OutMin: string,
  signer: ethers.JsonRpcSigner
): Promise<ethers.TransactionResponse> {
  try {
    const contract = getSatsumaContract(signer)
    const tx = await contract.swap(
      ethers.parseEther(amount0In),
      ethers.parseEther(amount1In),
      ethers.parseEther(amount0OutMin),
      ethers.parseEther(amount1OutMin),
      await signer.getAddress()
    )
    return tx
  } catch (error) {
    console.error('Error swapping tokens:', error)
    throw error
  }
}

export async function addLiquidity(
  amount0Desired: string,
  amount1Desired: string,
  amount0Min: string,
  amount1Min: string,
  signer: ethers.JsonRpcSigner
): Promise<ethers.TransactionResponse> {
  try {
    const contract = getSatsumaContract(signer)
    const tx = await contract.addLiquidity(
      ethers.parseEther(amount0Desired),
      ethers.parseEther(amount1Desired),
      ethers.parseEther(amount0Min),
      ethers.parseEther(amount1Min),
      await signer.getAddress(),
      {
        value: ethers.parseEther("0.01") // Send some ETH for liquidity
      }
    )
    return tx
  } catch (error) {
    console.error('Error adding liquidity:', error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    SPINE LENDING FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function depositToSpine(amount: string, signer: ethers.JsonRpcSigner): Promise<ethers.TransactionResponse> {
  try {
    const contract = getSpineContract(signer)
    const tx = await contract.deposit(ethers.parseEther(amount), {
      value: ethers.parseEther(amount) // Send ETH to deposit
    })
    return tx
  } catch (error) {
    console.error('Error depositing to Spine:', error)
    throw error
  }
}

export async function borrowFromSpine(amount: string, signer: ethers.JsonRpcSigner): Promise<ethers.TransactionResponse> {
  try {
    const contract = getSpineContract(signer)
    const tx = await contract.borrow(ethers.parseEther(amount))
    return tx
  } catch (error) {
    console.error('Error borrowing from Spine:', error)
    throw error
  }
}

export async function repayToSpine(amount: string, signer: ethers.JsonRpcSigner): Promise<ethers.TransactionResponse> {
  try {
    const contract = getSpineContract(signer)
    const tx = await contract.repay(ethers.parseEther(amount), {
      value: ethers.parseEther(amount) // Send ETH to repay
    })
    return tx
  } catch (error) {
    console.error('Error repaying to Spine:', error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    MINT PARK NFT FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function mintNFT(tokenURI: string, signer: ethers.JsonRpcSigner): Promise<ethers.TransactionResponse> {
  try {
    const contract = getMintParkContract(signer)
    const userAddress = await signer.getAddress()
    const tx = await contract.mint(userAddress, tokenURI, {
      value: ethers.parseEther("0.01") // Send 0.01 ETH to mint
    })
    return tx
  } catch (error) {
    console.error('Error minting NFT:', error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    ASIGNA MULTISIG FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function executeMultisigTransaction(
  destination: string,
  value: string,
  data: string,
  signer: ethers.JsonRpcSigner
): Promise<ethers.TransactionResponse> {
  try {
    const contract = getAsignaContract(signer)
    
    // First submit the transaction
    const submitTx = await contract.submitTransaction(
      destination,
      ethers.parseEther(value),
      data || "0x"
    )
    
    // Wait for submission to be mined to get transaction ID
    const receipt = await submitTx.wait()
    
    // For demo purposes, we'll assume transaction ID is 0 (latest)
    // In a real implementation, you'd parse the event logs to get the actual ID
    const transactionId = 0
    
    // Confirm and execute the transaction
    const executeTx = await contract.executeTransaction(transactionId)
    return executeTx
  } catch (error) {
    console.error('Error executing multisig transaction:', error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    DVOTE GOVERNANCE FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function createProposal(
  description: string,
  votingPeriod: number,
  signer: ethers.JsonRpcSigner
): Promise<ethers.TransactionResponse> {
  try {
    const contract = getDVoteContract(signer)
    const tx = await contract.createProposal(description, votingPeriod)
    return tx
  } catch (error) {
    console.error('Error creating proposal:', error)
    throw error
  }
}

export async function castVote(
  proposalId: number,
  support: boolean,
  signer: ethers.JsonRpcSigner
): Promise<ethers.TransactionResponse> {
  try {
    const contract = getDVoteContract(signer)
    const tx = await contract.vote(proposalId, support)
    return tx
  } catch (error) {
    console.error('Error casting vote:', error)
    throw error
  }
}

/*//////////////////////////////////////////////////////////////
                    UTILITY FUNCTIONS
//////////////////////////////////////////////////////////////*/

export async function waitForTransaction(
  tx: ethers.TransactionResponse,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  try {
    console.log(`⏳ Waiting for transaction: ${tx.hash}`)
    const receipt = await tx.wait(confirmations)
    console.log(`✅ Transaction confirmed: ${tx.hash}`)
    return receipt
  } catch (error) {
    console.error('Error waiting for transaction:', error)
    throw error
  }
}

export function formatEther(value: bigint): string {
  return ethers.formatEther(value)
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value)
}

/*//////////////////////////////////////////////////////////////
                    TYPE DEFINITIONS
//////////////////////////////////////////////////////////////*/

export interface ReputationData {
  address: string
  totalScore: number
  breakdown: {
    namoshi: number
    dex: number
    lending: number
    nft: number
    multisig: number
    governance: number
  }
}

export interface TransactionOptions {
  value?: bigint
  gasLimit?: bigint
  gasPrice?: bigint
}