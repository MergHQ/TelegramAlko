FROM node:12.10.0

WORKDIR /app

ADD . /app

RUN yarn install

CMD ["yarn", "start"]