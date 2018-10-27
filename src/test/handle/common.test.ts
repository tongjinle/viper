import assert = require("assert");
import config from "../../config";
import helper from "../helper";
import axios, { AxiosInstance } from "axios";
import MongoDb from "../../db";
import RedisDb from "../../redisDb";

describe("common.handle", () => {
  let redisDb: RedisDb;
  let mongoDb: MongoDb;
  let token: string;
  let request: AxiosInstance;

  before(async () => {
    // db
    mongoDb = await MongoDb.getIns();
    redisDb = await RedisDb.getIns();
  });

  beforeEach(async () => {
    await helper.clearAll();
    request = await helper.getAxios();
  });

  after(async () => {
    await helper.close();
  });

  it("createUser", async () => {
    let res = await request.post("/common/createUser", {
      username: "tongpuman"
    });

    assert.deepEqual(res.data, {});
  });

  it("reuse token", async () => {
    let request = await helper.getAxios();
    let res;
    let tokens: string[];
    let tokens2: string[];

    res = await request.post("/common/createUser", {
      username: "tongpuman"
    });

    tokens = await redisDb.keys("token#*");
    res = await request.post("/common/createUser", {
      username: "tongpuman2"
    });
    tokens2 = await redisDb.keys("token#*");

    assert.deepEqual(tokens, tokens2);
  });
});
