import {prisma} from "./prismaDB";
import {MyList} from "../types/types";
const {dateArr} = require("../utils/utils");

// 크롤링 데이터 DB에 넣어주기
const crawlerRepository =async (Mylists:MyList[], keyWord:string, cnt:number,site:string):Promise<boolean> =>{
    let ans :boolean = true;
    try{
        // 키워드 ID 찾기
        const keyWordFind = await prisma.keywords.findFirst({
            where:{
                keyword:keyWord
            }
        })
        // 키워드 없을시 에러 발생시켜서 처리
        if(keyWordFind===null){
            throw new Error("키워드가 없어");
        }
        // 키워드 id
        const keywordId:number = keyWordFind.id;
        // 크롤링 데이터를 가지고 DB에 있는지 검증
        for (const item of Mylists) {
            // 해당 게시글 있는지 확인
            const okData = await prisma.job_Posting.findFirst({
                where :{
                    title: item.postTitle,
                    company_name:item.company
                }
            })
            // 해당 포스터가 이미 존재한다면
            if(okData!==null){
                const postId:number = okData.id
                // 검색한 키워드가 해당 url과 연결되어있는지 확인
                const keywordIn  = await prisma.job_Keywords.findFirst({
                    where:{
                        posting_id:postId,
                        keyword_id:keywordId
                    }
                })
                // 연결되어 있지 않다면 연결
                if(keywordIn===null){
                    await prisma.job_Keywords.create({
                        data:{
                            posting_id:postId,
                            keyword_id:keywordId
                        }
                    })
                }
            }else{
                // 포스터가 없으니 새로 등록
                const thisPost = await prisma.job_Posting.create({
                    data: {
                        company_name :item.company,
                        title :item.postTitle,
                        experience_level:item.exp.toString(),
                        education_level :item.edu,
                        location:item.loc,
                        tech_stack :item.skillStacks,
                        closing_date:item.endDate,
                        link:item.postURL.toString(),
                    }
                })
                // 해당 글과 키워드를 연결하기
                await prisma.job_Keywords.create({
                    data:{
                        posting_id:thisPost.id,
                        keyword_id:keywordId
                    }
                })
            }
        }
    }catch(e){
        console.error(`${site} 의 ${cnt}페이지 저장 실패`)
        ans =false;
    }finally{
        await prisma.$disconnect();
    }
    return ans;
}
// 키워드 리스트 가져오기
const findKeywords = async ():Promise<string[]>=>{
    const keywords:string[] = [];
    try{
        const keywordList = await prisma.keywords.findMany({
            select:{
                keyword:true
            }
        })
        keywordList.forEach(item =>{
            keywords.push(item.keyword);
        })
    }catch(e){
        console.error(e);
    }finally {
        await prisma.$disconnect();
    }
    return keywords;
}
// 기간지난 공고 DB에서 삭제하기 및 마감일 없는 공고 DB에서 삭제
const postDel = async ():Promise<boolean>=>{
    try{
        const postListNum = await prisma.job_Posting.count();
        for(let i =0; i<postListNum; i+=1000){
            const postData = await prisma.job_Posting.findMany({
                skip: i,
                take: i+1000
            })
            if(postData===null){
                throw new Error("힘들다");
            }
            for(let j=0; j<postData.length; j++){
                if(postData[j].closing_date.includes("상시채용")||postData[j].closing_date.includes("오늘마감")||postData[j].closing_date.includes("채용시")||postData[j].closing_date.includes("내일마감")){
                    // 상시채용/ 오늘마감 /채용시 /내일 마감 공고 지우기
                    // 해당 공고와 엮여있는 키워드 삭제
                    await prisma.job_Keywords.deleteMany({
                        where:{
                            posting_id:postData[j].id
                        }
                    })
                    // 해당 공고 삭제
                    await prisma.job_Posting.delete({
                        where:{
                            id:postData[j].id,
                            company_name:postData[j].company_name,
                        }
                    })
                    continue;
                }
                const endDate:number[] =dateArr(postData[j].closing_date);
                const thisM = new Date().getMonth()+1;
                const thisD = new Date().getDate();
                if(thisM>endDate[0]){
                    //공고를 지워야하는 경우 1 오늘보다 전달임
                    await prisma.job_Keywords.deleteMany({
                        where:{
                            posting_id:postData[j].id
                        }
                    })
                    await prisma.job_Posting.delete({
                        where:{
                            id:postData[j].id,
                            company_name:postData[j].company_name,
                        }
                    })
                }else{
                    if(thisD>endDate[1]){
                        //오늘이 공고를 지워야하는 경우 2 같은달이지만 오늘보다 전날임
                        await prisma.job_Keywords.deleteMany({
                            where:{
                                posting_id:postData[j].id
                            }
                        })
                        await prisma.job_Posting.delete({
                            where:{
                                id:postData[j].id,
                                company_name:postData[j].company_name,
                            }
                        })
                    }
                }
            }
            console.log(`공고 ${i}~${i+1000}번 기간지난 공고 삭제 완료`);
        }
    }catch (e){
        return false;
    }finally {
        await prisma.$disconnect();
    }
    return true;
}

module.exports = {crawlerRepository,findKeywords,postDel}

