#!/bin/bash

cd find-job-craling-only
# 저장소로부터 최신 코드를 가져오거나 업데이트
git pull origin main
# Node.js 의존성 설치
npm install
# prisma
npx prisma generate
# PM2를 사용하여 애플리케이션 재시작
pm2 start node_modules/.bin/ts-node --name "find-job" -- index.ts


