'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import { parseUnits, formatUnits } from 'viem'
import TokenFactoryABI from '../abi/TokenFactory.json'
import MyTokenABI from '../abi/MyToken.json'
import { hardhatLocal } from '../lib/wagmi'

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { switchChain } = useSwitchChain()
  
  // Fix hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // TokenFactory contract address from deployment
  const tokenFactoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`

  // Form state for token creation
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [initialSupply, setInitialSupply] = useState('')
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string>('')

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Token type definition
  interface TokenInfo {
    tokenAddress: string
    creator: string
    name: string
    symbol: string
    initialSupply: bigint
    createdAt: bigint
  }

  // Get all tokens from the factory
  const { data: allTokens, refetch: refetchTokens } = useReadContract({
    address: tokenFactoryAddress,
    abi: TokenFactoryABI,
    functionName: 'getAllTokens',
  }) as { data: TokenInfo[], refetch: () => void }

  // Get user's tokens
  const { data: userTokens } = useReadContract({
    address: tokenFactoryAddress,
    abi: TokenFactoryABI,
    functionName: 'getUserTokens',
    args: [address],
    query: {
      enabled: !!address,
    },
  }) as { data: TokenInfo[] }

  // Get balance of selected token
  const { data: tokenBalance } = useReadContract({
    address: selectedTokenAddress as `0x${string}`,
    abi: MyTokenABI,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && !!selectedTokenAddress,
    },
  })

  // Get selected token details
  const { data: selectedTokenName } = useReadContract({
    address: selectedTokenAddress as `0x${string}`,
    abi: MyTokenABI,
    functionName: 'name',
    query: {
      enabled: !!selectedTokenAddress,
    },
  })

  const { data: selectedTokenSymbol } = useReadContract({
    address: selectedTokenAddress as `0x${string}`,
    abi: MyTokenABI,
    functionName: 'symbol',
    query: {
      enabled: !!selectedTokenAddress,
    },
  })

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenName || !tokenSymbol || !initialSupply) return

    try {
      const supply = parseUnits(initialSupply, 18) // 18 decimals
      writeContract({
        address: tokenFactoryAddress,
        abi: TokenFactoryABI,
        functionName: 'createToken',
        args: [tokenName, tokenSymbol, supply],
      })
    } catch (error) {
      console.error('Error creating token:', error)
    }
  }

  // Reset form and refetch tokens when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setTokenName('')
      setTokenSymbol('')
      setInitialSupply('')
      refetchTokens()
    }
  }, [isConfirmed, refetchTokens])

  // Prevent hydration mismatch by not rendering wagmi content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 items-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold">Token Factory DApp</h1>
          <div className="flex flex-col gap-4 items-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold">Token Factory DApp</h1>
        
        <div className="flex flex-col gap-4 items-center">
          {!isConnected ? (
            <button
              onClick={() => connect({ connector: metaMask() })}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Connect MetaMask
            </button>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Connected!</h2>
                <p className="text-gray-600">Address: {address}</p>
                <p className="text-sm text-gray-500">Network: {chain?.name || 'Unknown'}</p>
              </div>
              
              {chain?.id !== hardhatLocal.id && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-center">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Wrong Network! Please switch to Hardhat Local network for free transactions.
                  </p>
                  <button
                    onClick={() => switchChain({ chainId: hardhatLocal.id })}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Switch to Hardhat Local
                  </button>
                </div>
              )}
              
              <button
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Token Creation Form */}
            <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-4">Create New Token</h3>
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Token Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="e.g., My Token"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Token Symbol</label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., MTK"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initial Supply</label>
                  <input
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    placeholder="e.g., 1000000"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                >
                  {isPending ? 'Confirming...' : isConfirming ? 'Creating...' : 'Create Token'}
                </button>
              </form>
              {hash && (
                <div className="mt-4 p-2 bg-blue-100 dark:bg-blue-900 rounded">
                  <p className="text-sm">Transaction Hash: {hash}</p>
                  {isConfirmed && <p className="text-green-600">✅ Token created successfully!</p>}
                </div>
              )}
            </div>

            {/* Token Information */}
            <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-4">Token Information</h3>
              
              {selectedTokenAddress ? (
                <div className="space-y-2">
                  <p><strong>Token Name:</strong> {selectedTokenName?.toString() || 'Loading...'}</p>
                  <p><strong>Token Symbol:</strong> {selectedTokenSymbol?.toString() || 'Loading...'}</p>
                  <p><strong>Contract Address:</strong> {selectedTokenAddress}</p>
                  <p>
                    <strong>Your Balance:</strong> {' '}
                    {tokenBalance ? formatUnits(tokenBalance as bigint, 18) : '0'}
                  </p>
                  <button
                    onClick={() => setSelectedTokenAddress('')}
                    className="mt-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">Select a token from the lists below to view details</p>
              )}
            </div>

            {/* Your Tokens */}
            <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-4">Your Tokens ({userTokens?.length || 0})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userTokens && userTokens.length > 0 ? (
                  userTokens.map((token: TokenInfo, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedTokenAddress(token.tokenAddress)}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <p className="font-medium">{token.name} ({token.symbol})</p>
                      <p className="text-sm text-gray-600">Supply: {formatUnits(token.initialSupply, 18)}</p>
                      <p className="text-xs text-gray-500">{token.tokenAddress}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">You haven&apos;t created any tokens yet</p>
                )}
              </div>
            </div>

            {/* All Tokens */}
            <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-4">All Tokens ({allTokens?.length || 0})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allTokens && allTokens.length > 0 ? (
                  allTokens.map((token: TokenInfo, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedTokenAddress(token.tokenAddress)}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <p className="font-medium">{token.name} ({token.symbol})</p>
                      <p className="text-sm text-gray-600">
                        Supply: {formatUnits(token.initialSupply, 18)} | 
                        Creator: {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">{token.tokenAddress}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No tokens created yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
