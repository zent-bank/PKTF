const PrivateKatinrunFoundation = artifacts.require("./PrivateKatinrunFoudation.sol")
const BigNumber = require('bignumber.js');
const assert = require('assert');

contract("PrivateKatinrunFoudation", accounts => {
    let instance
    let owner
    let user1
    let user2
    let expectedTotalSupply = BigNumber('0')
    let expectedTokenHolders = BigNumber('0')

    const amountToMintToOwner = web3.utils.toWei('1000000', "ether")
    const amountToMintToUser1 = web3.utils.toWei('5000000', "ether")
    const amountToMintToUser2 = web3.utils.toWei('2000000', "ether")

    async function mintTo(user, amount) {
        // Minting
        await instance.mint(
            user,
            amount,
            {from: owner}
        )
    }

    async function verifyBalance(user, expectedBalance) {
        const balance = await instance.balanceOf(user)
        assert.equal(balance.toString(10), expectedBalance, `Balance should be ${expectedBalance}`)
    }

    async function verifyTotalSupply() {
        const totalSupply = await instance.totalSupply()
        const expectedTotalSupplyStrig = web3.utils.toWei(expectedTotalSupply.toString(10), "ether")
        assert.equal(totalSupply.toString(10), expectedTotalSupplyStrig, `Total supply should be ${expectedTotalSupplyStrig}`)
    }

    async function verifyTokenHolders() {
        const numberOfTokenHolders = await instance.numberOfTokenHolders()
        assert.equal(numberOfTokenHolders.toString(10), expectedTokenHolders.toString(10), `Holders count should be ${expectedTokenHolders.toString(10)}`)
    }

    describe('Freeze Private Token', async() => {
        beforeEach(async() => {
            instance = await PrivateKatinrunFoundation.new()
            owner = accounts[0]
            user1 = accounts[1]
            user2 = accounts[2]

            // Mint to owner
            expectedTotalSupply = expectedTotalSupply.plus(BigNumber('1000000'))
            expectedTokenHolders = expectedTokenHolders.plus(BigNumber('1'))
            await mintTo(owner, amountToMintToOwner)

            // Mint to user1
            expectedTotalSupply = expectedTotalSupply.plus(BigNumber('5000000'))
            expectedTokenHolders = expectedTokenHolders.plus(BigNumber('1'))
            await mintTo(owner, amountToMintToUser1)

            // Mint to user2
            expectedTotalSupply = expectedTotalSupply.plus(BigNumber('2000000'))
            expectedTokenHolders = expectedTokenHolders.plus(BigNumber('1'))
            await mintTo(owner, amountToMintToUser2)
        })

        it('Mint to owner', async() => {
            //apply freeze
            await instance.freeze({from: owner})

            // verify mint
            try {
                await mintTo(owner, web3.utils.toWei('10000', "ether"))
            } catch (err) {
                assert(err);
                return;
            }
            assert(false);

            await verifyBalance(owner, amountToMintToOwner);
            await verifyTotalSupply();
            await verifyTokenHolders();
        })

        it('Transfer (owner) to user1', async() => {
            // apply freeze
            await instance.freeze({from: owner})

            // verify transfer
            try {
                await instance.transfer(user1, web3.utils.toWei('99', "ether"), {from: owner});
            }catch (err) {
                assert(err);
                return;
            }
            assert(false);

            await verifyBalance(owner, amountToMintToOwner);
            await verifyBalance(user1, amountToMintToUser1);
        });

        // please re-check here
        it('Transfer from user1 to user2', async() => {
            // apply freeze
            await instance.freeze({from: owner})

            // verify transfer
            try {
                await instance.transferFrom(user1, user2, web3.utils.toWei('24552', "ether"));
            }catch (err) {
                assert(err);
                return;
            }
            assert(false);

            await verifyBalance(user2, amountToMintToUser2);
            await verifyBalance(user1, amountToMintToUser1);
        });

        it('burn token', async() => {
            // apply freeze
            await instance.freeze({from: owner})

            // verify transfer
            try {
                await instance.burn(web3.utils.toWei('22345', "ether"), {from: owner});
            }catch (err) {
                assert(err);
                return;
            }
            assert(false);

            await verifyTotalSupply();
        });

        // please re-check here
        it('burn token target account', async() => {
            // apply freeze
            // await instance.freeze({from: owner})

            // verify transfer
            try {
                await instance.burn(user1, web3.utils.toWei('22222', "ether"), {from: owner});
            }catch (err) {
                assert(err);
                return;
            }
            assert(false);

            await verifyBalance(user1, amountToMintToUser1);
            await verifyTotalSupply();
        });

    })
})