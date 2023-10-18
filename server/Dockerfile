# ./Dockerfile
FROM node:18 as development
RUN mkdir -p /home/node/server/node_modules && chown -R node:node /home/node/server
WORKDIR /home/node/server
COPY package.json /home/node/server/package.json
RUN NODE_ENV=development npm i
COPY . /home/node/server
RUN npm run compile


FROM development as dev-envs
RUN <<EOF
    apt-get update
    apt-get install -y --no-install-recommends git
EOF
EXPOSE 4000 4000
# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=30s \
  CMD node healthcheck.js
# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /
CMD [ "npm", "start" ]