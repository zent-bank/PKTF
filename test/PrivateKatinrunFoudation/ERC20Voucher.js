const PrivateKatinrunFoudation = artifacts.require("./PrivateKatinrunFoudation.sol")


contract("PrivateKatinrunFoudation", accounts => {
  let instance
  let owner
  let user1
  const hexFunc = web3.utils.sha3

  before('Init', async () => {
    instance = await PrivateKatinrunFoudation.deployed()
    owner = accounts[0]
    console.log('owner', owner);
    user1 = accounts[1]
  })

  function sign(
    owner,
    expire,
    runnigNumber,
    amount,
    parity,
    receiver,
    socialHash,
) {  
    // const message = `Running: ${runnigNumber} Amount: ${amount} PKTF for ${receiver} Expired: ${expire} Parity: ${parity} Social: ${socialHash}`;
    const message = `${runnigNumber}${amount}${receiver}${expire}${parity}${socialHash}`;
    const messageHex = hexFunc(message);

    console.log('message', message);
    console.log('messageHex', messageHex);

    const signatureObject = owner.sign(messageHex);
    return signatureObject;
  }
  
  function getWallet(privateKey) {
    const owner = web3.eth.accounts.privateKeyToAccount(privateKey);
    return owner;
  }

  describe('Voucher', async () => {
    it("Can redeem voucher if signed by owner", async () => {
      const privateKey = '0xad4aeafa53adfebde0eae2ecfd145a9e3a3e7ac49dce8b366b5bef82aca63861';
      const voucher = {
        expire: '123456789',
        runnigNumber: '1',
        amount: '1000',
        parity: '1234',
        receiver: user1,
        socialHash: '0x12',
      }
      console.log('voucher', voucher);
      const signature = sign(
        getWallet(privateKey), // owner wallet
        voucher.expire,
        voucher.runnigNumber,
        voucher.amount,
        voucher.parity,
        voucher.receiver,
        voucher.socialHash,
      );
      
      let err = null
      console.log('signature', signature);
      try{
        const txHash = await instance.redeemVoucher(
          signature.v, 
          signature.r, 
          signature.s, 
          voucher.expire,
          voucher.runnigNumber,
          voucher.amount,
          voucher.parity,
          voucher.receiver,
          voucher.socialHash,
        {
          from: owner,
        });
        console.log('txHash', txHash);
      } catch (error) {
        console.log('error', error)
        err = error
      }
      assert.ok(err instanceof Error)
    })

    // it("Cannot redeem voucher if signed by other", async () => {
    //   const privateKey = '0x13fa9ad5f345292e608f0624be04da00b016b84104a83c638bfc6e4c9cf46d66';
    //   const voucher = {
    //     expire: '123456789',
    //     runnigNumber: '1',
    //     amount: '1000',
    //     parity: '1234',
    //     receiver: user1,
    //     socialHash: '0x12',
    //   }

    //   const signature = sign(
    //     getWallet(privateKey), // owner wallet
    //     voucher.expire,
    //     voucher.runnigNumber,
    //     voucher.amount,
    //     voucher.parity,
    //     voucher.receiver,
    //     voucher.socialHash,
    //   );

    //   try{
    //     const txHash = await instance.redeemVoucher(
    //       signature._v, 
    //       signature._r, 
    //       signature._s, 
    //       voucher.expire,
    //       voucher.runnigNumber,
    //       voucher.amount,
    //       voucher.parity,
    //       voucher.receiver,
    //       voucher.socialHash,
    //     ).send({
    //       from: owner
    //     });
    //     console.log('success')
    //   } catch (error) {
    //     console.log('fail')
    //     return;
    //   }
    //   assert(false);
    // })
  })
})
