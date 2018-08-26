import assert = require("assert");
import config from "../../config";
import helper from "../helper";
import axios, { AxiosInstance } from "axios";
import Database from "../../db";

describe("common.handle", () => {
  let db: Database;
  let token: string;
  let request: AxiosInstance;

  before(async () => {
    // db
    db = await Database.getIns();
    // axios
    await helper.clearToken();
    request = await helper.getAxios();
  });

  beforeEach(async () => {
    await helper.clearAll();
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
});
