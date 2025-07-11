import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { run } from "hardhat";

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.KAIROS_RPC_URL;

  if (!privateKey || !rpcUrl) {
    throw new Error("Set PRIVATE_KEY and KAIROS_RPC_URL in your .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const artifact = await import(
    "../artifacts/contracts/Voting.sol/Voting.json"
  );
  const VotingFactory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  const voting = await VotingFactory.deploy(["Alice", "Bob", "Charlie"]);
  await voting.waitForDeployment();

  console.log("Voting contract deployed to:", await voting.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
