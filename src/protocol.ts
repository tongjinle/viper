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
}

// special for project
// create user
export interface IReqCreateUser {
  username: string;
}

export interface IResCreateUser {}

// current index
export interface IReqCurrentIndex {}
export interface IResCurrentIndex {
  index: number;
}

// list
export interface IReqList {
  index: number;
}

export interface IResList {
  list: {
    userId: string;
    username: string;
    photoList: string[];
    count: number;
  }[];
}

// upvote
export interface IReqUpvote {
  userId: string;
  // how to upvote
  type: "point" | "coin";
  // cast
  cast: number;
}

export interface IResUpvote {}

// addPoint
export interface IReqAddPoint {
  userId: string;
  // the reason of addPoint
  type: "sign" | "money" | "invite";
  // cast
  cast?: number;
}

export interface IResAddPoint {
  point: number;
  coin: number;
}

// game result
export interface IReqReward {
  index: number;
}

export interface IResReward {
  winner?: {
    userId: string;
    username: string;
    count: number;
  };
  maxUpvoter?: {
    userId: string;
    username: string;
    point: number;
    coin: number;
  };
  reward: {
    imgUrlList: string[];
    desc: string;
    value: number;
  };
}

// myUpvote
export interface IReqMyUpvote {
  index: number;
}

export interface IResMyUpvote {
  upvoteList: {
    userId: string;
    // upvote count
    count: number;
  }[];
}

// myPoint
export interface IReqMyPoint {}

export interface IResMyPoint {
  point: number;
  coin: number;
}
