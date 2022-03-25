const axios = require("axios");
const SECRET = require("../SECRET.json");

module.exports = {
  /**
   * 슬랙 메세지 전송.
   * @param {String} text
   */
  sendMessage: (text) => {
    return axios.post(SECRET.SLACK_URL, {
      channel: "binance",
      username: "binance",
      type: "mrkdwn",
      text,
    });
  },
};
