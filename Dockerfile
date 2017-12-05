FROM node:8

WORKDIR /fusion-apollo-universal-client

COPY . .

RUN yarn
