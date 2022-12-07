import { useSelector } from "react-redux";
import {
  myFilledOrderSelector,
  myOpenOrdersSelector,
} from "../store/selectors";
import { useRef, useState } from "react";

import sort from "../assets/sort.svg";
import Banner from "./Banner";

const Transactions = () => {
  const symbols = useSelector((state) => state.tokens.symbols);
  const myOpenOrders = useSelector(myOpenOrdersSelector);
  const myFilledOrders = useSelector(myFilledOrderSelector);
  const [showMyOrder, setShowMyOrder] = useState(true);
  const orderRef = useRef(null);
  const tradeRef = useRef(null);

  const handleTab = (e) => {
    if (e.target.className === orderRef.current.className) {
      e.target.className = "tab tab--active";
      tradeRef.current.className = "tab";
      setShowMyOrder(true);
    } else {
      e.target.className = "tab tab--active";
      orderRef.current.className = "tab";
      setShowMyOrder(false);
    }
  };

  return (
    <div className="component exchange__transactions">
      {showMyOrder ? (
        <div>
          <div className="component__header flex-between">
            <h2>My Orders</h2>

            <div className="tabs">
              <button
                className="tab tab--active"
                onClick={handleTab}
                ref={orderRef}
              >
                Orders
              </button>
              <button className="tab" onClick={handleTab} ref={tradeRef}>
                Trades
              </button>
            </div>
          </div>

          {!myOpenOrders || myOpenOrders.length === 0 ? (
            <Banner text={`No open orders`}></Banner>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>
                    {symbols && symbols[0]} <img src={sort} alt="sort"></img>
                  </th>
                  <th>
                    {symbols && symbols[0]}/{symbols && symbols[1]}
                    <img src={sort} alt="sort"></img>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myOpenOrders &&
                  myOpenOrders.map((order, index) => {
                    return (
                      <tr key={index}>
                        <td style={{ color: order.orderTypeClass }}>
                          {order.token0Amount}
                        </td>
                        <td>{order.tokenPrice}</td>
                        <td>
                          <button>Cancel</button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          <div className="component__header flex-between">
            <h2>My Transactions</h2>

            <div className="tabs">
              <button
                className="tab tab--active"
                onClick={handleTab}
                ref={orderRef}
              >
                Orders
              </button>
              <button className="tab" onClick={handleTab} ref={tradeRef}>
                Trades
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>
                  Time <img src={sort} alt="sort"></img>
                </th>
                <th>
                  {symbols && symbols[0]}
                  <img src={sort} alt="sort"></img>
                </th>
                <th>
                  {symbols && symbols[0]}/{symbols && symbols[1]}
                  <img src={sort} alt="sort"></img>
                </th>
              </tr>
            </thead>
            <tbody>
              {myFilledOrders &&
                myFilledOrders.map((order, index) => {
                  return (
                    <tr key={index}>
                      <td>{order.formattedTimestamp}</td>
                      <td style={{ color: order.orderTypeClass }}>
                        {order.orderSign}
                        {order.token0Amount}
                      </td>
                      <td>{order.tokenPrice}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
