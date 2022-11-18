import { useEffect } from "react";
import config from "../config.json";

import { useDispatch } from "react-redux";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken,
} from "../store/interactions";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    await loadAccount(dispatch);

    // Connect ethers to the blockchain
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    //// Talk to Smart Contract
    // Token Smart Contract
    const ntst = await loadToken(
      provider,
      config[chainId].NTST.address,
      dispatch
    );
    const symbol = await ntst.symbol();
    console.log('Symbol: ', symbol)

    // Exchange Smart Contract
    // const exchange = new ethers.Contract(
    //   config[31337].exchange.address,
    //   Exchange_ABI,
    //   provider
    // );
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      {/* Navbar */}
      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}
          {/* Balance */}
          {/* Order */}
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
