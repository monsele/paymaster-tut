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
 
const owner = privateKeyToAccount(
  "0x1912fcd607821c9e4b5c479e270836dac549d340ceaf554f9067bf61f949f97d"
);
 
export const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 