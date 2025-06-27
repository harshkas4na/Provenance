"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Target, BarChart3, Trophy, TrendingUp } from "lucide-react"

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)

  // Mouse tracking for 3D tilt effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height
        setMousePosition({ x, y })
      }
    }

    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress((scrolled / maxScroll) * 100)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
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

  // Cursor trail effect
  useEffect(() => {
    const createTrail = (e: MouseEvent) => {
      const trail = document.createElement("div")
      trail.className = "cursor-trail"
      trail.style.left = e.clientX + "px"
      trail.style.top = e.clientY + "px"
      document.body.appendChild(trail)

      setTimeout(() => {
        document.body.removeChild(trail)
      }, 500)
    }

    let throttleTimer: NodeJS.Timeout
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        createTrail(e)
        throttleTimer = null as any
      }, 50)
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const tiltStyle = {
    transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="dynamic-bg">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="bg-blob bg-blob-3"></div>
        <div className="bg-blob bg-blob-4"></div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* Particle System */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 floating-nav">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏛️</span>
            <span className="text-xl font-bold text-slate-800">Provenance</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors relative">
              Home
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-purple-500 transform scale-x-100 transition-transform"></div>
            </Link>
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/playground" className="text-slate-600 hover:text-slate-900 transition-colors">
              Playground
            </Link>
            <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Docs
            </Link>
          </nav>

          <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium ripple">
            Connect Wallet
          </Button>
        </div>
      </header>

      {/* Hero Section with Floating Cards */}
      <section ref={heroRef} className="pt-24 pb-16 px-4 relative min-h-screen flex items-center">
        {/* Floating Reputation Cards */}
        <div className="floating-card floating-card-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <div className="font-bold text-sm">alice.btc</div>
              <div className="text-xs text-slate-600 flex items-center">
                <span className="text-green-500 font-bold">892</span>
                <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="floating-card floating-card-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              B
            </div>
            <div>
              <div className="font-bold text-sm">bob.btc</div>
              <div className="text-xs text-slate-600 flex items-center">
                <span className="text-blue-500 font-bold">756</span>
                <TrendingUp className="h-3 w-3 text-blue-500 ml-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="floating-card floating-card-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              C
            </div>
            <div>
              <div className="font-bold text-sm">charlie.btc</div>
              <div className="text-xs text-slate-600 flex items-center">
                <span className="text-purple-500 font-bold">634</span>
                <TrendingUp className="h-3 w-3 text-purple-500 ml-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="floating-card floating-card-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
              D
            </div>
            <div>
              <div className="font-bold text-sm">diana.btc</div>
              <div className="text-xs text-slate-600 flex items-center">
                <span className="text-orange-500 font-bold">923</span>
                <TrendingUp className="h-3 w-3 text-orange-500 ml-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="floating-card floating-card-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              E
            </div>
            <div>
              <div className="font-bold text-sm">eve.btc</div>
              <div className="text-xs text-slate-600 flex items-center">
                <span className="text-pink-500 font-bold">812</span>
                <TrendingUp className="h-3 w-3 text-pink-500 ml-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="tilt-3d" style={tiltStyle}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight gradient-text">
              Your On-Chain Provenance Score
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto reveal">
              Transform Bitcoin DeFi activities into unified reputation that unlocks undercollateralized lending,
              governance weight, and protocol incentives
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16 reveal reveal-stagger"
              style={{ "--delay": "0.2s" } as any}
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium ripple tilt-3d"
                style={tiltStyle}
              >
                <Link href="/dashboard">
                  View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent ripple tilt-3d"
                style={tiltStyle}
              >
                <Link href="/playground">Try Playground</Link>
              </Button>
            </div>
          </div>

          {/* Interactive Score Counter */}
          <div
            className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto reveal reveal-stagger"
            style={{ "--delay": "0.4s" } as any}
          >
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2 counter-animation">847</div>
                <div className="text-sm text-slate-600">Reputation Score</div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2 counter-animation">92%</div>
                <div className="text-sm text-slate-600">Protocol Coverage</div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2 counter-animation">#156</div>
                <div className="text-sm text-slate-600">Global Rank</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Journey */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm wave-divider reveal">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16 gradient-text">How It Works</h2>

          <div className="relative">
            {/* Animated SVG Path */}
            <svg
              className="absolute top-1/2 left-0 w-full h-24 transform -translate-y-1/2 hidden lg:block"
              viewBox="0 0 800 100"
            >
              <path d="M50 50 Q 200 20, 400 50 T 750 50" className="journey-path" />
              <circle cx="50" cy="50" className="journey-pulse" />
              <circle cx="400" cy="50" className="journey-pulse" style={{ animationDelay: "1.3s" }} />
              <circle cx="750" cy="50" className="journey-pulse" style={{ animationDelay: "2.6s" }} />
            </svg>

            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
              <div
                className="text-center relative hover-lift reveal reveal-stagger"
                style={{ "--delay": "0.1s" } as any}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Target className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 Participate</h3>
                <p className="text-slate-600">
                  Use Citrea protocols naturally - trade, lend, govern, and build your on-chain presence
                </p>
              </div>

              <div
                className="text-center relative hover-lift reveal reveal-stagger"
                style={{ "--delay": "0.2s" } as any}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <BarChart3 className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">📊 Earn Points</h3>
                <p className="text-slate-600">
                  Actions tracked and scored automatically across all integrated protocols
                </p>
              </div>

              <div
                className="text-center relative hover-lift reveal reveal-stagger"
                style={{ "--delay": "0.3s" } as any}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Trophy className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">🏆 Unlock Benefits</h3>
                <p className="text-slate-600">Access exclusive opportunities, better rates, and governance power</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics - Glassmorphism */}
      <section className="py-16 px-4 bg-slate-800 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "12,847", label: "Total Users", color: "text-yellow-400" },
              { value: "6", label: "Protocols Integrated", color: "text-purple-400" },
              { value: "2.1M", label: "Points Awarded", color: "text-green-400" },
              { value: "642", label: "Average Score", color: "text-blue-400" },
            ].map((metric, index) => (
              <div
                key={index}
                className="gradient-border reveal reveal-stagger"
                style={{ "--delay": `${index * 0.1}s` } as any}
              >
                <div className="gradient-border-inner p-6 text-center">
                  <div className={`text-4xl font-bold mb-2 counter-animation ${metric.color}`}>{metric.value}</div>
                  <div className="text-slate-600">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Protocols - Hexagonal Grid */}
      <section className="py-16 px-4 bg-slate-50 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16 gradient-text reveal">
            Supported Protocols
          </h2>

          <div className="hex-grid reveal">
            {[
              { icon: "🏷️", name: "Namoshi", desc: "Name Service", status: "Live", delay: "0s" },
              { icon: "🔄", name: "Satsuma", desc: "DEX Trading", status: "Live", delay: "0.1s" },
              { icon: "🏦", name: "Spine", desc: "Lending", status: "Live", delay: "0.2s" },
              { icon: "🎨", name: "MintPark", desc: "NFT Platform", status: "Coming Soon", delay: "0.3s" },
              { icon: "🔐", name: "Asigna", desc: "Multisig", status: "Coming Soon", delay: "0.4s" },
              { icon: "🗳️", name: "DVote", desc: "Governance", status: "Coming Soon", delay: "0.5s" },
            ].map((protocol, index) => (
              <div
                key={index}
                className={`hex-card reveal-stagger ${protocol.status === "Coming Soon" ? "coming-soon" : ""}`}
                style={{ "--delay": protocol.delay } as any}
              >
                <div className="text-4xl mb-2">{protocol.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{protocol.name}</h3>
                <p className="text-sm text-slate-600 mb-2">{protocol.desc}</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    protocol.status === "Live" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {protocol.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-800 text-white relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-4 gap-8 reveal">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold">Provenance</span>
              </div>
              <p className="text-slate-300">Building reputation for the Bitcoin DeFi ecosystem</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/playground" className="block text-slate-300 hover:text-white transition-colors">
                  Playground
                </Link>
                <Link href="#" className="block text-slate-300 hover:text-white transition-colors">
                  API
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-slate-300 hover:text-white transition-colors">
                  Documentation
                </Link>
                <Link href="#" className="block text-slate-300 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link href="#" className="block text-slate-300 hover:text-white transition-colors">
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="text-slate-300 mb-4">Stay updated with the latest features</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-l-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-l-none border-l-0"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Provenance. Built on Citrea.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
