const binance = require("./helper/binance");
const { convertPriceToPercent } = require("./utils/index");
const { constant, stockInfo, userAccount } = require("./globalState/index");
const fs = require("fs");
const { buying } = require("./strategy/index");
const { saveToFile } = require("./price_detect/index");
const test = require("./SECRET.json");
// const { getDeposit } = require("./trade/deposit");

// test = () => {
//   const coinObjList = JSON.parse(
//     fs.readFileSync("./price_detect/coin_info.json")
//   ).coins;
//   const coinSymbolList = [];
//   for (const i of coinObjList) {
//     coinSymbolList.push(i.symbol);
//   }

//   const targetCoins = [];

//   binance.websockets.candlesticks(coinSymbolList, "1d", (candlestickData) => {
//     const d = candlestickData;
//     const coinObj = coinObjList.find((x) => {
//       return x.symbol === d.s;
//     });
//     if (coinObj.vol20 < parseFloat(d.k.v)) {
//       if (((1 - parseFloat(d.k.o) / parseFloat(d.k.c)) * 100).toFixed(2) > 3) {
//         const detectedCoin = targetCoins.find((x) => {
//           return x.symbol === d.s;
//         });

//         if (detectedCoin) {
//           // 한시간 간격
//           if (new Date().getTime() - detectedCoin.time > 1000 * 60 * 60) {
//             // 한시간 뒤에 감지된 코인들 다시 ..
//             for (let i = 0; i < targetCoins.length; i++) {
//               if (targetCoins[i].symbol === detectedCoin.symbol) {
//                 targetCoins[i].time = new Date().getTime();
//               }
//             }
//           }
//         } else {
//           // 최초 감지가 되었다면,
//           console.log(
//             "🎇 감지됨 -",
//             d.s,
//             " , 현재 수익율 : +",
//             ((1 - parseFloat(d.k.o) / parseFloat(d.k.c)) * 100).toFixed(2)
//           );
//           targetCoins.push({
//             symbol: d.s,
//             time: new Date().getTime(),
//             price: d.k.c,
//           });
//         }
//       }
//       ``;
//     }
//   });
// };

// binance.trades("SOLUSDT", (error, trades, symbol) => {
//   console.info(symbol + " trade history", trades);
// });
// const getDeposit = () => {
//   binance.balance(async (error, balances) => {
//     if (error) return console.log("getDeposit() error");

//     const tikers = Object.keys(balances);
//     for (let tiker of tikers) {
//       if (tiker === "USDT") {
//         userAccount.available_money = parseFloat(balances[tiker].available);
//       } else {
//         // USDT가 아닌 생태에서 잔돈이 0이 아니면, 구매한 내역에 등록
//         if (parseFloat(balances[tiker].available) != 0) {
//           userAccount.ordered_coin_list.push({
//             symbol: tiker + "USDT",
//             quantity: parseFloat(balances[tiker].available),
//           });
//         }
//       }
//     }

//     for (let i = 0; i < userAccount.ordered_coin_list.length; i++) {
//       await binance.allOrders(
//         userAccount.ordered_coin_list[i].symbol,
//         (error, orders, symbol) => {
//           const result = orders
//             .reverse()
//             .find((e) => e.status == "FILLED" && e.side == "BUY");
//           userAccount.ordered_coin_list[i] = {
//             ...userAccount.ordered_coin_list[i],
//             price: parseFloat(result.price),
//           };
//         }
//       );
//     }

//     for (const coin of userAccount.ordered_coin_list) {
//       binance.candlesticks(
//         coin.symbol,
//         "1m",
//         (error, ticks, symbol) => {
//           const last_tick = ticks[ticks.length - 1];
//           const close = last_tick[4];
//           userAccount.onOrder_money += close * coin.quantity;
//         },
//         { limit: 1 }
//       );
//     }
//   });
// };

// getDeposit();

// setTimeout(() => {
//   console.log(userAccount.ordered_coin_list);
//   console.log(userAccount.onOrder_money);
//   console.log(userAccount.available_money);
// }, 5000);

// 2372272485

console.log(test);
