const { ethers } = require("hardhat");
const config = require("../src/config.json");
require("dotenv").config();

const tokenABI = require("../artifacts/contracts/Token.sol/Token.json");
const exchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const API_KEY = process.env.ALCHEMY_KEY;
const PRIV_KEY_1 = process.env.PRIV_KEY_1;
const PRIV_KEY_2 = process.env.PRIV_KEY_2;
const exchangeAddress = "0xFfC8A1843919FA4b2dd7476bDFaD10069084f5a6";
const ntstAddress = "0x831C9E9461C24D92C59DFf9e2EB2bCf6F87901b8";
const wETHAddress = "0x16B49eAF94d2c4D0630D05Cc18Af72C42504dB18";
const wDAIAddress = "0x46DfCEE20D8DB7a3edE50C61af7D99719eb06648";
const userAddress = "0x5E63ddAe9dAe73BE06cD45843B2036D58BF24BAA";

// Provider
const alchemyProvider = new ethers.providers.AlchemyProvider(
  (network = "goerli"),
  API_KEY
);

// Signer
const signer = new ethers.Wallet(PRIV_KEY_1, alchemyProvider);

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds) => {
  const miliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
};

async function main() {
  let transaction, result;

  // Fetch users
  const user1 = signer;
  const user2 = new ethers.Wallet(PRIV_KEY_2, alchemyProvider);

  //// Contract Instances
  // Exchange Contract
  const exchange = new ethers.Contract(
    exchangeAddress,
    exchangeABI.abi,
    signer
  );

  // Token Contarct
  // You can specify which token you want to use here
  const NTST = new ethers.Contract(ntstAddress, tokenABI.abi, signer);
  const wETH = new ethers.Contract(wETHAddress, tokenABI.abi, signer);
  const wDAI = new ethers.Contract(wDAIAddress, tokenABI.abi, signer);

  // Specify all the amount
  const amountTransfer = tokens(500);
  const amountGet = tokens(5);
  const amountGive = tokens(5);

  ////////// TRANSFER

  // Transfer NTST from user1 to user2
  transaction = await NTST.connect(user1).transfer(
    user2.address,
    amountTransfer
  );
  await transaction.wait();
  console.log(`Transfer ${amountTransfer} NTST to ${user2.address}`);

  // Transfer wETH from user1 to user2
  transaction = await wETH
    .connect(user1)
    .transfer(user2.address, amountTransfer);
  await transaction.wait();
  console.log(`Transfer ${amountTransfer} wETH to ${user2.address}`);

  // Transfer wDAI from user1 to user2
  transaction = await wDAI
    .connect(user1)
    .transfer(user2.address, amountTransfer);
  await transaction.wait();
  console.log(`Transfer ${amountTransfer} wDAI to ${user2.address}`);

  ////////// APPROV
  // User 1 approves NTST for exchange
  transaction = await NTST.connect(user1).approve(
    exchange.address,
    amountTransfer
  );
  await transaction.wait();
  console.log(`User 1 approves NTST for exchange ${NTST.address}`);

  // User 1 approves wETH for exchange
  transaction = await wETH
    .connect(user1)
    .approve(exchange.address, amountTransfer);
  await transaction.wait();
  console.log(`User 1 approves wETH for exchange ${wETH.address}`);

  // User 1 approves wDAI for exchange
  transaction = await wDAI
    .connect(user1)
    .approve(exchange.address, amountTransfer);
  await transaction.wait();
  console.log(`User 1 approves wDAI for exchange ${wDAI.address}`);

  // User 2 approves NTST for exchange
  transaction = await NTST.connect(user2).approve(
    exchange.address,
    amountTransfer
  );
  await transaction.wait();
  console.log(`User 2 approves NTST for exchange ${NTST.address}`);

  // User 2 approves wETH for exchange
  transaction = await wETH
    .connect(user2)
    .approve(exchange.address, amountTransfer);
  await transaction.wait();
  console.log(`User 2 approves wETH for exchange ${wETH.address}`);

  // User 2 approves wDAI for exchange
  transaction = await wDAI
    .connect(user2)
    .approve(exchange.address, amountTransfer);
  await transaction.wait();
  console.log(`User 2 approves wDAI for exchange ${wDAI.address}`);

  ////////// DEPOSIT
  // User 1 deposits NTST to exchange
  transaction = await exchange
    .connect(user1)
    .depositToken(NTST.address, amountTransfer);
  await transaction.wait();
  console.log(`User 1 Deposit NTST ${NTST.address} to the exchange`);

  // User 1 deposits wETH to exchange
  transaction = await exchange
    .connect(user1)
    .depositToken(wETH.address, amountTransfer);
  await transaction.wait();
  console.log(`User 1 Deposit wETH ${wETH.address} to the exchange`);

  // User 1 deposits wDAI to exchange
  transaction = await exchange
    .connect(user1)
    .depositToken(wDAI.address, amountTransfer);
  await transaction.wait();
  console.log(`User 1 Deposit wDAI ${wDAI.address} to the exchange`);

  // User 2 deposits NTST to exchange
  transaction = await exchange
    .connect(user2)
    .depositToken(NTST.address, amountTransfer);
  await transaction.wait();
  console.log(`User 2 Deposit wDAI ${wDAI.address} to the exchange`);

  // User 2 deposits wETH to exchange
  transaction = await exchange
    .connect(user2)
    .depositToken(wETH.address, amountTransfer);
  await transaction.wait();
  console.log(`User 2 Deposit wETH ${wETH.address} to the exchange`);

  // User 2 deposits wDAI to exchange
  transaction = await exchange
    .connect(user2)
    .depositToken(wDAI.address, amountTransfer);
  await transaction.wait();
  console.log(`User 2 Deposit wDAI ${wDAI.address} to the exchange`);

  ////////// Filled Order
  // User 1 make 1st order
  transaction = await exchange
    .connect(user1)
    .makeOrder(NTST.address, amountGet, wETH.address, amountGive);
  result = await transaction.wait();
  console.log(`User1 created 1st order with id ${result.events[0].args.id}`);

  // User 2 filled the 1st order
  let orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`User 2 filled 1st order with id ${result.events[0].args.id}`);

  // Wait 1 second
  await wait(1);

  // User 1 makes 2nd order
  transaction = await exchange
    .connect(user1)
    .makeOrder(NTST.address, amountGet, wETH.address, amountGive);
  result = await transaction.wait();
  console.log(`User1 created 2nd order with id ${result.events[0].args.id}`);

  // User 2 filled 2nd order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  await transaction.wait();
  console.log(`User 2 filled 2nd order with id ${result.events[0].args.id}`);

  await wait(1);

  /////////// Open Order
  // User 1 make 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(NTST.address, tokens(i * 2), wETH.address, tokens(5));
    result = transaction.wait();
    console.log(`User 1 make ${i} open order, will be finished at 10`);
    await wait(1);
  }

  // User 2 make 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(wETH.address, tokens(i * 2), NTST.address, tokens(5));
    result = transaction.wait();
    console.log(`User 2 make ${i} order, will be finished at 10`);
    await wait(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
