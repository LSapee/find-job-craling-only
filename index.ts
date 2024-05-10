require('dotenv').config();
import express, { Request, Response } from 'express';
const app = express();
const port = 3000;
const {crawlingScheduler} = require('./utils/scheduler');
//json 데이터 파싱
app.use(express.json());
// urlparam 파싱
app.use(express.urlencoded({ extended: true }));

crawlingScheduler();

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome');
})

app.listen(port,()=>{
    console.log(`${port}포트로 서비스를 시작합니다~`);
})