const {
  stockInfo,
  constant,
  tradeInfo,
  userAccount,
} = require("../globalState/index");
const { convertPriceToPercent } = require("../utils/index");
const { getMAprice } = require("../indicator/index");
const binance = require("../helper/binance");
const fs = require("fs");

module.exports = {
  buying: {
    /**
     * 이동평균선 돌파 전략
     * @param {Number} code 몇번째 이동평균선 전략을 사용할지
     */
    movingAveragesStrategy: async (code) => {
      // ################### CODE 1 ###################
      const ma120 = await getMAprice(stockInfo.symbol, "1m", 120);
      const ma60 = await getMAprice(stockInfo.symbol, "1m", 60);
      const ma10 = await getMAprice(stockInfo.symbol, "1m", 10);
      if (ma120 > ma60 && ma60 > ma10 && stockInfo.price > ma10) {
        console.log("매수 strategy에 들어왔음!");
        return true;
      } else {
        return false;
      }
      // ################### CODE 1 END ###################
    },
    firstStrategy: () => {
      const coinObjList = JSON.parse(
        fs.readFileSync("../price_detect/coin_info.json")
      ).coins;
      const coinSymbolList = [];
      for (const i of coinObjList) {
        coinSymbolList.push(i.symbol);
      }

      const targetCoins = [];

      binance.websockets.candlesticks(
        coinSymbolList,
        "1d",
        (candlestickData) => {
          const d = candlestickData;
          const coinObj = coinObjList.find((x) => {
            return x.symbol === d.s;
          });

          // 구매 전략 부분 ########################################################################
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
          // 구매 전략 끝 ####################################################################

          // 판매 전략 시작 ############################################################################
          if (this.selling.sellStrategy(d.s, parseFloat(d.k.c))) {
            // 만약 판매 조건이 성립한다면, sell_signal_list에 넣는다
            // 혹시 판매 시그널이 2번 들어 갈 수 있으므로 방지해준다.
            if (!tradeInfo.sell_signal_list.find((e) => e.symbol == d.s)) {
              tradeInfo.sell_signal_list.push({
                symbol: d.s,
                price: parseFloat(d.k.c),
              });
            }
          }
          // 판매 전략 끝 ############################################################################
        }
      );
    },
  },
  selling: {
    /**
     * 익절/손절 조건
     */
    sellStrategy: (symbol, price) => {
      for (const el of userAccount.ordered_coin_list) {
        if (el.symbol == symbol) {
          const percent = (
            (1 - parseFloat(el.price) / parseFloat(price)) *
            100
          ).toFixed(2);

          if (percent > 5) {
            // 5퍼샌트 이상이면 익절
            return true;
          } else if (percent < -2) {
            // 마이너스 2퍼이면 손절
            return true;
          }
        }
      }
      return false;

      // // 만약 구매한게 없을 경우 돌아가게
      // if (!tradeInfo.isOnPosition) return false;

      // // 수익율이 몇퍼인지
      // const percentage = convertPriceToPercent(
      //   stockInfo.price,
      //   tradeInfo.buying_avg_price
      // );

      // if (
      //   constant.sellStrategy.PROFIT_PERCENTAGE < percentage ||
      //   constant.sellStrategy.LOSS_PERCENTAGE > percentage
      // ) {
      //   return true;
      // }
      // return false;
    },
  },
};
