import assert = require("assert");
import config from "../../config";
import helper from "../helper";
import Database from "../../db";
import { AxiosInstance } from "axios";
import * as Protocol from "../../protocol";
import { ErrCode } from "../../errCode";

let mockOpenId = config.mockOpenId;

describe("common.handle", () => {
  let db: Database;
  let request: AxiosInstance;
  before(async () => {
    // db
    db = await Database.getIns();
  });

  beforeEach(async () => {
    await helper.clearAll();
    // axios
    await helper.clearToken();
    request = await helper.getAxios();
  });

  after(async () => {
    await helper.close();
  });

  it("upvote", async () => {
    await db.getCollection("reward").insertOne({
      index: 1,
      status: 0
    });

    await db
      .getCollection("list")
      .insertMany([
        { index: 1, userId: "zst", username: "zst" },
        { index: 1, userId: "xiao", username: "xiao" }
      ]);

    await db.getCollection("user").insertMany([
      {
        userId: config.mockOpenId,
        username: config.mockOpenId,
        point: 100,
        coin: 0
      }
    ]);

    // 合法
    {
      let reqData: Protocol.IReqUpvote = {
        userId: "zst",
        type: "point",
        cast: 10
      };
      let res = await request.post("/game/upvote", reqData);

      assert.deepEqual(res.data, {});
    }
  });

  // upvote-不存在的index
  it("upvote-invalidIndex", async () => {
    {
      let reqData: Protocol.IReqUpvote = {
        userId: "zst",
        type: "point",
        cast: 10
      };
      let res = await request.post("/game/upvote", reqData);

      assert(res.data.code === ErrCode.invalidCurrentIndex.code);
    }
  });

  // 不存在的up主
  it("upvote-invalidUperId", async () => {
    await db.getCollection("reward").insertOne({
      index: 1,
      status: 0
    });

    await db
      .getCollection("list")
      .insertMany([
        { index: 1, userId: "zst", username: "zst" },
        { index: 1, userId: "xiao", username: "xiao" }
      ]);

    await db.getCollection("user").insertMany([
      {
        userId: config.mockOpenId,
        username: config.mockOpenId,
        point: 100,
        coin: 0
      }
    ]);

    {
      let reqData: Protocol.IReqUpvote = {
        userId: "none",
        type: "point",
        cast: 10
      };
      let res = await request.post("/game/upvote", reqData);

      assert(res.data.code === ErrCode.invalidUperId.code);
    }
  });

  // 不存在的upvoter
  it("upvote-invalidUpvoterId", async () => {
    await db.getCollection("reward").insertOne({
      index: 1,
      status: 0
    });

    await db
      .getCollection("list")
      .insertMany([
        { index: 1, userId: "zst", username: "zst" },
        { index: 1, userId: "xiao", username: "xiao" }
      ]);

    await db.getCollection("user").insertMany([
      {
        userId: "none",
        username: "none",
        point: 100,
        coin: 0
      }
    ]);

    {
      let reqData: Protocol.IReqUpvote = {
        userId: "zst",
        type: "point",
        cast: 10
      };
      let res = await request.post("/game/upvote", reqData);

      assert(res.data.code === ErrCode.invalidUpvoterId.code);
    }
  });

  // upvoter的消费方式不对
  it("upvote-invalidUpvoteType", async () => {
    await db.getCollection("reward").insertOne({
      index: 1,
      status: 0
    });

    await db
      .getCollection("list")
      .insertMany([
        { index: 1, userId: "zst", username: "zst" },
        { index: 1, userId: "xiao", username: "xiao" }
      ]);

    await db.getCollection("user").insertMany([
      {
        userId: config.mockOpenId,
        username: config.mockOpenId,
        point: 100,
        coin: 0
      }
    ]);

    {
      let reqData /* : Protocol.IReqUpvote */ = {
        userId: "zst",
        type: "none",
        cast: 10
      };
      let res = await request.post("/game/upvote", reqData);

      assert(res.data.code === ErrCode.invalidUpvoteType.code);
    }
  });

  // upvoter的point不够
  it("upvote-notEnoughPoint", async () => {
    await db.getCollection("reward").insertOne({
      index: 1,
      status: 0
    });

    await db
      .getCollection("list")
      .insertMany([
        { index: 1, userId: "zst", username: "zst" },
        { index: 1, userId: "xiao", username: "xiao" }
      ]);

    await db.getCollection("user").insertMany([
      {
        userId: config.mockOpenId,
        username: config.mockOpenId,
        point: 100,
        coin: 0
      }
    ]);

    {
      let reqData: Protocol.IReqUpvote = {
        userId: "zst",
        type: "point",
        cast: 10000
      };
      let res = await request.post("/game/upvote", reqData);

      assert(res.data.code === ErrCode.notEnoughPoint.code);
    }
  });

  it("list", async () => {
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
        count: 0
      },
      {
        index: 1,
        userId: "xiao",
        username: "xiao",
        photoList: [
          "xiao01.jpg",
          "xiao02.jpg",
          "xiao03.jpg",
          "xiao04.jpg",
          "xiao05.jpg",
          "xiao06.jpg"
        ],
        count: 15
      }
    ]);

    let reqData: Protocol.IReqList = {
      index: 1
    };
    let res = (await request.get("/game/list", {
      params: reqData
    })) as { data: Protocol.IResList };

    assert(res.data.list.length == 2);
    assert(res.data.list.find(n => n.userId === "zst").photoList.length == 3);
    assert(res.data.list.find(n => n.userId === "xiao").photoList.length == 4);
  });

  it("addPoint-fail", async () => {
    let res = await request.post("/game/addPoint", {
      type: "invalidType",
      cast: 100
    });
    assert(res.data.code === ErrCode.invalidAddPointType.code);
  });

  it("addPoint", async () => {
    await db
      .getCollection("user")
      .insertOne({ userId: mockOpenId, point: 0, coin: 0 });

    {
      let reqData: Protocol.IReqAddPoint = {
        type: "sign"
      };
      let res = (await request.post("/game/addPoint", reqData)) as {
        data: Protocol.IResAddPoint;
      };

      assert(res.data.point === 1);
      assert(res.data.coin === 0);
    }

    {
      let reqData: Protocol.IReqAddPoint = {
        type: "money",
        cast: 5
      };
      let res = (await request.post("/game/addPoint", reqData)) as {
        data: Protocol.IResAddPoint;
      };

      assert(res.data.point === 0);
      assert(res.data.coin === 50);
    }
  });

  it("myUpvote", async () => {
    await db
      .getCollection("upvote")
      .insertMany([
        { index: 1, userId: "zst", count: 100, upvoterId: mockOpenId },
        { index: 1, userId: "zst", count: 10, upvoterId: mockOpenId },
        { index: 1, userId: "xiao", count: 200, upvoterId: mockOpenId }
      ]);
    let res = (await request.get("/game/myUpvote", {
      params: { index: 1 }
    })) as {
      data: Protocol.IResMyUpvote;
    };

    assert(res.data.upvoteList.length === 2);
    assert(res.data.upvoteList.find(n => n.userId === "zst").count === 110);
    assert(res.data.upvoteList.find(n => n.userId === "xiao").count === 200);
  });

  it("myPoint", async () => {
    await db.getCollection("user").insertOne({
      userId: config.mockOpenId,
      username: config.mockOpenId,
      point: 100,
      coin: 200
    });

    let res = (await request.get("/game/myPoint")) as {
      data: Protocol.IResMyPoint;
    };

    assert(res.data.coin === 200);
    assert(res.data.point === 100);
  });
});
