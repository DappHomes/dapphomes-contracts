'use strict'

const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const dotenv = require('dotenv')

dotenv.config()

const price = process.env.MARKETPLACE_INITIAL_PRICE || 700000000
const duration = process.env.MARKETPLACE_INITIAL_DURATION || 2
const token = process.env.MARKETPLACE_LISTING_TOKEN || 'abcdefg'

describe('DappHomes', function() {
    async function deployDappHomesFixture() {
        const [owner, otherAccount] = await ethers.getSigners()
        
        const DappHomes = await ethers.getContractFactory('DappHomes')
        const dappHomes = await DappHomes.deploy()

        return { dappHomes, owner, otherAccount }
    }

    describe('deployment', function() {
        it('should set the right owner', async function () {
            const { dappHomes, owner } = await loadFixture(
                deployDappHomesFixture
            )

            expect(await dappHomes.owner()).to.equal(owner.address)
        })

        it('should be initially unpaused', async function () {
            const {dappHomes, owner } = await loadFixture(
                deployDappHomesFixture
            )

            expect(await dappHomes.paused()).to.equal(false)
        })
    })

    describe('pausable', function () {
        it('should be paused by owner', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await dappHomes.pause()

            expect(await dappHomes.paused()).to.equal(true)
        })

        it('should be paused only by owner', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await expect(dappHomes.connect(otherAccount).pause())
            .to.be.revertedWithCustomError(dappHomes, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should be unpaused by owner', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await dappHomes.pause()
            await dappHomes.unpause()

            expect(await dappHomes.paused()).to.equal(false)
        })

        it('should be unpaused only by owner', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await expect(dappHomes.connect(otherAccount).unpause())
            .to.be.revertedWithCustomError(dappHomes, 'OwnableUnauthorizedAccount')
            .withArgs(otherAccount.address)
        })

        it('should fail when re-pause', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await dappHomes.pause()

            await expect(dappHomes.pause())
            .to.be.revertedWithCustomError(dappHomes, 'EnforcedPause')
        })

        it('should fail when re-unpaused', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await expect(dappHomes.unpause())
            .to.be.revertedWithCustomError(dappHomes, 'ExpectedPause')
        })

        it('add marketplace should fail when paused', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await dappHomes.pause()

            await expect(dappHomes.createMarketplace(
                price, duration, token
            ))
            .to.be.revertedWithCustomError(dappHomes, 'EnforcedPause')
        })
    })

    describe('events', function () {
        it('should emit an event on create marketplace', async function () {
            const {dappHomes, owner, otherAccount } = await loadFixture(
                deployDappHomesFixture
            )

            await expect(dappHomes.connect(otherAccount).createMarketplace(
                price, duration, token
            )).to.emit(dappHomes, "CreateMarketplace")
            .withArgs(
                otherAccount.address,
                anyValue
            )
        })
    })
})
