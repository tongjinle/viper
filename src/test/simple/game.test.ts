import assert = require("assert");
import MongoDb from "../../db";
import RedisDb from "../../redisDb";
import * as keys from "../../redisKeys";
import GameService from "../../service/gameService";
import helper from "../helper";

describe("game", () => {
  let mongoDb: MongoDb;
  let redisDb: RedisDb;
  let gaService: GameService;

  before(async () => {
    mongoDb = await MongoDb.getIns();
    redisDb = await RedisDb.getIns();
    gaService = await GameService.getIns();
  });

  beforeEach(async () => {
    await helper.clearAll();
  });

  afterEach(async () => {});

  after(async () => {
    await helper.close();
  });

  it("currentIndex", async () => {
    await mongoDb
      .getCollection("reward")
      .insertMany([
        { index: 1, status: 1 },
        { index: 2, status: 1 },
        { index: 3, status: 0, rule: { endTime: new Date(9999, 1, 1) } }
      ]);

    let data = await gaService.currentIndex();
    assert(data === 3);
  });

  it("reward", async () => {
    // index, winnerId, upvoterId, reward.desc, reward.photoList, reward.value
    await mongoDb
      .getCollection("reward")
      .insertMany([
        { index: 1, winnerId: "zst" },
        { index: 2, winnerId: "zst" },
        { index: 3 }
      ]);
    {
      let data = await gaService.reward(2);
      assert(data.index === 2 && data.winnerId === "zst");
    }
    {
      let data = await gaService.reward(3);
      assert(data.index === 3 && !data.winnerId);
    }
  });

  it("upvote", async () => {
    await mongoDb
      .getCollection("user")
      .insertOne({ userId: "tong", username: "tong", point: 100 });
    await mongoDb.getCollection("list").insertMany([
      {
        index: 1,
        userId: "zst",
        username: "zst",
        photoList: [
          "zst01.jpg",
          "zst02.jpg",
          "zst03.jpg",
          "zst04.jpg",
          "zst05.jpg",
          "zst06.jpg"
        ],
        count: 100
      }
    ]);

    await gaService.upvote(1, "zst", "tong", "point", 10, 1, new Date());

    // redis test
    {
      let usData = await redisDb.hgetall(keys.user("tong"));
      assert(usData && parseInt(usData.point) === 90);

      let upData = await redisDb.hgetall(keys.uper(1, "zst"));
      assert(upData && parseInt(upData.count) === 101);
    }
    // mongo test
    {
      await helper.delay();

      let usData = await mongoDb
        .getCollection("user")
        .findOne({ userId: "tong" });
      assert(usData && usData.point === 90);

      let liData = await mongoDb
        .getCollection("list")
        .findOne({ userId: "zst" });
      assert(liData && liData.count === 101);

      let upData = await mongoDb
        .getCollection("upvote")
        .findOne({ upvoterId: "tong" });
      assert(upData && upData.type === "point" && upData.cast === 10);
    }
  });

  it("addPoint", async () => {
    await mongoDb
      .getCollection("user")
      .insertOne({ userId: "tong", username: "tong", point: 100 });

    await gaService.addPoint("tong", 10, 0, new Date());

    // redis test
    {
      let usData = await redisDb.hgetall(keys.user("tong"));
      assert(usData && parseInt(usData.point) === 110);
    }

    // mongo test
    {
      await helper.delay();

      let data = await mongoDb
        .getCollection("user")
        .findOne({ userId: "tong" });
      assert(data && data.point === 110);
    }
  });

  it("myUpvote", async () => {
    await mongoDb
      .getCollection("upvote")
      .insertMany([
        { index: 1, userId: "zst", upvoterId: "tong", count: 1 },
        { index: 1, userId: "zst", upvoterId: "tong", count: 2 },
        { index: 1, userId: "xiao", upvoterId: "tong", count: 1 },
        { index: 2, userId: "zst", upvoterId: "tong", count: 1 },
        { index: 1, userId: "zst", upvoterId: "yu", count: 1 },
        { index: 1, userId: "xiao", upvoterId: "yu", count: 1 }
      ]);

    let data = await gaService.myUpvote(1, "tong");
    assert(data.length == 2);
    assert(data.find(n => n._id === "zst").count == 3);
    assert(data.find(n => n._id === "xiao").count == 1);
  });

  it("myPoint", async () => {
    await mongoDb
      .getCollection("user")
      .insertOne({ userId: "tong", username: "tong", point: 100, coin: 200 });

    let data = await gaService.myPoint("tong");
    assert(data && data.point === 100 && data.coin === 200);
  });

  it("list", async () => {
    // insert data
    await mongoDb.getCollection("list").insertMany([
      {
        index: 1,
        userId: "zst",
        username: "zst",
        photoList: [
          "zst01.jpg",
          "zst02.jpg",
          "zst03.jpg",
          "zst04.jpg",
          "zst05.jpg",
          "zst06.jpg"
        ],
        count: 100
      },
      {
        index: 1,
        userId: "sannian",
        username: "sannian",
        photoList: [
          "sannian01.jpg",
          "sannian02.jpg",
          "sannian03.jpg",
          "sannian04.jpg",
          "sannian05.jpg",
          "sannian06.jpg"
        ],
        count: 0
      },
      {
        index: 2,
        userId: "sannian",
        username: "sannian",
        photoList: [
          "sannian01.jpg",
          "sannian02.jpg",
          "sannian03.jpg",
          "sannian04.jpg",
          "sannian05.jpg",
          "sannian06.jpg"
        ],
        count: 1000
      }
    ]);

    let data = await gaService.list(1);

    assert(data.length === 2);
    assert(data.find(n => n.userId === "zst").photoList.length === 6);
    assert(data.find(n => n.userId === "sannian").photoList.length === 6);
  });
});
