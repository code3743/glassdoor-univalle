FROM node:22.12.0-alpine AS runtime


WORKDIR /app
COPY . .

EXPOSE 3000

RUN npm install
RUN npm run build

CMD ["node", "dist/server/entry.mjs"]
