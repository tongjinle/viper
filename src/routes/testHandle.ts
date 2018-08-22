import * as express from 'express';
import Database from '../db';

export default function handle(app: express.Express) {

    // 测试
    app.get('/test', async (req, res) => {
        res.end('hello world');
    });

    app.post('/testPost', async (req, res) => {
        console.log('testPost');
        console.log(req.body);
        res.end('testPost');
    });

    app.get('/test/db', async (req, res) => {
        let db = await Database.getIns();
        let ts = Date.now();
        await db.getCollection('test').insertOne({ ts, });
        let data = await db.getCollection('test').findOne({ ts, });
        res.end('db test:' + data.ts);
    });
}