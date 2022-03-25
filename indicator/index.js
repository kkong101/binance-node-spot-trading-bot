const binance = require("../helper/binance");
module.exports = {
  /**
   *  이동평균가격을 구하는 함수
   * @param {*} symbol ticker
   * @param {*} min 몇분의 이동 평균선 인지? ex)1m,3m,5m,15min
   * @param {*} num 몇일??
   */
  getMAprice: async (symbol, min, num) => {
    try {
      const result = await binance.candlesticks(symbol, min);

      const slicedList = result.slice(result.length - num, result.length);

      const avgPricePerMin = [];
      slicedList.forEach((e) => {
        avgPricePerMin.push(parseFloat(e[4]));
      });

      return avgPricePerMin.reduce((a, b) => a + b, 0) / num;
    } catch (e) {
      console.log("getMAprice error");
    }
  },
};
