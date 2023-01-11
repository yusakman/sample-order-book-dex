require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("hardhat-gas-reporter");


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: `${process.env.ALCHEMY_URL}`,
      accounts: [process.env.PRIV_KEY_1]
   }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 21
  }

};
