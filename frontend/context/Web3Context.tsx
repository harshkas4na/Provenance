"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface Web3ContextType {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  chainId: number | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== address) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16))
        // Optionally reload the page or update provider here
        window.location.reload()
      }

      const handleDisconnect = () => {
        disconnectWallet()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('disconnect', handleDisconnect)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
          window.ethereum.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [address])

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          const network = await provider.getNetwork()
          
          setProvider(provider)
          setSigner(signer)
          setAddress(address)
          setChainId(Number(network.chainId))
          setIsConnected(true)
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet!')
      return
    }

    try {
      setIsConnecting(true)
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAddress(address)
      setChainId(Number(network.chainId))
      setIsConnected(true)

      // Store connection status in localStorage for persistence
      localStorage.setItem('walletConnected', 'true')

    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      
      if (error.code === 4001) {
        // User rejected the request
        alert('Please connect to your wallet to continue.')
      } else {
        alert('Failed to connect wallet. Please try again.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    setChainId(null)
    
    // Remove connection status from localStorage
    localStorage.removeItem('walletConnected')
  }

  const contextValue: Web3ContextType = {
    address,
    provider,
    signer,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    chainId,
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}