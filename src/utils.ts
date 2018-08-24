import config from "./config";
import Database from "./db";

// *** 存放一些通用方法 ***

let utils = {
  // 计算消费对应的热度
  calCount(type: "point" | "coin", cast: number): number {
    let rst = 0;
    let rate = [config.pointRate, config.coinRate][
      ["point", "coin"].indexOf(type)
    ];
    rst = cast * rate;
    return rst;
  },

  calPoint(
    type: "sign" | "money" | "invite",
    count: number
  ): { point: number; coin: number } {
    let rst = { point: 0, coin: 0 };
    if ("sign" === type) {
      rst.point += config.signPoint;
    } else if ("invite" === type) {
      rst.point += config.invitePoint;
    } else if ("money" === type) {
      rst.coin += count * config.moneyPointRate;
    }
    return rst;
  }
};

export default utils;
