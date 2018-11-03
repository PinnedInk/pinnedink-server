FROM node:8

WORKDIR /usr/server

COPY package.json ./
RUN npm install
COPY ./lib .
ADD .env.production .env
EXPOSE 4000
CMD [ "node", "." ]