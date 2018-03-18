import React, { Component } from 'react';
import NameContract from '../build/contracts/NameContract.json';
import getWeb3 from './utils/getWeb3';

import {SelectedName, NameComponent, ReserveName, ReleaseName, SelectedAccount, RetrieveBids, PlaceBid, AcceptHighestBidComponent, TransferFundsComponent} from './Components';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isNameAvailable: null,
      nameAmount: 0,
      nameOwner: null,
      web3: null,
      nameContract: null,
      nameEntity: "",
      accounts: [],
      selectedAccount: null,
      etherAmount: 0,
      bidAmount: 0,
      bidCount: null,
      bidsInSystem:[],
      transferAmount: 0,
      currentAccountBalance: ""
    };
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()

    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    var nameContract = contract(NameContract);
    nameContract.setProvider(this.state.web3.currentProvider);
    this.setState({
      nameContract: nameContract
    });
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState((prevState) => ({
        accounts: [...prevState, ...accounts]
      }))
    });

  }

  updateAccountBalance(acc){
    var balance = this.state.web3.eth.getBalance(acc);
    this.setState({
      currentAccountBalance: Number(balance / Math.pow(10, 18))
    })
  }

  handleAccounts(acc){
      this.setState({
        selectedAccount: acc,
      })
      this.updateAccountBalance(acc)
  }

  checkName(name){
    var nameInstance;
      this.state.nameContract.deployed().then((instance) => {
        nameInstance = instance;

        // Stores a given value, 5 by default.
        // this.state.web3.personal.unlockAccount(accounts[0],"test",150000);
        return nameInstance.getNameDetails.call(name);
      }).then((result) => {
        // result[0] -> isReserved true or false
        // result[1] amount in wei
        //  result[2] owner address
        if(result[0]){
          return this.setState({
            isNameAvailable: Boolean(!result[0]),
            nameAmount : Number(result[1] / Math.pow(10, 18)),
            nameOwner: String(result[2])
          })
        }
        else{
          return this.setState({ isNameAvailable: !result[0] })
        }
        // Get the value from the contract to prove it worked.
      });
  }

  reserveName(name){
    // Declaring this for later so we can chain functions on SimpleStorage.
    var nameInstance;
    // Get accounts.
      this.state.nameContract.deployed().then((instance) => {
        nameInstance = instance;

        // Stores a given value, 5 by default.
        // this.state.web3.personal.unlockAccount(accounts[0],"test",150000);
        return nameInstance.reserveName(name, {from: this.state.selectedAccount, value:this.state.web3.toWei(this.state.etherAmount,"ether"), gas: 3000000});
      }).then((result) => {
        console.log(result);
        // Get the value from the contract to prove it worked.
        this.checkName(name);
        this.updateAccountBalance(this.state.selectedAccount);
      });
  }

  releaseName(name){
    var nameInstance;
    // Get accounts.
      this.state.nameContract.deployed().then((instance) => {
        nameInstance = instance;

        // this.state.web3.personal.unlockAccount(accounts[0],"test",150000);
        return nameInstance.releaseName(name, {from: this.state.selectedAccount});
      }).then((result) => {
        console.log(result);
        // Get the value from the contract to prove it worked.
        return nameInstance.isNameAvailable.call(name);
      }).then((result) => {
        // Update state with the result.
        console.log(result);
        return this.setState({ isNameAvailable: result })
      })
      .catch(() => {
        alert('Only Name Owner Can Release the Name');
      });
  }

  placeBid(name){
    var nameInstance;
    // Get accounts.
      this.state.nameContract.deployed().then((instance) => {
        nameInstance = instance;

        // this.state.web3.personal.unlockAccount(accounts[0],"test",150000);
        return nameInstance.placeBid(name, {from: this.state.selectedAccount, value:this.state.web3.toWei(this.state.bidAmount,"ether"), gas: 3000000});
      })
      .then(() => {
        this.retrieveBids(name);
        this.updateAccountBalance(this.state.selectedAccount);
        alert('New Bid Placed for ' + name + ' Name For ' +  this.state.bidAmount + ' Ether By ' + this.state.selectedAccount);
      })
      .catch(() => {
        alert('BidAmount should be greater than current Name Amount ( ' + this.state.nameAmount + ' Ethers )');
      });
    }

  retrieveBids(name){
    var nameInstance;
    // Get accounts.
      this.state.nameContract.deployed().then((instance) => {
        nameInstance = instance;

        // this.state.web3.personal.unlockAccount(accounts[0],"test",150000);
        return nameInstance.getBidCount.call(name);
      }).then((count) => {
        // Get the value from the contract to prove it worked.
        this.setState({
          bidCount: count
        });
        let bidsPromiseChain=[];
        if(count){
          for(let index=0; index<count; ++index){
            let singlePromise = nameInstance.retrieveBids.call(name, index);
            bidsPromiseChain.push(singlePromise);
          }
        }
        Promise.all(bidsPromiseChain)
        .then((data) => {
          this.setState({
            bidsInSystem: data
          })
        })
      });
    }

    acceptHighestBid(name){
      var nameInstance;
      // Get accounts.
        this.state.nameContract.deployed().then((instance) => {
          nameInstance = instance;

          // sender gets all the ether, name is transferred from old to new owner
          return nameInstance.acceptHighestBid(name, {from: this.state.selectedAccount, gas: 3000000});
        }).then((result) => {
          this.checkName(name);
          alert('Highest Bid For ' + name + ' Name Accepted');
          this.retrieveBids(name);
          this.updateAccountBalance(this.state.selectedAccount);
        })
        .catch(() => {
          alert('Only Name Owner Can Accept The Highest Bid');
        })
      }

    transferFunds(name){
      var nameInstance;
      // Get accounts.
        this.state.nameContract.deployed().then((instance) => {
          nameInstance = instance;

          // sender gets all the ether, name is transferred from old to new owner
          return nameInstance.transferFunds(name, {from: this.state.selectedAccount, value:this.state.web3.toWei(this.state.transferAmount,"ether"), gas: 3000000});
        }).then((result) => {
          // this.checkName(name);
          this.updateAccountBalance(this.state.selectedAccount);
          alert('Successfully Transferred Funds To Name Owner ' + name);
          // this.retrieveBids(name);
        })
        .catch(() => {
          alert('Transfer Failed, Name not reserved OR Transfer Amount Invalid');
        })
    }

