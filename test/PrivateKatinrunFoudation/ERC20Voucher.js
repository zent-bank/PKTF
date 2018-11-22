const PrivateKatinrunFoudation = artifacts.require("./PrivateKatinrunFoudation.sol")


contract("PrivateKatinrunFoudation", accounts => {
  let instance
  let owner
  let user1
  const hexFunc = web3.utils.sha3

  before('Init', async () => {
    instance = await PrivateKatinrunFoudation.deployed()
    owner = accounts[0]
    // console.log('owner', owner);
    user1 = accounts[1]
  })

  function sign(
    owner,
    runnigNumber,
    amount,
    expire,
    receiver,
    parity,
    socialHash,
) {  
    const message = `${runnigNumber}${amount}${receiver}${expire}${parity}${socialHash}`;
    const messageHex = hexFunc(message);

    // console.log('message', message);
    // console.log('messageHex', messageHex);

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
        runnigNumber: '1',
        amount: '1000',
        receiver: user1,
        expire: '123456789',
        parity: '1234',
        socialHash: '0x12',
      }
      // console.log('voucher', voucher);
      const signature = sign(
        getWallet(privateKey), // owner wallet
        voucher.runnigNumber,
        voucher.amount,
        voucher.expire,
        voucher.receiver,
        voucher.parity,
        voucher.socialHash,
      );
      
      // console.log('signature', signature);
      try{
        const txHash = await instance.redeemVoucher(
          signature.v, 
          signature.r, 
          signature.s, 
          voucher.runnigNumber,
          voucher.amount,
          voucher.expire,
          voucher.receiver,
          voucher.parity,
          voucher.socialHash,
        {
          from: owner,
        });
        return;
      } catch (error) {
        console.log('error', error.message);
      }
      assert(false, 'This transaction signed by other');
    })

    it("Cannot redeem voucher if signed by other", async () => {
      // const privateKey = '0xad4aeafa53adfebde0eae2ecfd145a9e3a3e7ac49dce8b366b5bef82aca63861'; // owner
      const privateKey = '0x2268bdaf93b33e22251ad45fea8bbc8f80a207a31d5095f86ba7507289fadaba'; // user 1
      const voucher = {
        runnigNumber: '1',
        amount: '1000',
        receiver: user1,
        expire: '123456789',
        parity: '1234',
        socialHash: '0x12',
      }
      // console.log('voucher', voucher);
      const signature = sign(
        getWallet(privateKey), // owner wallet
        voucher.runnigNumber,
        voucher.amount,
        voucher.expire,
        voucher.receiver,
        voucher.parity,
        voucher.socialHash,
      );
      
      // console.log('signature', signature);
      try{
        const txHash = await instance.redeemVoucher(
          signature.v, 
          signature.r, 
          signature.s, 
          voucher.runnigNumber,
          voucher.amount,
          voucher.expire,
          voucher.receiver,
          voucher.parity,
          voucher.socialHash,
        {
          from: owner,
        });
        // assert(false)
      } catch (error) {
        // console.log('error', error.message);
        return;
      }
      assert(false, 'This transaction signed by owner');
    })
  })
})
