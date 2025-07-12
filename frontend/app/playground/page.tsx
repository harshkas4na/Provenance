"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, RotateCcw, Share2, Sparkles, Zap, Star, Info } from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { 
  registerDomain, 
  swapTokens, 
  addLiquidity, 
  depositToSpine, 
  borrowFromSpine, 
  repayToSpine,
  mintNFT,
  executeMultisigTransaction,
  createProposal,
  castVote,
  waitForTransaction 
} from "@/lib/contracts"

export default function PlaygroundPage() {
  const [currentScore, setCurrentScore] = useState(0)
  const [completedStations, setCompletedStations] = useState<number[]>([])
  const [currentStation, setCurrentStation] = useState(0)
  const [celebrationActive, setCelebrationActive] = useState(false)
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false)

  // Form states for each station
  const [domainName, setDomainName] = useState("")
  
  // Satsuma DEX states
  const [swapFromAmount, setSwapFromAmount] = useState("")
  const [swapToAmount, setSwapToAmount] = useState("")
  const [liquidityBTC, setLiquidityBTC] = useState("")
  const [liquidityUSDT, setLiquidityUSDT] = useState("")
  
  // Spine Lending states
  const [depositAmount, setDepositAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [repayAmount, setRepayAmount] = useState("")
  
  // MintPark NFT states
  const [nftName, setNftName] = useState("")
  const [nftPrice, setNftPrice] = useState("")
  
  // Asigna Multisig states
  const [multisigDestination, setMultisigDestination] = useState("")
  const [multisigValue, setMultisigValue] = useState("")
  
  // DVote Governance states
  const [proposalTitle, setProposalTitle] = useState("")
  const [proposalDescription, setProposalDescription] = useState("")
  const [proposalId, setProposalId] = useState("")

  // Get web3 context
  const { signer, isConnected } = useWeb3()

  const stations = [
    {
      id: 0,
      name: "Namoshi Name Service",
      icon: "🏷️",
      description: "Register your .btc domain",
      points: 50,
      color: "from-blue-500 to-blue-600",
      actions: ["Register Domain"],
    },
    {
      id: 1,
      name: "Satsuma DEX",
      icon: "🔄",
      description: "Trade tokens and provide liquidity",
      points: 75,
      color: "from-green-500 to-green-600",
      actions: ["Swap Tokens", "Provide Liquidity"],
    },
    {
      id: 2,
      name: "Spine Lending",
      icon: "🏦",
      description: "Deposit, borrow, and manage positions",
      points: 65,
      color: "from-purple-500 to-purple-600",
      actions: ["Deposit", "Borrow", "Repay"],
    },
    {
      id: 3,
      name: "MintPark NFT",
      icon: "🎨",
      description: "Mint and trade NFTs",
      points: 85,
      color: "from-pink-500 to-pink-600",
      actions: ["Mint NFT", "Buy NFT"],
    },
    {
      id: 4,
      name: "Asigna Multisig",
      icon: "🔐",
      description: "Execute multisig transactions",
      points: 100,
      color: "from-orange-500 to-orange-600",
      actions: ["Execute Transaction"],
    },
    {
      id: 5,
      name: "DVote Governance",
      icon: "🗳️",
      description: "Participate in governance",
      points: 60,
      color: "from-red-500 to-red-600",
      actions: ["Create Proposal", "Cast Vote"],
    },
  ]

  const completeStation = (stationId: number) => {
    if (!completedStations.includes(stationId)) {
      setCompletedStations([...completedStations, stationId])
      setCurrentScore(currentScore + stations[stationId].points)
      setCelebrationActive(true)

      // Create celebration particles
      createCelebrationParticles()

      setTimeout(() => setCelebrationActive(false), 2000)
    }
  }

  // Handle domain registration with real contract interaction
  const handleRegisterDomain = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!domainName.trim()) {
      alert('Please enter a domain name!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🏷️ Registering domain: ${domainName}`)
      
      const tx = await registerDomain(domainName, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Domain registered successfully!`)
        alert(`Success! Domain "${domainName}" registered successfully!`)
        completeStation(0)
      }
    } catch (error: any) {
      console.error('❌ Error registering domain:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else if (error.message?.includes('insufficient funds')) {
        alert('Insufficient funds for transaction.')
      } else {
        alert(`Failed to register domain: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Handle DEX operations
  const handleSwapTokens = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!swapFromAmount || !swapToAmount) {
      alert('Please enter swap amounts!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🔄 Swapping ${swapFromAmount} BTC for ${swapToAmount} USDT`)
      
      const tx = await swapTokens(swapFromAmount, "0", "0", swapToAmount, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Swap transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Swap completed successfully!`)
        alert(`Success! Tokens swapped successfully!`)
        completeStation(1)
      }
    } catch (error: any) {
      console.error('❌ Error swapping tokens:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to swap tokens: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!liquidityBTC || !liquidityUSDT) {
      alert('Please enter liquidity amounts!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🔄 Adding liquidity: ${liquidityBTC} BTC + ${liquidityUSDT} USDT`)
      
      const tx = await addLiquidity(liquidityBTC, liquidityUSDT, "0", "0", signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Liquidity transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Liquidity added successfully!`)
        alert(`Success! Liquidity added successfully!`)
        completeStation(1)
      }
    } catch (error: any) {
      console.error('❌ Error adding liquidity:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to add liquidity: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Handle lending operations
  const handleDeposit = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!depositAmount) {
      alert('Please enter deposit amount!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🏦 Depositing ${depositAmount} BTC`)
      
      const tx = await depositToSpine(depositAmount, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Deposit transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Deposit completed successfully!`)
        alert(`Success! ${depositAmount} BTC deposited successfully!`)
        completeStation(2)
      }
    } catch (error: any) {
      console.error('❌ Error depositing:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to deposit: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  const handleBorrow = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!borrowAmount) {
      alert('Please enter borrow amount!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🏦 Borrowing ${borrowAmount} USDT`)
      
      const tx = await borrowFromSpine(borrowAmount, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Borrow transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Borrow completed successfully!`)
        alert(`Success! ${borrowAmount} USDT borrowed successfully!`)
        completeStation(2)
      }
    } catch (error: any) {
      console.error('❌ Error borrowing:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to borrow: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  const handleRepay = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!repayAmount) {
      alert('Please enter repay amount!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🏦 Repaying ${repayAmount} USDT`)
      
      const tx = await repayToSpine(repayAmount, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Repay transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Repayment completed successfully!`)
        alert(`Success! ${repayAmount} USDT repaid successfully!`)
        completeStation(2)
      }
    } catch (error: any) {
      console.error('❌ Error repaying:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to repay: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Handle NFT operations
  const handleMintNFT = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!nftName) {
      alert('Please enter NFT name!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🎨 Minting NFT: ${nftName}`)
      
      const tokenURI = `https://metadata.example.com/${nftName.replace(/\s+/g, '_').toLowerCase()}`
      const tx = await mintNFT(tokenURI, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`NFT mint transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ NFT minted successfully!`)
        alert(`Success! NFT "${nftName}" minted successfully!`)
        completeStation(3)
      }
    } catch (error: any) {
      console.error('❌ Error minting NFT:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to mint NFT: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Handle multisig operations
  const handleExecuteMultisig = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!multisigDestination || !multisigValue) {
      alert('Please enter transaction details!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🔐 Executing multisig transaction to ${multisigDestination}`)
      
      const tx = await executeMultisigTransaction(multisigDestination, multisigValue, "0x", signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Multisig transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Multisig transaction executed successfully!`)
        alert(`Success! Multisig transaction executed successfully!`)
        completeStation(4)
      }
    } catch (error: any) {
      console.error('❌ Error executing multisig transaction:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to execute multisig transaction: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  // Handle governance operations
  const handleCreateProposal = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!proposalTitle || !proposalDescription) {
      alert('Please enter proposal details!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🗳️ Creating proposal: ${proposalTitle}`)
      
      const description = `${proposalTitle}: ${proposalDescription}`
      const votingPeriod = 7 * 24 * 60 * 60 // 7 days in seconds
      const tx = await createProposal(description, votingPeriod, signer)
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Proposal creation transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Proposal created successfully!`)
        alert(`Success! Proposal "${proposalTitle}" created successfully!`)
        completeStation(5)
      }
    } catch (error: any) {
      console.error('❌ Error creating proposal:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to create proposal: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  const handleCastVote = async () => {
    if (!isConnected || !signer) {
      alert('Please connect your wallet first!')
      return
    }

    if (!proposalId) {
      alert('Please enter proposal ID!')
      return
    }

    try {
      setIsProcessingTransaction(true)
      console.log(`🗳️ Casting vote on proposal #${proposalId}`)
      
      const tx = await castVote(parseInt(proposalId), true, signer) // voting "yes"
      console.log(`⏳ Transaction sent: ${tx.hash}`)
      alert(`Vote transaction sent! Hash: ${tx.hash}`)
      
      const receipt = await waitForTransaction(tx)
      if (receipt) {
        console.log(`✅ Vote cast successfully!`)
        alert(`Success! Vote cast on proposal #${proposalId}!`)
        completeStation(5)
      }
    } catch (error: any) {
      console.error('❌ Error casting vote:', error)
      if (error.code === 4001) {
        alert('Transaction was rejected by user.')
      } else {
        alert(`Failed to cast vote: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsProcessingTransaction(false)
    }
  }

  const createCelebrationParticles = () => {
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div")
      particle.className = "celebration-particle"
      particle.style.left = Math.random() * 100 + "%"
      particle.style.animationDelay = Math.random() * 2 + "s"
      document.body.appendChild(particle)

      setTimeout(() => {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle)
        }
      }, 3000)
    }
  }

  const resetJourney = () => {
    setCurrentScore(0)
    setCompletedStations([])
    setCurrentStation(0)
    // Reset all form states
    setDomainName("")
    setSwapFromAmount("")
    setSwapToAmount("")
    setLiquidityBTC("")
    setLiquidityUSDT("")
    setDepositAmount("")
    setBorrowAmount("")
    setRepayAmount("")
    setNftName("")
    setNftPrice("")
    setMultisigDestination("")
    setMultisigValue("")
    setProposalTitle("")
    setProposalDescription("")
    setProposalId("")
  }

  const progressPercentage = (completedStations.length / stations.length) * 100

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1 },
    )

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="dynamic-bg">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      {/* Celebration Particles */}
      {celebrationActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                fontSize: "2rem",
              }}
            >
              {["🎉", "✨", "🌟", "💫", "🎊"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 floating-nav">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="magnetic">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold text-slate-800">Provenance</span>
            </div>
          </div>

          {/* Floating Score */}
          <div className="flex items-center space-x-4">
            <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 border-0 hover-lift">
              <CardContent className="px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="font-bold counter-animation">{currentScore} Points</span>
                </div>
              </CardContent>
            </Card>
            <Button onClick={resetJourney} variant="outline" size="sm" className="magnetic ripple bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Page Header */}
        <div className="text-center mb-12 reveal">
          <h1 className="text-4xl font-bold text-slate-800 mb-4 gradient-text">Reputation Journey Playground</h1>
          <p className="text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
            Experience how your actions build reputation across the Citrea ecosystem
          </p>

          {/* Disclaimer Box */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Demo Environment</p>
                  <p>
                    This is a simulation to demonstrate how the Provenance reputation system will work. 
                    The protocols listed are not yet live. Actions taken here are for illustrative purposes 
                    and do not affect your actual on-chain reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progress</span>
              <span>
                {completedStations.length}/{stations.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 progress-bar" />
          </div>
        </div>

        {/* Animated Journey Path */}
        <div className="mb-12 relative">
          <svg
            className="absolute top-1/2 left-0 w-full h-32 transform -translate-y-1/2 hidden lg:block"
            viewBox="0 0 1200 100"
          >
            <path d="M100 50 Q 300 20, 500 50 T 900 50 Q 1000 30, 1100 50" className="journey-path" />
            {stations.map((_, index) => (
              <circle
                key={index}
                cx={100 + index * 200}
                cy="50"
                className="journey-pulse"
                style={{ animationDelay: `${index * 0.5}s` }}
              />
            ))}
          </svg>

          {/* Journey Map */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {stations.map((station, index) => {
              const isCompleted = completedStations.includes(station.id)
              const isActive = currentStation === station.id

              return (
                <Card
                  key={station.id}
                  className={`transition-all duration-300 magnetic reveal reveal-stagger ${
                    isCompleted
                      ? "glass-card border-green-200 shadow-lg animate-pulse-glow"
                      : isActive
                        ? "glass-card border-blue-200 shadow-lg ring-2 ring-blue-300"
                        : "glass-card border-slate-200 hover:shadow-md hover-lift cursor-pointer"
                  }`}
                  style={{ "--delay": `${index * 0.1}s` } as any}
                  onClick={() => !isCompleted && setCurrentStation(station.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${station.color} flex items-center justify-center text-2xl relative`}
                        >
                          {station.icon}
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Star className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{station.name}</CardTitle>
                          <p className="text-sm text-slate-600">{station.description}</p>
                        </div>
                      </div>
                      {isCompleted && <Badge className="bg-green-500 text-white animate-pulse">✓ Complete</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Potential Points</span>
                      <span className="font-bold text-yellow-600 flex items-center">
                        <Zap className="h-4 w-4 mr-1" />+{station.points}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Active Station Detail */}
        <Card className="glass-card shadow-lg reveal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${stations[currentStation].color} flex items-center justify-center text-3xl animate-pulse`}
                >
                  {stations[currentStation].icon}
                </div>
                <div>
                  <CardTitle className="text-2xl gradient-text">{stations[currentStation].name}</CardTitle>
                  <p className="text-slate-600">{stations[currentStation].description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2 gradient-border">
                <Zap className="h-4 w-4 mr-1" />+{stations[currentStation].points} points
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Station-specific content with enhanced styling */}
            {currentStation === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Register Your .btc Domain
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <Label htmlFor="domain">Domain Name</Label>
                    <Input 
                      id="domain" 
                      placeholder="yourname.btc" 
                      className="mt-2"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      disabled={isProcessingTransaction}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleRegisterDomain}
                      disabled={completedStations.includes(0) || isProcessingTransaction}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ripple magnetic"
                    >
                      {isProcessingTransaction 
                        ? "Processing..." 
                        : completedStations.includes(0) 
                          ? "Completed ✓" 
                          : "Simulate: Register Domain"
                      }
                    </Button>
                  </div>
                </div>
                {!isConnected && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Connect your wallet</strong> to try the domain registration simulation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStation === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Trade & Provide Liquidity
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-4 space-y-4">
                    <h4 className="font-medium">Swap Tokens</h4>
                    <div className="space-y-2">
                      <Label>From Amount (BTC)</Label>
                      <Input 
                        placeholder="0.0" 
                        value={swapFromAmount}
                        onChange={(e) => setSwapFromAmount(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                      <Label>To Amount (USDT)</Label>
                      <Input 
                        placeholder="0.0" 
                        value={swapToAmount}
                        onChange={(e) => setSwapToAmount(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                    </div>
                    <Button 
                      onClick={handleSwapTokens}
                      disabled={isProcessingTransaction}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Swap Tokens"}
                    </Button>
                  </div>
                  <div className="glass-card p-4 space-y-4">
                    <h4 className="font-medium">Provide Liquidity</h4>
                    <div className="space-y-2">
                      <Label>BTC Amount</Label>
                      <Input 
                        placeholder="0.0" 
                        value={liquidityBTC}
                        onChange={(e) => setLiquidityBTC(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                      <Label>USDT Amount</Label>
                      <Input 
                        placeholder="0.0" 
                        value={liquidityUSDT}
                        onChange={(e) => setLiquidityUSDT(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                    </div>
                    <Button 
                      onClick={handleAddLiquidity}
                      disabled={isProcessingTransaction}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Add Liquidity"}
                    </Button>
                  </div>
                </div>
                {!isConnected && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Connect your wallet</strong> to try DEX operations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStation === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Lending Operations
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="glass-card p-4">
                    <Label>Deposit Amount (BTC)</Label>
                    <Input 
                      placeholder="0.0" 
                      className="mt-2" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={isProcessingTransaction}
                    />
                    <Button 
                      onClick={handleDeposit}
                      disabled={isProcessingTransaction}
                      className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Deposit"}
                    </Button>
                  </div>
                  <div className="glass-card p-4">
                    <Label>Borrow Amount (USDT)</Label>
                    <Input 
                      placeholder="0.0" 
                      className="mt-2" 
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      disabled={isProcessingTransaction}
                    />
                    <Button 
                      onClick={handleBorrow}
                      disabled={isProcessingTransaction}
                      className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Borrow"}
                    </Button>
                  </div>
                  <div className="glass-card p-4">
                    <Label>Repay Amount (USDT)</Label>
                    <Input 
                      placeholder="0.0" 
                      className="mt-2" 
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      disabled={isProcessingTransaction}
                    />
                    <Button 
                      onClick={handleRepay}
                      disabled={isProcessingTransaction}
                      className="w-full mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Repay"}
                    </Button>
                  </div>
                </div>
                {!isConnected && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Connect your wallet</strong> to try lending operations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStation === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  NFT Operations
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-4">
                    <h4 className="font-medium mb-2">Mint NFT</h4>
                    <div className="space-y-2">
                      <Label>NFT Name</Label>
                      <Input 
                        placeholder="My Awesome NFT" 
                        value={nftName}
                        onChange={(e) => setNftName(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                      <Label>Price (BTC)</Label>
                      <Input 
                        placeholder="0.001" 
                        value={nftPrice}
                        onChange={(e) => setNftPrice(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                    </div>
                    <Button
                      onClick={handleMintNFT}
                      disabled={isProcessingTransaction}
                      className="w-full mt-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Mint NFT"}
                    </Button>
                  </div>
                  <div className="glass-card p-4">
                    <h4 className="font-medium mb-2">Buy NFT</h4>
                    <div className="space-y-2">
                      <Label>NFT Collection</Label>
                      <Input placeholder="Citrea Punks" disabled />
                      <Label>Max Price (BTC)</Label>
                      <Input placeholder="0.01" disabled />
                    </div>
                    <Button 
                      disabled
                      className="w-full mt-2 bg-gray-400"
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>
                {!isConnected && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Connect your wallet</strong> to try NFT operations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStation === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Multisig Transaction
                </h3>
                <div className="space-y-4">
                  <div className="glass-card p-4">
                    <Label>Destination Address</Label>
                    <Input 
                      placeholder="0x1234..." 
                      className="mt-2" 
                      value={multisigDestination}
                      onChange={(e) => setMultisigDestination(e.target.value)}
                      disabled={isProcessingTransaction}
                    />
                  </div>
                  <div className="glass-card p-4">
                    <Label>Value (ETH)</Label>
                    <Input 
                      placeholder="0.1" 
                      className="mt-2" 
                      value={multisigValue}
                      onChange={(e) => setMultisigValue(e.target.value)}
                      disabled={isProcessingTransaction}
                    />
                  </div>
                  <div className="glass-card p-4">
                    <Label>Required Signatures</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Slider defaultValue={[2]} max={5} min={1} step={1} className="flex-1" />
                      <span className="text-sm text-slate-600">2 of 3</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleExecuteMultisig}
                  disabled={completedStations.includes(4) || isProcessingTransaction}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 ripple magnetic"
                >
                  {isProcessingTransaction 
                    ? "Processing..." 
                    : completedStations.includes(4) 
                      ? "Completed ✓" 
                      : "Simulate: Execute Transaction"
                  }
                </Button>
                {!isConnected && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Connect your wallet</strong> to try multisig operations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStation === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Governance Participation
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-4">
                    <h4 className="font-medium mb-2">Create Proposal</h4>
                    <div className="space-y-2">
                      <Label>Proposal Title</Label>
                      <Input 
                        placeholder="Increase block rewards" 
                        value={proposalTitle}
                        onChange={(e) => setProposalTitle(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                      <Label>Description</Label>
                      <Input 
                        placeholder="Proposal details..." 
                        value={proposalDescription}
                        onChange={(e) => setProposalDescription(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                    </div>
                    <Button
                      onClick={handleCreateProposal}
                      disabled={isProcessingTransaction}
                      className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Create Proposal"}
                    </Button>
                  </div>
                  <div className="glass-card p-4">
                    <h4 className="font-medium mb-2">Cast Vote</h4>
                    <div className="space-y-2">
                      <Label>Proposal ID</Label>
                      <Input 
                        placeholder="42" 
                        value={proposalId}
                        onChange={(e) => setProposalId(e.target.value)}
                        disabled={isProcessingTransaction}
                      />
                      <Label>Vote Weight</Label>
                      <Input placeholder="100 tokens" disabled />
                    </div>
                    <Button
                      onClick={handleCastVote}
                      disabled={isProcessingTransaction}
                      className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                      {isProcessingTransaction ? "Processing..." : "Cast Vote"}
                    </Button>
                  </div>
                </div>
                {!isConnected && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Connect your wallet</strong> to try governance operations.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-40">
          <div className="container mx-auto max-w-7xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentStation(0)} className="magnetic ripple">
                <Play className="h-4 w-4 mr-2" />
                Start Guided Tour
              </Button>
              <Button variant="outline" className="magnetic ripple bg-transparent">
                Random Journey
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {completedStations.length}/{stations.length} completed ({Math.round(progressPercentage)}%)
              </span>
              <Button variant="outline" className="magnetic ripple bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 magnetic ripple"
              >
                <Link href="/dashboard">View Real Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      <style jsx>{`
        .celebration-particle {
          position: fixed;
          font-size: 2rem;
          pointer-events: none;
          z-index: 1000;
          animation: celebration-fall 3s ease-out forwards;
        }

        @keyframes celebration-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}