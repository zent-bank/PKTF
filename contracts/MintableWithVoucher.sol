pragma solidity ^0.4.23;  

import "./PrivateToken.sol";
import "./strings.sol";

contract MintableWithVoucher is PrivateToken {
    mapping(uint256 => bool) usedVouchers;
    mapping(bytes32 => uint32) holderRedemptionCount;
    using strings for *;
    
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
        string runnigNumber,
        string amount, 
        string expire,
        string receiver,
        string parity,
        string socialHash
    )  
        public
        // isNotFreezed
        // voucherIsNotExpired(expire)
        // isVoucherUnUsed(runnigNumber) 
        {
        string memory str = concatStr(
            runnigNumber,
            amount, 
            receiver,
            expire, 
            parity,
            socialHash
        );

        bytes32 hash = keccak256(str);
        
        require(getOriginAddress(hash, _v, _r, _s) == owner(), "message must sign by owner");

        // // Mint
        // _mint(receiver, amount);

        // // Record new holder
        // _recordNewTokenHolder(receiver);

        // markVoucherAsUsed(runnigNumber);

        // holderRedemptionCount[socialHash]++;

        // emit VoucherUsed(expire, runnigNumber, amount,  expire, parity, receiver, socialHash);
    }
    
    function getOriginAddress(
        bytes32 signedMessage, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) internal returns(address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(prefix, signedMessage);
        return ecrecover(prefixedHash, v, r, s);
    }
        
    function concatStr(
        string runnigNumber,
        string amount, 
        string receiver,
        string expire, 
        string parity,
        string socialHash
    ) public view returns (string) {
        string memory s1 = runnigNumber.toSlice().concat(amount.toSlice());
        string memory s2 = receiver.toSlice().concat(expire.toSlice());
        string memory s3 = parity.toSlice().concat(socialHash.toSlice());
        string memory s4 = s1.toSlice().concat(s2.toSlice());
        string memory s5 = s4.toSlice().concat(s3.toSlice());

        return s5;
    }
    
    // function ecRecover(bytes32 _hash, uint8 _v, bytes32 _r, bytes32 _s) public view returns(bool) {
    //     return (ecrecover(_hash, _v, _r, _s) == owner());
    // }
    
    // function getHash(string paintext) public view returns (bytes32) {
    //     return keccak256(paintext);
    // }
    
    // function getContatString(
    //         string runnigNumber,
    //         string amount, 
    //         string receiver,
    //         string expire, 
    //         string parity,
    //         string socialHash) public view returns (string) {
    //     return concatStr(
    //         runnigNumber,
    //         amount, 
    //         receiver,
    //         expire, 
    //         parity,
    //         socialHash
    //     );
    // }
    
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
