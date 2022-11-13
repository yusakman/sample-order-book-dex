const { EtherscanProvider } = require("@ethersproject/providers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { result } = require("lodash");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
  let exchange, deployer, feeAccount, token1, token2;
  const feePercent = 10;

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");

    token1 = await Token.deploy("Wonderful SBucks", "WSB", "1000000");
    token2 = await Token.deploy("Fake Dai", "FDAI", "1000000");

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];

    let transaction = await token1
      .connect(deployer)
      .transfer(user1.address, tokens(100));
    await transaction.wait(); // Untuk memastikan transaksi berjalan

    let transcation2 = await token2
      .connect(deployer)
      .transfer(user2.address, tokens(10));
    await transcation2.wait();

    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("check the feePercent", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent);
    });
  });

  describe("Deposit Token", () => {
    let transaction, result;

    let amount = tokens(100);

    beforeEach(async () => {
      // Approve Tokens
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      // Deposit Tokens
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });

    describe("Success", () => {
      it("track the token deposit", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(
          amount
        );
        expect(
          await exchange.balanceOf(token1.address, user1.address)
        ).to.equal(amount);
      });

      it("emits a Deposit event", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("Deposit");

        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("fails when no tokens are approved", async () => {
        // Don't approve any tokens before depositing
        await expect(
          exchange.connect(user1).depositToken(token1.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Test Deposit Token", () => {
    let transaction, result;
    let amount = tokens(10);

    beforeEach(async () => {
      transaction = await token2
        .connect(user2)
        .approve(exchange.address, amount);
      transaction = await exchange
        .connect(user2)
        .testDepositToken(token2.address, amount);
      result = await transaction.wait();
    });

    describe("Success", () => {
      it("It tracks the test deposit function", async () => {
        expect(await token2.balanceOf(exchange.address)).to.equal(amount);
        expect(await exchange.tokens(token2.address, user2.address)).to.equal(
          amount
        );
        expect(
          await exchange.testBalanceOf(token2.address, user2.address)
        ).to.equal(amount);
      });

      it("It emits TestDepositEvent", async () => {
        const event = result.events[1];
        expect(event.event).to.equal("TestDeposit");

        const args = event.args;

        expect(args.token).to.equal(token2.address);
        expect(args.user).to.equal(user2.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("should fail when no tokens are approved", async () => {
        await expect(
          exchange.connect(user2).depositToken(token2.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Test testWithdrawToken", () => {
    let transaction, result;
    let amount = tokens(10);
    beforeEach(async () => {
      // My mistake, we need to keep the deposit
      // Approve
      transaction = await token2
        .connect(user2)
        .approve(exchange.address, amount);
      // Deposit
      transaction = await exchange
        .connect(user2)
        .testDepositToken(token2.address, amount);
      // Withdraw
      transaction = await exchange
        .connect(user2)
        .testWithdrawToken(token2.address, amount);
      result = await transaction.wait();
    });

    describe("Success", () => {
      it("tracks the withdrawl function", async () => {
        expect(await token2.balanceOf(user2.address)).to.equal(amount);
        expect(await exchange.tokens(token2.address, user2.address)).to.equal(
          0
        );
        expect(
          await exchange.testBalanceOf(token2.address, user2.address)
        ).to.equal(0);
      });

      it("emits testwithdraw event", async () => {
        const event = await result.events[1];
        expect(event.event).to.equal("TestWithdraw");

        const args = event.args;

        expect(args.token).to.equal(token2.address);
        expect(args.user).to.equal(user2.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);
      });
    });

    describe("Failure", () => {
      it("should fail when no tokens are approved", async () => {
        await expect(
          exchange.connect(user2).testWithdrawToken(token2.address, amount)
        ).to.be.reverted;
      });
    });
  });

  describe("Checking Balances", () => {
    let transaction, result;

    let amount = tokens(100);

    beforeEach(async () => {
      // Approve Tokens
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      // Deposit Tokens
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();
    });

    it("returns user balance", async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(
        amount
      );
    });
  });

  describe("Make Order", () => {
    let transaction, result;

    let amountGet = tokens(5);
    let amountGive = tokens(5);
    let amount = tokens(100);

    beforeEach(async () => {
      // Approve token
      transaction = await token1
        .connect(user1)
        .approve(exchange.address, amount);
      // Deposit Tokens
      transaction = await exchange
        .connect(user1)
        .depositToken(token1.address, amount);
      result = await transaction.wait();

      // Make order
      transaction = await exchange
        .connect(user1)
        .makeOrder(token2.address, amountGet, token1.address, amountGive);
      result = await transaction.wait();
    });

    describe("Success", () => {
      it("tracks newly created order", async () => {
        expect(await exchange.orderCount()).to.equal(1);
      });

      it("Emits make order event", async () => {
        const event = await result.events[0];
        expect(await event.event).to.equal("Order");

        const args = await result.events[0].args;

        expect(args.tokenGet).to.equal(token2.address);
        expect(args.amountGet).to.equal(amountGet);
        expect(args.tokenGive).to.equal(token1.address);
        expect(args.amountGive).to.equal(amountGive);
        expect(args.timestamp).to.at.least(1);
      });
    });

    describe("Failure", () => {
      it("Rejects with no balance", async () => {
        await expect(
          exchange
            .connect(user1)
            .makeOrder(token1.address, tokens(1), token2.address, tokens(1))
        ).to.be.reverted;
      });
    });
  });

  describe("Order Actions", () => {
    describe("Cancel Order", () => {
      let transaction, result;

      let amountGet = tokens(5);
      let amountGive = tokens(5);
      let amount = tokens(100);

      beforeEach(async () => {
        // Approve token
        transaction = await token1
          .connect(user1)
          .approve(exchange.address, amount);
        // Deposit Tokens
        transaction = await exchange
          .connect(user1)
          .depositToken(token1.address, amount);
        result = await transaction.wait();

        // Make order
        transaction = await exchange
          .connect(user1)
          .makeOrder(token2.address, amountGet, token1.address, amountGive);
        result = await transaction.wait();

        // Cancel Order
        transaction = await exchange.connect(user1).cancelOrder(1);
        result = await transaction.wait();
      });

      describe("Success", () => {
        it("tracks the cancel order", async () => {
          expect(await exchange.orderCancelled(1)).to.equal(true);
        });

        it("Emits cancel event", async () => {
          const event = await result.events[0];
          expect(await event.event).to.equal("Cancel");

          const args = await result.events[0].args;

          expect(args.tokenGet).to.equal(token2.address);
          expect(args.amountGet).to.equal(amountGet);
          expect(args.tokenGive).to.equal(token1.address);
          expect(args.amountGive).to.equal(amountGive);
          expect(args.timestamp).to.at.least(1);
        });
      });

      describe("Failure", () => {

        it("rejects invalid order ids", async () => {
          await expect(exchange.connect(user1).cancelOrder(999)).to.be.reverted;
        });

        it("rejects invalid user", async () => {
          await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
        })
      });
    });

    describe("Filling Order", () => {});
  });
});
