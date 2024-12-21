FROM node:22.12

RUN apt update && apt install -y iputils-ping curl

WORKDIR /app
COPY . /app

EXPOSE 5000


RUN npm install
RUN npm run build


CMD ["npm", "start"]
