import config from "../config";
import MongoDb from "../db";
import RedisDb from "../redisDb";
import * as keys from "../redisKeys";
import { ErrCode, IErr } from "../errCode";
import CacheService from "./cacheService";
import * as CONSTANT from "../constant";
import utils from "../utils";
import IGalleryItem from "./IGalleryItem";
import serveStatic = require("serve-static");
import { ObjectId } from "bson";

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
          username: uper.username,
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
    return JSON.parse(await this.redisDb.get(keys.reward(index)));
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
  async recordSign(userId: string, day: string) {
    await this.redisDb.set(keys.userSign(userId, day), "1");
  }

  // 记录转发(邀请)
  async recordInvite(userId: string, day: string) {
    {
      let service = await CacheService.getIns();
      await service.cacheUserInviteCount(userId, day);
    }
    await this.redisDb.incrby(keys.userInvite(userId, day), -1);
  }

  // 记录冠军
  async recordWinner(index: number, userId: string) {
    await this.redisDb.set(keys.winner(index), userId);
  }

  // add point
  async addPoint(userId: string, point: number, coin: number, time: Date) {
    await this.cacheUser(userId);

    await this.redisDb.hincrby(keys.user(userId), "point", point);

    await this.redisDb.hincrby(keys.user(userId), "coin", coin);
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
  async myAddPoint(userId: string, date: Date): Promise<IAddPoint> {
    let rst: IAddPoint;

    let day = utils.getDateString(date);

    {
      let service = await CacheService.getIns();
      await service.cacheUserInviteCount(userId, day);
    }

    let sign = (await this.redisDb.exists(keys.userSign(userId, day))) ? 0 : 1;
    let invite = parseInt(await this.redisDb.get(keys.userInvite(userId, day)));
    rst = {
      sign,
      invite
    };
    return rst;
  }

  // 检查是否已经到了临界热度,从而产生了冠军
  async checkWinner(index: number, userId: string): Promise<void> {
    {
      let service = await CacheService.getIns();
      service.cacheGame(index);
    }

    let uper = await this.redisDb.hgetall(keys.uper(index, userId));
    if (uper.count >= config.maxHot) {
      await this.redisDb.set(keys.winner(index), userId);
    }
  }

  async gallery(pageIndex: number, pageSize: number): Promise<IGalleryItem[]> {
    let rst: IGalleryItem[];

    rst = [];
    // cache gallery
    let service = await CacheService.getIns();
    await service.cacheGallery(pageIndex, pageSize);

    let idList: string[] = await this.redisDb.lrange(
      keys.galleryIdList(),
      pageIndex * pageSize,
      pageIndex * pageSize + pageSize - 1
    );
    for (let i = 0; i < idList.length; i++) {
      let key: string = keys.galleryItem(idList[i]);
      if (await this.redisDb.exists(key)) {
        let item = JSON.parse(await this.redisDb.get(key));
        rst.push({
          id: item._id,
          // 类型,'图片' | '视频'
          type: item.type,
          // 浏览量
          count: item.count,
          // 标题
          title: item.title,
          // logo图片的url
          logoUrl: item.logoUrl,
          // 资源url数组
          resource: item.resource,
          // 时间戳
          date: item.date
        });
      }
    }

    return rst;
  }

  // gallery浏览量计数
  async galleryCount(id: string): Promise<void> {
    // mongo
    {
      this.mongoDb
        .getCollection("gallery")
        .updateOne({ _id: new ObjectId(id) }, { $inc: { count: 1 } });
    }

    // redis
    {
      // 如果存在才更新
      let key: string = keys.galleryItem(id);
      if (!!(await this.redisDb.exists(key))) {
        let item: any = await this.redisDb.get(key);
        item = JSON.parse(item);
        item.count++;
        await this.redisDb.set(key, JSON.stringify(item));
      }
    }
  }
}
interface IAddPoint {
  sign: number;
  invite: number;
}
