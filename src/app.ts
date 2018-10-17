import * as Http from "http";
import * as Https from "https";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as fs from "fs";
import * as path from "path";

import loger from "./logIns";
import config from "./config";

import * as mongo from "mongodb";

import httpRouteHandle from "./routes/httpRoute";
import Database from "./db";

class Main {
  // express实例
  app: express.Express;

  constructor() {
    let app = (this.app = express());

    this.initHttpRoute();
  }

  // 挂载http路由
  initHttpRoute(): void {
    let app = this.app;

    // 中间件
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // 静态文件
    app.use("/static", express.static(path.join(__dirname, "./public")));

    // 过滤掉option
    app.use((req, res, next) => {
      loger.info("req.path", req.path, req.method);
      if (req.method == "OPTIONS") {
        next();
        return;
      }

      next();
    });

    // cors
    app.all("*", (req: express.Request, res: express.Response, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    // 路由
    httpRouteHandle(app);

    // // https start
    // let opts: Https.ServerOptions = {
    //   key: fs.readFileSync('./cert/index.key'),
    //   cert: fs.readFileSync('./cert/index.pem'),
    // };
    // let httpsServer = Https.createServer(opts, app);
    // // https end

    // httpsServer.listen(port, () => {

    // });

    // 启动
    let { port } = config;
    let cb = () => {
      console.log("=======================================");
      console.log(new Date());
      console.log(`** start https server at port(${port}) **`);
      console.log("=======================================");

      if (process.env.NODE_ENV === "dev") {
        console.log(`visit url: ${config.apiPrefix}:${config.port}/test`);
        console.log(`visit url: ${config.apiPrefix}:${config.port}/test/db`);
      }
    };

    if ("product" === process.env.NODE_ENV) {
      // 启动https
      let opts: Https.ServerOptions = {
        key: fs.readFileSync("./cert/index.key"),
        cert: fs.readFileSync("./cert/index.pem")
      };
      let httpsServer = Https.createServer(opts, app);
      // https end

      httpsServer.listen(port, cb);
    } else {
      app.listen(port, cb);
    }
  }
}

new Main();
