const binance = require("../helper/binance");
const { sleep } = require("../utils/index");
const {
  stockInfo,
  tradeInfo,
  userAccount,
  constant,
} = require("../globalState/index");

module.exports = {
  buyingCoin: async (obj) => {
    // 메인 루프 중지
    tradeInfo.isOnOrder = true;

    // 여기 2번 들어올 수 있음... 막아 줘야 되는데 ..
    // if (stockInfo.price == 0 || isNaN(stockInfo.price)) {
    //   tradeInfo.isOnOrder = false;
    //   return;
    // }

    //만약 구매한 코인이라면 반환시켜준다.
    if (userAccount.ordered_coin_list.find((e) => e.symbol == obj.symbol)) {
      tradeInfo.isOnOrder = false;
      return;
    }

    const current_price = obj.price;
    const order_money = constant.USING_MONEY / constant.DIVIDED_NUM;
    const quantity = order_money / current_price;
    // 더이상 구매할 돈이 없거나, 분할매수 횟수 이상 되면 구매 불가하게
    if (
      userAccount.available_money < order_money ||
      tradeInfo.divided_buying_count == constant.DIVIDED_NUM
    ) {
      sleep(5000, () => {
        console.log("돈이 없거나 분할 매수를 전부해서 구매할 수 없습니다.");
        tradeInfo.isOnOrder = false;
      });
      return;
    }
    try {
      await binance.buy(obj.symbol, quantity, current_price);
    } catch (e) {
      if (e || JSON.parse(e.body).msg.includes("MIN_NOTIONAL")) {
        console.log(quantity);
        console.log("최소 주문 금액이 충족되지 않습니다.");
      } else if (e || JSON.parse(e.body).msg.includes("insufficient balance")) {
        console.log("잔액이 부족합니다.");
      } else {
        console.log("buyingCoin error");
      }
    }
  },
};
