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
  static userExists: IErr = { code: 901, message: "用户已经存在" };

  // special for project
  static invalidAddPointType: IErr = {
    code: 900,
    message: "非法的增加point的方式"
  };

  static invalidCurrentIndex: IErr = {
    code: 901,
    message: "没有对应的正在进行的竞赛"
  };

  static invalidUperId: IErr = { code: 902, message: "非法的up主" };
  static invalidUpvoterId: IErr = { code: 903, message: "打榜者不存在" };
  static invalidUpvoteType: IErr = { code: 904, message: "非法的打榜类型" };
  static notEnoughPoint: IErr = { code: 905, message: "缺乏足够的point" };
}
