import config from "../config";
import MongoDb from "../db";
import RedisDb from "../redisDb";
import * as keys from "../redisKeys";
import * as mongodb from "mongodb";

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
    this.mongoDb.getCollection("user").insertOne(info);

    // redisDb
    await this.redisDb.hmset(keys.user(userId), {
      userId,
      username,
      time: time.getTime(),
      point,
      coin
    });
  }
}
