const Binance = require("node-binance-api");
const SECRET = require("../SECRET.json");

const binanceOptions = {};

const playMode = "test";

if (playMode == "test") {
  binanceOptions.APIKEY = SECRET.APIKEY;
  binanceOptions.APISECRET = SECRET.APISECRET;
} else {
}

const binance = Binance(binanceOptions);

module.exports = binance;
