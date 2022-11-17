const { ethers } = require("hardhat");
const config = require("../src/config.json");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const wait = (seconds) => {
  const miliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
};

async function main() {
  // Fetch all the accounts
  const accounts = await ethers.getSigners();

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using chainID: ${chainId}`)

  const NTST = await ethers.getContractAt(
    "Token",
    config[31337].NTST.address
  );
  const wETH = await ethers.getContractAt(
    "Token",
    config[31337].wETH.address
  );
  const wDAI = await ethers.getContractAt(
    "Token",
    config[31337].wDAI.address
  );

  console.log(`NTST fetched: ${NTST.address}`);
  console.log(`wETH fetched: ${wETH.address}`);
  console.log(`wDAI fetched: ${wDAI.address}`);

  // Fetch the exchange contract
  const exchange = await ethers.getContractAt(
    "Exchange",
    config[31337].exchange.address
  );

  console.log(`Exchange fetched: ${exchange.address}`);

  // Fetch sender and feeAddress / receiver
  const sender = accounts[0];
  const feeAddress = accounts[1];
  const amount = tokens(10000);
  const amountGet = tokens(100);
  const amountGive = tokens(100);

  console.log(
    `Sender address: ${sender.address}\n`,
    `Receiver address: ${feeAddress.address}\n`,
    `Amout is: ${amount}`
  );

  // Fetch users addresses
  const user1 = accounts[2];
  const user2 = accounts[3];
  const user3 = accounts[4];

  console.log(
    `User 1 address is: ${user1.address}\n`,
    `User 2 address is: ${user2.address}\n`,
    `User 3 address is: ${user3.address}\n`
  );

  ////// Distribute tokens
  // Transfer token NTST from sender to user1
  let transaction, result;
  transaction = await NTST.connect(sender).transfer(user1.address, amount);
  await transaction.wait();
  console.log(
    `Transfer ${amount} tokens from ${sender.address} to ${user1.address}`
  );

  // Transfer token wETH from sender to user2
  transaction = await wETH.connect(sender).transfer(user2.address, amount);
  await transaction.wait();
  console.log(
    `Transfer ${amount} tokens from ${sender.address} to ${user2.address}`
  );

  // Transfer token wDAI from sender to user3
  transaction = await wDAI.connect(sender).transfer(user3.address, amount);
  await transaction.wait();
  console.log(
    `Transfer ${amount} tokens from ${sender.address} to ${user3.address}`
  );

  // Check the balanceOf users tokens before deposit
  console.log(`Balance of NTST user 1: ${await NTST.balanceOf(user1.address)}`);
  console.log(`Balance of wETH user 2: ${await wETH.balanceOf(user2.address)}`);
  console.log(`Balance of wDAI user 3: ${await wDAI.balanceOf(user3.address)}`);

  ////// Approve tokens
  // Approve tokens of user1
  transaction = await NTST.connect(user1).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user1.address}\n`);

  // Approve tokens of user2
  transaction = await wETH.connect(user2).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user2.address}\n`);

  // Approve tokens of user3
  transaction = await wDAI.connect(user3).approve(exchange.address, amount);
  await transaction.wait();
  console.log(`Approved ${amount} tokens from ${user3.address}\n`);

  ////// Deposit tokens to exchange
  // User 1 deposit NTST to exchange
  transaction = await exchange
    .connect(user1)
    .depositToken(NTST.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} NTST from ${user1.address}\n`);

  transaction = await exchange
    .connect(user2)
    .depositToken(wETH.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} wETH from ${user2.address}\n`);

  transaction = await exchange
    .connect(user3)
    .depositToken(wDAI.address, amount);
  await transaction.wait();
  console.log(`Deposited ${amount} wETH from ${user3.address}\n`);

  ///// Seed a Cancelled Order
  // User 1 make order
  transaction = await exchange
    .connect(user1)
    .makeOrder(wETH.address, amountGet, NTST.address, amountGive);
  result = await transaction.wait();
  console.log(`Make order from ${user1.address}`);

  // User 1 cancel order
  orderId = result.events[0].args.id;
  console.log(`Order Id ${orderId}`);
  transaction = await exchange.connect(user1).cancelOrder(orderId);
  result = await transaction.wait();
  console.log(`Order ${orderId} cancelled by ${user1.address}`);

  // Wait 1 second
  await wait(1);

  ///// Seed a Filled Order
  // User 1 make order
  transaction = await exchange
    .connect(user1)
    .makeOrder(wETH.address, amountGet, NTST.address, amountGive);
  result = await transaction.wait();
  console.log(`Make order from ${user1.address}`);

  // User 2 fill order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  // Wait 1 second
  await wait(1);

  // User 1 make order 2
  transaction = await exchange
    .connect(user1)
    .makeOrder(wETH.address, amountGet, NTST.address, tokens(50));
  result = await transaction.wait();
  console.log(`Make order from ${user1.address}`);

  // User 2 fill order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  // User 1 make order 3
  transaction = await exchange
    .connect(user1)
    .makeOrder(wETH.address, amountGet, NTST.address, tokens(150));
  result = await transaction.wait();
  console.log(`Make order from ${user1.address}`);

  // User 2 fill order
  orderId = result.events[0].args.id;
  transaction = await exchange.connect(user2).fillOrder(orderId);
  result = await transaction.wait();
  console.log(`Filled order from ${user2.address}\n`);

  // Wait 1 second
  await wait(1);

  //// Seed Open Order
  // User 1 make 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user1)
      .makeOrder(wETH.address, tokens(i * 5), NTST.address, tokens(10));
    result = await transaction.wait();
    console.log(`Made order from ${user1.address}\n`);
    await wait(1);
    // exchange.connect(user2).makeOrder(wDAI.address, tokens(i * 5), wETH.address, tokens(10));
  }

  // User 2 make 10 orders
  for (let i = 1; i <= 10; i++) {
    transaction = await exchange
      .connect(user2)
      .makeOrder(wDAI.address, tokens(10), wETH.address, tokens(i * 5));
    result = await transaction.wait();
    console.log(`Made order from ${user2.address}\n`);

    await wait(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
