import assert = require("assert");
import redisDb from "../../redisDb";
import TokenService from "../../service/tokenService";
import ITokenService from "../../service/tokenService/ITokenService";
import IToken from "../../service/tokenService/IToken";

let service: ITokenService;
let db: redisDb;

describe("redis-token", () => {
  before(async () => {
    service = await TokenService.getIns();
    db = await redisDb.getIns();
  });

  beforeEach(async () => {
    await service.clear();
  });

  after(async () => {
    await db.close();
  });

  it("bind", async () => {
    let openId = "zst";
    let key = "openId#" + openId;
    let info: IToken = await service.bind(openId);

    let token = info.token;

    {
      let key = "token#" + token;
      let info: IToken = await db.hgetall(key);
      assert(info.openId === openId);
    }
  });

  it("check", async () => {
    let openId = "zst";
    let key = "openId#" + openId;

    let info: IToken = await service.bind(openId);

    {
      let isExists = await service.check(info.token);
      assert(isExists === true);
    }
  });

  it("getInfoByOpenId", async () => {
    let openId = "zst";
    let key = "openId#" + openId;

    let info: IToken = await service.bind(openId);

    {
      let info = await service.getInfoByOpenId(openId);
      assert(info.openId === openId);
    }
  });
});
