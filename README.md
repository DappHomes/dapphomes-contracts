# dapphomes-contracts

dapphomes-contracts provides needed smart contracts to deploy domotic data marketplace into blockchain using a subscription model. User own their data and are able to share it with any consumer and without third parties involved.

## environment

Needed environment variables are:

| Name | Description | Example |
|---|---|---|
| WEB3_PROVIDER | desired web3 provider | http://127.0.0.1:7545 |
| WEB3_PUBLIC_KEY | owner public key | 0x... |
| WEB3_PRIVATE_KEY | owner private key | 0x... |
| MARKETPLACE_INITIAL_PRICE | marketplace subscription price (wei) | 7000000000000000 |
| MARKETPLACE_INITIAL_DURATION | marketplace subscription duration (days) | 30 |
| MARKETPLACE_LISTING_TOKEN | public token to access encrypted file | abcdef |

## development and testing with ganache

In order to deploy and test with ease,follow theses steps:

1. Install [docker](https://docs.docker.com/engine/install/) within the preferred operating system.
2. Open vscode and install [remote development plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) typing `Ctrl + P` and pasting `ext install ms-vscode-remote.vscode-remote-extensionpack`.
3. Clone this repository:
```
git clone https://github.com/DappHomes/dapphomes-contracts.git
```
4. Edit `.env` variables for your needs:

```bash
cd dapphomes-contracts
cp .env.example .env
```

5. Open directory in container using `Ctrl + P`, choose `Dev Containers: Open Folder in Container...` and open repository folder.
6. Open a terminal inside vscode (``Ctrl + Shift + ` ``) and execute hardhat commands

```bash
npx hardhat help
npx hardhat compile
npx hardhat test
```

7. Open ganache.
8. Execute the following command from vscode terminal:

```bash
node scripts/deploy.js
```

## deploy to amoy

Into previously `dapphomes-contracts` folder:

```bash
docker compose build
docker run -it dapphomes-contracts
```

And confirm amoy deployment.
