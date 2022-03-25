const {
  stockInfo,
  tradeInfo,
  userAccount,
  strategyMsg,
} = require("./globalState/index");
const { buyingCoin } = require("./trade/buy");
const { sellingCoin } = require("./trade/sell");
const { setStockPrice, setOrderListeners } = require("./subscribe/index");
const { sleep } = require("./utils/index");
const { sendMessage } = require("./helper/slack");
const { buying, selling } = require("./strategy/index");
const { getDeposit } = require("./trade/deposit");

const startAutoBot = () => {
  // 잠금 가지고 오는 부분 & 잔고 금액 초기화
  // 비동기로 가져옴.
  getDeposit();

  // 현재 가지고 있는 포지션 체크
  // 이부분은 나중에 로직 짜기

  // 가격, 이동 평균선 세팅해주는 부분
  // setInterval(() => {
  //   setStockPrice(stockInfo.symbol);
  // }, 200);

  // 거래가 체결됬는지 안됬는지 바이낸스와 연결하는 함수
  setOrderListeners();

  buying.firstStrategy();

  sleep(3000, () => {
    setInterval(async () => {
      if (!tradeInfo.stop) {
        if (!tradeInfo.isOnOrder) {
          if (
            !userAccount.ordered_coin_list.find(
              (e) => e.symbol == tradeInfo.buy_signal_list[0].symbol
            ) &&
            tradeInfo.buy_signal_list.length != 0
          ) {
            tradeInfo.isOnOrder = true;
            buyingCoin(tradeInfo.buy_signal_list[0]);
          } else if (
            tradeInfo.ordered_coin_list.length != 0 &&
            tradeInfo.sell_signal_list.length != 0
          ) {
            tradeInfo.isOnOrder = true;
            sellingCoin(tradeInfo.sell_signal_list[0]);
          }
        }
      }
    }, 200);
  });

  /**
   * 루프 돌면서 거래 하는 로직 부분
   */
  // sleep(3000, () => {
  //   setInterval(async () => {
  //     if (!tradeInfo.stop) {
  //       if (!tradeInfo.isOnOrder) {
  //         if (await buying.movingAveragesStrategy(1)) {
  //           tradeInfo.isOnOrder = true;
  //           buyingCoin();
  //         } else if (
  //           tradeInfo.isOnPosition &&
  //           !tradeInfo.isOnOrder &&
  //           selling.sellStrategy()
  //         ) {
  //           tradeInfo.isOnOrder = true;
  //           sellingCoin();
  //         }
  //       }
  //     }
  //   }, 200);
  // });
};

startAutoBot();
