import { createSelector } from "reselect";
import { get, groupBy, maxBy, minBy, reject } from "lodash";
import { ethers } from "ethers";
import moment from "moment";

const GREEN = "#08f26e";
const RED = "#F45353";
const tokens = (state) => get(state, "tokens.contracts");
const account = (state) => get(state, "provider.account");
const allOrders = (state) => get(state, "exchange.allOrders.data", []);
const allCancelOrders = (state) =>
  get(state, "exchange.allCancelOrders.data", []);
const allFilledOrders = (state) =>
  get(state, "exchange.allFilledOrders.data", []);

const openOrders = (state) => {
  const all = allOrders(state);
  const filled = allFilledOrders(state);
  const cancel = allCancelOrders(state);

  const openOrders = reject(all, (order) => {
    const filledExclude = filled.some(
      (o) => o.id.toString() === order.id.toString()
    );
    const cancelExcluded = cancel.some(
      (o) => o.id.toString() === order.id.toString()
    );
    return filledExclude || cancelExcluded;
  });

  return openOrders;
};

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

// MY OPEN ORDERS
export const myOpenOrdersSelector = createSelector(
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Filter orders created by currency account
    orders = orders.filter((o) => o.user === account);

    // Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    orders = decorateMyOpenOrders(orders, tokens);

    // Descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateMyOpenOrders = (orders, tokens) => {
  orders = orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyOpenOrder(order, tokens);
    return order;
  });

  return orders;
};

const decorateMyOpenOrder = (order, token) => {
  let orderType = order.tokenGive === token[1].address ? "buy" : "sell";
  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? "GREEN" : "RED",
  };
};

// ALL FILLED ORDER
export const filledOrderSelector = createSelector(
  allFilledOrders,
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

    // Sorting
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    orders = decorateFilledOrders(orders, tokens);
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateFilledOrders = (orders, tokens) => {
  let previousOrder = orders[0];

  orders = orders.map((order) => {
    // Decorate each order
    order = decorateOrder(order, tokens);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order;
    return order;
  });

  return orders;
};

const decorateFilledOrder = (order, previousOrder) => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
  };
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  if (previousOrder.id === orderId) {
    return GREEN;
  }

  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN;
  } else {
    return RED;
  }
};

// MY FILLED ORDER
export const myFilledOrderSelector = createSelector(
  account,
  tokens,
  allFilledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Filter orders created by currency account
    orders = orders.filter((o) => o.user === account || o.creator === account);

    // Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    // Descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    orders = decorateMyFilledOrders(orders, account, tokens);

    console.log(orders, "In myFilledOrders");

    return orders;
  }
);

const decorateMyFilledOrders = (orders, account, tokens) => {
  orders = orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyFilledOrder(order, account, tokens);
    return order;
  });

  return orders;
};

const decorateMyFilledOrder = (order, account, token) => {
  let orderType;
  const myOrder = order.creator === account;

  // If user created the order
  if (myOrder) {
    orderType = order.tokenGive === token[1].address ? "buy" : "sell";
  } else {
    orderType = order.tokenGive === token[1].address ? "sell" : "buy";
  }

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? "GREEN" : "RED",
    orderSign: orderType === "buy" ? "+" : "-",
  };
};

// ORDER BOOK

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
    const sellOrders = get(orders, "sell", []);

    // Sort buyOrders and sellOrders
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
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

// PRICE CHART

export const priceChartSelector = createSelector(
  allFilledOrders,
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

    // Sorting
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);

    // Decorate
    orders = orders.map((o) => decorateOrder(o, tokens));

    let secondLastOrder, lastOrder;
    [secondLastOrder, lastOrder] = orders.slice(
      orders.length - 2,
      orders.length
    );

    const lastPrice = get(lastOrder, "tokenPrice", 0);
    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
      series: [
        {
          data: buildGraphData(orders),
        },
      ],
    };
  }
);

const buildGraphData = (orders) => {
  orders = groupBy(orders, (o) =>
    moment.unix(o.timestamp).startOf("hour").format()
  );

  const hours = Object.keys(orders);

  const graphData = hours.map((hour) => {
    // Fetch all orders from current hour
    const group = orders[hour];

    // Calculate price values: open, high, low, close
    const open = group[0].tokenPrice;
    const high = maxBy(group, "tokenPrice").tokenPrice;
    const low = minBy(group, "tokenPrice").tokenPrice;
    const close = group[group.length - 1].tokenPrice;

    return {
      x: new Date(hour),
      y: [open, high, low, close],
    };
  });

  return graphData;
};
