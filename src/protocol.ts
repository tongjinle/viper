// *** 基础response格式
// *** 带有code[错误码]和msg[错误信息]
// *** 当code===undefined的时候,表示正确
export interface IResErr {
  // 错误码
  code?: number;
  // 错误信息
  message?: string;
}

// token
export interface IReqToken {
  code: string;
}

export interface IResToken {
  token: string;
  expires: number;
}

// special for project
// create user
// 创建用户
export interface IReqCreateUser {
  username: string;
}

export interface IResCreateUser {}

// 设置用户信息
export interface IReqSetUserInfo {
  username?: string;
  gender?: number;
  city?: string;
  logoUrl?: string;
}
export interface IResSetUserInfo {}

// current index
// 返回现在正在进行中的一届比赛
export interface IReqCurrentIndex {}
export interface IResCurrentIndex {
  index: number;
}

// 请求第index届的比赛信息
// list
export interface IReqList {
  // 第几届
  index: number;
}

export interface IResList {
  // 数据,每个参赛者的数据
  list: {
    // 参赛者的唯一id
    userId: string;
    // 参赛者昵称
    username: string;
    // 参赛照片
    photoList: string[];
    // 热度
    count: number;
  }[];
}

// upvote
// 打榜,增加热度
export interface IReqUpvote {
  // 参赛者的唯一id
  userId: string;
  // how to upvote
  // 打榜的方式
  // point可以通过签到和转发获取
  // coin通过人民币购买
  // 目前只有point方式
  type: "point" | "coin";
  // cast
  // 耗费的数量
  cast: number;
}

export interface IResUpvote {}

// addPoint
// 赚取point
export interface IReqAddPoint {
  // the reason of addPoint
  // 赚取point的方式
  // 签到,人民币,转发
  type: "sign" | "money" | "invite";
  // cast
  // 耗费的数量
  // 不是用money的方式,则没有cast
  cast?: number;
}

// 收益
export interface IResAddPoint {
  // point收益
  point: number;
  // coin收益
  coin: number;
}

// game result
// 获取某届的比赛结果
export interface IReqReward {
  // 第几届
  index: number;
}

// 这个现在没有页面用到
export interface IResReward {
  // 获胜者(有可能没有,因为可能还在比赛中)
  winner?: {
    // 冠军的唯一id
    userId: string;
    // 冠军的昵称
    username: string;
    // 冠军的参赛照片
    photoList: string[];
    // 纪念照,冠军会跟礼物进行合影发给组织方
    memoryPhoto: string[];
    // 冠军的最终热度
    count: number;
  };
  // 最大热度的打榜者
  maxUpvoter?: {
    // 打榜者唯一id
    userId: string;
    // 打榜者的昵称
    username: string;
    // 总共提供的point
    point: number;
    // 总共提供的coin
    coin: number;
  };
  reward: {
    // 奖品的照片列表
    photoList: string[];
    // 奖品描述
    desc: string;
    // 奖品的价值
    value: number;
  };
  rule: {
    // 开始时间(时间戳)
    beginTime: number;
    // 结束时间(时间戳)
    endTime: number;
    // 热度临界点
    hotIntervalList: number[];
    // 每日签到上限
    signCount: number;
    // 每日转发(邀请)上限
    inviteCount: number;
  };
}

// myUpvote
// 我的打榜记录
export interface IReqMyUpvote {
  // 第几届
  index: number;
}

export interface IResMyUpvote {
  // 打榜列表
  upvoteList: {
    // 参赛者的唯一id
    userId: string;
    // upvote count
    // 提供的总热度
    count: number;
  }[];
}

// myPoint
// 查看我的信息
export interface IReqMyPoint {}

export interface IResMyPoint {
  // point剩余数量
  point: number;
  // coin剩余数量
  coin: number;
}

// myAddPoint
// 查看我的增加point的状态,因为有的已经不能增加了(比如签到只能一次)
export interface IReqMyAddPoint {}

export interface IResMyAddPoint {
  sign: number;
  invite: number;
}

// gallery
export interface IReqGallery {
  pageIndex: number;
  pageSize: number;
}

// galleryCount
export interface IResGallery {
  list: {
    id: string;
    type: "pic" | "video";
    logoUrl: string;
    title: string;
    count: number;
    resource: string[];
  }[];
}

// gallery count
export interface IReqGalleryCount {
  id: string;
}

export interface IResGalleryCount {}
