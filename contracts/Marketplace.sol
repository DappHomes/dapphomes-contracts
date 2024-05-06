// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable(msg.sender) {

    // suscription price
    uint256 public price;
    // subscription days
    uint256 public duration;
    // subscribers mapping
    mapping (address => uint256) subscribers;

    // event: successful subscription event
    event Subscription(address, uint256);
    // event: update subscription price
    event UpdateSubscriptionPrice(uint256);
    // event: update subscription duration
    event UpdateSubscriptionDuration(uint256);
    // event: withdrawal
    event Withdrawal(address, uint256, uint256);

    /**
     * constructor
     * @param initialPrice initial subscription price
     * @param initialDuration initial subscription duration
     */
    constructor(uint256 initialPrice, uint256 initialDuration) {
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
    }

    /**
     * subscribe to marketplace
     */
    function subscribe() public payable {
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
     * set new subscription price
     * @param newPrice updated subscription price
     */
    function updatePrice(uint256 newPrice) public onlyOwner {
        require(newPrice > 0, "Price should be > 0 wei");
        price = newPrice;

        emit UpdateSubscriptionPrice(price);
    }

    /**
     * set new subscription duration
     * @param newDuration updated subscription duration
     */
    function updateDuration(uint256 newDuration) public onlyOwner {
        require(newDuration > 0, "Duration should be > 0 day");
        duration = newDuration;

        emit UpdateSubscriptionDuration(duration);
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
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;

        emit Withdrawal(msg.sender, amount, block.timestamp);

        payable(msg.sender).transfer(amount);
    }
}
