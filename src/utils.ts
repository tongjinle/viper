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

  // 计算增加的点数
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
  },
  getToday(): number {
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  },
  getTodayString(): string {
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-");
  },

  // flat object
  flatObject(obj: object): object {
    let rst: any = {};
    let fn = (obj, key, value) => {
      if (Array.isArray(value)) {
        value.forEach((n, index) => {
          let newKey = [key, index].join(".").replace(/^\./g, "");
          fn(obj, newKey, n);
        });
      } else if (typeof value === "object") {
        for (let key2 in value) {
          let newKey = [key, key2].join(".").replace(/^\./g, "");
          fn(obj, newKey, value[key2]);
        }
      } else {
        obj[key] = value;
      }
    };
    fn(rst, "", obj);
    return rst;
  }
};

export default utils;
