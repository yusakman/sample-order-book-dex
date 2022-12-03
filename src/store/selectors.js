import { createSelector } from "reselect";
import { get, groupBy, reject } from "lodash";
import { ethers } from "ethers";
import moment from "moment";

const GREEN = "#25CEF8";
const RED = "#F45353";
const tokens = (state) => get(state, "tokens.contracts");
const allOrders = (state) => get(state, "exchange.allOrders.data", []);
const allCancelOrders = (state) => get(state, "exchange.allCancelOrders.data", [])
const allFilledOrders = (state) => get(state, "exchange.allFilledOrders.data", [])

const openOrders = (state) => {
    const all = allOrders(state)
    const filled = allFilledOrders(state)
    const cancel = allCancelOrders(state)
    
    const filledExcluded = reject(all, (order) => {
        const filledExclude = filled.some(o => o.id.toString() === order.id.toString())
        return filledExclude
    })

    const cancelExcluded = reject(filledExcluded, (order) => {
        const cancelExcluded = cancel.some(o => o.id.toString() === order.id.toString())
        return cancelExcluded
    })

    return cancelExcluded
}

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount;

  if (order.tokenGive === tokens[1].address) {
    token0Amount = order.amountGive;
    token1Amount = order.amountGet;
  } else {
    token0Amount = order.amountGet;
    token1Amount = order.amountGive;
  }

  let precision = 100000;
  let tokenPrice = token1Amount / token0Amount;
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return {
    ...order,
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    tokenPrice: tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ssa d MMM D"),
  };
};

// ORDER BOOk

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Filters order by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    // Decorate order
    orders = decorateOrderBookOrders(orders, tokens);

    // Group orders by 'orderType'
    orders = groupBy(orders, "orderType");

    // Fetch buy orders
    const buyOrders = get(orders, "buy", []);
    
    // Fetch sell orders
    const sellOrders = get(orders, "sell", [])

    // Sort buyOrders and sellOrders
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
      sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    };

    return orders;
  }
);

const decorateOrderBookOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateOrderBookOrder(order, tokens);
    return order;
  });
};

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order.tokenGive === tokens[1].address ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
  };
};
