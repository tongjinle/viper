import config from "../config";
import Database from "../db";
import * as mongodb from "mongodb";
import utils from "../utils";

interface IToken {
  token: string;
  openId: string;
  expires: number;
}

export default class MemoryService {
  private static ins: MemoryService;
  private static db: Database;

  static async getIns(): Promise<MemoryService> {
    let ins = (MemoryService.ins = MemoryService.ins || new MemoryService());
    MemoryService.db = await Database.getIns();
    return ins;
  }

  async write(key, value) {
    await MemoryService.db.getCollection("memory").updateOne(
      {
        key,
        ts: utils.getToday()
      },
      {
        $inc: {
          value
        }
      },
      {
        upsert: true
      }
    );
  }

  async read(key) {
    let data = await MemoryService.db.getCollection("memory").findOne({
      key,
      ts: utils.getToday()
    });
    return data ? data.value : 0;
  }

  // 清空
  async clear(): Promise<void> {
    await MemoryService.db.getCollection("memory").deleteMany({});
  }
}
