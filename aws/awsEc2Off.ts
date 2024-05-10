import {EC2Client, StopInstancesCommand} from "@aws-sdk/client-ec2";

const awsRegion:string = process.env.AWS_REGION as string;
const awsInstanceId:string = process.env.AWS_EC2_INSTENT_ID as string;
const awsAccessKey:string =process.env.AWS_ACCESS_KEY_ID as string;
const awsSecretAccessKey:string =process.env.AWS_SECRET_ACCESS_KEY as string;
const credentials = {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretAccessKey
};

// EC2Client 객체 생성
const ec2Client = new EC2Client({ region: awsRegion ,credentials});

const params = {
    InstanceIds: [awsInstanceId], // 시작할 인스턴스의 ID
};

const stopCommand = new StopInstancesCommand(params);

export const ec2Stop = async  () =>{
    try {
        ec2Client.send(stopCommand)
            .then((data) => {
                console.log("인스턴스 중지 요청 : ", data);
            })
            .catch(err => {
                console.error("인스턴스 중지 중 오류 발생:", err);
            });
    }catch (e){
        console.log("e",e);
    }
}
