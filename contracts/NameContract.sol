pragma solidity ^0.4.18;

contract NameContract {

    address public contractOwner;

    // constructor function
    function NameContract() public {
      contractOwner = msg.sender;
    }

    // ReservedName stores name details
    struct ReservedName {
      bool isReserved;
      uint bid;
      address owner;
    }

    // Bid containing necessary details
    struct Bid {
      address bidOwner;
      uint bidAmount;
    }

    // name is mapped to all the name details
    mapping(bytes32 => ReservedName) names;
    // name is mapped to array of Bids against that name
    mapping(bytes32 => Bid[10]) bidsInSystem;
    // store the highest bidder for a name
    mapping(bytes32 => Bid) highestBidder;
    // store the count of bids for a name
    mapping(bytes32 => uint) countOfBids;


    // Events
    event NameReserved(bytes32 _name, address _owner, uint _bid);
    event NameReleased(bytes32 _name, address _previousOwner);
    event BidPlaced(bytes32 _name, address _bidPlacedBy, uint _bidPlacedForAmount);
    event HighestBidAccepted(bytes32 _name, address _previousOwner, address _newOwner, uint updatedBidAmount);
    event ReturnEtherToLowBidOwner(bytes32 _name, address _ownerAddress, uint _amount);

    // Modifiers
    // checks if name is available
    modifier nameAvailable(bytes32 _name) { require(names[_name].isReserved == false); _; }
    // checks if name reserved
    modifier nameReserved(bytes32 _name) { require(names[_name].isReserved); _; }
    // checks if ether value is greater than 0
    modifier etherExists(){ require(msg.value > 0); _;}
    // checks if amount is greater than exisiting bid amount
    modifier checkBidAmount(bytes32 _name){ require(msg.value > names[_name].bid); _;}
    // checks if sender is contractOwner
    modifier onlyContractOwner(){ require(msg.sender == contractOwner); _;}
    // checks if sender is nameEntity owner
    modifier onlyNameEntityOwner(bytes32 _name){ require(msg.sender == names[_name].owner); _;}
    // checks if there is atleast 1 bid against the name
    modifier atleastOneBid(bytes32 _name){ require(getBidCount(_name) >= 1); _;}
    // check if bid index is less than countOfBids
    modifier indexLessThanCountOfBids(bytes32 _name, uint _index){ require(_index < countOfBids[_name]); _;}

    // Reserves a name if not already Reserved
    // The value of ether should be greater than 0 in order to reserve
    // the amount of ether is transferred to contractOwner
    function reserveName(bytes32 _name)
      public
      payable
      nameAvailable(_name)
      etherExists()
    {
      contractOwner.transfer(msg.value);
      names[_name].isReserved = true;
      names[_name].bid = msg.value;
      names[_name].owner = msg.sender;
      NameReserved(_name, msg.sender, msg.value);
    }

    // returns true if name available, otherwise returns false
    function isNameAvailable(bytes32 _name)
      public
      view
      returns (bool)
    {
      if( names[_name].isReserved == true ){
        return false;
      }
      return true;
    }

    // getter function for names mapping
    function getNameDetails(bytes32 _name)
      public
      view
      returns(bool, uint, address)
      {
        return (names[_name].isReserved, names[_name].bid, names[_name].owner);
      }

    // Releases the name if not already available
    // can only be released by the owner of the name
    function releaseName(bytes32 _name)
      public
      payable
      nameReserved(_name)
      onlyNameEntityOwner(_name)
    {
        // assign default values
        names[_name].isReserved = false;
        names[_name].bid = uint(0);
        names[_name].owner = address(0x0);
        NameReleased(_name, names[_name].owner);
      }

    // transfer name after acceptingHighestBid
    function transferName(bytes32 _name, uint _amount, address _toAddress)
      private
      nameAvailable(_name)
    {
      names[_name].isReserved = true;
      names[_name].bid = _amount;
      names[_name].owner = _toAddress;
    }

    // place bids for a reserved name
    // all bids against a name are present in bidsInSystem[_name]
    // what if bid already exists for a user ??
    function placeBid(bytes32 _name)
     public
     payable
     nameReserved(_name)
     checkBidAmount(_name)
    {
        // place bid in storage
        bidsInSystem[_name][countOfBids[_name]] = Bid({
          bidOwner:msg.sender,
          bidAmount:msg.value
          });

        countOfBids[_name] += 1;
        // set highest bidder for name
        if( msg.value > highestBidder[_name].bidAmount )
        {
          highestBidder[_name].bidOwner = msg.sender;
          highestBidder[_name].bidAmount = msg.value;
        }
        BidPlaced(_name,msg.sender,msg.value);
    }

    // Gets the count of bids agains a name
    function getBidCount(bytes32 _name)
      public
      view
      returns(uint)
    {
        return countOfBids[_name];
    }

    // retrieves bids against a name for a given index
    function retrieveBids(bytes32 _name, uint _index)
      public
      view
      indexLessThanCountOfBids(_name, _index)
      returns (address, uint)
      {
        Bid storage bid = bidsInSystem[_name][_index];
        return (bid.bidOwner, bid.bidAmount);
      }

    // after highest Bid has been accepted
    // return ether to all other low bidders
    // event is logged for each transfer of amount to low bidder
    function returnEtherToLowBidders(bytes32 _name, address _newNameOwner)
      private
    {
      for(uint i = 0; i < countOfBids[_name]; ++i)
      {
        if( bidsInSystem[_name][i].bidOwner != _newNameOwner )
        {
          // return ether to low bids owner
          bidsInSystem[_name][i].bidOwner.transfer(bidsInSystem[_name][i].bidAmount);
          ReturnEtherToLowBidOwner(_name, bidsInSystem[_name][i].bidOwner, bidsInSystem[_name][i].bidAmount);
        }
      }

      // empty the bidsInSystem and highestBidder for _name
      countOfBids[_name] = 0;
      highestBidder[_name].bidOwner = address(0x0);
      highestBidder[_name].bidAmount = uint(0);
    }

    // this will accept the highest bid present in the system agains the name
    // only the owner of nameEntity can execute this function
    // there should be atleast 1 bid in the system
    // should transfer name to highest bidder
    // should transfer ether fromm highest bidder to previous owner
    // should refund the bid amount for all lower bids
    function acceptHighestBid(bytes32 _name)
      public
      payable
      nameReserved(_name)
      onlyNameEntityOwner(_name)
      atleastOneBid(_name)
    {
      Bid storage bid = highestBidder[_name];
      // msg.sender is previousOwner of name, he/she will get all the ether
      msg.sender.transfer(bid.bidAmount);
      releaseName(_name);
      // transfer Name to highest bidder now
      transferName(_name, bid.bidAmount, bid.bidOwner);
      HighestBidAccepted(_name, msg.sender, bid.bidOwner, bid.bidAmount);
      // return ether to all other lowest bid owners
      returnEtherToLowBidders(_name, bid.bidOwner);
    }

    // transfer funds to owner of name
    // name should exist
    function transferFunds(bytes32 _name)
    public
    payable
    nameReserved(_name)
    {
        names[_name].owner.transfer(msg.value);
    }

    // deletes all data and sends contract balance to contractOwner
    function close()
      public
      onlyContractOwner
    {
      selfdestruct(contractOwner);
    }

    // fallback function to accept ether
    function () public payable {}

}
