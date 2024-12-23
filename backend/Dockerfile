FROM node:22.12.0-alpine


WORKDIR /app
COPY . /app

EXPOSE 5000


RUN npm install
RUN npm run build


CMD ["npm", "start"]
