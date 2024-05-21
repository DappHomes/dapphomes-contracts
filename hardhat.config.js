require("@nomicfoundation/hardhat-toolbox");
const dotenv = require('dotenv')

dotenv.config()

// Fill WEB3_PRIVATE_KEY within .env file
const AMOY_PRIVATE_KEY = process.env.WEB3_PRIVATE_KEY || '0x0'

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    amoy: {
      url: 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      gasPrice: 'auto',
      accounts: [AMOY_PRIVATE_KEY]
    }
  }
};
