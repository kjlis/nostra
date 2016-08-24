FROM node:6.3.1

RUN apt-get update && apt-get -y upgrade
RUN apt-get -y install r-base

RUN mkdir -p /usr/nostra
WORKDIR /usr/nostra

COPY package.json /usr/nostra
RUN npm install

COPY . /usr/nostra
RUN npm run publish

EXPOSE 3000

CMD ["npm", "start"]