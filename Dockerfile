ARG app_name=business-portal-webapp

FROM node:12.16.3-alpine3.10 as builder

RUN apk update && \
 apk add -U ca-certificates

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install
COPY . /app

# lint
# RUN yarn lint

# test
# RUN npm run test

# build client site
RUN yarn build


# config flyway
FROM node:12.16.3-alpine3.10
RUN apk update && apk add curl bash
# Add the flyway user and step in the directory
WORKDIR /flyway
ENV FLYWAY_VERSION 6.2.3
# COPY server/flyway.conf /flyway/
COPY flyway /flyway
# https://serverfault.com/questions/960772/installing-openjdk-11-on-alpine3-9
RUN apk --no-cache add openjdk11 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community

RUN curl -L https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz -o flyway-commandline-${FLYWAY_VERSION}.tar.gz \
  && tar -xzf flyway-commandline-${FLYWAY_VERSION}.tar.gz --strip-components=1 \
  && rm flyway-commandline-${FLYWAY_VERSION}.tar.gz \
  && ln -sf /flyway/flyway /usr/local/bin/flyway

WORKDIR /app
COPY server/package.json /app
RUN yarn install

RUN apk update && \
 apk add -U ca-certificates curl bash
COPY --from=builder /app/build build
COPY --from=builder /app/server server
COPY --from=builder /app/*.sh /app/
COPY --from=builder /app/server.js .
COPY --from=builder /app/*.json /app/

ENV ENGINE_KEY A189FB9E2682CCA1DDF93687E96A7
ENV SENDER_EMAIL_PASSWORD seta@2020

EXPOSE 3001/tcp
COPY . .
RUN chmod +x /app/*.sh
ENTRYPOINT ["./entrypoint.sh"]