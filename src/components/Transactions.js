import { useSelector } from "react-redux";
import { myOpenOrdersSelector } from "../store/selectors";
import { useRef, useState } from "react";

import sort from "../assets/sort.svg";
import Banner from "./Banner";

const Transactions = () => {
  const symbols = useSelector((state) => state.tokens.symbols);
  const myOpenOrders = useSelector(myOpenOrdersSelector);
  const [order, setIsOrder] = useState(true)
  const orderRef = useRef();
  const tradeRef = useRef();

  const handleTab = (e) => {
    if(e.target.className === orderRef.current.className) {
      e.target.className = "tab tab--active";
      tradeRef.current.className = "tab";
      setIsOrder(true)
    } else {
      e.target.className = "tab tab--active";
      orderRef.current.className = "tab";
      setIsOrder(false)
    }
  };

  return (
    <div className="component exchange__transactions">
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

      {/* <div> */}
      {/* <div className='component__header flex-between'> */}
      {/* <h2>My Transactions</h2> */}

      {/* <div className='tabs'> */}
      {/* <button className='tab tab--active'>Orders</button> */}
      {/* <button className='tab'>Trades</button> */}
      {/* </div> */}
      {/* </div> */}

      {/* <table> */}
      {/* <thead> */}
      {/* <tr> */}
      {/* <th></th> */}
      {/* <th></th> */}
      {/* <th></th> */}
      {/* </tr> */}
      {/* </thead> */}
      {/* <tbody> */}

      {/* <tr> */}
      {/* <td></td> */}
      {/* <td></td> */}
      {/* <td></td> */}
      {/* </tr> */}

      {/* </tbody> */}
      {/* </table> */}

      {/* </div> */}
    </div>
  );
};

export default Transactions;
