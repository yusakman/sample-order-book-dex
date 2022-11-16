const { ethers } = require("hardhat")

async function main() {
  console.log(`Preparing for deployment...\n`)

  // Fetch contract to deploy
  const Token = await ethers.getContractFactory("Token")
  const Exchange = await ethers.getContractFactory("Exchange")

  // Fetch accounts
  const accounts = await ethers.getSigners();
  console.log(`Account fetched: \n${accounts[0].address}\n${accounts[1].address}\n`)

  // Deploy contracts
  const ntst = await Token.deploy('New Token Smoke Test', 'NTST', '1000000')
  await ntst.deployed()
  console.log(`NTST Deployed to: ${ntst.address}`)

  const weth = await Token.deploy('W-ETH', 'WETH', '1000000')
  await weth.deployed()
  console.log(`wETH Deployed to: ${weth.address} `)

  const wdai = await Token.deploy('W-DAI', 'WDAI', '1000000')
  await wdai.deployed()
  console.log(`wDAI Deployed to: ${wdai.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
