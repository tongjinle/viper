import assert = require("assert");
// import * as assert from 'assert';
import Database from "../db";
import GameService from "../service/gameService";

describe("game", () => {
  let db: Database;
  let gaService: GameService;

  let clearAll = async () => {
    await Promise.all(
      ["user", "upvote", "list", "reward"].map(async n => {
        await db.getCollection(n).deleteMany({});
      })
    );
  };

  before(async () => {
    db = await Database.getIns();
    gaService = await GameService.getIns();
  });

  beforeEach(async () => {
    await clearAll();
  });

  afterEach(async () => {});

  after(async () => {
    await db.close();
  });

  it("createUser", async () => {
    await db.getCollection("user").insertOne({});

    await gaService.createUser("zst", "zst");

    let data = await db.getCollection("user").findOne({ userId: "zst" });
    assert(
      data && data.userId === "zst" && data.point === 0 && data.coin === 0
    );
  });

  it("currentIndex", async () => {
    await db
      .getCollection("reward")
      .insertMany([{ index: 1 }, { index: 2 }, { index: 3 }]);

    let data = await gaService.currentIndex();
    assert(data === 3);
  });

  it("reward", async () => {
    // index, winnerId, upvoterId, reward.desc, reward.imgUrlList, reward.value
    await db
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
    await db
      .getCollection("user")
      .insertOne({ userId: "tong", username: "tong", point: 100 });
    await db.getCollection("list").insertMany([
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

    let usData = await db.getCollection("user").findOne({ userId: "tong" });
    assert(usData && usData.point === 90);

    let liData = await db.getCollection("list").findOne({ userId: "zst" });
    assert(liData && liData.count === 101);

    let upData = await db
      .getCollection("upvote")
      .findOne({ upvoterId: "tong" });
    assert(upData && upData.type === "point" && upData.cast === 10);
  });

  it("addPoint", async () => {
    await db
      .getCollection("user")
      .insertOne({ userId: "tong", username: "tong", point: 100 });

    await gaService.addPoint("tong", 10, 0, new Date());

    let data = await db.getCollection("user").findOne({ userId: "tong" });
    assert(data && data.point === 110);
  });

  it("myUpvote", async () => {
    await db
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
    console.log(data);
    assert(data.length == 2);
    assert(data.find(n => n._id === "zst").count == 3);
    assert(data.find(n => n._id === "xiao").count == 1);
  });

  it("myPoint", async () => {
    await db
      .getCollection("user")
      .insertOne({ userId: "tong", username: "tong", point: 100, coin: 200 });

    let data = await gaService.myPoint("tong");
    assert(data && data.point === 100 && data.coin === 200);
  });

  it("list", async () => {
    // insert data
    await db.getCollection("list").insertMany([
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
