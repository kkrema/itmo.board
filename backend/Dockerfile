FROM node:20-alpine

WORKDIR ./

COPY . ./backend

WORKDIR backend

RUN npm install

EXPOSE 8080

CMD ["node", "index.js"]
