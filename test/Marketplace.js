'use strict'

const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const dotenv = require('dotenv')

dotenv.config()

const price = process.env.MARKETPLACE_INITIAL_PRICE || 700000000
const duration = process.env.MARKETPLACE_INITIAL_DURATION || 2
const listToken = process.env.MARKETPLACE_LISTING_TOKEN || 'abcdefg'

describe('Marketplace', function() {
    async function deployMarketplaceFixture() {
        const [owner, otherAccount] = await ethers.getSigners()
        
        const Marketplace = await ethers.getContractFactory('Marketplace')
        const marketplace = await Marketplace.deploy(
            price,
            duration,
            listToken
        )

        return { marketplace, owner, otherAccount }
    }

    describe('deployment', function() {
        it('should set the right owner', async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture)
            expect(await marketplace.owner()).to.equal(owner.address)
        })

        it('should set the right subscription price', async function () {
            const {marketplace, owner } = await loadFixture(
                deployMarketplaceFixture
            )

            expect(await marketplace.price()).to.equal(price)
        })

        it('should set the right subscription duration', async function () {
            const {marketplace, owner } = await loadFixture(
                deployMarketplaceFixture
            )

            expect(await marketplace.duration()).to.equal(duration)
        })

        it('should fail when price = 0', async function () {
            const Marketplace = await ethers.getContractFactory('Marketplace')
            await expect(Marketplace.deploy(0, duration, listToken)).to.be.revertedWith(
                'Price should be > 0 wei'
            )
        })

        it('should fail when duration = 0', async function () {
            const Marketplace = await ethers.getContractFactory('Marketplace')
            await expect(Marketplace.deploy(price, 0, listToken)).to.be.revertedWith(
                'Duration should be > 0 day'
            )
        })

        it('should be initially unpaused', async function () {
            const {marketplace, owner } = await loadFixture(
                deployMarketplaceFixture
            )

            expect(await marketplace.paused()).to.equal(false)
        })

        it('should set the right listing token', async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture)
            expect(await marketplace.listToken()).to.equal(listToken)
        })
    })

    describe('access control', function () {
        it('should be owner to update price', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            const updatedPrice = 100

            await expect(marketplace.connect(otherAccount).updatePrice(updatedPrice))
            .to.be.revertedWithCustomError(marketplace, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should be owner to update duration', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            const updatedDuration = 100

            await expect(marketplace.connect(otherAccount).updateDuration(updatedDuration))
            .to.be.revertedWithCustomError(marketplace, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should be owner to update token', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            const updatedToken = 'abcdef'

            await expect(marketplace.connect(otherAccount).updateListToken(updatedToken))
            .to.be.revertedWithCustomError(marketplace, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should be owner to withdraw', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.connect(otherAccount).withdraw())
            .to.be.revertedWithCustomError(marketplace, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })
    })

    describe('subscription', function() {
        it('should fail when amount < subscription price', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.connect(otherAccount).subscribe({
                value: BigInt(price) - BigInt(1)
            })).to.be.revertedWith('Cannot subscribe, not enough funds')
        })

        it('should set correct duration', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.connect(otherAccount).subscribe({
                value: price
            })

            expect(await marketplace.subscriberDuration(otherAccount))
            .to.be.equal(
                await time.latest() + duration * 24 * 60 * 60
            )
        })

        it('should revert when subscriber does not exists', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.isSubscribed(otherAccount))
            .to.be.revertedWith('Subscriptor does not exists')
        })

        it('should reverts when duration expires', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.connect(otherAccount).subscribe({
                value: price
            })

            await time.increaseTo(
                (await time.latest()) +
                ((duration + 1) * 24 * 60 * 60)
            )

            expect(await marketplace.isSubscribed(otherAccount))
            .equals(false)
        })
    })

    describe('events', function () {
        it('should emit an event on subscribe', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.connect(otherAccount).subscribe({
                value: price
            })).to.emit(marketplace, "Subscription")
            .withArgs(
                otherAccount.address,
                await time.latest() + duration * 24 * 60 * 60 + 1
            )
        })

        it('should emit an event on update subscription price', async function () {
            const {marketplace, owner } = await loadFixture(
                deployMarketplaceFixture
            )

            const updatedPrice = 100

            await expect(marketplace.updatePrice(updatedPrice))
            .to.emit(marketplace, "UpdateSubscriptionPrice")
            .withArgs(
                updatedPrice
            )
        })

        it('should emit an event on update subscription duration', async function () {
            const {marketplace, owner } = await loadFixture(
                deployMarketplaceFixture
            )

            const updatedDuration = 100

            await expect(marketplace.updateDuration(updatedDuration))
            .to.emit(marketplace, "UpdateSubscriptionDuration")
            .withArgs(
                updatedDuration
            )
        })

        it('should emit an event on withdraw', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.connect(otherAccount).subscribe({
                value: price
            })

            await expect(marketplace.withdraw())
            .to.emit(marketplace, "Withdrawal")
            .withArgs(
                owner.address,
                price,
                anyValue
            )
        })
    })

    describe('withdrawals', function () {
        it('should transfer the funds to the owner', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.connect(otherAccount).subscribe({
                value: price
            })

            await expect(marketplace.withdraw())
            .to.changeEtherBalances(
                [owner, marketplace],
                [price, BigInt(-price)]
            )
        })

        it('should fail when paused', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            await expect(marketplace.withdraw())
            .to.be.revertedWithCustomError(marketplace, 'EnforcedPause')
        })
    })

    describe('pausable', function () {
        it('should be paused by owner', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            expect(await marketplace.paused()).to.equal(true)
        })

        it('should be paused only by owner', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.connect(otherAccount).pause())
            .to.be.revertedWithCustomError(marketplace, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should be unpaused by owner', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()
            await marketplace.unpause()

            expect(await marketplace.paused()).to.equal(false)
        })

        it('should be unpaused only by owner', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.connect(otherAccount).unpause())
            .to.be.revertedWithCustomError(marketplace, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should fail when re-pause', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            await expect(marketplace.pause())
            .to.be.revertedWithCustomError(marketplace, 'EnforcedPause')
        })

        it('should fail when re-unpaused', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.unpause())
            .to.be.revertedWithCustomError(marketplace, 'ExpectedPause')
        })

        it('subscribe should fail when paused', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            const updatedPrice = 100

            await expect(marketplace.subscribe({value: updatedPrice}))
            .to.be.revertedWithCustomError(marketplace, 'EnforcedPause')
        })

        it('update price should fail when paused', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            const updatedPrice = 100

            await expect(marketplace.updatePrice(updatedPrice))
            .to.be.revertedWithCustomError(marketplace, 'EnforcedPause')
        })

        it('update duration should fail when paused', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            const updatedDuration = 100

            await expect(marketplace.updateDuration(updatedDuration))
            .to.be.revertedWithCustomError(marketplace, 'EnforcedPause')
        })

        it('update list token should fail when paused', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await marketplace.pause()

            const updatedToken = 'abcdef'

            await expect(marketplace.updateListToken(updatedToken))
            .to.be.revertedWithCustomError(marketplace, 'EnforcedPause')
        })
    })
})
