import config from "../config";
import MongoDb from "../db";
import RedisDb from "../redisDb";
import * as keys from "../redisKeys";
import * as mongodb from "mongodb";
import IUserInfo from "./IUserInfo";
import CacheService from "./cacheService";

export default class CommonService {
  private static ins: CommonService;
  private mongoDb: MongoDb;
  private redisDb: RedisDb;

  static async getIns(): Promise<CommonService> {
    if (!CommonService.ins) {
      CommonService.ins = new CommonService();
    }
    return CommonService.ins;
  }

  constructor() {
    MongoDb.getIns().then(db => {
      this.mongoDb = db;
    });

    RedisDb.getIns().then(db => {
      this.redisDb = db;
    });
  }

  // create user
  async createUser(
    userId: string,
    username: string,
    point: number,
    coin: number,
    time: Date
  ): Promise<void> {
    let info = { userId, username, time, point, coin };
    // mongoDb
    // 这里的mongo需要await,因为后面的redis依赖它
    await this.mongoDb.getCollection("user").insertOne(info);

    // redisDb
    let key: string = keys.user(userId);
    {
      let service = await CacheService.getIns();
      await service.clearFlayKey(key);
      await service.cacheUser(userId);
    }
    await this.redisDb.hmset(key, {
      userId,
      username,
      time: time.getTime(),
      point,
      coin
    });
  }

  async setUserInfo(userId: string, info: Partial<IUserInfo>): Promise<void> {
    // mongoDb
    this.mongoDb.getCollection("user").updateOne({ userId }, { $set: info });

    // redisDb
    await this.redisDb.hmset(keys.user(userId), {
      userId,
      username: info.username,
      province: info.province,
      city: info.city,
      gender: info.gender,
      logoUrl: info.logoUrl
    });
  }
}
