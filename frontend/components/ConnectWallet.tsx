"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useWeb3 } from '@/context/Web3Context'
import { Wallet, Loader2 } from 'lucide-react'

interface ConnectWalletProps {
  variant?: 'default' | 'connected'
  className?: string
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { address, isConnecting, isConnected, connectWallet, disconnectWallet } = useWeb3()

  const truncateAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleClick = () => {
    if (isConnected) {
      // If already connected, you could show a dropdown menu or disconnect
      // For now, we'll just keep the connection
      return
    } else {
      connectWallet()
    }
  }

  if (isConnecting) {
    return (
      <Button 
        disabled 
        className={`${className} bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-medium`}
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && address) {
    // Connected state
    if (variant === 'connected') {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <Button 
            className={`${className} bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-medium ripple`}
            onClick={handleClick}
          >
            Connected: {truncateAddress(address)}
          </Button>
        </div>
      )
    }

    return (
      <Button 
        className={`${className} bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-medium ripple`}
        onClick={handleClick}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {truncateAddress(address)}
      </Button>
    )
  }

  // Disconnected state
  return (
    <Button 
      onClick={handleClick}
      className={`${className} bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 font-medium ripple`}
    >
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  )
}