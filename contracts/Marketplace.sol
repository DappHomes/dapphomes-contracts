// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Marketplace is Ownable(msg.sender), Pausable {

    // suscription price
    uint256 public price;
    // subscription days
    uint256 public duration;
    // listing token
    string public listToken;
    // subscribers mapping
    mapping (address => uint256) subscribers;

    // event: successful subscription event
    event Subscription(address, uint256);
    // event: update subscription price
    event UpdateSubscriptionPrice(uint256);
    // event: update subscription duration
    event UpdateSubscriptionDuration(uint256);
    // event: update list token
    event UpdateListToken(address);
    // event: withdrawal
    event Withdrawal(address, uint256, uint256);

    /**
     * constructor
     * @param initialPrice initial subscription price
     * @param initialDuration initial subscription duration
     * @param token encrypted files listing token
     */
    constructor(uint256 initialPrice, uint256 initialDuration, string memory token) {
        require(
            initialPrice > 0,
            'Price should be > 0 wei'
        );
        require(
            initialDuration > 0,
            'Duration should be > 0 day'
        );

        price = initialPrice;
        duration = initialDuration;
        listToken = token;
    }

    /**
     * subscribe to marketplace
     */
    function subscribe() public payable whenNotPaused {
        require(msg.value >= price, "Cannot subscribe, not enough funds");
        subscribers[msg.sender] = block.timestamp + duration * 1 days;

        emit Subscription(msg.sender, subscribers[msg.sender]);
    }

    /**
     * check user subscription expiration time
     * @param subscriber user to check subscription duration
     */
    function subscriberDuration(address subscriber) public view returns (uint256) {
        return subscribers[subscriber];
    }

    /**
     * check user valid period
     * @param subscriber user to check subscription status
     */
    function isSubscribed(address subscriber) public view returns (bool) {
        require(subscribers[subscriber] > 0, 'Subscriptor does not exists');
        return block.timestamp < subscribers[subscriber];
    }

    /**
     * set new subscription price
     * @param newPrice updated subscription price
     */
    function updatePrice(uint256 newPrice) public onlyOwner whenNotPaused {
        require(newPrice > 0, "Price should be > 0 wei");
        price = newPrice;

        emit UpdateSubscriptionPrice(price);
    }

    /**
     * set new subscription duration
     * @param newDuration updated subscription duration
     */
    function updateDuration(uint256 newDuration) public onlyOwner whenNotPaused {
        require(newDuration > 0, "Duration should be > 0 day");
        duration = newDuration;

        emit UpdateSubscriptionDuration(duration);
    }

    /**
     * set new listing token
     * @param newToken updated listing token
     */
    function updateListToken(string memory newToken) public onlyOwner whenNotPaused {
        listToken = newToken;

        emit UpdateListToken(msg.sender);
    }

    /**
     * get contract balance
     * @return balance contract balance
     */
    function getBalance() public view returns (uint256) {
        uint256 balance = address(this).balance;
        return balance;
    }

    /**
     * withdraw users subscriptions to owner
     */
    function withdraw() public onlyOwner whenNotPaused {
        uint256 amount = address(this).balance;

        emit Withdrawal(msg.sender, amount, block.timestamp);

        payable(msg.sender).transfer(amount);
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
