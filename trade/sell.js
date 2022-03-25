const binance = require("../helper/binance");
const { sleep } = require("../utils/index");
const {
  stockInfo,
  tradeInfo,
  userAccount,
  constant,
} = require("../globalState/index");
const { getDeposit } = require("../trade/deposit");

module.exports = {
  SellingCoin: async (symbol) => {
    // 메인 루프 중지
    tradeInfo.isOnOrder = true;

    // 판매할 수량
    const coin_obj = userAccount.ordered_coin_list.find(
      (e) => e.symbol == symbol
    );

    // 만약 판매하고자 하는 코인이 없으면...
    if (coin_obj == null) {
      getDeposit();
      tradeInfo.sell_signal_list = [];
      setTimeout(() => {
        tradeInfo.isOnOrder = true;
      }, 5000);
    }

    try {
      await binance.sell(coin_obj.symbol, coin_obj.quantity, coin_obj.price);
    } catch (e) {
      console.log("SellingCoin error");
    }

    // if (!tradeInfo.isOnPosition) {
    //   return console.log("구매상태 아닌데 판매 로직에 들어왔음.");
    // }

    // // 판매할 수량
    // const quantity = tradeInfo.quantity;
    // const current_price = stockInfo.price;

    // if (quantity == 0 || current_price == 0) {
    //   cosnole.log("수량 없는데 들어왔음.");
    //   return;
    // }

    // // 더이상 구매할 돈이 없거나, 분할매수 횟수 이상 되면 구매 불가
    // if (
    //   userAccount.available_money < order_money ||
    //   tradeInfo.divided_buying_count == constant.DIVIDED_NUM
    // ) {
    //   sleep(5000, () => {
    //     console.log("돈이 없거나 분할 매수를 전부해서 구매할 수 없습니다.");
    //   });
    //   return;
    // }
    // try {
    //   await binance.sell(stockInfo.symbol, quantity, current_price);
    // } catch (e) {
    //   console.log("SellingCoin error");
    // }

    // 체결이 안됬으면 주문 취소해줘야댐!!!!
  },
};
