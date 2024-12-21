FROM node:20.16 as runtime


WORKDIR /app
COPY . /app

EXPOSE 3000

RUN npm install
RUN npm run build

CMD ["node", "dist/server/entry.mjs"]
