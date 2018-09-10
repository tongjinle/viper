import * as express from "express";
import * as Protocol from "../protocol";

import CommonService from "../service/commonService";
import CheckService from "../service/checkService";

export default function handle(app: express.Express) {
  app.post("/common/createUser", async (req, res) => {
    let resData: Protocol.IResCreateUser | Protocol.IResErr;
    let { username } = req.body;
    let userId = req.headers["openId"] as string;

    let service = await CommonService.getIns();

    // check
    {
      let service = await CheckService.getIns();
      let err = await service.canCreateUser(userId);
      if (err) {
        res.json(err);
        return;
      }
    }

    await service.createUser(userId, username, new Date());

    resData = {};
    res.json(resData);
  });
}
