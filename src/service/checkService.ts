import MongoDb from "../db";
import { ErrCode, IErr } from "../errCode";
import RedisDb from "../redisDb";
import * as keys from "../redisKeys";
import CacheService from "./cacheService";
import config from "../config";

export default class CheckService {
  private static ins: CheckService;
  private mongoDb: MongoDb;
  private redisDb: RedisDb;

  static async getIns(): Promise<CheckService> {
    if (!CheckService.ins) {
      CheckService.ins = new CheckService();
    }
    return CheckService.ins;
  }

  constructor() {
    MongoDb.getIns().then(db => {
      this.mongoDb = db;
    });

    RedisDb.getIns().then(db => {
      this.redisDb = db;
    });
  }

  // 能否创建一个user
  // userId是唯一的
  async canCreateUser(userId: string): Promise<IErr> {
    let rst: IErr;
    let user = this.findUser(userId);
    if (user) {
      rst = ErrCode.userExists;
    }
    return rst;
  }

  // 获取用户信息
  async findUser(userId: string): Promise<any> {
    // 缓存用户
    await this.cacheUser(userId);

    let key = keys.user(userId);
    return await this.redisDb.hgetall(key);
  }

  // username正则检验
  async checkUsername(username: string): Promise<IErr> {
    let rst: IErr;
    // TODO
    return rst;
  }

  // 能否打榜
  async canUpvote(
    index: number,
    userId: string,
    upvoterId: string,
    type: string,
    cast: number
  ): Promise<IErr> {
    let rst: IErr;

    // 第index届比赛是不是还在进行中

    // userId 是不是存在
    // upvoterId 是不是存在
    // type 是不是合法
    // upvoter是不是有足够的cast
    let arr = [
      () => this.checkCurrentIndex(index),
      () => this.checkUperIdExists(index, userId),
      () => this.checkUpvoterIdExists(upvoterId),
      () => this.checkUpvoteType(type, userId, cast),
      () => this.checkUpvotePoint(type, upvoterId, cast)
    ];
    for (let i = 0; i < arr.length; i++) {
      rst = await arr[i]();
      if (rst) {
        return rst;
      }
    }
  }

  // 正确的当前index
  async checkCurrentIndex(index: number): Promise<IErr> {
    if (index == -1) {
      return ErrCode.invalidCurrentIndex;
    }
  }

  // 检测up主是否存在
  async checkUperIdExists(index: number, userId: string): Promise<IErr> {
    let uper;
    // uper= await this.mongoDb.getCollection("list").findOne({
    //   index,
    //   userId
    // });

    let key: string = keys.uper(index, userId);
    uper = await this.redisDb.hgetall(key);

    // console.log(uper);

    if (!uper) {
      return ErrCode.invalidUperId;
    }
  }

  // 检测打榜的用户是否存在
  async checkUpvoterIdExists(userId: string): Promise<IErr> {
    let rst: IErr;
    let user = this.findUser(userId);
    if (!user) {
      rst = ErrCode.invalidUperId;
    }
    return rst;
    // let upvoter = await this.mongoDb.getCollection("user").findOne({ userId });
    // if (!upvoter) {
    //   return ErrCode.invalidUpvoterId;
    // }
  }

  // 检测是否是合法的打榜
  async checkUpvoteType(
    type: string,
    userId?: string,
    cast?: number
  ): Promise<IErr> {
    if (!(["point"].indexOf(type) >= 0)) {
      return ErrCode.invalidUpvoteType;
    }
  }

  // 检测是否有足够point(或者coin)
  async checkUpvotePoint(
    type: string,
    userId?: string,
    cast?: number
  ): Promise<IErr> {
    let user = await this.findUser(userId);
    // let upvoter = await this.mongoDb.getCollection("user").findOne({ userId });
    if (type === "point" && user.point < cast) {
      return ErrCode.notEnoughPoint;
    }
  }

  // 是否可以增加point
  // sign 签到
  // invite 转发
  async canAddPoint(
    userId: string,
    day: string,
    type: "sign" | "money" | "invite"
  ): Promise<IErr> {
    let rst: IErr;

    if ("sign" === type) {
      let isExists = await this.redisDb.exists(keys.userSign(userId, day));
      if (isExists) {
        rst = ErrCode.signAgain;
      }
    } else if ("invite" === type) {
      let count: number = parseInt(
        await this.redisDb.get(keys.userInvite(userId, day))
      );

      if (count && count > config.inviteCount) {
        rst = ErrCode.inviteTooMuch;
      }
    }

    return rst;
  }

  private async cacheUser(userId: string) {
    let service = await CacheService.getIns();
    await service.cacheUser(userId);
  }
}
