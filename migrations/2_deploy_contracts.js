var NameContract = artifacts.require("./NameContract.sol");

module.exports = function(deployer) {
  deployer.deploy(NameContract);
};
