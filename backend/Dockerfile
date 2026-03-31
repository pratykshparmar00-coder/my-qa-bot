FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]