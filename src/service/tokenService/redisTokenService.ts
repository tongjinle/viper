import RedisDb from "../../redisDb";
import config from "../../config";
import IToken from "./IToken";
import ITokenService from "./ITokenService";
import genToken from "./genToken";

const wrapTokenKey = key => "token#" + key;
const wrapOpenIdKey = key => "openId#" + key;

class RedisTokenService implements ITokenService {
  private static ins: RedisTokenService;
  private db: RedisDb;

  static async getIns(): Promise<RedisTokenService> {
    let ins = (RedisTokenService.ins =
      RedisTokenService.ins || new RedisTokenService());

    return ins;
  }

  private constructor() {
    RedisDb.getIns().then(db => {
      this.db = db;
    });
  }

  // 查找token对应的信息
  async getInfo(token: string): Promise<IToken> {
    let rst: IToken;
    rst = await this.db.hgetall(wrapTokenKey(token));
    return rst;
  }

  async getInfoByOpenId(openId: string): Promise<IToken> {
    let rst: IToken;
    let token: string = await this.db.get(wrapOpenIdKey(openId));
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
    rst = await this.db.exists("token#" + token);
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
      await this.db.hmset(wrapTokenKey(token), info);
      await this.db.set(wrapOpenIdKey(openId), token);
    }
    await this.db.expire(wrapOpenIdKey(openId), config.tokenExpires);
    await this.db.expire(wrapTokenKey(info.token), config.tokenExpires);

    rst = info;
    return rst;
  }

  // 清空
  async clear(): Promise<void> {
    let tokenKeys = await this.db.keys("token#*");
    let openIdKeys = await this.db.keys("openId#*");
    let keys = [...tokenKeys, ...openIdKeys];
    if (keys.length) {
      await this.db.del(keys);
    }
  }
}

export default RedisTokenService;
