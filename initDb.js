/*
    初始化数据库dota
    1 建立用户
    2 建立索引
    ** 因为有dropDatabase操作,所以要小心数据被清洗
*/

const mongodb = require("mongodb");

// let connectStr = 'mongodb://puman:puman@118.31.11.29:27017/doctor';
let connectStr = "mongodb://118.31.11.29:27017/zst";
// let connectStr = "mongodb://localhost:27017/zst";

let { MongoClient } = mongodb;

// 数据库的名字
let databaseName = "zst";

let userInfoList = [
  {
    userName: "tongjinle",
    password: "tongjinle19840118"
  }
];

async function init() {
  let ins = await MongoClient.connect(connectStr);

  // await clear(ins);
  // await createUser(ins);
  await clearCollections(ins);
  // await createIndex(ins);
  await createDevData(ins);
  await ins.close();
}

async function clearCollections(ins) {
  let curr = ins.db(databaseName);

  // 要清空的表名
  let arr = ["user", "upvote", "list", "reward", "token"];
  await Promise.all(
    arr.map(n => {
      return curr.collection(n).deleteMany({});
    })
  );
}

async function clear(ins) {
  let curr = ins.db(databaseName);
  await curr.dropDatabase();

  let admin = ins.db("admin");
  admin.collection("system.users").deleteMany({
    db: databaseName
  });
}

// 建立用户
async function createUser(ins) {
  let admin = ins.db(databaseName);
  let fn = (userName, password) => {
    admin.addUser(userName, password, {
      roles: [
        {
          role: "readWrite",
          db: databaseName
        }
      ]
    });
  };
  await Promise.all(
    userInfoList.map(n => {
      return fn(n.userName, n.password);
    })
  );
}

// 建立数据库索引
async function createIndex(ins) {
  let curr = ins.db(databaseName);
  // await curr.collection('zst').createIndex({
  //     openId: 1,
  // });
}

async function createDevData(ins) {
  let curr = ins.db(databaseName);
  let now = new Date();
  now.setHours(0, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;
  let beginTime = new Date(now.getTime() - 2 * DAY);
  let endTime = new Date(now.getTime() + 5 * DAY);
  let prefix = "https://api.puman.xyz/static/images";
  // reward
  await curr.collection("reward").insertMany([
    {
      index: 2,
      status: 0,
      reward: {
        desc: "YSL口红",
        value: 300,
        photoList: [
          prefix +
            "/1/poster/lg_1392380_1537887123_5baa4b9324e10.jpg!l1000_b.jpg"
        ]
      },
      rule: {
        beginTime,
        endTime
      }
    }
  ]);

  // list
  await curr.collection("list").insertMany([
    {
      index: 2,
      userId: "gshock",
      username: "gshock",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/gshock-992977181/52BD2A59FA08D5885052F3D486FA3EFC.png",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/gshock-992977181/52BD2A59FA08D5885052F3D486FA3EFC.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/gshock-992977181/870061D58C2CBE73207D019B3B975D52.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/gshock-992977181/A9FC476C3A573E596793533FE3FF30FC.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/gshock-992977181/E860089D3766DCE1A8A2E75413D959B8.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/gshock-992977181/ECF45366285890E1729B3D2DEF5A4178.png"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "兔兔鸭",
      username: "兔兔鸭",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/1.jpg",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/1.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/2.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/3.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/4.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/5.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E5%85%94%E5%85%94%E9%B8%AD-3267729362/6.jpg"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "甜系",
      username: "甜系",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/1637B5907070D1032854D895A176C320.jpg",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/1637B5907070D1032854D895A176C320.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/2251A1643D54111EC12D149F4DC2A06C.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/8A9F28FFEF915A17E28E6613263233C9.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/C7D951BA018B0DBE2BA6B2359BEC72C5.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/CED94FEDA5071F901050A16A56ED65F0.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%94%9C%E7%B3%BB-2143296822/E998CEAE39CCA6FD70F898AE62779A16.jpg"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "红红鸭",
      username: "红红鸭",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/52911C30AAD83D83509183A4218F5062.png",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/52911C30AAD83D83509183A4218F5062.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/6D8530DEC40633B25861AF4FC2E501C1.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/98C64C6D427B51C14688FBA0D83A8297.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/D4D9E752E987A01661EE338734C83179.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/D865124EC608CFDBB27521B4FD227E6A.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E7%BA%A2%E7%BA%A2%E9%B8%AD-2783632036/DFF9C3B19E9BEBAD3932B9CC02DFA20E.png"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "锦鲤妹妹",
      username: "锦鲤妹妹",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/247E04CED0E36E77BD976E9299FB288C.jpg",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/247E04CED0E36E77BD976E9299FB288C.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/305F037BFB8E4FF4925C2F0D90DDDF61.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/49B893ED281C48A4501BA0188333F009.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/57DB929A7961BC2322F36E05ADA18C41.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/8EECCEFBD19FE34C957875B9F2A4B60E.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%94%A6%E9%B2%A4%E5%A6%B9%E5%A6%B9-230624096/C09673B762DC5404950CFC91960E4FFE.jpg"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "阿菲",
      username: "阿菲",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%98%BF%E8%8F%B2-3107614076/9C7372D50256247DB94DE7A3E62D454E.jpg",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%98%BF%E8%8F%B2-3107614076/9C7372D50256247DB94DE7A3E62D454E.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%98%BF%E8%8F%B2-3107614076/BF8C70A4969FEEDAC3152CBEE2B96E53.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%98%BF%E8%8F%B2-3107614076/EFBB579C89ED7D66683F0F06EFB5FB05.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%98%BF%E8%8F%B2-3107614076/7518F4F852F7C5A9B653A2711640C47E.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%98%BF%E8%8F%B2-3107614076/6A9DACF94124DC274CE97721281BA0AA.jpg"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "雨杭",
      username: "雨杭",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/1ACD6E48E07F5FBD9EA04210D03F6379.png",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/1ACD6E48E07F5FBD9EA04210D03F6379.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/376E28D673BA73EA2E411280D23C8279.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/747DFACB1992A538C98358D6D3CC0710.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/7AA178595E9E488DC91BBDA6A09AD5BC.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/8F015D3064E31F3B82EF2ADDCFA1CCF6.png",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9B%A8%E6%9D%AD-2227051085/DA0F96610174C547556652B27CB52B6F.png"
      ],
      count: 0
    },
    {
      index: 2,
      userId: "静静是个肥宅",
      username: "静静是个肥宅",
      logo:
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/74854DA7B3EA89157A57F28F20180AB3.jpg",
      photoList: [
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/74854DA7B3EA89157A57F28F20180AB3.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/1A24E635123864CFDFFB01107E1B145E.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/87AAA4E2651CB3D541691A5EA74A85AE.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/AA8DD62A9F98CE60B4DB1A753579444E.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/DFBD651621B38A685E6920815E7B67CB.jpg",
        "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%AF%94%E8%B5%9B/%E9%9D%99%E9%9D%99%E6%98%AF%E4%B8%AA%E6%AD%BB%E8%82%A5%E5%AE%85-1239052932/E0F40264545B2DC3C95CABDED34952A9.jpg"
      ],
      count: 0
    }
  ]);

  // user
}

init();
