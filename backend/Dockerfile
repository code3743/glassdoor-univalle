FROM debian:bookworm


RUN apt-get update && apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN nvm install 22


WORKDIR /app
COPY . /app

EXPOSE 5000


RUN npm install
RUN npm run build


CMD ["npm", "start"]
