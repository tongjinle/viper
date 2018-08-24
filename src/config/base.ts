import { HOUR } from "../constant";
export default {
  port: 3000,
  connectStr: "mongodb://localhost:27017",
  dbName: "zst",

  wx: {
    appId: "wx76c2cfaf352e3a62",
    appSecret: "61925af2bb3d710aa2e84699b9cf0466",
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
  moneyPointRate: 1
};
