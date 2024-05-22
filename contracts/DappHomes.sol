// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface OwnerInterface {
    function owner() external view returns (address);
}

contract DappHomes is Ownable(msg.sender), Pausable {
    // published dapphomes marketplaces
    address[] public onlineMarketplaces;

    // event: add marketplace to public warehouse
    event AddMarketplace(address, address);

    /**
     * dapphome marketplace owner can add its marketplace to have public access
     * @param marketplace dapphome marketplace address
     */
    function addMarketplace(address marketplace) public whenNotPaused {
        require(
            OwnerInterface(marketplace).owner() == msg.sender,
            "You are not the owner of the marketplace"
        );

        onlineMarketplaces.push(marketplace);

        emit AddMarketplace(msg.sender, marketplace);
    }

    /**
     * get dapphomes marketplaces public address
     */
    function getMarketplaces() public view returns (address[] memory) {
        return onlineMarketplaces;
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
