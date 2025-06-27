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
import { ArrowLeft, Play, RotateCcw, Share2, Sparkles, Zap, Star } from "lucide-react"

export default function PlaygroundPage() {
  const [currentScore, setCurrentScore] = useState(0)
  const [completedStations, setCompletedStations] = useState<number[]>([])
  const [currentStation, setCurrentStation] = useState(0)
  const [celebrationActive, setCelebrationActive] = useState(false)

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
                    <Input id="domain" placeholder="yourname.btc" className="mt-2" />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => completeStation(0)}
                      disabled={completedStations.includes(0)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ripple magnetic"
                    >
                      {completedStations.includes(0) ? "Completed ✓" : "Register Domain"}
                    </Button>
                  </div>
                </div>
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
                      <Label>From</Label>
                      <Input placeholder="0.0 BTC" />
                      <Label>To</Label>
                      <Input placeholder="0.0 USDT" />
                    </div>
                  </div>
                  <div className="glass-card p-4 space-y-4">
                    <h4 className="font-medium">Provide Liquidity</h4>
                    <div className="space-y-2">
                      <Label>BTC Amount</Label>
                      <Input placeholder="0.0 BTC" />
                      <Label>USDT Amount</Label>
                      <Input placeholder="0.0 USDT" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => completeStation(1)}
                  disabled={completedStations.includes(1)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 ripple magnetic"
                >
                  {completedStations.includes(1) ? "Completed ✓" : "Execute Trade"}
                </Button>
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
                    <Label>Deposit Amount</Label>
                    <Input placeholder="0.0 BTC" className="mt-2" />
                    <Button variant="outline" className="w-full mt-2 bg-transparent magnetic">
                      Deposit
                    </Button>
                  </div>
                  <div className="glass-card p-4">
                    <Label>Borrow Amount</Label>
                    <Input placeholder="0.0 USDT" className="mt-2" />
                    <Button variant="outline" className="w-full mt-2 bg-transparent magnetic">
                      Borrow
                    </Button>
                  </div>
                  <div className="glass-card p-4">
                    <Label>Repay Amount</Label>
                    <Input placeholder="0.0 USDT" className="mt-2" />
                    <Button variant="outline" className="w-full mt-2 bg-transparent magnetic">
                      Repay
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => completeStation(2)}
                  disabled={completedStations.includes(2)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 ripple magnetic"
                >
                  {completedStations.includes(2) ? "Completed ✓" : "Execute Lending"}
                </Button>
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
                      <Input placeholder="My Awesome NFT" />
                      <Label>Price (BTC)</Label>
                      <Input placeholder="0.001" />
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <h4 className="font-medium mb-2">Buy NFT</h4>
                    <div className="space-y-2">
                      <Label>NFT Collection</Label>
                      <Input placeholder="Citrea Punks" />
                      <Label>Max Price (BTC)</Label>
                      <Input placeholder="0.01" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => completeStation(3)}
                  disabled={completedStations.includes(3)}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 ripple magnetic"
                >
                  {completedStations.includes(3) ? "Completed ✓" : "Execute NFT Action"}
                </Button>
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
                    <Label>Transaction Details</Label>
                    <Input placeholder="Send 0.1 BTC to bc1q..." className="mt-2" />
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
                  onClick={() => completeStation(4)}
                  disabled={completedStations.includes(4)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 ripple magnetic"
                >
                  {completedStations.includes(4) ? "Completed ✓" : "Execute Transaction"}
                </Button>
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
                      <Input placeholder="Increase block rewards" />
                      <Label>Description</Label>
                      <Input placeholder="Proposal details..." />
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <h4 className="font-medium mb-2">Cast Vote</h4>
                    <div className="space-y-2">
                      <Label>Active Proposal</Label>
                      <Input placeholder="Proposal #42" disabled />
                      <Label>Vote Weight</Label>
                      <Input placeholder="100 tokens" />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => completeStation(5)}
                  disabled={completedStations.includes(5)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 ripple magnetic"
                >
                  {completedStations.includes(5) ? "Completed ✓" : "Participate in Governance"}
                </Button>
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
