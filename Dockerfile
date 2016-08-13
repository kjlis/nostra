FROM node:6.3.1

RUN mkdir -p /usr/nostra
WORKDIR /usr/nostra

COPY package.json /usr/nostra
RUN npm install

COPY . /usr/nostra
RUN npm run publish

EXPOSE 3000

CMD ["npm", "start"]