import baseConf from "./base";
import testConf from "./test";
import devConf from "./dev";
import prodConf from "./prod";

const env = process.env.NODE_ENV;
console.log("node env:", env);
interface IConfig {
  port: number;
  connectStr: string;
  dbName: string;

  // 微信
  wx: {
    appId: string;
    appSecret: string;
    templateId: string;
  };
  // token过期时间
  tokenExpires: number;
  // 域名
  apiPrefix: string;

  // special for project
  // 照片跟热度的对应关系
  photoOpen: number[];
  // point兑换的热度
  pointRate: number;
  // coin兑换的热度
  coinRate: number;

  // 签到获得的点数
  signPoint: number;
  // 邀请获得的点数
  invitePoint: number;
  // money获得的点数
  moneyPointRate: number;

  // mock
  mockToken: string;
  mockOpenId: string;
}

let conf: Partial<IConfig> = {};
if ("test" === env) {
  conf = Object.assign({}, baseConf, testConf);
} else if ("dev" === env) {
  conf = Object.assign({}, baseConf, devConf);
} else if ("product" === env) {
  conf = Object.assign({}, baseConf, prodConf);
} else {
  throw "invalid environment: " + env;
}

export default conf;
