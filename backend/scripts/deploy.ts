import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy TokenFactory
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.waitForDeployment();
  console.log("TokenFactory deployed to:", await tokenFactory.getAddress());

  // Deploy SimpleDEX
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const simpleDEX = await SimpleDEX.deploy();
  await simpleDEX.waitForDeployment();
  console.log("SimpleDEX deployed to:", await simpleDEX.getAddress());

  // Get signers
  const [owner] = await ethers.getSigners();
  console.log("Owner address:", owner.address);

  // Create some sample tokens
  console.log("\nCreating sample tokens...");

  // Create USDC token
  const createUSDCTx = await tokenFactory.createToken(
    "USD Coin",
    "USDC",
    1000000 // 1M tokens
  );
  await createUSDCTx.wait();

  // Create WBTC token
  const createWBTCTx = await tokenFactory.createToken(
    "Wrapped Bitcoin",
    "WBTC",
    21000 // 21K tokens
  );
  await createWBTCTx.wait();

  // Create LINK token
  const createLINKTx = await tokenFactory.createToken(
    "Chainlink",
    "LINK",
    1000000000 // 1B tokens
  );
  await createLINKTx.wait();

  // Get all created tokens
  const allTokens = await tokenFactory.getAllTokens();
  console.log("\nCreated tokens:");
  for (let i = 0; i < allTokens.length; i++) {
    const token = allTokens[i];
    console.log(`${i + 1}. ${token.name} (${token.symbol})`);
    console.log(`   Address: ${token.tokenAddress}`);
    console.log(`   Supply: ${token.initialSupply.toString()}`);
  }

  // Save deployment addresses to a file
  const deploymentInfo = {
    tokenFactory: await tokenFactory.getAddress(),
    simpleDEX: await simpleDEX.getAddress(),
    tokens: allTokens.map((token: any) => ({
      name: token.name,
      symbol: token.symbol,
      address: token.tokenAddress,
      initialSupply: token.initialSupply.toString()
    }))
  };

  console.log("\nDeployment completed!");
  console.log("Contract addresses:", deploymentInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
