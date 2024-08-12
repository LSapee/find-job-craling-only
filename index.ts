require('dotenv').config();
import express, { Request, Response } from 'express';
const app = express();
const port = 3002;
const {crawlingScheduler} = require('./utils/scheduler');
// const {jobKCrawler} = require('./crawler/crawler');

//json 데이터 파싱
app.use(express.json());
// urlparam 파싱
app.use(express.urlencoded({ extended: true }));

crawlingScheduler();

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome');
})
//
// app.get("/test",async (req: Request, res: Response) => {
//     await jobKCrawler("java");
// })

app.listen(port,()=>{
    console.log(`${port}포트로 서비스를 시작합니다~`);
})