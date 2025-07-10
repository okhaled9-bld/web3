// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract TokenFactory {
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialSupply
    );

    struct TokenInfo {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 createdAt;
    }

    TokenInfo[] public tokens;
    mapping(address => TokenInfo[]) public userTokens;

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        SimpleToken newToken = new SimpleToken(
            name,
            symbol,
            initialSupply,
            msg.sender
        );

        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: address(newToken),
            creator: msg.sender,
            name: name,
            symbol: symbol,
            initialSupply: initialSupply,
            createdAt: block.timestamp
        });

        tokens.push(tokenInfo);
        userTokens[msg.sender].push(tokenInfo);

        emit TokenCreated(
            address(newToken),
            msg.sender,
            name,
            symbol,
            initialSupply
        );

        return address(newToken);
    }

    function getAllTokens() external view returns (TokenInfo[] memory) {
        return tokens;
    }

    function getUserTokens(address user) external view returns (TokenInfo[] memory) {
        return userTokens[user];
    }

    function getTokenCount() external view returns (uint256) {
        return tokens.length;
    }
}
