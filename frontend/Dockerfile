FROM node:20

WORKDIR ./

COPY . ./frontend

WORKDIR frontend

RUN npm install

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start"]
