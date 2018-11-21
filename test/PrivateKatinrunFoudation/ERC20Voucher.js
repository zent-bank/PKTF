const PrivateKatinrunFoudation = artifacts.require("./PrivateKatinrunFoudation.sol")
const BigNumber = require('bignumber.js');


contract("PrivateKatinrunFoudation", accounts => {
  let instance
  let owner
  let user1
  let user2
  let expectedTotalSupply = BigNumber('0')
  let expectedTokenHolders = BigNumber('0')

  before('Init', async () => {
    instance = await PrivateKatinrunFoudation.deployed()
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
  })

  function signByOwner(
    owner,
    expire,
    runnigNumber,
    amount,
    parity,
    receiver,
    socialHash,
) {  
    const message = `Running: ${runnigNumber} Amount: ${amount} PKTF for ${receiver} Expired: ${expire} Parity: ${parity} Social: ${socialHash}`;
    const messageHex = message.toString('hex');
    console.log('message', message);
    console.log('messageHex', messageHex);
    const signatureObject = owner.sign(messageHex);
    return signatureObject;
  }
  
  function getOwner(privateKey) {
    const owner = web3.eth.accounts.privateKeyToAccount(privateKey);
    // console.log('owner', owner);
    return owner;
  }

  describe('voucher', async () => {
    it("can redeem voucher", async () => {
      const privateKey = '0xad4aeafa53adfebde0eae2ecfd145a9e3a3e7ac49dce8b366b5bef82aca63861';
      const voucher = {
        expire: '123456789',
        runnigNumber: '1',
        amount: '1000',
        parity: '1234',
        receiver: user1,
        socialHash: '0x12',
      }

      const signature = signByOwner(
        getOwner(privateKey), // owner wallet
        voucher.expire,
        voucher.runnigNumber,
        voucher.amount,
        voucher.parity,
        voucher.receiver,
        voucher.socialHash,
      );

      try{
        const txHash = await instance.redeemVoucher(
          signature._v, 
          signature._r, 
          signature._s, 
          voucher.expire,
          voucher.runnigNumber,
          voucher.amount,
          voucher.parity,
          voucher.receiver,
          voucher.socialHash,
        ).send({
          from: owner,
          value: 0,
        })
        assert.ok(txHash, `this voucher can redeem`)
      } catch (error) {
        assert(false, error)
      }      
    })
  })
})
