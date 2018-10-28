import * as express from "express";
import * as Protocol from "../protocol";
import config from "../config";

import CommonService from "../service/commonService";
import CheckService from "../service/checkService";
import serveStatic = require("serve-static");

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

    await service.createUser(
      userId,
      username,
      config.regPoint,
      config.regCoin,
      new Date()
    );

    resData = {};
    res.json(resData);
  });

  app.post("/common/setUserInfo", async (req, res) => {
    let resData: Protocol.IResSetUserInfo | Protocol.IResErr;
    let userId = req.headers["openId"] as string;
    let service = await CommonService.getIns();
    // check
    {
      let service = await CheckService.getIns();
      let err = await service.canSetUserInfo(userId, req.body);
      if (err) {
        res.json(err);
        return;
      }
    }

    await service.setUserInfo(userId, req.body);

    resData = {};
    res.json(resData);
  });
}
