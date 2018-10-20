import assert = require("assert");
import redisClient from "../../redisDb";
import TokenService from "../../service/tokenService";
import ITokenService from "../../service/tokenService/ITokenService";
import IToken from "../../service/tokenService/IToken";

let service: ITokenService;

describe("redis-token", () => {
  before(async () => {
    console.log("before");
    service = await TokenService.getIns();
  });

  beforeEach(async () => {
    console.log("beforeEach");
    await service.clear();
  });

  it("bind", async () => {
    let openId = "zst";
    let key = "openId#" + openId;
    let info: IToken = await service.bind(openId);
    console.log(info);

    // let info: IToken = await redisClient.hgetall(key);
    // assert(info.openId === openId);
  });
});
