import assert = require("assert");
import Database from "../../db";
import CommonService from "../../service/commonService";

describe("game", () => {
  let db: Database;
  let coService: CommonService;

  let clearAll = async () => {
    await Promise.all(
      ["user", "upvote", "list", "reward"].map(async n => {
        await db.getCollection(n).deleteMany({});
      })
    );
  };

  before(async () => {
    db = await Database.getIns();
    coService = await CommonService.getIns();
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

    await coService.createUser("zst", "zst");

    let data = await db.getCollection("user").findOne({ userId: "zst" });
    assert(
      data && data.userId === "zst" && data.point === 0 && data.coin === 0
    );
  });
});
