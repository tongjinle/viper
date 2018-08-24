/*
    *********************************************  
                       _ooOoo_  
                      o8888888o  
                      88" . "88  
                      (| -_- |)  
                      O\  =  /O  
                   ____/`---'\____  
                 .'  \|     |//  `.  
                /  \|||  :  |||//  \  
               /  _||||| -:- |||||-  \  
               |   | \\  -  /// |   |  
               | \_|  ''\---/''  |   |  
               \  .-\__  `-`  ___/-. /  
             ___`. .'  /--.--\  `. . __  
          ."" '<  `.___\_<|>_/___.'  >'"".  
         | | :  `- \`.;`\ _ /`;.`/ - ` : | |  
         \  \ `-.   \_ __\ /__ _/   .-` /  /  
    ======`-.____`-.___\_____/___.-`____.-'======  
                       `=---='  
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  
               佛祖保佑       永无BUG  
*/
import config from "./config";
import axios from "axios";

let { appId, appSecret, templateId } = config.wx;
// 通过code获取微信用户openId
async function getOpenId(code: string): Promise<string> {
  let ret: string;
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code"`;
  try {
    let { data } = await axios.get(url);
    console.log("getWxOpenId:", JSON.stringify(data));
    if (data.errcode) {
      return undefined;
    } else {
      return data.openid;
    }
  } catch (e) {
    return undefined;
  } finally {
  }
}

let accessToken: string;
let ts: number = 0;
// 获取access_token,时效为2个小时
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() - ts < 1.5 * 3600) {
    return accessToken;
  } else {
    let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    let { data } = await axios.get(url);
    if (data.errcode) {
      return undefined;
    } else {
      accessToken = data.access_token;
      ts = Date.now();
      return data.access_token;
    }
  }
}

// 发送消息模版
async function sendMessage(
  data: {
    touser: string;
    template_id: string;
    page?: string;
    form_id: string;
    data: any;
    emphasis_keyword?: string;
  },
  accessToken: string
): Promise<void> {
  let url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${accessToken}`;
  await axios.post(url, data);
}

export default {
  getOpenId,
  getAccessToken,
  sendMessage
};
