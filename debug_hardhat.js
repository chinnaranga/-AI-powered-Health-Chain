import * as h from "hardhat";
console.log("Keys on namespace import:", Object.keys(h));
if (h.default) {
    console.log("Keys on default export:", Object.keys(h.default));
} else {
    console.log("h.default is undefined");
}
