import assert = require("assert");
import axios from "axios";
import config from "../../config";

describe("demo.handle", () => {
  before(() => {
    axios.defaults.baseURL = config.apiPrefix + ":" + config.port;
  });
  it("test", async () => {
    let res = await axios.get("/test");
    assert(res.data === "hello world");
  });
});
