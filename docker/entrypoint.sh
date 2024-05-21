# install dependencies
npm i

# compile contracts
npx hardhat compile

# deploy to amoy
npx hardhat ignition deploy ignition/modules/Marketplace.js --network amoy
