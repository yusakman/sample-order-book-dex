import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import logo from "../assets/logo.svg";
import ethLogo from "../assets/eth.svg";

import { loadBalance } from "../store/interactions";

const Balance = () => {
  const dispatch = useDispatch();
  const symbols = useSelector((state) => state.tokens.symbols);
  const exchange = useSelector((state) => state.exchange.contract.address);
  const tokens = useSelector((state) => state.tokens.contracts);
  const account = useSelector((state) => state.provider.account);

  useEffect(() => {
    console.log("exchange", exchange);
    console.log("tokens", tokens)

    loadBalance(exchange, tokens, account, dispatch);
  })

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
        </div>
        <form>
          <label htmlFor="token0" />
          <input type="text" id="token0" placeholder="0.000" />
          <button className="button" type="submit">
            <span></span>
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
