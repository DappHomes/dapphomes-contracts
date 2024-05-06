# dapphomes-contracts

Home data subscription marketplace.

## development and testing with ganache

1. Install [docker](https://docs.docker.com/engine/install/) within the preferred operating system.
2. Open vscode and install [remote development plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) typing `Ctrl + P` and pasting `ext install ms-vscode-remote.vscode-remote-extensionpack`.
3. Clone this repository:
```
git clone https://github.com/DappHomes/dapphomes-contracts.git
```
4. Open directory in container using `Ctrl + P`, choose `Dev Containers: Open Folder in Container...` and open repository folder.
5. Open a terminal inside vscode (``Ctrl + Shift + ` ``) and execute hardhat commands

```bash
npx hardhat help
npx hardhat compile
npx hardhat test
```

6. Open ganache.
7. Execute the following command from vscode terminal:

```bash
node scripts/deploy.js
```
