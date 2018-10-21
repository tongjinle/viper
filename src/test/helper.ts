import Database from "../db";
import TokenService from "../service/tokenService";
import axios from "axios";
import config from "../config";
import RedisDb from "../redisDb";

let db: Database;
let redisDb: RedisDb;
let clearAll = async () => {
  await open();
  await Promise.all(
    ["user", "upvote", "list", "reward", "memory"].map(async n => {
      await db.getCollection(n).deleteMany({});
    })
  );
};

let clearToken = async () => {
  await open();
  await db.getCollection("token").deleteMany({});
};

let open = async () => {
  db = await Database.getIns();
  redisDb = await RedisDb.getIns();
};

let close = async () => {
  await db.close();
  await redisDb.close();
};

let getAxios = async () => {
  // token service
  let service = await TokenService.getIns();
  let { token } = await service.bind(config.mockOpenId);
  return axios.create({
    baseURL: config.apiPrefix + ":" + config.port,
    headers: { token }
  });
};

export default {
  clearAll,
  open,
  close,

  // get axios instance
  // with token
  getAxios,

  // clean token
  clearToken
};
