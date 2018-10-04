import config from "../config";
import Database from "../db";
import * as mongodb from "mongodb";

interface IToken {
  token: string;
  openId: string;
  expires: number;
}

export default class TokenService {
  private coll: mongodb.Collection;

  private static ins: TokenService;

  static async getIns(): Promise<TokenService> {
    let ins = (TokenService.ins = TokenService.ins || new TokenService());
    let db = await Database.getIns();
    ins.coll = db.getCollection("token");
    return ins;
  }

  // 查找token对应的信息
  async getInfo(token: string): Promise<IToken> {
    let rst: IToken;
    rst = await this.coll.findOne({ token });
    return rst;
  }

  async getInfoByOpenId(openId: string): Promise<IToken> {
    let rst: IToken;
    rst = await this.coll.findOne({ openId });
    return rst;
  }

  // 检测token有效性
  async check(token: string): Promise<boolean> {
    // return this.dict[token] && this.dict[token].expires > Date.now();
    let data: IToken = await this.getInfo(token);
    return !!(data && data.expires >= Date.now());
  }

  // 绑定openId,生成token
  async bind(openId: string): Promise<string> {
    const maxAge = config.tokenExpires;
    let expires = Date.now() + maxAge;

    if (openId === undefined) {
      return undefined;
    }
    // 使用缓存的未过期的token
    {
      let data = await this.getInfoByOpenId(openId);
      if (data) {
        let expires = Date.now() + maxAge;
        await this.coll.findOneAndUpdate(
          { openId },
          { $set: { expires: expires } }
        );
        return data.token;
      }
    }
    // 创建token
    let token: string = Math.floor(10e8 * Math.random())
      .toString(16)
      .slice(0, 8);
    await this.coll.insertOne({ token, openId, expires });
    return token;
  }

  // 清空
  async clear(): Promise<void> {
    await this.coll.deleteMany({});
  }
}
