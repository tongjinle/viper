import redisClient from "../../redisDb";
import config from "../../config";
import IToken from "./IToken";
import ITokenService from "./ITokenService";
import genToken from "./genToken";

const wrapTokenKey = key => "token#" + key;
const wrapOpenIdKey = key => "openId#" + key;

class RedisTokenService implements ITokenService {
  private static ins: RedisTokenService;

  static async getIns(): Promise<RedisTokenService> {
    console.log("123123213");
    let ins = (RedisTokenService.ins =
      RedisTokenService.ins || new RedisTokenService());
    console.log(ins);
    return ins;
  }

  // 查找token对应的信息
  async getInfo(token: string): Promise<IToken> {
    let rst: IToken;
    rst = await redisClient.hgetall(wrapTokenKey(token));
    return rst;
  }

  async getInfoByOpenId(openId: string): Promise<IToken> {
    let rst: IToken;
    let token: string = await redisClient.get(wrapOpenIdKey(openId));
    if (!token) {
      return;
    }

    rst = await this.getInfo(token);

    return rst;
  }

  // 检测token有效性
  // 在redis中,因为有expires
  async check(token: string): Promise<boolean> {
    let rst: boolean;
    rst = await redisClient.exists("token#" + token);
    return rst;
  }

  // 绑定openId,生成token
  async bind(openId: string): Promise<IToken> {
    let rst: IToken;
    let info: IToken = await this.getInfoByOpenId(openId);
    let token: string;

    if (!info) {
      token = genToken();
      info = {
        token,
        openId,
        expires: Date.now() + config.tokenExpires
      };
      await redisClient.hmset(wrapTokenKey(token), info);
      await redisClient.set(wrapOpenIdKey(openId), token);
    }
    await redisClient.expire(wrapOpenIdKey(openId), config.tokenExpires);
    await redisClient.expire(wrapTokenKey(info.token), config.tokenExpires);
    return rst;
  }

  // 清空
  async clear(): Promise<void> {
    let tokenKeys = await redisClient.keys("token#*");
    let openIdKeys = await redisClient.keys("openId#*");
    await redisClient.del([...tokenKeys, ...openIdKeys]);
  }
}

export default RedisTokenService;
