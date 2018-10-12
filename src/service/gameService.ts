import config from "../config";
import Database from "../db";
import { ErrCode, IErr } from "../errCode";
import MemoryService from "./memoryService";
export default class GameService {
  private static ins: GameService;
  private static db: Database;

  static async getIns(): Promise<GameService> {
    if (!GameService.ins) {
      GameService.ins = new GameService();
      GameService.db = await Database.getIns();
    }
    return GameService.ins;
  }

  // game current index
  //
  async currentIndex(currentDate: Date = new Date()): Promise<number> {
    let data = await GameService.db
      .getCollection("reward")
      .findOne({ status: 0, "rule.endTime": { $gte: currentDate } });
    return data ? data.index : -1;
  }

  // game list
  async list(index: number): Promise<any> {
    // fields:
    // [index,userId,userName,photoList,count]
    return await GameService.db
      .getCollection("list")
      .find({ index })
      .toArray();
  }

  // game result
  async reward(index: number): Promise<any> {
    // fields:
    // [index,winnerId,upvoterId,reward.desc,reward.photoList,reward.value]
    return await GameService.db.getCollection("reward").findOne({ index });
  }

  // upvote
  async upvote(
    index: number,
    userId: string,
    upvoterId: string,
    type: "point" | "coin",
    cast: number,
    count: number,
    time: Date
  ): Promise<void> {
    // fields:
    // [index,userId,upvoterId,type,cast,count,time]
    await GameService.db
      .getCollection("upvote")
      .insertOne({ index, userId, upvoterId, type, count, cast, time });
    await GameService.db
      .getCollection("list")
      .updateOne({ index, userId }, { $inc: { count } });

    if (type === "point") {
      await GameService.db
        .getCollection("user")
        .updateOne({ userId: upvoterId }, { $inc: { point: -cast } });
    }
  }

  // add point
  async addPoint(userId: string, point: number, coin: number, time: Date) {
    await GameService.db
      .getCollection("user")
      .updateOne({ userId }, { $inc: { point, coin } });
  }

  async canAddPoint(
    userId: string,
    type: "sign" | "money" | "invite"
  ): Promise<IErr> {
    let rst: IErr;

    // 是否是合法的类型
    let isVaildType = ["sign", "money", "invite"].indexOf(type) >= 0;
    if (!isVaildType) {
      rst = ErrCode.invalidAddPointType;
      return rst;
    }

    let now: Date;
    {
      now = new Date();
      now.setHours(0, 0, 0, 0);
    }

    let service = await MemoryService.getIns();
    // 签到每天只能1次
    if (type === "sign") {
      let data = await service.read(userId + "addPoint.sign");
      if (data === 1) {
        rst = ErrCode.signAgain;
        return rst;
      }
    }

    // 转发每天只能10次
    else if (type === "invite") {
      let data = await service.read(userId + "addPoint.invite");
      if (data === 10) {
        rst = ErrCode.inviteTooMuch;
        return rst;
      }
    }

    return rst;
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
    let data = await GameService.db
      .getCollection("upvote")
      .aggregate(pipes)
      .toArray();
    return data;
  }

  // my point
  async myPoint(userId: string): Promise<any> {
    // fields:
    // [point,coin]
    return await GameService.db.getCollection("user").findOne({ userId });
  }
}
