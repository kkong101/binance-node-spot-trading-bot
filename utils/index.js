const moment = require("moment");

module.exports = {
  sleep: (ms, fn) => {
    setTimeout(() => {
      fn();
    }, ms);
  },
  /**
   * 시간 출력
   * @param {Number} ms
   * @returns
   */
  convertSecToday: (ms) => {
    return moment.utc(parseInt(ms)).local().format("YYYY/MM/DD HH:mm:ss");
  },
  /**
   * 퍼샌테이지로 변경
   * @param {String,Float} currentPrice 현재 코인 가격
   * @param {String,Float} buyingPrice 구매한 코인 가격
   * @returns
   */
  convertPriceToPercent: (currentPrice, buyingPrice) => {
    const current_price = parseFloat(currentPrice);
    const compared_price = parseFloat(buyingPrice);
    if (current_price < compared_price) {
      return -1 * (1 - current_price / compared_price) * 100;
    } else {
      return (1 - compared_price / current_price) * 100;
    }
  },
  getCurrentTime: () => {
    return "시간 : " + moment().format("HH시 mm분 ss초");
  },
};
