FROM node
WORKDIR /code

RUN npm install -g nodemon

COPY package.json /code/package.json
RUN npm install
RUN mv /code/node_modules /node_modules

COPY . /code

CMD ["npm", "start"]