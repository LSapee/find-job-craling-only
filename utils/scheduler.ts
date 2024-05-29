const cron = require("node-cron");
const {findKeywords,postDel} = require("../Repository/crawler.Repository")
const {jobKCrawler,saramInCrawler} =  require("../crawler/crawler")
const {ec2Stop} = require("../aws/awsEc2Off");

// 분 시 일 월 요일
export const crawlingScheduler = async ()=>{
    let cnt = 0;
    const promises:any[] =[];
    cron.schedule(("37 13 * * *"), async () =>{
        // 상시채용 ,채용시 완료, 기간 지난 공고 삭제
        await postDel();
        const keywords : string[] = await findKeywords();
        console.log(keywords)
        for(const item of keywords){
            // 기존코드
            // const resultJok = await jobKCrawler(item);
            // const resultSaramIn = await saramInCrawler(item);
            // console.log(`크롤링 resultJob ${item}:`, resultJok );
            // console.log(`크롤링 resultSaramIn ${item}:`, resultSaramIn );
            // 병렬처리를 위한 변경 코드
            promises.push(jobKCrawler(item));
            promises.push(saramInCrawler(item));
            cnt++;
        }
        await Promise.all(promises);
        // if(cnt==keywords.length) await ec2Stop();
    })
}
