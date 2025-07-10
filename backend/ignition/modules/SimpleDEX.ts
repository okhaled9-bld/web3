import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleDEXModule = buildModule("SimpleDEXModule", (m) => {
  const simpleDEX = m.contract("SimpleDEX");

  return { simpleDEX };
});

export default SimpleDEXModule;
