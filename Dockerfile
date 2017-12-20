FROM node:carbon
ADD . /code
WORKDIR /code
RUN npm install
CMD ["npm", "start"]