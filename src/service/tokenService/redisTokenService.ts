import RedisDb from "../../redisDb";
import * as keys from "../../redisKeys";
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
    if (!RedisTokenService.ins) {
      let ins = (RedisTokenService.ins =
        RedisTokenService.ins || new RedisTokenService());
      ins.db = await RedisDb.getIns();
    }

    return RedisTokenService.ins;
  }

  // 查找token对应的信息
  async getInfo(token: string): Promise<IToken> {
    let rst: IToken;
    let key = keys.token(token);
    rst = await this.db.hgetall(key);
    return rst;
  }

  async getInfoByOpenId(openId: string): Promise<IToken> {
    let rst: IToken;
    let token: string = await this.db.get(keys.openId(openId));
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
    rst = await this.db.exists(keys.token(token));
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
      await this.db.hmset(keys.token(token), info);
      await this.db.set(keys.openId(openId), token);
    }
    await this.db.pexpire(keys.openId(openId), config.tokenExpires);
    await this.db.pexpire(keys.token(token), config.tokenExpires);

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
