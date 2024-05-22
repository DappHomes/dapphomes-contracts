const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DappHomes", (m) => {
  const dappHomes = m.contract("DappHomes", []);

  return { dappHomes };
});
