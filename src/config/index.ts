import IConfig from "./IConfig";
import baseConf from "./base";
import testConf from "./test";
import devConf from "./dev";
import prodConf from "./prod";

const env = process.env.NODE_ENV;
console.log("node env:", env);

let conf: Partial<IConfig> = {};
if ("test" === env) {
  conf = Object.assign({}, baseConf, testConf);
} else if ("dev" === env) {
  conf = Object.assign({}, baseConf, devConf);
} else if ("product" === env) {
  conf = Object.assign({}, baseConf, prodConf);
} else {
  throw "invalid environment: " + env;
}

export default conf;
