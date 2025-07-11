import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ledger";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    kairos: {
      url:
        process.env.KAIROS_RPC_URL || "https://public-en-kairos.node.kaia.io",
      chainId: 1001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      // ledgerAccounts: ["your_ledger_address_here"] // optional
    },
    hardhat: {
      // forking: {
      //   url: process.env.KAIA_MAINNET_RPC_URL || "",
      //   blockNumber: 18000000
      // }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
