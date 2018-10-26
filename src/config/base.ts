import { HOUR } from "../constant";
export default {
  port: 3000,
  // mongo
  connectStr: "mongodb://localhost:27017",
  dbName: "zst",
  // redis
  redis: {
    host: "localhost",
    port: 6379,
    pass: "sannian"
  },
  wx: {
    appId: "wxfdb0bd7037208c77",
    appSecret: "f2a1d8b4e348164bf359f14776ec8433",
    // 信息模版Id
    templateId: "rbrtfn6Qt0UYaI3G6hnBUjr6Vikoz5Q9B1Wdvk4q82E"
  },

  // token过期时间
  tokenExpires: 2 * HOUR,

  // ******** special for project ********
  photoOpen: [0, 0, 0, 100, 300, 1000],

  pointRate: 1,
  coinRate: 100,

  //
  signPoint: 1,
  invitePoint: 1,
  moneyPointRate: 100,

  // 每日签到最大次数
  signCount: 1,
  // 每日转发最大次数
  inviteCount: 10,

  // 注册获得的point
  regPoint: 1,
  // 注册获得的coin
  regCoin: 0
};
