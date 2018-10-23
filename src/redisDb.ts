import * as redis from "redis";
import { EventEmitter } from "events";
import { promisify } from "util";
import config from "./config";
import utils from "./utils";

// 数据库状态
enum eStatus {
  open,
  close
}

let { port, host } = config.redis;
class RedisDb extends EventEmitter {
  db: redis.RedisClient;
  status: eStatus;

  private static ins: RedisDb;

  static async getIns(): Promise<RedisDb> {
    let ins = (RedisDb.ins = RedisDb.ins || new RedisDb());
    if (ins.status === eStatus.close) {
      ins.connect();
    }
    return ins;
  }

  private constructor() {
    super();
    this.connect();
    this.db.on("error", () => {
      this.connect();
    });
  }

  connect() {
    this.db = redis.createClient(port, host);
    this.status = eStatus.open;

    this.db.once("connect", () => {
      console.log("redis client connect");
      this.emit("connect");
    });
  }

  get(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(value);
      });
    });
  }

  set(key: string, value: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.set(key, value, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  hgetall(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.hgetall(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  hmset(key: string, obj: {}): Promise<boolean> {
    obj = utils.flatObject(obj);
    // console.log(obj);
    return new Promise((resolve, reject) => {
      this.db.hmset(key, obj, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  hincrby(key: string, field: string, increment: number) {
    return new Promise((resolve, reject) => {
      this.db.hincrby(key, field, increment, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  exists(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.exists(key, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  smembers(key: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.smembers(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  // 添加元素到集合
  sadd(key: string, member: string | string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.sadd(key, member, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  // 从集合中移除元素
  srem(key: string, member: string | string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.srem(key, member, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  // 是否元素在集合中
  sismember(key: string, member: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.sismember(key, member, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  expire(key: string, sec: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.expire(key, sec, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  pexpire(key: string, ms: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.pexpire(key, ms, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  // 查找keys
  keys(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.keys(pattern, (err, keys) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(keys);
      });
    });
  }

  // 删除key
  del(keys: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!keys || keys.length === 0) {
        resolve(true);
        return;
      }
      this.db.del(...keys, (err, num) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(num === 1);
      });
    });
  }

  close(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // this.db.end(true);
      // this.db.on("end", () => {
      //   console.log("redis client close");
      //   resolve(true);
      // });
      this.db.quit();
      this.status = eStatus.close;
      resolve(true);
    });
  }
}

export default RedisDb;
