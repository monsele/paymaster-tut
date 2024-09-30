//index.js
import { encodeFunctionData, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { account, client, RPC_URL } from "./config.js";
import { abi } from "./abi.js";

// Example NFT Contract address. You will have to change this to your dapps address
const targetContract = "0x3990f3a7D46C06A772bf7D1D378FB5404272EE16";
// Static v06 entrypoint address. You do not need to change this.
const v06EntrypointAddress = "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789";

const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http(RPC_URL),
  chain: baseSepolia,
});

const paymasterClient = createPaymasterClient({
  transport: http(RPC_URL),
});

// Encode your dapps call data. You will have change this depending on your dapp's abi
const callData = encodeFunctionData({
  abi: abi,
  functionName: "mint",
  args: ["0x133bC7a7EA1E1A5B03D67c1Fe09039c9520D5104", 100],
});

// Encode the call for the smart wallet to call the target contract's mintTo function
const encodedCalls = await account.encodeCalls([
    {
      to: targetContract,
      data: callData,
      value: BigInt(0),
    },
]);

// Get the paymaster stub 
const paymasterStub = await paymasterClient.getPaymasterStubData({
  sender: account.address,
  callData: encodedCalls,
  chainId: baseSepolia.id,
  entryPointAddress: v06EntrypointAddress,
});

// Prepare the user operation (estimates gas, fills in other fields)
const userOperation = await bundlerClient.prepareUserOperation({
  callData: encodedCalls,
  paymasterAndData: paymasterStub.paymasterAndData,
});


// Pad gas values so that the transaction is more likely to be accepted
userOperation.preVerificationGas =
  (userOperation.preVerificationGas * BigInt(3)) / BigInt(2);
userOperation.callGasLimit =
  (userOperation.callGasLimit * BigInt(3)) / BigInt(2);

// Get the final signed paymasterAndData 
const signedPaymasterData = await paymasterClient.getPaymasterData({
  chainId: baseSepolia.id,
  entryPointAddress: v06EntrypointAddress,
  ...userOperation,
});
// Sign and send the user operation
try {
  //console.log("🔍 signedData", signedPaymasterData);
  userOperation.signature = signedPaymasterData.signature;
  console.log("User Operations:",userOperation);
  
  const userOpHash = await bundlerClient.sendUserOperation({
    ...userOperation,
  });
//0x30eE618Ab4B8c020f2145AE4E1EbFC485C3b69F2
 // console.log("🔍 User operation hash:here ", userOpHash);

  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  // console.log("✅ Transaction successfully sponsored!");
  // console.log(
  //   `⛽ View sponsored userOp on blockscout: https://base-sepolia.blockscout.com/op/${receipt.userOpHash}`,
  //   `🔍 View NFT mint on basescan: https://sepolia.basescan.org/address/0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49#events`
  // );
  process.exit()
} catch (error) {
  console.log("Error sending transaction: ", error);
  process.exit(1)
}