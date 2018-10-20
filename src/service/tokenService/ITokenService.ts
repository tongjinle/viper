import IToken from "./IToken";

export default interface ITokenService {
  // 通过token获取相关信息
  getInfo(token: string): Promise<IToken>;
  // 通过openId查找token的相关信息
  getInfoByOpenId(openId: string): Promise<IToken>;
  // 检查Token有效性
  check(token: string): Promise<boolean>;
  // 绑定openId,生成token
  bind(openId: string): Promise<IToken>;
  // 清空所有的token
  clear(): Promise<void>;
}
