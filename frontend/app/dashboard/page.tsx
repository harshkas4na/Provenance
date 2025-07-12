"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ConnectWallet } from "@/components/ConnectWallet"
import { ArrowLeft, TrendingUp, Award, Clock, ExternalLink, Activity, Loader2 } from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { getReputationScore, getProtocolScore } from "@/lib/contracts"

export default function DashboardPage() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [onChainScore, setOnChainScore] = useState<number | null>(null)
  const [isLoadingScore, setIsLoadingScore] = useState(false)
  const [protocolScores, setProtocolScores] = useState<{[key: string]: number}>({})
  const targetScore = 847

  // Get web3 context
  const { address, signer, isConnected } = useWeb3()

  // Fetch on-chain reputation score when wallet connects
  useEffect(() => {
    const fetchReputationScore = async () => {
      if (!address || !signer) {
        setOnChainScore(null)
        setProtocolScores({})
        return
      }

      try {
        setIsLoadingScore(true)
        console.log(`📊 Fetching reputation score for: ${address}`)

        // Fetch total reputation score
        const totalScore = await getReputationScore(address, signer)
        setOnChainScore(totalScore)
        console.log(`✅ Total reputation score: ${totalScore}`)

        // Fetch individual protocol scores
        const protocols = [
          { key: 'namoshi', name: 'namoshi' },
          { key: 'satsuma', name: 'dex' },
          { key: 'spine', name: 'lending' },
          { key: 'mintpark', name: 'nft' },
          { key: 'asigna', name: 'multisig' },
          { key: 'dvote', name: 'governance' }
        ]

        const scores: {[key: string]: number} = {}
        for (const protocol of protocols) {
          try {
            const score = await getProtocolScore(address, protocol.name, signer)
            scores[protocol.key] = score
            console.log(`📈 ${protocol.key} score: ${score}`)
          } catch (error) {
            console.warn(`Failed to fetch ${protocol.key} score:`, error)
            scores[protocol.key] = 0
          }
        }
        setProtocolScores(scores)

      } catch (error) {
        console.error('❌ Error fetching reputation score:', error)
        // For demo purposes, fall back to mock data if contract calls fail
        setOnChainScore(847)
        setProtocolScores({
          namoshi: 150,
          satsuma: 180,
          spine: 120,
          mintpark: 90,
          asigna: 167,
          dvote: 140
        })
      } finally {
        setIsLoadingScore(false)
      }
    }

    fetchReputationScore()
  }, [address, signer])

  // Animated score for fallback display
  useEffect(() => {
    const duration = 1000 // 1 seconds
    const steps = 40
    const increment = targetScore / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetScore) {
        setAnimatedScore(targetScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

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

  // Determine which score to display
  const displayScore = () => {
    if (isLoadingScore) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          <span className="text-2xl">Loading...</span>
        </div>
      )
    }
    
    if (isConnected && onChainScore !== null) {
      return <span className="text-4xl font-bold text-yellow-400 counter-animation">{onChainScore}</span>
    }
    
    if (!isConnected) {
      return <span className="text-4xl font-bold text-yellow-400 counter-animation">{animatedScore}</span>
    }
    
    return <span className="text-4xl font-bold text-yellow-400 counter-animation">0</span>
  }

  // Get protocol breakdown data
  const getProtocolData = () => {
    if (isConnected && Object.keys(protocolScores).length > 0) {
      return [
        { icon: "🏷️", name: "Namoshi", score: protocolScores.namoshi || 0, max: 200, color: "bg-blue-500" },
        { icon: "🔄", name: "Satsuma", score: protocolScores.satsuma || 0, max: 200, color: "bg-green-500" },
        { icon: "🏦", name: "Spine", score: protocolScores.spine || 0, max: 200, color: "bg-purple-500" },
        { icon: "🎨", name: "MintPark", score: protocolScores.mintpark || 0, max: 200, color: "bg-pink-500" },
        { icon: "🔐", name: "Asigna", score: protocolScores.asigna || 0, max: 200, color: "bg-orange-500" },
        { icon: "🗳️", name: "DVote", score: protocolScores.dvote || 0, max: 200, color: "bg-red-500" },
      ]
    }
    
    // Fallback to mock data
    return [
      { icon: "🏷️", name: "Namoshi", score: 150, max: 200, color: "bg-blue-500" },
      { icon: "🔄", name: "Satsuma", score: 180, max: 200, color: "bg-green-500" },
      { icon: "🏦", name: "Spine", score: 120, max: 200, color: "bg-purple-500" },
      { icon: "🎨", name: "MintPark", score: 90, max: 200, color: "bg-pink-500" },
      { icon: "🔐", name: "Asigna", score: 167, max: 200, color: "bg-orange-500" },
      { icon: "🗳️", name: "DVote", score: 140, max: 200, color: "bg-red-500" },
    ]
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="dynamic-bg">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 floating-nav relative z-50">
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

          <ConnectWallet variant="connected" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-card reveal">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start bg-slate-100 magnetic">
                  📊 Overview
                </Button>
                <Button variant="ghost" className="w-full justify-start magnetic">
                  🏆 Achievements
                </Button>
                <Button variant="ghost" className="w-full justify-start magnetic">
                  📈 Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start magnetic">
                  ⚙️ Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Reputation Score Hero with Animation */}
            <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 reveal hover-lift">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <div className="flex items-center justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold gradient-text mr-3">Your Reputation Score</h1>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400 font-medium">
                          {isConnected ? 'Live' : 'Demo'}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-2">Based on your on-chain activities across 6 protocols</p>
                    <p className="text-sm text-slate-400">
                      {isConnected && address 
                        ? `Data for wallet: ${address.slice(0, 6)}...${address.slice(-4)}`
                        : 'Connect wallet to view live data'
                      }
                    </p>
                  </div>

                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-8 border-yellow-400 flex items-center justify-center relative">
                      <div className="text-center">
                        {displayScore()}
                        <div className="text-sm text-slate-300">Score</div>
                      </div>
                      <div className="absolute inset-0 rounded-full border-8 border-yellow-400/20 animate-ping"></div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-400 text-slate-900 animate-pulse">Rank #156</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="glass-card p-4">
                    <div className="text-sm text-slate-300 mb-1">Current Tier</div>
                    <div className="text-xl font-bold text-yellow-400">Gold</div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="text-sm text-slate-300 mb-1">Next Milestone</div>
                    <div className="text-xl font-bold">153 points to Platinum</div>
                  </div>
                </div>

                {!isConnected && (
                  <div className="mt-4 bg-blue-900/50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-200">
                      <strong>Connect your wallet</strong> to view your live reputation score and protocol breakdown.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Protocol Breakdown with Enhanced Cards */}
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 gradient-text reveal">Protocol Breakdown</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getProtocolData().map((protocol, index) => (
                  <Card
                    key={index}
                    className="glass-card hover-lift reveal reveal-stagger magnetic"
                    style={{ "--delay": `${index * 0.1}s` } as any}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl animate-pulse">{protocol.icon}</span>
                          <span className="font-bold text-slate-800">{protocol.name}</span>
                        </div>
                        <span className="text-lg font-bold text-slate-700 counter-animation">{protocol.score}</span>
                      </div>
                      <Progress value={(protocol.score / protocol.max) * 100} className="h-2 progress-bar" />
                      <div className="flex justify-between text-sm text-slate-500 mt-2">
                        <span>
                          {protocol.score}/{protocol.max}
                        </span>
                        <span>{Math.round((protocol.score / protocol.max) * 100)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Activity Timeline & Score Chart with Glassmorphism */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Activity Timeline */}
              <Card className="glass-card reveal">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      action: "Provided liquidity to BTC/USDT pool",
                      protocol: "Satsuma",
                      points: "+25",
                      time: "2 hours ago",
                      icon: "🔄",
                    },
                    {
                      action: "Voted on governance proposal #42",
                      protocol: "DVote",
                      points: "+50",
                      time: "1 day ago",
                      icon: "🗳️",
                    },
                    {
                      action: "Registered domain bitcoin.btc",
                      protocol: "Namoshi",
                      points: "+50",
                      time: "2 days ago",
                      icon: "🏷️",
                    },
                    {
                      action: "Deposited 0.5 BTC as collateral",
                      protocol: "Spine",
                      points: "+30",
                      time: "3 days ago",
                      icon: "🏦",
                    },
                    {
                      action: "Minted rare NFT #1337",
                      protocol: "MintPark",
                      points: "+75",
                      time: "1 week ago",
                      icon: "🎨",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors magnetic reveal-stagger"
                      style={{ "--delay": `${index * 0.1}s` } as any}
                    >
                      <span className="text-xl animate-pulse">{activity.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{activity.action}</div>
                        <div className="text-sm text-slate-500">
                          {activity.protocol} • {activity.time}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
                        {activity.points}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent magnetic ripple">
                    Load More Activities
                  </Button>
                </CardContent>
              </Card>

              {/* Score Progression */}
              <Card className="glass-card reveal">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Score Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-300 animate-pulse" />
                      <p>Score progression chart would be displayed here</p>
                      <p className="text-sm">Showing growth over time across all protocols</p>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="magnetic bg-transparent">
                      7D
                    </Button>
                    <Button variant="outline" size="sm" className="magnetic bg-transparent">
                      30D
                    </Button>
                    <Button variant="outline" size="sm" className="bg-slate-100 magnetic">
                      90D
                    </Button>
                    <Button variant="outline" size="sm" className="magnetic bg-transparent">
                      All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Badges with Enhanced Animations */}
            <Card className="glass-card reveal">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Achievement Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: "First Trade", icon: "🥇", unlocked: true },
                    { name: "Liquidity Provider", icon: "💧", unlocked: true },
                    { name: "Domain Owner", icon: "🏷️", unlocked: true },
                    { name: "Governance Voter", icon: "🗳️", unlocked: true },
                    { name: "NFT Collector", icon: "🎨", unlocked: false },
                    { name: "Multisig Master", icon: "🔐", unlocked: false },
                    { name: "DeFi Veteran", icon: "🏆", unlocked: false },
                    { name: "Protocol Pioneer", icon: "🚀", unlocked: false },
                  ].map((badge, index) => (
                    <div
                      key={index}
                      className={`text-center p-4 rounded-lg border-2 transition-all duration-300 magnetic reveal-stagger ${
                        badge.unlocked
                          ? "border-yellow-200 bg-yellow-50 hover:shadow-md hover-lift"
                          : "border-slate-200 bg-slate-50 opacity-50"
                      }`}
                      style={{ "--delay": `${index * 0.1}s` } as any}
                    >
                      <div className="text-3xl mb-2 animate-in fade-in duration-700">{badge.icon}</div>
                      <div className="text-sm font-medium text-slate-700">{badge.name}</div>
                      {badge.unlocked && (
                        <Badge className="mt-2 bg-yellow-400 text-slate-900 animate-in fade-in duration-700">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions with Enhanced Styling */}
            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 reveal hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      <Activity className="h-5 w-5 mr-2 animate-pulse" />
                      Ready to boost your score?
                    </h3>
                    <p className="text-purple-100 mb-4">
                      Try our interactive playground to see how different actions affect your reputation
                    </p>
                  </div>
                  <Button asChild className="bg-white text-purple-700 hover:bg-slate-100 magnetic ripple">
                    <Link href="/playground">
                      Explore Playground <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}