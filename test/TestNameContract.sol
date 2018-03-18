pragma solidity ^0.4.18;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/NameContract.sol";

contract TestNameContract {
  function testNameAvailable() public {
    NameContract name = NameContract(DeployedAddresses.NameContract());
    bool nameAvailable = name.isNameAvailable("suraj");
    Assert.equal(nameAvailable, true, "suraj name is available");
  }

  function testBidCount() public {
    NameContract name = NameContract(DeployedAddresses.NameContract());
    uint bids = name.getBidCount("suraj");
    Assert.equal(bids, 0, "currently 0 bids");
  }

  function testContractOwner() public {
    NameContract name = new NameContract();
    address owner = name.contractOwner();
    Assert.equal(owner, address(this), "contract owner matches");
  }
}
