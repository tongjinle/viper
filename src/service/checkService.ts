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
    rst = await this.isCurrentIndex(index);
    return rst;
  }

  async isCurrentIndex(index: number): Promise<IErr> {
    if (index == -1) {
      return ErrCode.invalidCurrentIndex;
    }
  }
}
