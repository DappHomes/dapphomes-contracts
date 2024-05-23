// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Marketplace.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract DappHomes is Ownable(msg.sender), Pausable {
    // published dapphomes marketplaces
    Marketplace[] public dappHomes;

    // event: create marketplace
    event CreateMarketplace(address, address);

    /**
     * create new dapphome marketplace
     * @param price initial subscription price
     * @param duration initial subscription duration
     * @param token pinned data listting token
     */
    function createMarketplace(
        uint256 price,
        uint256 duration,
        string memory token
    ) public whenNotPaused returns (address) {
        // create marketplace
        Marketplace marketplace = new Marketplace(price, duration, token);

        // transfer ownership or this contract is the owner?
        marketplace.transferOwnership(msg.sender);

        // store new marketplace
        dappHomes.push(marketplace);

        emit CreateMarketplace(msg.sender, address(marketplace));

        return address(marketplace);
    }

    /**
     * get dapphomes marketplaces public address
     */
    function getDappHomes() public view returns (Marketplace[] memory) {
        return dappHomes;
    }

    /**
     * pause by owner onlye when not paused
     */
    function pause() public onlyOwner whenNotPaused {
        _pause();
    }

    /**
     * unpause by owner onlye when paused
     */
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }
}
