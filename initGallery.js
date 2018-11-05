const mongodb = require("mongodb");

// let connectStr = 'mongodb://puman:puman@118.31.11.29:27017/doctor';
// let connectStr = "mongodb://118.31.11.29:27017/zst";
let connectStr = "mongodb://localhost:27017/zst";

let { MongoClient } = mongodb;

// 数据库的名字
let databaseName = "zst";

let userInfoList = [
  {
    userName: "tongjinle",
    password: "tongjinle19840118"
  }
];

let info = [
  {
    title: "阿菲",
    type: "pic",
    logoUrl:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E9%98%BF%E8%8F%B2-3107614076/EFBB579C89ED7D66683F0F06EFB5FB05.jpg?x-oss-process=style/w50",
    resource: [
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E9%98%BF%E8%8F%B2-3107614076/9C7372D50256247DB94DE7A3E62D454E.jpg",
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E9%98%BF%E8%8F%B2-3107614076/EFBB579C89ED7D66683F0F06EFB5FB05.jpg",
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E9%98%BF%E8%8F%B2-3107614076/EFBB579C89ED7D66683F0F06EFB5FB05.jpg"
    ],
    count: 100,
    date: new Date(2015, 0, 1)
  },
  {
    title: "甜系",
    type: "pic",
    logoUrl:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%94%9C%E7%B3%BB-2143296822/8A9F28FFEF915A17E28E6613263233C9.jpg?x-oss-process=style/w50",
    resource: [
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%94%9C%E7%B3%BB-2143296822/E998CEAE39CCA6FD70F898AE62779A16.jpg",
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%94%9C%E7%B3%BB-2143296822/FBE06C4A4B6FFB0E5167E9B0C43BD8B0.jpg",
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%94%9C%E7%B3%BB-2143296822/C7D951BA018B0DBE2BA6B2359BEC72C5.jpg",
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E7%94%9C%E7%B3%BB-2143296822/CED94FEDA5071F901050A16A56ED65F0.jpg"
    ],
    count: 0,
    date: new Date()
  },
  {
    title: "萌妹子",
    type: "video",
    logoUrl:
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E8%A7%86%E9%A2%91/594B7871917A76656D79205237852F57.jpg?x-oss-process=style/w50",
    resource: [
      "https://mucheng2020.oss-cn-hangzhou.aliyuncs.com/%E8%A7%86%E9%A2%91/Twitter%20%E4%B8%8A%E7%9A%84%20%23japanesegirl%20%E8%AF%9D%E9%A2%98%E6%A0%87%E7%AD%BE.mp4"
    ],
    count: 44,
    date: new Date()
  }
];

async function init() {
  let ins = await MongoClient.connect(connectStr);

  await insertGallery(ins, info);
  await ins.close();
}

async function insertGallery(ins, info) {
  info = Array.isArray(info) ? info : [info];
  let curr = ins.db(databaseName);
  await curr.collection("gallery").insertMany(info);
}

init();
