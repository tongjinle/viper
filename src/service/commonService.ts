import config from "../config";
import Database from "../db";
import * as mongodb from "mongodb";

export default class CommonService {
  private static ins: CommonService;
  private static db: Database;

  static async getIns(): Promise<CommonService> {
    if (!CommonService.ins) {
      CommonService.ins = new CommonService();
      CommonService.db = await Database.getIns();
    }
    return CommonService.ins;
  }

  // create user
  async createUser(userId: string, username: string): Promise<void> {
    await CommonService.db
      .getCollection("user")
      .insertOne({ userId, username, point: 0, coin: 0 });
  }
}
