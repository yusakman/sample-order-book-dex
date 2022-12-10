import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { myEventSelector } from "../store/selectors";
import config from "../config.json";

const Alert = () => {
  const network = useSelector((state) => state.provider.chainId);
  const alertRef = useRef(null);
  const account = useSelector((state) => state.provider.account);
  const isPending = useSelector(
    (state) => state.exchange.transaction.isPending
  );
  const isError = useSelector((state) => state.exchange.transaction.isError);
  const myEvents = useSelector(myEventSelector);

  const handleRemove = async () => {
    alertRef.current.className = "alert--remove";
  };

  useEffect(() => {
    if ((myEvents[0] || isPending || isError) && account) {
      alertRef.current.className = "alert";
    }
  }, [myEvents, isPending, isError, account]);

  return (
    <div>
      {isPending ? (
        <div
          className="alert alert--remove"
          ref={alertRef}
          onClick={handleRemove}
        >
          <h1>Transaction Pending...</h1>
        </div>
      ) : isError ? (
        <div
          className="alert alert--remove"
          ref={alertRef}
          onClick={handleRemove}
        >
          <h1>Transaction Will Fail</h1>
        </div>
      ) : !isPending && myEvents[0] ? (
        <div
          className="alert alert--remove"
          ref={alertRef}
          onClick={handleRemove}
        >
          <h1>Transaction Successful</h1>
          <a
            href={
              config[network]
                ? `${config[network].explorerURL}/tx/${myEvents[0].transactionHash}`
                : `#`
            }
            target="_blank"
            rel="noreferrer"
          >
            {myEvents[0].transactionHash.slice(0, 6) +
              "..." +
              myEvents[0].transactionHash.slice(60, 66)}
          </a>
        </div>
      ) : (
        <div
          className="alert alert--remove"
          ref={alertRef}
          onClick={handleRemove}
        ></div>
      )}
    </div>
  );
};

export default Alert;
