export const provider = (state = {}, action) => {
  switch (action.type) {
    case "PROVIDER_LOADED":
      return { ...state, connection: action.connection };
    case "NETWORK_LOADED":
      return { ...state, chainId: action.chainId };
    case "ACCOUNT_LOADED":
      return { ...state, account: action.account };
    case "ETHER_BALANCE_LOADED":
      return { ...state, balance: action.balance };
    default:
      return state;
  }
};

const DEFAULT_TOKEN_STATE = { loaded: false, contracts: [], symbols: [] };

export const tokens = (state = DEFAULT_TOKEN_STATE, action) => {
  switch (action.type) {
    case "TOKEN_1_LOADED":
      return {
        ...state,
        loaded: true,
        contracts: [action.token],
        symbols: [action.symbol],
      };
    case "TOKEN_1_BALANCE_LOADED":
      return {
        ...state,
        loaded: true,
        balances: [action.balances],
      };
    case "TOKEN_2_LOADED":
      return {
        ...state,
        loaded: true,
        contracts: [...state.contracts, action.token],
        symbols: [...state.symbols, action.symbol],
      };
    case "TOKEN_2_BALANCE_LOADED":
      return {
        ...state,
        loaded: true,
        balances: [...state.balances, action.balances],
      };
    default:
      return state;
  }
};

const DEFAULT_EXCHANGE_STATE = {
  loaded: false,
  contract: {},
  trasaction: {
    isSuccessful: false,
  },
  allOrders: {
    loaded: false,
    data: [],
  },
  events: [],
};

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
  let index, data;
  switch (action.type) {
    case "EXCHANGE_LOADED":
      return {
        ...state,
        loaded: true,
        contract: action.exchange,
      };
    case "EXCHANGE_TOKEN_1_BALANCE_LOADED":
      return {
        ...state,
        loaded: true,
        balances: [action.balances],
      };
    case "EXCHANGE_TOKEN_2_BALANCE_LOADED":
      return {
        ...state,
        loaded: true,
        balances: [...state.balances, action.balances],
      };

    // TRANSFERS
    case "TRANSFER_REQUEST":
      return {
        ...state,
        trasaction: {
          transactionType: "Transfer",
          isPending: true,
          isSuccessful: false,
        },
        transferInProgress: true,
      };
    case "TRANSFER_SUCCESS":
      return {
        ...state,
        trasaction: {
          transactionType: "Transfer",
          isPending: false,
          isSuccessful: true,
        },
        transferInProgress: false,
        events: [action.event, ...state.events],
      };
    case "TRANSFER_FAILED":
      return {
        ...state,
        trasaction: {
          transactionType: "Transfer",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
        transferInProgress: false,
      };

    // ORDERS
    case "ORDER_REQUEST":
      return {
        ...state,
        trasaction: {
          transactionType: "Order",
          isPending: true,
          isSuccessful: false,
        },
        orderInProgress: true,
      };

    case "ORDER_SUCCESS":
      // Prevent Duplicate Orders
      index = state.allOrders.data.findIndex(
        (order) => order.id === action.order.id
      );

      if (index === -1) {
        data = [...state.allOrders.data, action.order];
      } else {
        data = state.allOrders.data;
      }

      return {
        ...state,
        allOrders: {
          ...state.allOrders,
          data, 
        },
        trasaction: {
          transactionType: "Order",
          isPending: false,
          isSuccessful: true,
        },
        orderInProgress: false,
        events: [action.event, ...state.events],
      };
    case "ORDER_FAILED":
      return {
        ...state,
        trasaction: {
          transactionType: "Order",
          isPending: false,
          isSuccessful: false,
          isError: true,
        },
        orderInProgress: false,
      };
    default:
      return state;
  }
};
