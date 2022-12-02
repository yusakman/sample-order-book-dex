import { useEffect } from "react";
import config from "../config.json";

import { useDispatch } from "react-redux";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents
} from "../store/interactions";

import Navbar from "./Navbar";
import Markets from "./Markets";
import Balance from "./Balance";
import Order from "./Order";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    const ntst = config[chainId].NTST;
    const weth = config[chainId].wETH;
    await loadTokens(provider, [ntst.address, weth.address], dispatch);

    const exchangeConfig = config[chainId].exchange;
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch);

    subscribeToEvents(exchange, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      {/* Navbar */}
      <Navbar></Navbar>
      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets></Markets>
          <Balance></Balance>
          <Order></Order>
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}
          {/* Transaction  */}
          {/* Trades  */}
          {/* OrderBook  */}
        </section>
      </main>
    </div>
  );
}

export default App;
