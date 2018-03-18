# Name Bidding App
This repository contains code for a Name Bidding DAPP. It contains a simple React UI which interacts with an ethereum solidity contract, which in turn handles several scenarios which might occur in a Name Bidding App like reserving a name, releasing it, placing bids on names, accepting bids and transferring funds using name.

## Installation ##

1. **npm and node** is required.

2. Install Truffle globally.
    ```
    npm install -g truffle
    ```

3. Install node modules.
    ```
    npm install
    ```
3. Start local test blockchain
    ```
    npm install -g ganache-cli
    ganache-cli --gasLimit 300000000
    ```
    **NOTE:** Need to convert NameContract into smaller contracts in order to fit under mainNet gasLimit
    
4. Go inside contracts folder and deploy the contracts to a local ethereum network
    ```
    truffle compile
    truffle migrate
    ```

5. Run tests for JS and solidity.
    ```
    truffle test
    ```

6. Start the application.
   Should be available at http://localhost:3000
    ```
    npm run start
    ```

## Features And Assumptions ##

### 1. Reserve Name ###
* A name can be reserved by anyone for some amount of ether, the amount is sent to the contract Owner.
* Name can be reserved only if available.
* *Event NameReserved logged*

### 2. Release Name ###
* It releases the name and makes it available to everyone.
* **NOTE:** Does not send back the ether to owner
* *Event NameReleased logged*

### 3. Place Bid ###
* Places bid for an already reserved name.
* The bid amount has to be greater than the amount that owner has purchased the name at.
* *Event BidPlaced logged*
* **NOTE:** A user who has already placed a bid, can only place a new bid, cannot update existing bid.

### 4. Accept the highest bid ###
* Accepts the highest bid present in the system, transfers name to highest bidder and returns ether to all low bidders.
* *Event HighestBidAccepted logged*
* **NOTE:** Can only be called by the owner of the name.

### 5. Transfer funds to an owner of name ###
* Can transfer funds to anyone in the system using name.
* *Event ReturnEtherToLowBidOwner logged*

### 6. Name Available ###
* Checks if name is available.

### 5. Get Name Details ###
* Gets name owner and name bid of a reserved name.

### 5. Retrieve Bids ###
* Gets all the bids placed against a name for a particular index.

### Testing ###
* Deployed and tested by using the truffle framework
* Run `truffle test`
* NameContract.js and TestNameContract.sol contains in total 12 tests which test all of the above scenarios

### Author ###

* [Suraj Kohli](https://bitbucket.org/surajkohli/dns_app_ethereum)
