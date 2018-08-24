import assert = require("assert");
import axios from "axios";
import config from "../../config";
import helper from "../helper";
import TokenService from "../../service/tokenService";
import Database from "../../db";

describe("common.handle", () => {
  let db: Database;
  let service: TokenService;
  let token;
  before(async () => {
    // db
    db = await Database.getIns();
    // token service
    service = await TokenService.getIns();
    token = await service.bind(config.mockOpenId);
    // axios
    axios.defaults.baseURL = config.apiPrefix + ":" + config.port;
    axios.defaults.headers = { token };
  });

  beforeEach(async () => {
    await helper.clearAll();
  });

  after(async () => {
    await helper.close();
  });

  it("createUser", async () => {
    let res = await axios.post("/common/createUser", {
      username: "tongpuman"
    });

    assert.deepEqual(res.data, {});
  });
});
