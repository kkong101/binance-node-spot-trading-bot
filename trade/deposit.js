const binance = require("../helper/binance");
const { userAccount } = require("../globalState/index");

module.exports = {
  // 계좌에 사용 가능한 금액 가져오고 저장.
  // 주의 사항 비동기로 작동됨... 왜그런지 모르겠음.
  getDeposit: () => {
    userAccount.ordered_coin_list = [];
    binance.balance(async (error, balances) => {
      if (error) return console.log("getDeposit() error");

      const tikers = Object.keys(balances);
      for (let tiker of tikers) {
        if (tiker === "USDT") {
          userAccount.available_money = parseFloat(balances[tiker].available);
        } else {
          // USDT가 아닌 생태에서 잔돈이 0이 아니면, 구매한 내역에 등록
          if (parseFloat(balances[tiker].available) != 0) {
            userAccount.ordered_coin_list.push({
              symbol: tiker + "USDT",
              quantity: parseFloat(balances[tiker].available),
            });
          }
        }
      }

      for (let i = 0; i < userAccount.ordered_coin_list.length; i++) {
        await binance.allOrders(
          userAccount.ordered_coin_list[i].symbol,
          (error, orders, symbol) => {
            const result = orders
              .reverse()
              .find((e) => e.status == "FILLED" && e.side == "BUY");
            userAccount.ordered_coin_list[i] = {
              ...userAccount.ordered_coin_list[i],
              price: parseFloat(result.price),
            };
          }
        );
      }

      for (const coin of userAccount.ordered_coin_list) {
        binance.candlesticks(
          coin.symbol,
          "1m",
          (error, ticks, symbol) => {
            const last_tick = ticks[ticks.length - 1];
            const close = last_tick[4];
            userAccount.onOrder_money += close * coin.quantity;
          },
          { limit: 1 }
        );
      }
    });
  },
};
