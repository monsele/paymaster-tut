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

const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http(RPC_URL),
  chain: baseSepolia,
});

// Prepare the user operation (estimates gas, fills in other fields)
const userOperation = await bundlerClient.prepareUserOperation({
  calls: [
    {
      abi: abi,
      functionName: "mint",
      to: targetContract,
      args: ["0x133bC7a7EA1E1A5B03D67c1Fe09039c9520D5104", 100],
    },
  ],
  paymaster: true,
});

// Sign and send the user operation
try {
  userOperation.signature = await account.signUserOperation(userOperation);
  const userOpHash = await bundlerClient.sendUserOperation({
    ...userOperation,
  });

  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log(":white_check_mark: Transaction successfully sponsored!");
  console.log(
    `⛽ View sponsored userOp on blockscout: https://base-sepolia.blockscout.com/op/${userOpHash}`
  );
  console.log(
    `🔍 View NFT mint on basescan: https://sepolia.basescan.org/address/0x3990f3a7D46C06A772bf7D1D378FB5404272EE16#events`
  );
  process.exit();
} catch (error) {
  console.log("Error sending transaction: ", error);
  process.exit(1);
}
