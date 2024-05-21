FROM node:18

COPY . /dapphomes-contracts

WORKDIR /dapphomes-contracts

RUN npm install

ENTRYPOINT ["sh", "docker/entrypoint.sh"]
