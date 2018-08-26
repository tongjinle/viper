export interface IErr {
  code: number;
  message: string;
}

export class ErrCode {
  // 通用
  static invalidToken: IErr = { code: 800, message: "非法token" };
  static getOpenIdFail: IErr = { code: 801, message: "获取openid失败" };
  // 用户
  static notLogin: IErr = { code: 900, message: "用户未登录" };

  // special for project
  static invalidAddPointType: IErr = {
    code: 900,
    message: "非法的增加point的方式"
  };
}
