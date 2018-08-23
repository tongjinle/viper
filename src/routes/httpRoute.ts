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
import errCode from "../errCode";

export default function handler(app: express.Express) {
  app.use(async (req, res, next) => {
    if (/\/game\//.test(req.path)) {
      let service = await TokenService.getIns();
      let token: string = req.headers["token"] as string;
      let info = await service.getInfo(token);
      let openId: string = (req.headers["openId"] = info.openId);

      if (!await service.check(token)) {
        res.json(errCode.invalidToken);
        return;
      }
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
