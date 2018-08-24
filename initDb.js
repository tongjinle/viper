/*
    初始化数据库dota
    1 建立用户
    2 建立索引
    ** 因为有dropDatabase操作,所以要小心数据被清洗
*/

const mongodb = require("mongodb");

// let connectStr = 'mongodb://puman:puman@118.31.11.29:27017/doctor';
let connectStr = "mongodb://118.31.11.29:27017/doctor";

let { MongoClient } = mongodb;

// 数据库的名字
let databaseName = "doctor";

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
  await createIndex(ins);
  await ins.close();
}

async function clearCollections(ins) {
  let doctor = ins.db("doctor");
  // 要清空的表名
  let arr = [];
  await Promise.all(
    arr.map(n => {
      return doctor.collection(n).remove({});
    })
  );
}

async function clear(ins) {
  let curr = ins.db(databaseName);
  await curr.dropDatabase();

  let admin = ins.db("admin");
  admin.collection("system.users").remove({
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
  // await curr.collection('doctor').createIndex({
  //     openId: 1,
  // });
}

init();
