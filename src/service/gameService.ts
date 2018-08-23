import config from "../config";
import Database from "../db";
import * as mongodb from "mongodb";

interface IToken {
  token: string;
  openId: string;
  expires: number;
}

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

  // create user
  async createUser(userId: string, username: string): Promise<void> {
    await GameService.db
      .getCollection("user")
      .insertOne({ userId, username, point: 0, coin: 0 });
  }

  // game current index
  async currentIndex(): Promise<number> {
    let data = await GameService.db
      .getCollection("reward")
      .find({})
      .sort({ index: -1 })
      .limit(1)
      .toArray();
    return data[0].index;
  }

  // game list
  async list(index: number): Promise<any> {
    // fields:
    // [index,userId,userName,photoList,count]
    return await GameService.db.getCollection("list").find({ index }).toArray();
  }

  // game result
  async reward(index: number): Promise<any> {
    // fields:
    // [index,winnerId,upvoterId,reward.desc,reward.imgUrlList,reward.value]
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

    // todo
  }

  // add point
  async addPoint(userId: string, point: number, coin: number, time: Date) {
    await GameService.db
      .getCollection("user")
      .updateOne({ userId }, { $inc: { point, coin } });
  }

  // my upvote
  async myUpvote(index: number, userId: string): Promise<any> {
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
