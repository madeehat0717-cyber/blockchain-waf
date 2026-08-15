import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Deploying FirewallRuleRegistry...");

  const FirewallRuleRegistry = await hre.ethers.getContractFactory("FirewallRuleRegistry");
  const registry = await FirewallRuleRegistry.deploy();
  await registry.waitForDeployment();
  
  const address = await registry.getAddress();
  console.log(`FirewallRuleRegistry deployed to: ${address}`);

  const artifact = await hre.artifacts.readArtifact("FirewallRuleRegistry");
  
  const deploymentData = {
    address: address,
    abi: artifact.abi
  };

  const outputDir = path.join(__dirname, "../../backend/app/blockchain_data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, "contract.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("Deployment data saved to backend/app/blockchain_data/contract.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
