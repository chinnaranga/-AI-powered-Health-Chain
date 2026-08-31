import { ethers } from "ethers";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // Connect to local hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Get signer (first account)
    const signer = await provider.getSigner();
    console.log("Deploying with account:", signer.address);

    // Read artifact
    const artifactPath = path.resolve(__dirname, '../../src/artifacts/blockchain/contracts/Healthcare.sol/Healthcare.json');
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found at ${artifactPath}`);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // Deploy
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy();

    // Wait for deployment
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("Healthcare deployed to:", address);

    // Save address
    const addressPath = path.join(__dirname, '../../src/contract-address.json');
    fs.writeFileSync(addressPath, JSON.stringify({ Healthcare: address }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
