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

  // 产生冠军的临界热度
  maxHot: number;

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

  // 每日签到最大次数
  signCount: number;
  // 每日转发最大次数
  inviteCount: number;

  // 注册获得的point
  regPoint: number;
  // 注册获得的coin
  regCoin: number;

  // mock
  mockToken: string;
  mockOpenId: string;

  // redis
  redis: {
    // 主机
    host: string;
    // 端口
    port: number;
    // 密码
    pass: string;
  };
}

export default IConfig;
