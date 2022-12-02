import { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { makeBuyOrder, makeSellOrder } from "../store/interactions";

const Order = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.provider.connection);
  const exchange = useSelector((state) => state.exchange.contract);
  const tokens = useSelector((state) => state.tokens.contracts);
  // const account = useSelector((state) => state.provider.account);
  // const walletBalances = useSelector((state) => state.tokens.balances);
  // const exchangeBalances = useSelector((state) => state.exchange.balances);
  // const orderInProgress = useSelector(
  //   (state) => state.exchange.orderInProgress
  // );

  const buyRef = useRef(null);
  const sellRef = useRef(null);

  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);
  const [price, setPrice] = useState(0);

  const handleTab = (e) => {
    if (e.target.className !== buyRef.current.className) {
      e.target.className = "tab tab--active";
      buyRef.current.className = "tab";
      setIsBuy(false);
    }

    if (e.target.className !== sellRef.current.className) {
      e.target.className = "tab tab--active";
      sellRef.current.className = "tab";
      setIsBuy(true);
    }
  };

  const handleAmount = (e) => {
    setAmount(e.target.value);
  };

  const handlePrice = (e) => {
    setPrice(e.target.value);
  };

  const buyHandler = (e) => {
    e.preventDefault();
    console.log("buy handler");
    makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch);
    setAmount(0);
    setPrice(0);
  };

  const sellHandler = (e) => {
    e.preventDefault();
    makeSellOrder(provider, exchange, tokens, { amount, price }, dispatch);
    setAmount(0);
    setPrice(0);
  };

  return (
    <div className="component exchange__orders">
      <div className="component__header flex-between">
        <h2>New Order</h2>
        <div className="tabs">
          <button className="tab tab--active" ref={buyRef} onClick={handleTab}>
            Buy
          </button>
          <button className="tab" ref={sellRef} onClick={handleTab}>
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        {isBuy ? (
          <label htmlFor="amount">Buy Amount</label>
        ) : (
          <label htmlFor="amount">Sell Amount</label>
        )}

        <input
          type="text"
          id="amount"
          placeholder="0.0000"
          value={amount === 0 ? "" : amount}
          onChange={handleAmount}
        />

        {isBuy ? (
          <label htmlFor="price">Buy Price</label>
        ) : (
          <label htmlFor="price">Sell Price</label>
        )}

        <input
          type="text"
          id="price"
          placeholder="0.0000"
          value={price === 0 ? "" : price}
          onChange={handlePrice}
        />

        <button className="button button--filled" type="submit">
          Make Order
        </button>
      </form>
    </div>
  );
};

export default Order;
