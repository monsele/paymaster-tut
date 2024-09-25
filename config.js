//config.js
import { createPublicClient, http } from 'viem'
import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

export const RPC_URL = "https://api.developer.coinbase.com/rpc/v1/base-sepolia/G5bqtUxbXEF94HhUtGiXKwR3IrAwXDLx"
 
export const client = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
})
 
const owner = privateKeyToAccount('0x6afe757f5cd5c79734d9a91753ed8530eb1c0e3827e56616ad7af9e0448bc46d')
 
export const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 