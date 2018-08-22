import * as express from 'express';
import * as Protocol from '../protocol';
import config from '../config';
import TokenService from '../service/tokenService';
import axios from 'axios';
import errCode from '../errCode';
import wx from '../wx';



export default function handle(app: express.Express) {
  app.get('/getToken', async (req, res) => {
    let resData: Protocol.IResToken | Protocol.IResErr;
    let code: number = undefined;
    let cliCode = (req.query as Protocol.IReqToken).code;


    let openId = await wx.getOpenId(cliCode);

    // 获取openId失败
    if (!openId) {
      code = 0;
      resData = errCode.getOpenIdFail;
      res.json(resData);
      return;
    }

    let service = await TokenService.getIns();
    let token = await service.bind(openId);
    resData = { token, };
    res.json(resData);

  });


}










