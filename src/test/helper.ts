import Database from "../db";

let db: Database;
let clearAll = async () => {
  await open();
  await Promise.all(
    ["user", "upvote", "list", "reward"].map(async n => {
      await db.getCollection(n).deleteMany({});
    })
  );
};

let open = async () => {
  db = await Database.getIns();
};

let close = async () => {
  await db.close();
};

export default {
  clearAll,
  open,
  close
};
