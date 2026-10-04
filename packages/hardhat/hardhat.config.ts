import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    hedera_testnet: {
      url: process.env.HEDERA_JSON_RPC_URL || "https://testnet.hashio.io/api",
      chainId: 296,
      accounts: process.env.HEDERA_OPERATOR_KEY ? [process.env.HEDERA_OPERATOR_KEY.startsWith("0x") ? process.env.HEDERA_OPERATOR_KEY : `0x${process.env.HEDERA_OPERATOR_KEY}`] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
