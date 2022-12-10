import { useSelector, useDispatch } from "react-redux";
import Blockies from "react-blockies";
import logo from "../assets/logo.svg";
import eth from "../assets/eth.svg";

import { loadAccount } from "../store/interactions";

import config from "../config.json";

const Navbar = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);

  const handleConnect = async () => {
    await loadAccount(provider, dispatch);
  };

  const handleNetwork = async (e) => {
    e.preventDefault();
    window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: e.target.value,
        },
      ],
    });
  };

  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img
          src={logo}
          className="logo"
          alt="Knight Logo"
          style={{ backgroundColor: "white", borderRadius: "15px" }}
        ></img>
        <h1>Knight Finance</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} className="Eth logo" alt="ETH logo"></img>
        {chainId && <select
          name="networks"
          id="networks"
          value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
          onChange={handleNetwork}
        >
          <option value="0" disabled>
            Select Network
          </option>
          <option value="0x7A69">Localhost</option>
          <option value="0x5">Goerli</option>
        </select>} 
      </div>

      <div className="exchange__header--account flex">
        {balance ? (
          <p>
            <small>My Balance: </small>
            {Number(balance).toFixed(4)}
          </p>
        ) : (
          <p>
            <small>My Balance:</small>0 ETH
          </p>
        )}

        {account ? (
          <a href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`} target="_blank" rel="noreferrer">
            {account.slice(0, 5) + "..." + account.slice(38, 42)}
            <Blockies
              seed={account}
              className="identicon"
              size={10}
              scale={3}
            />
          </a>
        ) : (
          <button className="button" onClick={handleConnect}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
