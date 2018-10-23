import config from "../config";
import MongoDb from "../db";
import RedisDb from "../redisDb";
import * as keys from "../redisKeys";
import { ErrCode, IErr } from "../errCode";
import MemoryService from "./memoryService";
import CacheService from "./cacheService";
import * as CONSTANT from "../constant";
import serveStatic = require("serve-static");
export default class GameService {
  private static ins: GameService;
  private mongoDb: MongoDb;
  private redisDb: RedisDb;

  static async getIns(): Promise<GameService> {
    if (!GameService.ins) {
      GameService.ins = new GameService();
    }
    return GameService.ins;
  }

  constructor() {
    MongoDb.getIns().then(db => {
      this.mongoDb = db;
    });
    RedisDb.getIns().then(db => {
      this.redisDb = db;
    });
  }

  // 不输入index的时候,则缓存当前的活动
  async cacheGame(index?: number) {
    let service = await CacheService.getIns();
    await service.cacheGame(index);
  }

  // 获取当前活动的届数
  // 不存在活动返回-1
  async currentIndex(currentDate: Date = new Date()): Promise<number> {
    let rst: number;
    await this.cacheGame();
    rst = parseInt(await this.redisDb.get(keys.currentIndex()));
    return rst;
  }

  // game list
  async list(index: number): Promise<any[]> {
    let rst: any[];
    await this.cacheGame(index);

    rst = [];
    let uperKeys = await this.redisDb.keys(keys.uper(index, "*"));
    if (uperKeys && uperKeys.length) {
      for (let i = 0; i < uperKeys.length; i++) {
        let key = uperKeys[i];
        let uper = await this.redisDb.hgetall(key);
        // photoList
        let photoList: string[] = [];
        {
          let photoKey = keys.uperPhotos(index, uper.userId);
          photoList = await this.redisDb.smembers(photoKey);
        }

        let info: any = {
          index,
          userId: uper.userId,
          userName: uper.userName,
          photoList,
          count: uper.count
        };

        rst.push(info);
      }
    }
    return rst;

    // fields:
    // [index,userId,userName,photoList,count]
    // return await this.mongoDb
    //   .getCollection("list")
    //   .find({ index })
    //   .toArray();
  }

  // game result
  async reward(index: number): Promise<any> {
    // fields:
    // [index,winnerId,upvoterId,reward.desc,reward.photoList,reward.value]
    // return await this.mongoDb.getCollection("reward").findOne({ index });
    await this.cacheGame(index);
    return await this.redisDb.hgetall(keys.reward(index));
  }

  // 缓存用户数据
  // 缓存时间为1天
  async cacheUser(userId: string): Promise<void> {
    let service = await CacheService.getIns();
    await service.cacheUser(userId);
  }

  // upvote
  async upvote(
    // game届数
    index: number,
    // 参赛者id
    userId: string,
    // 打榜者id
    upvoterId: string,
    // 打榜类型
    // point 能量
    // coin 代币
    type: "point" | "coin",
    // 消耗
    cast: number,
    // 增加的热度
    count: number,
    // 打榜时间
    time: Date
  ): Promise<void> {
    // fields:
    // [index,userId,upvoterId,type,cast,count,time]

    // redisDb
    await this.cacheGame(index);
    await this.cacheUser(upvoterId);
    {
      // 热度增加
      await this.redisDb.hincrby(keys.uper(index, userId), "count", count);

      // 打榜者的消耗
      if (type === "point") {
        await this.redisDb.hincrby(keys.user(upvoterId), "point", -cast);
      }
    }

    // mongoDb
    {
      this.mongoDb
        .getCollection("upvote")
        .insertOne({ index, userId, upvoterId, type, count, cast, time });
      this.mongoDb
        .getCollection("list")
        .updateOne({ index, userId }, { $inc: { count } });

      if (type === "point") {
        this.mongoDb
          .getCollection("user")
          .updateOne({ userId: upvoterId }, { $inc: { point: -cast } });
      }
    }
  }

  // 记录签到
  async recordSign(userId: string, day: string) {}

  // 记录转发(邀请)
  async recordInvite(userId: string, day: string) {}

  // add point
  async addPoint(userId: string, point: number, coin: number, time: Date) {
    await this.cacheUser(userId);

    await this.redisDb.hincrby(keys.user(userId), "point", point);
    await this.redisDb.hincrby(keys.user(userId), "coint", coin);

    // mongoDb
    this.mongoDb
      .getCollection("user")
      .updateOne({ userId }, { $inc: { point, coin } });
  }

  // my upvote
  async myUpvote(index: number, userId: string): Promise<any[]> {
    let pipes = [];
    pipes.push({ $match: { index, upvoterId: userId } });
    pipes.push({
      $group: {
        _id: "$userId",
        count: { $sum: "$count" }
      }
    });
    let data = await this.mongoDb
      .getCollection("upvote")
      .aggregate(pipes)
      .toArray();
    return data;
  }

  // my point
  async myPoint(userId: string): Promise<{ point: number; coin: number }> {
    // fields:
    // [point,coin]
    {
      let service = await CacheService.getIns();
      await service.cacheUser(userId);

      let usData = await this.redisDb.hgetall(keys.user(userId));
      if (usData.__isExists !== false) {
        return { point: parseInt(usData.point), coin: parseInt(usData.coin) };
      } else {
        return undefined;
      }
    }
  }
}
