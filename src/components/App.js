import { useEffect } from "react";
import { ethers } from "ethers";
import "../App.css";
import contracts from "../config.json";
import TOKEN_ABI from '../abis/Token.json';
import Exchange_ABI from '../abis/Exchange.json';

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    })
    console.log(`Accounts: ${accounts[0]}`)

    // Connect ethers to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const {chainId} = await provider.getNetwork();

    //// Talk to Smart Contract
    // Token Smart Contract
    const ntst = new ethers.Contract(contracts[chainId].NTST.address, TOKEN_ABI, provider)
    console.log('token, ', ntst)
    const symbol = await ntst.symbol();
    console.log(symbol)

    // Exchange Smart Contract
    const exchange = new ethers.Contract(contracts[31337].exchange.address, Exchange_ABI, provider)
    // console.log('exchange', exchange)
  }

  useEffect(() => {
    loadBlockchainData();
  })

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
