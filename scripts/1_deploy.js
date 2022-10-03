const { ethers } = require("hardhat");

async function main() {
  // Do stuff...

  // Fetch contract to deploy
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy()

  // Deploy contract
  await token.deployed()
  console.log(`Token deployed to: ${token.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
