import React from 'react';

const SelectedAccount = (props) => (
  <div>
    <p> Current Selected Account : {props.currentAccount} </p>
    <p>
      <select className="pure-select" value={props.currentAccount || ''} onChange={event => props.onChange(event.target.value)}>
        <option>Select An Account</option>
        {
          props.accounts.map((acc) => <option key={acc}>{acc}</option>)
        }
      </select>
    </p>
    <p> Current Account Balance : {props.currentAccountBalance} Ethers </p>
  </div>
);

const SelectedName = (props) => (
  <div>
    <p> Current Selected Name : {props.name} </p>
    <p>Name: &nbsp;&nbsp;
      <input className="pure-input" type="text" placeholder="Enter Name"
        onChange={event => props.onChange(event.target.value)}
        onFocus={event => {
          props.onFocus();
          event.target.value = "";
        }}
        />
    </p>
  </div>
);

const NameComponent = (props) => {
  const getNames = () => {
    let nameMessage;
    let nameOwner;
    let nameAmount;
    if(props.isNameAvailable){
      nameMessage = props.name + ' name is Available';
    }
    else if(props.isNameAvailable === false){
      nameMessage = props.name + ' name is NOT Available';
      nameOwner = "Name Owner: " + props.nameOwner;
      nameAmount = "Name Amount: " + String(props.nameAmount) + " Ether";
    }
    else{
      nameMessage = "";
      nameOwner = "";
      nameAmount = "";
    }
    return <div>
      <p>{nameMessage}</p>
      <p>{nameOwner}</p>
      <p>{nameAmount}</p>
    </div>
  }
  return (
    <div>
      <button className="pure-button pure-button-primary" onClick={props.onClick}>{`Check if ${props.name} Name available`}</button>
      {getNames()}
    </div>
  );
}

const ReserveName = (props) => {
  const getReserveDetails = () => {
      return   <div>
                  <h3>Reserve Or Release A Name</h3>
                  <label>{`Enter amount to spend(in Ether):`}</label> &nbsp;&nbsp;
                  <input className="pure-input" type="text" placeholder="Enter Amount"
                    onChange={event => props.onChange(event.target.value)}
                    onFocus={event => {props.onFocus();event.target.value = "";}}
                    /> &nbsp;&nbsp;
                  <button className="pure-button pure-button-primary" onClick={props.onClick}>{`Reserve ${ props.name } Name`}</button>
                </div>
  }
  return(
    <div>
        {props.name !=="" && props.isNameAvailable && getReserveDetails()}
    </div>
  )
}

const ReleaseName = (props) => {
  const getReleaseDetails = () => {
    return <div>
            <h3>Reserve Or Release A Name</h3>
            <button className="pure-button pure-button-primary" onClick={props.onClick}>{`Release ${ props.name } Name`}</button>
           </div>
  }
  return(
    <div>
      {props.name !=="" && props.isNameAvailable === false && getReleaseDetails()}
    </div>
  )
}

const PlaceBid = (props) => {
  const getPlaceBidDetails = () => {
      return <div>
              <p>Enter amount to bid(in Ether): &nbsp;&nbsp;
                <input className="pure-input" type="text" placeholder="Enter Amount"
                  onChange={event => props.onChange(event.target.value)}
                  onFocus={event => {props.onFocus();event.target.value = "";}}
                  />
                  &nbsp;&nbsp;
                  <button className="pure-button pure-button-primary" onClick={props.onClick}>{`Place bid for ${ props.name } Name`}</button>
              </p>
             </div>
  }
  return(
    <div>
      {props.isNameAvailable === false && getPlaceBidDetails()}
    </div>
  )
}

const RetrieveBids = (props) => {
  const getBids = () => {
    return props.bidsInSystem.map(function(bid) {
      // return <p>{`Bid Owner: ${bid[0]} Bid Amount: ${Number(bid[1]/Math.pow(10,18))} Ether`}</p>;
        return <p><b>Bid Owner:&nbsp;&nbsp;</b> {bid[0]} &nbsp;&nbsp;&nbsp;&nbsp; <b>Bid Amount:&nbsp;&nbsp;</b> {Number(bid[1]/Math.pow(10,18))} Ether</p>;
    });
  }
  return(
  <div>
    <p>
      {props.isNameAvailable === false && <button className="pure-button pure-button-primary" onClick={props.onClick}>{`Retrieve All Bids for ${ props.name } Name`}</button>}
    </p>
    <div>
      {props.isNameAvailable === false && getBids()}
    </div>
  </div>
  )
}

const AcceptHighestBidComponent = (props) => {
  return  <p>
            {<button className="pure-button pure-button-primary" onClick={props.onClick}>{`Accept Highest Bid for ${props.name} Name`}</button>}
          </p>
}

const TransferFundsComponent = (props) => {
  const getTransferDetails = () => {
      return <div>
              <h3>Transfer Funds To A Name Owner</h3>
              <p>Amount to transfer(in Ether): &nbsp;&nbsp;
                <input className="pure-input" type="text" placeholder="Enter Amount"
                  onChange={event => props.onChange(event.target.value)}
                  onFocus={event => {props.onFocus();event.target.value = "";}}
                  />
                  &nbsp;&nbsp;
                  <button className="pure-button pure-button-primary" onClick={props.onClick}>{`Transfer Funds To ${ props.name } Name Owner`}</button>
              </p>
             </div>
  }
  return(
    <div>
      {props.isNameAvailable === false && getTransferDetails()}
    </div>
  )
}

module.exports = {
  SelectedName: SelectedName,
  NameComponent: NameComponent,
  ReserveName: ReserveName,
  ReleaseName: ReleaseName,
  SelectedAccount: SelectedAccount,
  PlaceBid: PlaceBid,
  RetrieveBids: RetrieveBids,
  AcceptHighestBidComponent: AcceptHighestBidComponent,
  TransferFundsComponent: TransferFundsComponent
}
