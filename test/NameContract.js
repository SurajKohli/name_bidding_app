var NameContract = artifacts.require("./NameContract.sol");

contract('NameContract', function(accounts) {
  console.log(accounts);
  var account1 = accounts[0];
  var account4 = accounts[3];
  var account5 = accounts[4];
  var account6 = accounts[5];
  it("check if suraj name exists", function() {
    // web3.personal.unlockAccount(account1,"test",100000);
    return NameContract.deployed().then(function(instance) {
      return instance.isNameAvailable.call("suraj");
    }).then(function(nameAvailable) {
      assert.equal(nameAvailable, true, "suraj name is NOT available");
    });
  });

  it("should reserve suraj name", function() {
    // web3.personal.unlockAccount(account1,"test",100000);
    return NameContract.deployed().then(function(instance) {
      return instance.reserveName("suraj",
        { value: web3.toWei(1,"ether"), from: account1})
        .then(function(result,err){
          return instance.isNameAvailable.call("suraj");
        })
        .then(function(nameAvailable){
          assert.equal(nameAvailable, false, "suraj name has not been reserved ");
        });
    });
  });

  it("Get Details Of suraj name", function() {
    // web3.personal.unlockAccount(account1,"test",100000);
    return NameContract.deployed().then(function(instance) {
      return instance.getNameDetails.call("suraj");
    }).then(function(details){
          assert.equal(details[2],account1,"The accounts should be same");
        });
    });

  it("release suraj name SHOULD FAIL as using account other than account1", function() {
    // web3.personal.unlockAccount(account4,"test",100000);
    return NameContract.deployed().then(function(instance) {
      return instance.releaseName("suraj",
      { from: account4 });
    }).then(function(result,err){
        return instance.isNameAvailable.call("suraj");
        })
        .then(function(nameAvailable){
          assert.equal(nameAvailable, true, "suraj name released :( )");
        });
    });

    it("should reserve name kohli", function() {
      // web3.personal.unlockAccount(account4,"test",100000);
      return NameContract.deployed().then(function(instance) {
        return instance.reserveName("kohli",
          { value: web3.toWei(5,"ether"), from: account4})
          .then(function(result,err){
            return instance.isNameAvailable.call("kohli");
          })
          .then(function(nameAvailable){
            assert.equal(nameAvailable, false, "kohli name has not been reserved :( )");
          });
      });
    });

    it("place bid for name kohli from account5", function() {
      // web3.personal.unlockAccount(account5,"test",100000);
      return NameContract.deployed().then(function(instance) {
        return instance.placeBid("kohli",
          { value: web3.toWei(10,"ether"), from: account5})
          .then(function(result,err){
            return instance.getBidCount.call("kohli");
          })
          .then(function(count){
            assert.equal(count, 1, "bid place failed for name kohli -> count doesn't match");
          });
      });
    });

    it("place 2nd bid for name kohli from account6", function() {
      // web3.personal.unlockAccount(account6,"test",100000);
      return NameContract.deployed().then(function(instance) {
        return instance.placeBid("kohli",
          { value: web3.toWei(18,"ether"), from: account6})
          .then(function(result,err){
            return instance.getBidCount.call("kohli");
          })
          .then(function(count){
            assert.equal(count, 2, "bid place failed for name kohli -> count doesn't match");
          });
      });
    });

    it("accept highest Bid (only name owner can initiate this)", function() {
      // web3.personal.unlockAccount(account4,"test",100000);
      return NameContract.deployed().then(function(instance) {
        return instance.acceptHighestBid("kohli",
          { from: account4})
          .then(function(result,err){
            return instance.getNameDetails.call("kohli");
          })
          .then(function(details){
            assert.equal(details[2], account6, "acceptHighestBid failed -> details don't match");
          });
      });
    });

    it("send ether to owner of kohli name", function() {
      // web3.personal.unlockAccount(account1,"test",100000);
      return NameContract.deployed().then(function(instance) {
            var currentBalance = web3.eth.getBalance(account6);
            return instance.transferFunds("kohli",
            {from:account1,value:web3.toWei(10,"ether")})
            .then(function(result,err){
              var updatedBalance = web3.eth.getBalance(account6);
              assert(updatedBalance>currentBalance, "Transfer failed, balance not updated");
            });
      });
    });
});
