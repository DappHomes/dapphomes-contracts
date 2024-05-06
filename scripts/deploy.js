'use strict'

const { Web3 } = require('web3')
const dotenv = require('dotenv')
const MarketplaceCompilation = require('../artifacts/contracts/Marketplace.sol/Marketplace.json')

// get env configuration
dotenv.config()
// get web3 provider
const web3 = new Web3(process.env.WEB3_PROVIDER)

async function deployMarketplace() {
    console.log(`* Trying to deploy marketplace from account: ${process.env.WEB3_PUBLIC_KEY}`)

    const result = await new web3.eth.Contract(MarketplaceCompilation.abi)
        .deploy({
            data: MarketplaceCompilation.bytecode,
            arguments: [
                process.env.MARKETPLACE_INITIAL_PRICE,
                process.env.MARKETPLACE_INITIAL_DURATION
            ]
        })
        .send({
            from: process.env.WEB3_PUBLIC_KEY,
            gasPrice: await web3.eth.getGasPrice(),
            gas: '4600000'
        })

    return result.options.address
}

deployMarketplace()
    .then(marketplaceAddress => {
        console.log(`* Marketplace deployed at address: ${marketplaceAddress}`)
    })
    .catch(error => console.log(error))
