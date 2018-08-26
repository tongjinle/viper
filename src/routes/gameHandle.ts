import * as express from "express";
import * as Protocol from "../protocol";
import config from "../config";
import GameService from "../service/GameService";
import { ErrCode } from "../errCode";
import utils from "../utils";
import { setServers } from "dns";
import { serveStatic } from "serve-static";
import { Db } from "mongodb";
import Database from "../db";

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

    let data = await service.reward(index);
    resData = data;

    res.json(resData);
  });

  app.post("/game/upvote", async (req, res) => {
    let resData: Protocol.IResUpvote | Protocol.IResErr;
    let service = await GameService.getIns();
    let { userId, type, cast } = req.body as Protocol.IReqUpvote;
    let upvoterId = req.headers["openId"] as string;

    let index = await service.currentIndex();
    // TODO
    // 判断能否upvote
    let err = await service.canUpvote(index, userId, upvoterId, type, cast);
    if (err) {
      res.json(err);
      return;
    }

    let count = utils.calCount(type, cast);
    let time = new Date();
    await service.upvote(index, userId, upvoterId, type, cast, count, time);

    res.json(resData);
  });

  app.post("/game/addPoint", async (req, res) => {
    let resData: Protocol.IResAddPoint | Protocol.IResErr;
    let service = await GameService.getIns();
    let userId = req.headers["openId"] as string;

    let { type, cast = 0 } = req.body as Protocol.IReqAddPoint;
    let { point, coin } = utils.calPoint(type, cast);
    let time = new Date();

    // 判断是不是合法的类型
    let err = await service.canAddPoint(userId, type);
    if (err) {
      res.json(err);
      return;
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
}