// h2
  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Name Bidding App</a>
        </nav>
        <main className="container">
        <h1>Welcome to Name Bidding DAPP</h1>
          <div className="pure-g">
            <div className="pure-u-1-1">
                <h3>Select An Account And Name</h3>
                  <SelectedAccount
                    accounts={this.state.accounts}
                    currentAccount={this.state.selectedAccount}
                    onChange={ acc => this.handleAccounts(acc) }
                    currentAccountBalance={this.state.currentAccountBalance}
                  />
                  <SelectedName
                    name={this.state.nameEntity}
                    onChange={name => this.setState({nameEntity: name})}
                    onFocus={ () => this.setState({ isNameAvailable: null, nameEntity: ""}) }
                  />
                <h3>Check If Name Exists</h3>
                  <NameComponent name={this.state.nameEntity}
                    onClick={() => this.checkName(this.state.nameEntity)}
                    isNameAvailable={this.state.isNameAvailable}
                    nameOwner={this.state.nameOwner}
                    nameAmount={this.state.nameAmount}
                    />
                <ReserveName
                  name={this.state.nameEntity}
                  isNameAvailable={this.state.isNameAvailable}
                  onClick={() => this.reserveName(this.state.nameEntity)}
                  onChange={ amount => this.setState({etherAmount: amount}) }
                  onFocus={ () => this.setState({etherAmount: 0}) }
                />
                <ReleaseName
                  name={this.state.nameEntity}
                  isNameAvailable={this.state.isNameAvailable}
                  onClick={() => this.releaseName(this.state.nameEntity)}
                />
            <h3>Handle Bids </h3>
                <PlaceBid
                  name={this.state.nameEntity}
                  isNameAvailable={this.state.isNameAvailable}
                  onClick={() => this.placeBid(this.state.nameEntity)}
                  onChange={amount => this.setState({bidAmount: amount}) }
                  onFocus={ () => this.setState({bidAmount: 0, bidCount: null}) }
                />
                <RetrieveBids
                  name={this.state.nameEntity}
                  isNameAvailable={this.state.isNameAvailable}
                  bidCount={this.state.bidCount}
                  bidsInSystem={this.state.bidsInSystem}
                  onClick={() => this.retrieveBids(this.state.nameEntity)}
                />
                <AcceptHighestBidComponent
                  name={this.state.nameEntity}
                  isNameAvailable={this.state.isNameAvailable}
                  bidCount={this.state.bidCount}
                  nameAmount={this.state.nameAmount}
                  nameOwner={this.state.nameOwner}
                  onClick={() => this.acceptHighestBid(this.state.nameEntity)}
                />
                <TransferFundsComponent
                  name={this.state.nameEntity}
                  isNameAvailable={this.state.isNameAvailable}
                  onClick={() => this.transferFunds(this.state.nameEntity)}
                  onChange={amount => this.setState({transferAmount: amount}) }
                  onFocus={ () => this.setState({transferAmount: 0}) }
                />
            </div>
        </div>
        </main>
      </div>
    );
  }
}

export default App
