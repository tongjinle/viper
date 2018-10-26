import * as express from "express";
import * as Protocol from "../protocol";
import config from "../config";
import GameService from "../service/gameService";
import { ErrCode } from "../errCode";
import utils from "../utils";
import { Db } from "mongodb";
import Database from "../db";
import CheckService from "../service/checkService";
import MemoryService from "../service/memoryService";
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from "constants";

export default function handle(app: express.Express) {
  app.get("/game/currentIndex", async (req, res) => {
    let resData: Protocol.IResCurrentIndex | Protocol.IResErr;
    let service = await GameService.getIns();
    let index = await service.currentIndex();
    resData = { index };
    res.json(resData);
  });

  app.get("/game/list", async (req, res) => {
    let resData: Protocol.IResList;
    let { index } = req.query as Protocol.IReqList;
    index = index - 0;
    console.log({ index });
    let service = await GameService.getIns();

    let data = await service.list(index);

    resData = {
      list: data.map(n => {
        let openCount = 0;
        config.photoOpen.find((nn, i) => {
          if (n.count >= nn) {
            openCount = i + 1;
          } else {
            return true;
          }
        });
        return {
          userId: n.userId,
          username: n.username,
          photoList: n.photoList.slice(0, openCount),
          count: n.count
        };
      })
    };

    console.log(resData);

    res.json(resData);
  });

  app.get("/game/reward", async (req, res) => {
    let resData: Protocol.IResReward | Protocol.IResErr;
    let service = await GameService.getIns();
    let { index } = req.query as Protocol.IReqReward;
    index = index - 0;

    let data = await service.reward(index);
    resData = data;

    if (resData) {
      // 这些游戏数据暂时来自config文件
      (resData as Protocol.IResReward).rule = {
        ...(resData as Protocol.IResReward).rule,
        hotIntervalList: config.photoOpen,
        inviteCount: config.inviteCount,
        signCount: config.signCount
      };
    }
    console.log({ index, resData });

    res.json(resData);
  });

  app.post("/game/upvote", async (req, res) => {
    let resData: Protocol.IResUpvote | Protocol.IResErr;
    let service = await GameService.getIns();
    let { userId, type, cast } = req.body as Protocol.IReqUpvote;
    let upvoterId = req.headers["openId"] as string;

    let index = await service.currentIndex();
    {
      let service = await CheckService.getIns();
      let err = await service.canUpvote(index, userId, upvoterId, type, cast);
      if (err) {
        res.json(err);
        return;
      }
    }

    let count = utils.calCount(type, cast);
    let time = new Date();
    await service.upvote(index, userId, upvoterId, type, cast, count, time);
    resData = {};
    res.json(resData);
  });

  app.post("/game/addPoint", async (req, res) => {
    let resData: Protocol.IResAddPoint | Protocol.IResErr;
    let service = await GameService.getIns();
    let userId = req.headers["openId"] as string;

    let { type, cast = 0 } = req.body as Protocol.IReqAddPoint;
    let { point, coin } = utils.calPoint(type, cast);
    let time = new Date();

    let err;
    {
      let service = await CheckService.getIns();
      let day = utils.getTodayString();
      err = await service.canAddPoint(userId, day, type);
    }
    if (err) {
      res.json(err);
      return;
    }

    {
      let day: string = utils.getTodayString();
      if (type === "sign") {
        await service.recordSign(userId, day);
      } else if (type === "invite") {
        await service.recordInvite(userId, day);
      }
    }

    await service.addPoint(userId, point, coin, time);
    resData = {
      point,
      coin
    };
    res.json(resData);
  });

  app.get("/game/myUpvote", async (req, res) => {
    let resData: Protocol.IResMyUpvote | Protocol.IResErr;
    let service = await GameService.getIns();
    let userId = req.headers["openId"] as string;
    let { index } = req.query as Protocol.IReqMyUpvote;
    index = index - 0;
    let data = await service.myUpvote(index, userId);
    let upvoteList: { userId: string; count: number }[] = [];
    upvoteList = data.map(n => {
      return {
        userId: n._id,
        count: n.count
      };
    });
    resData = {
      upvoteList
    };
    res.json(resData);
  });

  app.get("/game/myPoint", async (req, res) => {
    let resData: Protocol.IResMyPoint | Protocol.IResErr;
    let service = await GameService.getIns();
    let userId = req.headers["openId"] as string;

    let data = await service.myPoint(userId);
    resData = {
      point: data.point,
      coin: data.coin
    };

    res.json(resData);
  });

  app.get("/game/myAddPoint", async (req, res) => {
    let resData: Protocol.IResMyAddPoint | Protocol.IResErr;
    let userId = req.headers["openId"] as string;

    let service = await GameService.getIns();
    let data = await service.myAddPoint(userId, new Date());

    resData = data;
    res.json(resData);
  });
}
