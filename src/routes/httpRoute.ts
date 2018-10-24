import * as express from "express";

import config from "../config";
import loger from "../logIns";
import Database from "../db";
import TokerService from "../service/tokenService";

// 路由
import testHandle from "./testHandle";
import tokenHandle from "./tokenHandle";
import gameHandle from "./gameHandle";
import commonHandle from "./commonHandle";
import TokenService from "../service/tokenService";

// 错误
import { ErrCode } from "../errCode";
import { json } from "body-parser";

export default function handler(app: express.Express) {
  app.use(async (req, res, next) => {
    if (/\/game\/|\/common\//.test(req.path)) {
      let token: string = req.headers["token"] as string;

      let service = await TokenService.getIns();
      let checkRst = await service.check(token);
      console.log({ token, checkRst });
      console.log(JSON.stringify(token));
      if (!checkRst) {
        res.json(ErrCode.invalidToken);
        return;
      }
      let info = await service.getInfo(token);
      req.headers["openId"] = info.openId;
    }
    next();
  });

  // token
  tokenHandle(app);

  // 通用接口
  commonHandle(app);

  // game
  gameHandle(app);

  // 测试
  testHandle(app);
}
