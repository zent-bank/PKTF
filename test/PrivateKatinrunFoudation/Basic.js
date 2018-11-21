// const ERC20_Token = artifacts.require("./erc20/ERC20_Token.sol");
const PrivateKatinrunFoudation = artifacts.require("./PrivateKatinrunFoudation.sol");

contract("PrivateKatinrunFoudation", accounts => {
  let instance

  before('Init', async() => {
    instance = await PrivateKatinrunFoudation.deployed();
  })

  it("should name be Private Katinrun Foundation", async () => {
    // Get name from public variable getter
    const name = await instance.name.call();

    assert.equal(name, "Private Katinrun Foundation", "Name sbould be 'Private Katinrun Foundation'");
  });

  it("should symbol be PKTF", async () => {
    // Get symbole from public variable getter
    const symbol = await instance.symbol.call();

    assert.equal(symbol, "PKTF", "Symbol sbould be 'PKTF'");
  });

  it("should decimals be 18", async () => {
    // Get symbole from public variable getter
    const decimals = await instance.decimals.call();

    assert.equal(decimals, 18, "Decimal should be 18");
  });

  it("should total supply be 0", async () => {
    // Get symbole from public variable getter
    const totalSupply = await instance.totalSupply.call();

    assert.equal(totalSupply, 0, "Total supply should be 0");
  });

  describe("Approving", async() => {
    it("Approve to accounts[1] from accounts[0]", async() => {
      // Allow exchange
      await instance.approve(
        accounts[1],
        web3.toWei(1000000, "ether"),
        {from: accounts[0]}
      )
      console.log('allowed exchange')

      // Verify approved
      let approveAmount = await instance.allowance.call(
        accounts[0],
        accounts[1]
      )
      assert.equal(approveAmount.toNumber(), web3.toWei(1000000, "ether"), "Approved amount is not correct");
    })
  })
});