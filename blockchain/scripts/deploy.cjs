const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const Healthcare = await hre.ethers.getContractFactory("Healthcare");
    const healthcare = await Healthcare.deploy();

    await healthcare.waitForDeployment();
    const address = await healthcare.getAddress();

    console.log(`Healthcare deployed to ${address}`);

    // Save address to src/contract-address.json
    const addressPath = path.join(__dirname, '../../src/contract-address.json');
    fs.writeFileSync(addressPath, JSON.stringify({ Healthcare: address }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
