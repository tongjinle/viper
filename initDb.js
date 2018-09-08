/*
    初始化数据库dota
    1 建立用户
    2 建立索引
    ** 因为有dropDatabase操作,所以要小心数据被清洗
*/

const mongodb = require("mongodb");

// let connectStr = 'mongodb://puman:puman@118.31.11.29:27017/doctor';
let connectStr = "mongodb://118.31.11.29:27017/zst";

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

  // reward
  await curr.collection("reward").insertMany([
    {
      index: 1,
      status: 1
    },
    {
      index: 2,
      status: 0,
      reward: {
        desc: "扑满萝莉裙",
        value: 500,
        photoList: ["1.jpg", "2.jpg", "3.jpg"]
      }
    }
  ]);

  // list
  await curr.collection("list").insertMany([
    {
      index: 2,
      userId: "zst",
      username: "小猫",
      photoList: [
        "https://api.puman.xyz/static/images/1.jpg",
        "https://api.puman.xyz/static/images/2.jpg",
        "https://api.puman.xyz/static/images/3.jpg"
      ],
      count: 100
    },
    {
      index: 2,
      userId: "zst2",
      username: "落落",
      photoList: [
        "https://api.puman.xyz/static/images/11.jpg",
        "https://api.puman.xyz/static/images/12.jpg",
        "https://api.puman.xyz/static/images/13.jpg",
        "https://api.puman.xyz/static/images/14.jpg"
      ],
      count: 0
    }
  ]);

  // user
}

init();
