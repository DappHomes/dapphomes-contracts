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
})
