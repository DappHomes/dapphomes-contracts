const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Marketplace", (m) => {
  const marketplace = m.contract("Marketplace", [
    process.env.MARKETPLACE_INITIAL_PRICE || 700000000,
    process.env.MARKETPLACE_INITIAL_DURATION || 2,
    process.env.MARKETPLACE_LISTING_TOKEN || 'abcdefg'
  ]);

  return { marketplace };
});
