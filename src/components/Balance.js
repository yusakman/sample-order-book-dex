import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import ethLogo from "../assets/eth.svg";

import { loadBalances, transferTokens } from "../store/interactions";

const Balance = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const symbols = useSelector((state) => state.tokens.symbols);
  const exchange = useSelector((state) => state.exchange.contract);
  const tokens = useSelector((state) => state.tokens.contracts);
  const account = useSelector((state) => state.provider.account);
  const walletBalances = useSelector((state) => state.tokens.balances);
  const exchangeBalances = useSelector((state) => state.exchange.balances);
  const transferInProgress = useSelector((state) => state.exchange.transferInProgress);

  const [depositAmount1, setDepositAmount1] = useState(0);

  const handleDepositToken1 = (e, token) => {
    e.preventDefault();
    if (token.address === tokens[0].address) {
      setDepositAmount1(e.target.value);
    }
  };

  const depositHandler = (e, token) => {
    const transferType = "Deposit";
    e.preventDefault();
    if (token.address === tokens[0].address) {
      transferTokens(
        provider,
        exchange,
        transferType,
        token,
        depositAmount1,
        dispatch
      );  
    }
    
    setDepositAmount1(0)
  };

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account, transferInProgress, dispatch]);

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button className="tab tab--active">Deposit</button>
          <button className="tab">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (NTST) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small> <br />
            <img
              src={logo}
              alt="token logo"
              style={{
                backgroundColor: "white",
                width: "25px",
                borderRadius: "15px",
              }}
            />
            {symbols && symbols[0]}
          </p>
          <p>
            <small>Wallet</small> <br />
            {walletBalances && walletBalances[0]}
          </p>
          <p>
            <small>Exchange</small> <br />
            {exchangeBalances && exchangeBalances[0]}
          </p>
        </div>
        <form onSubmit={(e) => depositHandler(e, tokens[0])}>
          <label htmlFor="token0" />
          <input
            type="text"
            id="token0"
            placeholder="0.000"
            value={depositAmount1 === 0 ? '' : depositAmount1}
            onChange={(e) => handleDepositToken1(e, tokens[0])}
          />
          <button className="button" type="submit">
            <span>Deposit</span>
          </button>
        </form>
      </div>

      {/* Deposit/Withdraw Component 2 (wETH) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small> <br />
            <img
              src={ethLogo}
              alt="token logo"
              style={{
                width: "30px",
                borderRadius: "15px",
              }}
            />
            {symbols && symbols[1]}
          </p>
          <p>
            <small>Wallet</small> <br />
            {walletBalances && walletBalances[1]}
          </p>
          <p>
            <small>Exchange</small> <br />
            {exchangeBalances && exchangeBalances[1]}
          </p>
        </div>
        <form>
          <label htmlFor="token1" />
          <input type="text" id="token1" placeholder="0.000" />
          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
