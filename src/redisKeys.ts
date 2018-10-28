// flag
export let flag = (key: string) => `flag#${key}`;

// 用户信息
export let user = (userId: string) => `user#${userId}`;
// token
export let token = (token: string) => `token#${token}`;
export let openId = (openId: string) => `openId#${openId}`;

// 用户签到标记
export let userSign = (userId: string, day: string) =>
  `user#sign#${userId}#${day}`;

// 用户转发标记
export let userInvite = (userId: string, day: string) =>
  `user#invite#${userId}#${day}`;

// 当前活动是否被缓存的标记
export let cacheGame = () => `cacheGame`;

// 当前活动届数
export let currentIndex = () => `currentIndex`;

// 当前比赛的奖励和规则
export let reward = (index: number) => `reward#${index}`;

// 当前活动参加的参赛者列表
// 是否缓存了所有参赛者的列表
export let uperList = (index: number) => `uperList#${index}`;
// 参赛者基本信息
export let uper = (index: number, uperId: string) => `uper#${index}#${uperId}`;
// 参赛者图片列表
export let uperPhotos = (index: number, uperId: string) =>
  `uperPhotos#${index}#${uperId}`;

// 某届活动的冠军
export let winner = (index: number) => `winner#${index}`;
