import IConfig from "./IConfig";

let conf: Partial<IConfig> = {
  connectStr: "mongodb://localhost:27017",
  dbName: "zst",

  apiPrefix: "http://localhost",

  mockToken: "sannian.zst",
  mockOpenId: "sannian.zst",

  signPoint: 1,
  invitePoint: 1,
  moneyPointRate: 10,
  photoOpen: [0, 0, 0, 10, 50, 100]
};

export default conf;
