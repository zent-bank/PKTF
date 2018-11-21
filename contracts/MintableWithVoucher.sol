pragma solidity ^0.4.23;  

import "./PrivateToken.sol";

contract MintableWithVoucher is PrivateToken {
    mapping(uint256 => bool) usedVouchers;
    mapping(bytes32 => uint32) holderRedemptionCount;
    
    event VoucherUsed(
        uint256 expire, 
        uint256 runnigNumber, 
        uint256 amount,  
        uint256 expired, 
        uint256 parity, 
        address indexed receiver, // use indexed for easy to filter event
        bytes32 socialHash
    );

    modifier isVoucherUnUsed(uint256 runnigNumber) {
        require(!usedVouchers[runnigNumber]);
        _;
    }
    
    function markVoucherAsUsed(uint256 runnigNumber) private {
        usedVouchers[runnigNumber] = true;
    }

    function getHolderRedemptionCount(bytes32 socialHash) public view returns(uint32) {
        return holderRedemptionCount[socialHash];
    }

    modifier voucherIsNotExpired(uint256 expired) {
        require(expired >= now);
        _;
    }

    // Implement voucher system
    function redeemVoucher(
        uint8 _v, 
        bytes32 _r, 
        bytes32 _s, 
        string expire, 
        string runnigNumber,
        string amount, 
        string parity,
        string receiver,
        string socialHash
    )  
        public 
        // isNotFreezed
        // voucherIsNotExpired(expire)
        // isVoucherUnUsed(runnigNumber) 
        {
        string memory longStr = concatStr(
            expire, 
            runnigNumber,
            amount, 
            parity,
            receiver,
            socialHash
        );
        
        bytes32 hash = keccak256(longStr);
            
        require(ecrecover(hash, _v, _r, _s) == owner());

        // // Mint
        // _mint(receiver, amount);

        // // Record new holder
        // _recordNewTokenHolder(receiver);

        // markVoucherAsUsed(runnigNumber);

        // holderRedemptionCount[socialHash]++;

        // emit VoucherUsed(expire, runnigNumber, amount,  expire, parity, receiver, socialHash);
    }

    function strConcat(string _a, string _b, string _c, string _d, string _e) internal returns (string){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }
    
    function concatStr(
        string expire, 
        string runnigNumber,
        string amount, 
        string parity,
        string receiver,
        string socialHash
    ) internal view returns (string) {
        return strConcat(runnigNumber, amount, receiver, expire, strConcat(parity, socialHash, "", "", ""));
        // 110000x2ac8c9810A4f4570aAbfEE01a074DB75807335F012345678912340x12
        // 110000x0b88850c7F0509531C56DCA1f50882151fB40DB112345678912340x12
    }
    
    function ecRecover(bytes32 _hash, uint8 _v, bytes32 _r, bytes32 _s) public view returns(bool) {
        return (ecrecover(_hash, _v, _r, _s) == owner());
    }
    
    function getHash(string paintext) public view returns (bytes32) {
        // string memory hash = 'Running: 1 Amount: 1000 PKTF for 0x2ac8c9810A4f4570aAbfEE01a074DB75807335F0 Expired: 123456789 Parity: 1234 Social: 0x12';
        return keccak256(paintext);
    }
    
    /**
        * @dev Function to mint tokens
        * @param to The address that will receive the minted tokens.
        * @param value The amount of tokens to mint.
        * @return A boolean that indicates if the operation was successful.
        */
    function mint(address to,uint256 value) 
        public
        onlyOwner // todo: or onlyMinter
        isNotFreezed
        returns (bool)
    {
        _mint(to, value);

        // Record new holder
        _recordNewTokenHolder(to);

        return true;
    }

    /**
        * @dev Burns a specific amount of tokens. Only owner can burn themself.
        * @param value The amount of token to be burned.
        */
    function burn(uint256 value) 
        public
        onlyOwner
        isNotFreezed {

        burn(msg.sender, value);
    }

    /**
        * @dev Internal function that burns an amount of the token of a given
        * account.
        * @param account The account whose tokens will be burnt.
        * @param value The amount that will be burnt.
        */
    function burn(address account, uint256 value) 
        public 
        onlyOwner
        isNotFreezed
        {
        require(account != address(0));

        _burn(account, value);

        _removeTokenHolder(msg.sender);
    }
}
