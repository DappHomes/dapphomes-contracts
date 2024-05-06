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

describe('Marketplace', function() {
    async function deployMarketplaceFixture() {
        const [owner, otherAccount] = await ethers.getSigners()
        
        const Marketplace = await ethers.getContractFactory('Marketplace')
        const marketplace = await Marketplace.deploy(
            process.env.MARKETPLACE_INITIAL_PRICE,
            process.env.MARKETPLACE_INITIAL_DURATION
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

            expect(await marketplace.price()).to.equal(process.env.MARKETPLACE_INITIAL_PRICE)
        })

        it('should set the right subscription duration', async function () {
            const {marketplace, owner } = await loadFixture(
                deployMarketplaceFixture
            )

            expect(await marketplace.duration()).to.equal(process.env.MARKETPLACE_INITIAL_DURATION)
        })

        it('should fail when price = 0', async function () {
            const Marketplace = await ethers.getContractFactory('Marketplace')
            await expect(Marketplace.deploy(0, 0)).to.be.revertedWith(
                'Price should be > 0'
            )
        })

        it('should fail when duration = 0', async function () {
            const Marketplace = await ethers.getContractFactory('Marketplace')
            await expect(Marketplace.deploy(0, 0)).to.be.revertedWith(
                'Price should be > 0'
            )
        })
    })

    describe('events', function () {
        it('should emit an event on subscribe', async function () {
            const {marketplace, owner, otherAccount } = await loadFixture(
                deployMarketplaceFixture
            )

            await expect(marketplace.connect(otherAccount).subscribe({
                value: process.env.MARKETPLACE_INITIAL_PRICE
            })).to.emit(marketplace, "Subscription")
            .withArgs(
                otherAccount.address,
                await time.latest() + process.env.MARKETPLACE_INITIAL_DURATION * 24 * 60 * 60 + 1
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
    })
})
