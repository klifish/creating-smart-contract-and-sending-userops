import { smartAccountClient } from "./createSmartAccountClient";
import { parseEther } from "viem";
import type { SendUserOperationResult } from "@alchemy/aa-core";
import { JsonRpcProvider } from 'ethers';
import { ethers } from "ethers";
const PRIV_KEY = process.env.PRIV_KEY!;

const ADDR = "0xe1249c0ED30dE2EEf273ce84813C6fd54aBA58Fc"; // replace with the adress you want to send SepoliaETH to, unless you want to send ETH to Vitalik :)

/**
 * @description Creates a smart contract account, and sends ETH to the specified address (could be an EOA or SCA)
 * @note Seperating the logic to create the account, and the logic to send the transaction
 */

const ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "store",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retrieve",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]



const BYTE_CODE = "608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea264697066735822122040f116908b19cc0084646af6dc209d324dcccc2da9f8c6cb38a44b15cca3cf3e64736f6c63430008070033"

const provider = new JsonRpcProvider("https://polygon-amoy.g.alchemy.com/v2/Ko40RnPvR0P6u7h0PqwrImRd3SI8CqE-");

// const userOperation = {
//   sender: "0x6B0f25b1c28bD85c046647EC610bc6E28Feaa773",
//   nonce: await provider.getTransactionCount("0x6B0f25b1c28bD85c046647EC610bc6E28Feaa773"),
//   initCode: BYTE_CODE, // Use the contract creation bytecode
//   callData: "0x", // Set to empty if not calling any function during deployment
//   maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei"),
//   maxFeePerGas: ethers.utils.parseUnits("50", "gwei"),
//   signature: "0xYourSignedMessage", // Sign this operation with your private key
// };

export async function main() {
  const amountToSend: bigint = parseEther("0");

  // const signature = await smartAccountClient.signUserOperation({uoStruct:userOperation});


  // 0x6057361d0000000000000000000000000000000000000000000000000000000000000080
  // 0x6057361d0000000000000000000000000000000000000000000000000000000000000400
  const result: SendUserOperationResult =
    await smartAccountClient.sendUserOperation({
      uo: {
        target: "0x65E7afb98fC77320C2EAE9F1aDAe2CF9BE9eef91",
        data: "0x6057361d0000000000000000000000000000000000000000000000000000000000000040",
        value: amountToSend,
      },
    });

  console.log("User operation result: ", result);

  console.log(
    "\nWaiting for the user operation to be included in a mined transaction..."
  );

  const txHash = await smartAccountClient.waitForUserOperationTransaction(
    result
  );

  console.log("\nTransaction hash: ", txHash);

  const userOpReceipt = await smartAccountClient.getUserOperationReceipt(
    result.hash as `0x${string}`
  );

  console.log("\nUser operation receipt: ", userOpReceipt);

  const txReceipt = await smartAccountClient.waitForTransactionReceipt({
    hash: txHash,
  });

  return txReceipt;
}

main()
  .then((txReceipt) => {
    console.log("\nTransaction receipt: ", txReceipt);
  })
  .catch((err) => {
    console.error("Error: ", err);
  })
  .finally(() => {
    console.log("\n--- DONE ---");
  });
