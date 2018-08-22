import * as express from 'express';
import * as Protocol from '../protocol';
import config from '../config';
import GameService from '../service/GameService';
import errCode from '../errCode';
import wx from '../wx';



export default function handle(app: express.Express) {
  app.get('/list', async (req, res) => {
    let resData: Protocol.IResList;
    let code: number = undefined;
    let index = (req.query as Protocol.IReqList).index;

    let service = await GameService.getIns();

    let data = await service.list(index);

    resData = {
      list: data.map(n => {
        return {
          userId: n.userId,
          username: n.username,
          photoList: n.photoList,
          count: n.count,
        };
      }),
    };

    console.log(resData);

    res.json(resData);

  });


}










