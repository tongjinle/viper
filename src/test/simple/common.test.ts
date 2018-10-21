import assert = require("assert");
import Database from "../../db";
import CommonService from "../../service/commonService";
import helper from "../helper";

describe("common", () => {
  let db: Database;
  let coService: CommonService;

  let clearAll = async () => {
    await helper.clearAll();
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
    await helper.close();
  });

  it("createUser", async () => {
    await db.getCollection("user").insertOne({});
    await coService.createUser("zst", "zst", 0, 0, new Date());
    let data = await db.getCollection("user").findOne({ userId: "zst" });
    assert(
      data && data.userId === "zst" && data.point === 0 && data.coin === 0
    );
  });
});
