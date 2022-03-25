const binance = require("../helper/binance");
const {
  tradeInfo,
  stockInfo,
  userAccount,
  constant,
  reset_state_after_sell,
} = require("../globalState/index");
const { convertSecToday } = require("../utils/index");
const { convertPriceToPercent } = require("../utils/index");
const { sleep } = require("../utils/index");
const { sendMessage } = require("../helper/slack");
const { getDeposit } = require("./trade/deposit");

module.exports = {
  /**
   * 코인 가격 불러와서 저장.
   */
  setStockPrice: async (symbol) => {
    try {
      const ticker = await binance.prices(symbol);
      stockInfo.price = parseFloat(ticker[symbol]);
    } catch (e) {
      console.log(e);
      console.log("setStockPrice error");
    }
  },
  /**
   * 주문 과정 및 결과 이벤트 수신
   */
  setOrderListeners: () => {
    function balance_update(data) {
      console.log("## balance_update data ##########");
      console.log(data);

      const {
        X: requestType, // 주문 요청인지 체결인지
        S: orderType, // 매수인지 매도인지
        q: quantity, // 수량
        L: price, // 체결 가격
        O: time, // 체결 시간
        Y: orderTotalPrice, //
        i: orderId,
        s: symbol,
      } = data;
      console.log(convertSecToday(time));
      if (requestType == "NEW") {
        // 주문 요청
        // 만약 체결 안된다면 취소하고
        sleep(20 * 1000, async () => {
          try {
            await binance.cancel(symbol, orderId, (error, response, symbol) => {
              console.info(symbol + " cancel response:", response);
              console.log("주문 cancel 취소.");
              tradeInfo.buy_signal_list = [];
              tradeInfo.isOnOrder = false;
            });
          } catch (e) {
            console.log("balance_update error");
          }
        });

        tradeInfo.isOnOrder = false;
      } else if (requestType == "FILLED") {
        // 주문 체결됬으면.
        if (orderType == "BUY") {
          getDeposit();

          for (let i = 0; i < tradeInfo.buy_signal_list.length; i++) {
            // buy_signal_list에서 주문 성공한 obj를 제거해준다.
            if (tradeInfo.buy_signal_list[i].symbol == symbol) {
              tradeInfo.buy_signal_list = tradeInfo.buy_signal_list.splice(
                i,
                i
              );
            }
          }
          setTimeout(() => {
            tradeInfo.isOnOrder = false;
          }, 4000);

          /**
           * 구매 체결 완료 로직 @@@@@@@@
           */
          // tradeInfo.quantity += quantity;
          // tradeInfo.divided_buying_count++;
          // // 평단가 개산 부분
          // if (tradeInfo.divided_buying_count == 1) {
          //   tradeInfo.buying_avg_price = price;
          // } else {
          //   tradeInfo.buying_avg_price =
          //     (tradeInfo.buying_avg_price * quantity +
          //       (price * price) / orderTotalPrice) /
          //     (quantity + price / orderTotalPrice);
          // }

          // // 사용 가능 금액 reset
          // getDeposit();
          // // 구매한 결과 변수 세팅
          // userAccount.available_money -= orderTotalPrice;
          // userAccount.onOrder_money += orderTotalPrice;

          // tradeInfo.isOnOrder = false;
          // tradeInfo.isOnPosition = true;

          sleep(5000, () => {
            const msg =
              `🌈 코인 매수 성공 - ${symbol}\n` +
              `🌈 매수 가격 - ${price}\n` +
              `🌈 평균 단가 - ${tradeInfo.buying_avg_price}\n` +
              `🌈 구입한 금액 - ${userAccount.onOrder_money}` +
              `🌈 매도할 금액 - 익절가 ${
                price * (1 + constant.sellStrategy.PROFIT_PERCENTAGE * 0.01)
              } 손절가 ${
                price * (1 + constant.sellStrategy.LOSS_PERCENTAGE * 0.01)
              }\n` +
              `🎇 사용 가능 금액 - ${userAccount.available_money}`;
            sendMessage(msg);
          });
        } else if (orderType == "SELL") {
          // 사용 가능 금액 reset
          getDeposit();

          // 판매된 코인 빼준다.
          for (let i = 0; i < tradeInfo.sell_signal_list.length; i++) {
            // buy_signal_list에서 주문 성공한 obj를 제거해준다.
            if (tradeInfo.sell_signal_list[i].symbol == symbol) {
              tradeInfo.sell_signal_list = tradeInfo.sell_signal_list.splice(
                i,
                i
              );
            }
          }

          setTimeout(() => {
            tradeInfo.isOnOrder = false;
          }, 4000);

          sleep(5000, () => {
            // 코인 판매 시 변수값들 초기화
            const msg =
              `🎇 코인 매도 성공 - ${symbol}\n` +
              `🎇 매수 평단가 - ${userAccount.onOrder_money}\n` +
              `🎇 매도 평단가 - ${price}\n` +
              `🎇 수익률 - ${convertPriceToPercent(
                price,
                tradeInfo.buying_avg_price
              )}\n` +
              `🎇 사용 가능 금액 - ${userAccount.available_money}`;

            sendMessage(msg);
          });
        }
      }
    }
    /**
     * 사용되지 X
     * @param {} data
     */
    function execution_update(data) {
      console.log("##execution_update data##########");
      console.log(data);
    }
    binance.websockets.userData(balance_update, execution_update);
  },

  // #################################################################

  setCoinPriceListener: () => {
    const coinObjList = JSON.parse(
      fs.readFileSync("../price_detect/coin_info.json")
    ).coins;
    const coinSymbolList = [];
    for (const i of coinObjList) {
      coinSymbolList.push(i.symbol);
    }

    const targetCoins = [];

    binance.websockets.candlesticks(coinSymbolList, "1d", (candlestickData) => {
      const d = candlestickData;
      const coinObj = coinObjList.find((x) => {
        return x.symbol === d.s;
      });
      if (coinObj.vol20 < parseFloat(d.k.v)) {
        if (
          ((1 - parseFloat(d.k.o) / parseFloat(d.k.c)) * 100).toFixed(2) > 3
        ) {
          // 조건에 모두 충족하면 들어오는곳 ########################################

          // buy_signal_list에 추가 해준다.
          if (!tradeInfo.buy_signal_list.find((e) => e == d.s))
            tradeInfo.buy_signal_list.push({
              symbol: d.s,
              price: parseFloat(d.k.c),
            });

          // ###############################################################

          const detectedCoin = targetCoins.find((x) => {
            return x.symbol === d.s;
          });

          if (detectedCoin) {
            // 한시간 간격으로 ..
            if (new Date().getTime() - detectedCoin.time > 1000 * 60 * 60) {
              // 한시간 뒤에 감지된 코인들 다시 ..
              for (let i = 0; i < targetCoins.length; i++) {
                if (targetCoins[i].symbol === detectedCoin.symbol) {
                  targetCoins[i].time = new Date().getTime();
                }
              }
            }
          } else {
            // 최초 감지가 되었다면,
            console.log(
              "🎇 감지됨 -",
              d.s,
              " , 현재 수익율 : +",
              ((1 - parseFloat(d.k.o) / parseFloat(d.k.c)) * 100).toFixed(2)
            );
            targetCoins.push({
              symbol: d.s,
              time: new Date().getTime(),
              price: d.k.c,
            });
          }
        }
      }
    });
  },
};
