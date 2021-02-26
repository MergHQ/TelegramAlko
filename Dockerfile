FROM arm64v8/node:13.0.0-alpine

WORKDIR /app

ADD . /app

RUN yarn install

CMD ["yarn", "start"]