const binance = require("../helper/binance");
const fs = require("fs");

/**
 * 코인 전체의 모든 가격정보를 가져옴.
 */

module.exports = {
  saveToFile: () => {
    const fileName = "coin_info.json";

    (getHistoryPrice = (symbol) => {
      const num100 = 100;
      const num20 = 20;
      const num10 = 10;

      if (symbol === "END") return;
      return new Promise((resolve, reject) => {
        binance.candlesticks(
          symbol,
          "1d",
          (error, ticks, symbol) => {
            let sumVolume = 0;
            let sumPrice = 0;
            let ma10 = 0;
            let ma100 = 0;
            let vol20 = 0;
            let i = 0;
            const reversedList = ticks.reverse();
            for (const o of reversedList) {
              i++;
              const [
                time,
                open,
                high,
                low,
                close,
                volume,
                closeTime,
                assetVolume,
                trades,
                buyBaseVolume,
                buyAssetVolume,
                ignored,
              ] = o;
              sumVolume += parseFloat(volume);
              sumPrice += parseFloat(close);
              // MA는 몇일 기준인지?
              if (i == num10) {
                ma10 = sumPrice / num10;
              }
              if (i == num100) {
                ma100 = sumPrice / num100;
              }

              if (i == num20) {
                vol20 = sumVolume / num20;
              }

              if (i == num100) {
                if (ma10 < ma100) {
                  //기준 충족 못시키면,
                  resolve(null);
                } else {
                  const result = {
                    vol20: Math.round(vol20),
                    ma10: ma10,
                    ma100: ma100,
                  };
                  resolve(result);
                }
              }
            }
          },
          { limit: num100 }
        );
      });
    }),
      (setCoinInfo = () => {
        return new Promise(async (resolve, reject) => {
          const coinList = JSON.parse(fs.readFileSync("./coin_list.json")).list;
          const resultList = [];
          let time_interval = 0;
          for (const symbol of coinList) {
            time_interval++;
            setTimeout(async () => {
              if (symbol == "END") {
                resolve(resultList);
                return;
              }
              const res = await getHistoryPrice(symbol);
              if (res == null) return;
              console.log("symbol:", symbol, " => ", res);
              resultList.push({
                symbol: symbol,
                vol20: res.vol20,
                ma10: res.ma10,
                ma100: res.ma100,
              });
            }, 80 * time_interval);
          }
        });
      });

    if (fs.existsSync(fileName)) {
      // 만약 파일이 존재하면
      const result = fs.readFileSync(fileName);
      jsonFile = JSON.parse(result);
      if (new Date().getTime() - jsonFile.time > 1000 * 60 * 60) {
        // 1000 * 60 * 60 * 3
        // 3시간 이상 경과되었으면 다시 코인 전체 정보 저장.
        setCoinInfo().then((value) => {
          const writeJson = {
            time: new Date().getTime(),
            coins: value,
          };
          fs.writeFileSync(
            fileName,
            JSON.stringify(writeJson),
            (err, result) => {
              console.log(err);
              console.log("저장 완료");
            }
          );
        });
      } else {
        // 만약 3시간 이내에 불러온거면 skip
        return;
      }
    } else {
      // 만약 파일이 존재하지 않는다면, 데이터 Json에 넣고 코인 정보 받아옴.
      setCoinInfo().then((value) => {
        const writeJson = {
          time: new Date().getTime(),
          coins: value,
        };

        fs.writeFileSync(fileName, JSON.stringify(writeJson), (err, result) => {
          console.log(err);
          console.log("저장 완료");
        });
      });
    }
  },
};
