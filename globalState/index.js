module.exports = {
  stockInfo: {
    price: 0,
    maPrice: 0, // 일단 미사용
    symbol: "SOLUSDT", // 티커명
  },
  tradeInfo: {
    isOnOrder: false, // 현재 주문 상태인지
    isOnPosition: false, // 포지션 가지고 있는지,
    buying_avg_price: 0, // 평균 단가
    divided_buying_count: 0, // 분할매수 횟수
    quantity: 0, // 구매한 수량
    buy_signal_list: [],
    sell_signal_list: [],
    stop: false, // 긴급 상황 때 전체 로직 중단 변수
  },
  userAccount: {
    available_money: 0, // 계좌에 사용 가능한 금액
    onOrder_money: 0, // 현재 구매한 코인의 가격
    ordered_coin_list: [],
  },
  constant: {
    DELAY_AFTER_SELL: 3 * 60 * 1000, // 판매 후 몇분 쉴것인지.
    DIVIDED_NUM: 1, // 몇번 분할 매수 진행할 것인지.
    USING_MONEY: 11, // 얼마 사용할 건지(총 매매 비용),
    sellStrategy: {
      LOSS_PERCENTAGE: -0.8, // 손절 수익률
      PROFIT_PERCENTAGE: 0.4, // 익절 수익률
    },
  },
  // 전략 설명부분
  strategyMsg: {
    1: "\n💈 1. 120ma > 60ma > 현재가 2. 10ma 돌파 시 매수\n 💈 +2% 익절, -1% 손절",
  },
  // 판매 후 상태값들 초기화
  reset_state_after_sell: () => {
    this.tradeInfo.quantity = 0;
    this.tradeInfo.isOnPosition = false;
    this.tradeInfo.divided_buying_count = 0;
    this.buying_avg_price = 0;
    this.tradeInfo.isOnOrder = false;
    this.userAccount.onOrder_money = 0;
  },
};
