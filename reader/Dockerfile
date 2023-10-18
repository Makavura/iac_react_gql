FROM node:18 as builder

# copy the package.json to install dependencies
COPY package.json ./

# Install the dependencies and make the folder
RUN npm install && mkdir /reader && mv ./node_modules ./reader

WORKDIR /reader

COPY . .

# Build the project and copy the files
RUN npm run build


FROM nginx:alpine

#!/bin/sh

COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY --from=builder /reader/build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]