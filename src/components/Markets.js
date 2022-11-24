import { useSelector, useDispatch } from "react-redux";
import config from "../config.json";
import { loadTokens } from "../store/interactions";

const Markets = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const chainId = useSelector((state) => state.provider.chainId);

  const handlePair = async (e) => {
    const addresses = e.target.value.split(",");
    await loadTokens(provider, addresses, dispatch);
  };

  return (
    <div className="component exchange__markets">
      <div className="component__header">
        <h2>Select Market</h2>
      </div>
      {chainId && (
        <select name="markets" id="markets" onChange={handlePair}>
          <option
            value={config[chainId] && `${config[chainId].NTST.address},${config[chainId].wETH.address}`}
          >
            NTST / wETH
          </option>
          <option
            value={config[chainId] && `${config[chainId].NTST.address},${config[chainId].wDAI.address}`}
          >
            NTST / wDAI
          </option>
        </select>
      )}
      <hr></hr>
    </div>
  );
};

export default Markets;
