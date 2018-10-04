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
  let now = new Date();
  now.setHours(0, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;
  let beginTime = new Date(now.getTime() - 2 * DAY);
  let endTime = new Date(now.getTime() + 5 * DAY);
  let prefix = "https://api.puman.xyz/static/images";
  // reward
  await curr.collection("reward").insertMany([
    {
      index: 1,
      status: 0,
      reward: {
        desc: "500元萝莉裙",
        value: 500,
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
      index: 1,
      userId: "chaoxiong",
      username: "超凶",
      logo: prefix + "/1/超凶/1F048D0787EF9BD64FDBCCAD34F0EE16.jpg",
      photoList: [
        prefix + "/1/超凶" + "/1F048D0787EF9BD64FDBCCAD34F0EE16.jpg",
        prefix + "/1/超凶" + "/2DACC2DE732B1435B77522B330397D8C.jpg",
        prefix + "/1/超凶" + "/74AB4DAF7743D485A7A93CC71BB03AF2.jpg",
        prefix + "/1/超凶" + "/0801D8695FDCC07CAE5B0A7611833B1A.jpg",
        prefix + "/1/超凶" + "/D70EEED6C53D9B8B6DF2EE4CA6B409D9.jpg",
        prefix + "/1/超凶" + "/FCD6F391C5449207C39527D08B847CC4.jpg"
      ],
      count: 0
    },
    {
      index: 1,
      userId: "keaijiu",
      username: "可爱九",
      logo: prefix + "/1/可爱九/" + "22F8CEEA99B5F99AAAA9CD9EA0DE804D.jpg",

      photoList: [
        prefix + "/1/可爱九" + "/22F8CEEA99B5F99AAAA9CD9EA0DE804D.jpg",
        prefix + "/1/可爱九" + "/1792C6A17007261289632CBF202ADD8C.jpg",
        prefix + "/1/可爱九" + "/A74F2223EF87904B38FF483FC47DC7D8.jpg",
        prefix + "/1/可爱九" + "/CC00331552B4415D33CDC885CDBDECED.jpg",
        prefix + "/1/可爱九" + "/DC3146AA093D4C763340804BBFE29E78.jpg",
        prefix + "/1/可爱九" + "/FC1F5C6922DF82ED216C4AAD14822225.jpg"
      ],
      count: 0
    },
    {
      index: 1,
      userId: "luoshi",
      username: "萝世",
      logo: prefix + "/1/萝世" + "/6E7D7CB7AF8EEA6FCC064720A8C3DA60",
      photoList: [
        prefix + "/1/萝世" + "/6E7D7CB7AF8EEA6FCC064720A8C3DA60.jpg",
        prefix + "/1/萝世" + "/58DECC2DB2CD880C5331643597184A7D.jpg",
        prefix + "/1/萝世" + "/680E2DD98B674403F7AB8343D55A17F0.jpg",
        prefix + "/1/萝世" + "/C85DC5774532D6676B3E7D9E77BF9716.jpg",
        prefix + "/1/萝世" + "/DF80ECD5A47AE57CA23D42C0B62413DA.jpg",
        prefix + "/1/萝世" + "/F23DAECCAFBB75A7D0570EC5BDE2C2B4.jpg"
      ],
      count: 0
    },
    {
      index: 1,
      userId: "meimei",
      username: "玫玫",
      logo: prefix + "/1/玫玫" + "/4F68525169691F5AFBD063CC094C57AF.jpg",
      photoList: [
        prefix + "/1/玫玫" + "/4F68525169691F5AFBD063CC094C57AF.jpg",
        prefix + "/1/玫玫" + "/58F4E3DC61B7D4C51EEB301B27C946A0.jpg",
        prefix + "/1/玫玫" + "/6962454F52C63912C116DF6D4EF33FD5.jpg",
        prefix + "/1/玫玫" + "/35448794BCD33CD8FC6B5C328E3D90D4.jpg",
        prefix + "/1/玫玫" + "/B703D7CD5495C4377F8883A6FB137E30.jpg",
        prefix + "/1/玫玫" + "/FF5A6617282E22B6E11CACB8105C3F86.jpg"
      ],
      count: 0
    },
    {
      index: 1,
      userId: "saigao",
      username: "赛高",
      logo: prefix + "/1/赛高" + "/74D4C6210FFD058DF469E049C5626C96.jpg",
      photoList: [
        prefix + "/1/赛高" + "/74D4C6210FFD058DF469E049C5626C96.jpg",
        prefix + "/1/赛高" + "/514A1B4F48D06BF182F2DA46358DFB38.jpg",
        prefix + "/1/赛高" + "/702BCB36CD8BA3E5A68F59FB528F81B8.jpg",
        prefix + "/1/赛高" + "/8417CEC5B7561D1F7E1FC268223B1003.jpg",
        prefix + "/1/赛高" + "/FB80DAFF65321933E3FE945AD11CE76A.jpg",
        prefix + "/1/赛高" + "/FF1B993AEB48DED807E751CCBC5E1CBD.jpg"
      ],
      count: 0
    },
    {
      index: 1,
      userId: "xizi",
      username: "希子",
      logo: "https://api.puman.xyz/static/images/11.jpg",
      photoList: [
        prefix + "/1/希子" + "/05ACD9C529F95D1CF5CC3BEAD135F43F.jpg",
        prefix + "/1/希子" + "/625DC5025E9EF450943B96E3AEA6D832.jpg",
        prefix + "/1/希子" + "/03453B798C80E367321152781B05C06D.jpg",
        prefix + "/1/希子" + "/05546514D344AAE2BC47EE6236F15E5C.jpg",
        prefix + "/1/希子" + "/161596078127CA09FA66A0503D416746.jpg",
        prefix + "/1/希子" + "/D049B125E10AB58495544B939344EAF8.jpg"
      ],
      count: 0
    }
  ]);

  // user
}

init();
