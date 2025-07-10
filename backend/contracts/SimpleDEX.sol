// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SimpleDEX is ReentrancyGuard {
    event LiquidityAdded(
        address indexed token,
        address indexed provider,
        uint256 tokenAmount,
        uint256 ethAmount
    );

    event LiquidityRemoved(
        address indexed token,
        address indexed provider,
        uint256 tokenAmount,
        uint256 ethAmount
    );

    event TokensPurchased(
        address indexed buyer,
        address indexed token,
        uint256 ethAmount,
        uint256 tokenAmount
    );

    event TokensSold(
        address indexed seller,
        address indexed token,
        uint256 tokenAmount,
        uint256 ethAmount
    );

    struct Pool {
        uint256 tokenReserve;
        uint256 ethReserve;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidity;
    }

    mapping(address => Pool) public pools;
    address[] public tokenList;

    function addLiquidity(address token, uint256 tokenAmount) 
        external 
        payable 
        nonReentrant 
    {
        require(token != address(0), "Invalid token address");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(msg.value > 0, "ETH amount must be greater than 0");

        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        Pool storage pool = pools[token];
        
        if (pool.totalLiquidity == 0) {
            // First liquidity provider
            pool.tokenReserve = tokenAmount;
            pool.ethReserve = msg.value;
            pool.totalLiquidity = msg.value; // Use ETH as liquidity token
            pool.liquidity[msg.sender] = msg.value;
            tokenList.push(token);
        } else {
            // Subsequent liquidity providers
            uint256 ethLiquidity = (msg.value * pool.totalLiquidity) / pool.ethReserve;
            uint256 tokenLiquidity = (tokenAmount * pool.totalLiquidity) / pool.tokenReserve;
            
            uint256 liquidityMinted = ethLiquidity < tokenLiquidity ? ethLiquidity : tokenLiquidity;
            
            pool.tokenReserve += tokenAmount;
            pool.ethReserve += msg.value;
            pool.totalLiquidity += liquidityMinted;
            pool.liquidity[msg.sender] += liquidityMinted;
        }

        emit LiquidityAdded(token, msg.sender, tokenAmount, msg.value);
    }

    function removeLiquidity(address token, uint256 liquidityAmount) 
        external 
        nonReentrant 
    {
        Pool storage pool = pools[token];
        require(pool.liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");

        uint256 ethAmount = (liquidityAmount * pool.ethReserve) / pool.totalLiquidity;
        uint256 tokenAmount = (liquidityAmount * pool.tokenReserve) / pool.totalLiquidity;

        pool.liquidity[msg.sender] -= liquidityAmount;
        pool.totalLiquidity -= liquidityAmount;
        pool.ethReserve -= ethAmount;
        pool.tokenReserve -= tokenAmount;

        payable(msg.sender).transfer(ethAmount);
        IERC20(token).transfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(token, msg.sender, tokenAmount, ethAmount);
    }

    function buyTokens(address token) external payable nonReentrant {
        require(msg.value > 0, "ETH amount must be greater than 0");
        
        Pool storage pool = pools[token];
        require(pool.ethReserve > 0, "Pool does not exist");

        uint256 tokenAmount = getTokenAmountOut(token, msg.value);
        require(tokenAmount > 0, "Insufficient output amount");

        pool.ethReserve += msg.value;
        pool.tokenReserve -= tokenAmount;

        IERC20(token).transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, token, msg.value, tokenAmount);
    }

    function sellTokens(address token, uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        
        Pool storage pool = pools[token];
        require(pool.tokenReserve > 0, "Pool does not exist");

        uint256 ethAmount = getEthAmountOut(token, tokenAmount);
        require(ethAmount > 0, "Insufficient output amount");

        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        pool.tokenReserve += tokenAmount;
        pool.ethReserve -= ethAmount;

        payable(msg.sender).transfer(ethAmount);

        emit TokensSold(msg.sender, token, tokenAmount, ethAmount);
    }

    function getTokenAmountOut(address token, uint256 ethAmountIn) 
        public 
        view 
        returns (uint256) 
    {
        Pool storage pool = pools[token];
        if (pool.ethReserve == 0 || pool.tokenReserve == 0) return 0;

        // Simple constant product formula: x * y = k
        // tokenAmountOut = (tokenReserve * ethAmountIn) / (ethReserve + ethAmountIn)
        uint256 numerator = pool.tokenReserve * ethAmountIn;
        uint256 denominator = pool.ethReserve + ethAmountIn;
        return numerator / denominator;
    }

    function getEthAmountOut(address token, uint256 tokenAmountIn) 
        public 
        view 
        returns (uint256) 
    {
        Pool storage pool = pools[token];
        if (pool.ethReserve == 0 || pool.tokenReserve == 0) return 0;

        // ethAmountOut = (ethReserve * tokenAmountIn) / (tokenReserve + tokenAmountIn)
        uint256 numerator = pool.ethReserve * tokenAmountIn;
        uint256 denominator = pool.tokenReserve + tokenAmountIn;
        return numerator / denominator;
    }

    function getPoolInfo(address token) 
        external 
        view 
        returns (uint256 tokenReserve, uint256 ethReserve, uint256 totalLiquidity) 
    {
        Pool storage pool = pools[token];
        return (pool.tokenReserve, pool.ethReserve, pool.totalLiquidity);
    }

    function getUserLiquidity(address token, address user) 
        external 
        view 
        returns (uint256) 
    {
        return pools[token].liquidity[user];
    }

    function getAllTokens() external view returns (address[] memory) {
        return tokenList;
    }
}
