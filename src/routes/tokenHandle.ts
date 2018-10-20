import * as express from "express";
import * as Protocol from "../protocol";
import config from "../config";
import TokenService from "../service/tokenService";
import axios from "axios";
import { ErrCode } from "../errCode";
import wx from "../wx";
import CommonService from "../service/commonService";
import CheckService from "../service/checkService";

export default function handle(app: express.Express) {
  app.get("/getToken", async (req, res) => {
    let resData: Protocol.IResToken | Protocol.IResErr;
    let code: number = undefined;
    let cliCode = (req.query as Protocol.IReqToken).code;

    let openId = await wx.getOpenId(cliCode);

    // 获取openId失败
    if (!openId) {
      code = 0;
      resData = ErrCode.getOpenIdFail;
      res.json(resData);
      return;
    }

    // 尝试把openId插入到user表
    {
      // check
      {
        let service = await CheckService.getIns();
        let err = await service.canCreateUser(openId);
        if (!err) {
          let service = await CommonService.getIns();
          let { regCoin, regPoint } = config;
          await service.createUser(openId, "", regPoint, regCoin, new Date());
        }
      }
    }

    let service = await TokenService.getIns();
    let { token, expires } = await service.bind(openId);
    resData = { token, expires };
    res.json(resData);
  });
}
