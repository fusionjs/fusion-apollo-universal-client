FROM uber/web-base-image:1.0.0

WORKDIR /fusion-apollo-universal-client

COPY . .

RUN yarn
