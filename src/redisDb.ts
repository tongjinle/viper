import * as redis from "redis";
import { EventEmitter } from "events";
import { promisify } from "util";
import { resolve } from "path";

let port = 6379;
let host = "118.25.212.28";
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

  ins.close();
}

let client = new RedisDb();
test();

export default client;
