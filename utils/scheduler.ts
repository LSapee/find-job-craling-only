const cron = require("node-cron");
const {findKeywords,postDel} = require("../Repository/crawler.Repository")
const {jobKCrawler,saramInCrawler} =  require("../crawler/crawler")
const {ec2Stop} = require("../aws/awsEc2Off");

// 분 시 일 월 요일
export const crawlingScheduler = async ()=>{
    const promises:any[] =[];
    const maxSize = 10;
    cron.schedule(("35 15 * * *"), async () =>{
        // 상시채용 ,채용시 완료, 기간 지난 공고 삭제
        await postDel();
        const keywords : string[] = await findKeywords();
        for(const item of keywords){
            promises.push(jobKCrawler(item));
            if(promises.length === maxSize){
                await Promise.race(promises).then((success)=>{
                    promises.splice(promises.indexOf(success),1);
                })
            }
        }
        for(const item of keywords){
            promises.push(saramInCrawler(item));
            if(promises.length === maxSize){
                await Promise.race(promises).then((success)=>{
                    promises.splice(promises.indexOf(success),1);
                })
            }
        }
        await Promise.all(promises);
        console.log("크롤링 종료");
        // if(cnt==keywords.length) await ec2Stop();
    })
}
