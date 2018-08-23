import * as express from "express";
import * as Protocol from "../protocol";

import CommonService from "../service/commonService";

export default function handle(app: express.Express) {
  app.post("/common/createUser", async (req, res) => {
    let resData: Protocol.IResCreateUser | Protocol.IResErr;
    let { username } = req.body;
    let userId = req.header("openId");

    let service = await CommonService.getIns();
    await service.createUser(userId, username);

    resData = {};
    res.json(resData);
  });
}
