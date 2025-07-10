import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { metaMask } from 'wagmi/connectors'

// Define Hardhat local network
export const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: '' },
  },
})

export const config = createConfig({
  chains: [hardhatLocal],
  connectors: [metaMask()],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
})
