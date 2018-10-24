// redis的缓存服务
import MongoDb from "../db";
import RedisDb from "../redisDb";
import * as keys from "../redisKeys";
import * as CONSTANT from "../constant";
import { POINT_CONVERSION_HYBRID } from "constants";

export default class CacheService {
  mongoDb: MongoDb;
  redisDb: RedisDb;
  private static ins;
  static async getIns(): Promise<CacheService> {
    if (!CacheService.ins) {
      let ins = (CacheService.ins = new CacheService());
      ins.mongoDb = await MongoDb.getIns();
      ins.redisDb = await RedisDb.getIns();
    }
    return CacheService.ins;
  }

  // 缓存当前的活动届数
  // 缓存时间定为1天
  async cacheCurrentIndex(currentDate: Date = new Date()) {
    let key: string = keys.currentIndex();
    let isCache: boolean = await this.redisDb.exists(key);
    if (!isCache) {
      let data = await this.mongoDb
        .getCollection("reward")
        .findOne({ status: 0, "rule.endTime": { $gte: currentDate } });

      let currentIndex = data ? data.index : -1;
      await this.redisDb.set(key, currentIndex);
      await this.redisDb.pexpire(key, CONSTANT.DAY);
    }
  }

  // 缓存奖励和规则
  // 缓存时间定为1天
  async cacheReward(index: number) {
    let key: string = keys.reward(index);
    let isCache: boolean = await this.redisDb.exists(keys.reward(index));
    if (!isCache) {
      let data = await this.mongoDb.getCollection("reward").findOne({ index });
      if (data) {
        // 处理_id
        data._id = data._id.toString();
      } else {
        data = { index, __isExists: false };
      }
      await this.redisDb.hmset(key, data);
      await this.redisDb.pexpire(key, CONSTANT.DAY);
    }
  }

  // 缓存某届所有的参赛者
  async cacheUperList(index: number) {
    let isCache: boolean = await this.redisDb.exists(keys.uperList(index));
    if (!isCache) {
      let list = await this.mongoDb
        .getCollection("list")
        .find({ index })
        .toArray();
      for (let i = 0; i < list.length; i++) {
        let uper = list[i];
        uper._id = uper._id.toString();
        let info = {
          index,
          userId: uper.userId,
          userName: uper.userName || "",
          count: uper.count
        };
        // 缓存参赛者基本信息
        await this.redisDb.hmset(keys.uper(index, uper.userId), info);
        await this.redisDb.pexpire(keys.uper(index, uper.userId), CONSTANT.DAY);

        // 缓存参赛者图片列表
        for (let j = 0; uper.photoList && j < uper.photoList.length; j++) {
          await this.redisDb.sadd(
            keys.uperPhotos(index, uper.userId),
            uper.photoList[j]
          );
        }
      }
    }
  }

  // 缓存当前活动的相关数据
  // 缓存时间定为一天
  // 相关数据包括'当前届数','当前比赛奖励和规则','当前参赛者信息列表'
  async cacheGame(
    index: number = -1,
    currentDate: Date = new Date()
  ): Promise<void> {
    await this.cacheCurrentIndex();

    let currentIndex: number = parseInt(
      await this.redisDb.get(keys.currentIndex())
    );

    index = index === -1 ? currentIndex : index;
    await this.cacheReward(index);
    await this.cacheUperList(index);
  }

  // 缓存用户数据
  // 缓存时间为1天
  async cacheUser(userId: string): Promise<void> {
    let key: string = keys.user(userId);
    let isExists: boolean = await this.redisDb.exists(key);

    if (!isExists) {
      let data = await this.mongoDb.getCollection("user").findOne({ userId });
      if (data) {
        data._id = data._id.toString();
      } else {
        data = {
          userId,
          __isExists: false
        };
      }
      await this.redisDb.hmset(key, data);
      await this.redisDb.pexpire(key, CONSTANT.DAY);
    }
  }
}
