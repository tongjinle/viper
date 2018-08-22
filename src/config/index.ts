import baseConf from './base';
import testConf from './test';
import devConf from './dev';
import prodConf from './prod';

const env = process.env.NODE_ENV;
console.log("node env:", env);
interface IConfig {
  port: number,
  connectStr: string,
  dbName: string,

  // 微信
  wx: {
    appId: string,
    appSecret: string,
    templateId: string,
  },
  // token过期时间
  tokenExpires: number,
  // 域名
  apiPrefix:string,
}


let conf: Partial<IConfig> = {};
if ('test' === env) {
  conf = Object.assign({}, baseConf, testConf);
} else if ('dev' === env) {
  conf = Object.assign({}, baseConf, devConf);
} else {
  throw "invalid environment: " + env;

}


export default conf;