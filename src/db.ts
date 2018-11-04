import * as mongodb from "mongodb";
import config from "./config/index";
import * as Schema from "./schema";
// 数据库状态
enum eStatus {
  open,
  close
}

export default class Database {
  private connectStr: string;
  private dbName: string;
  private db: mongodb.MongoClient;
  private currDb: mongodb.Db;

  private status: eStatus;

  // 返回一个连接实例
  private static ins: Database;
  static async getIns(): Promise<Database> {
    if (!Database.ins) {
      Database.ins = new Database();
    }

    let ins: Database = Database.ins;
    if (ins.status == eStatus.close) {
      await ins.open();
    }

    return Database.ins;
  }

  private constructor() {
    this.connectStr = config.connectStr;
    this.dbName = config.dbName;
    this.status = eStatus.close;
  }

  async open() {
    this.db = await mongodb.MongoClient.connect(
      this.connectStr,
      {
        useNewUrlParser: true
      }
    );
    this.status = eStatus.open;
    // dbName
    let currDb = (this.currDb = this.db.db(this.dbName));
    //[name]是
    // this.[name]Collection = currDb.collection([name]);
  }

  async close() {
    await this.db.close();
    this.status = eStatus.close;
  }

  getCollection(name: string) {
    return this.currDb.collection(name);
  }
}
