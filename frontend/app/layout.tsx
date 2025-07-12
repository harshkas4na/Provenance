import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "../context/Web3Context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Provenance - Bitcoin DeFi Reputation System",
  description:
    "Transform Bitcoin DeFi activities into unified reputation that unlocks undercollateralized lending, governance weight, and protocol incentives",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}