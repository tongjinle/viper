import config from "../config";
import Database from "../db";
import { ErrCode, IErr } from "../errCode";
import { Db } from "mongodb";

export default class CheckService {
  private static ins: CheckService;
  private static db: Database;

  static async getIns(): Promise<CheckService> {
    if (!CheckService.ins) {
      CheckService.ins = new CheckService();
      CheckService.db = await Database.getIns();
    }
    return CheckService.ins;
  }

  // create user
  async canCreateUser(userId: string, username: string): Promise<IErr> {
    let rst: IErr;
    rst =
      (await this.isUserExists(userId)) || (await this.checkUsername(username));
    return rst;
  }

  async isUserExists(userId: string): Promise<IErr> {
    let rst: IErr;
    if (await CheckService.db.getCollection("user").findOne({ userId })) {
      rst = ErrCode.userExists;
    }
    return rst;
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
    let uper = await CheckService.db.getCollection("list").findOne({
      index,
      userId
    });
    console.log(uper);
    if (!uper) {
      return ErrCode.invalidUperId;
    }
  }

  // 检测打榜的用户是否存在
  async checkUpvoterIdExists(userId: string): Promise<IErr> {
    let upvoter = await CheckService.db
      .getCollection("user")
      .findOne({ userId });
    if (!upvoter) {
      return ErrCode.invalidUpvoterId;
    }
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
    let upvoter = await CheckService.db
      .getCollection("user")
      .findOne({ userId });
    console.log(upvoter, cast);
    if (type === "point" && upvoter.point < cast) {
      return ErrCode.notEnoughPoint;
    }
  }
}
