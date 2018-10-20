import * as redis from "redis";
import { EventEmitter } from "events";
import { promisify } from "util";
import config from "./config";

let { port, host } = config.redis;
class RedisDb extends EventEmitter {
  db: redis.RedisClient;

  constructor() {
    super();
    this.db = redis.createClient(port, host);
    this.db.on("connect", () => {
      console.log("redis client connect");
      this.emit("connent");
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
        console.log({ err, data });
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
        console.log(err, data);
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  hmset(key: string, obj: {}): Promise<boolean> {
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

  expire(key: string, ts: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.expire(key, ts, (err, num) => {
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
      this.db.end(true);
      this.db.on("end", () => {
        console.log("redis client close");
        resolve(true);
      });
    });
  }
}

async function test() {
  let ins = client;
  let isSetSuccess = await ins.set("number", Math.random().toString());
  console.log({ isSetSuccess });

  let value = await ins.get("number");
  console.log({ value });

  await ins.set("number2", parseFloat(value) + 5 + "");
  {
    await ins.hmset("person", { name: "zst", birth: 2002 });
    let value = await ins.hgetall("person");
    console.log("zst", value);
  }
  ins.close();
}

let client = new RedisDb();
// test();

export default client;
