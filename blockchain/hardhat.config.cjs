const path = require('path');
console.log("Loading hardhat config...");
try {
    require("@nomicfoundation/hardhat-toolbox");
    console.log("Toolbox loaded successfully");
} catch (error) {
    console.error("Error loading toolbox:", error);
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    paths: {
        artifacts: path.join(__dirname, '../src/artifacts'),
        sources: path.join(__dirname, 'contracts'),
        cache: path.join(__dirname, 'cache'),
        tests: path.join(__dirname, 'test')
    }
};
