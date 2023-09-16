const Web3=require('web3');
var netURL='http://127.0.0.1:7545';
const {jsonInterface}=require('./jsoninterface.js');
var contract_address="0x19Fe7b8C4aF6E0aDb61f8e463b3a051d29ACdFe2"
var admin_address="0xD4abaf61953716edB1DCd52e9404983b4244750a"

web3=new Web3(Web3.givenProvider || netURL);

var Contract = require('web3-eth-contract');
Contract.setProvider(netURL);
var contract = new Contract(jsonInterface, contract_address);

var Accounts = require('web3-eth-accounts');
var accounts = new Accounts(netURL);
var first_account = '';
var index=0;
var accountList;

web3.eth.getAccounts().then(fetchedAccounts=>{
     console.log(fetchedAccounts);
     accountList=fetchedAccounts;
     first_account=fetchedAccounts[0];
  });

//web3.eth.getAccounts().then(res=>first_account=res[0]);
module.exports={
      
    createAccount:function(){
        index+=1;
        console.log('-------------------------------------');
        console.log(index);
        console.log(accountList[index]);
        return accountList[index];
      },
      addVoter:function(addr){
          contract.methods.addVoter(addr).send({from:first_account,gas:1000000}).then(res=> console.log('address sent..')).catch(err=>console.log(err));
      },
      winnerr:function(electionID){
        return contract.methods.winner(electionID).call()
      },
      showAllElections:function(){
        return contract.methods.showAllElections().call();
        },
      addElection:function(subject, description, startDate,endDate){
        contract.methods.addElection(subject, description, startDate,endDate).send({from:first_account,gas:1200000});
      },
      showCandidates:function(){
        return contract.methods.showCandidates().call();
      },
      startElection:function(id){
          contract.methods.startElection(id).send({from:first_account,gas:1000000})
          .then(res=>console.log(res))
          .catch(err=>console.log(err));
      },
      endElection:function(id){
        contract.methods.endElection(id).send({from:first_account,gas:1000000})
        .then(res=>console.log(res))
        .catch(err=>console.log(err));
      },
      addCandidate:function(name,email,elecId,addr){
        return contract.methods.addCandidate(name,email,elecId).send({from:addr,gas:1200000})
      },
      approveCandidate:function(candidateId){
        return contract.methods.approveCandiate(candidateId).send({from:first_account,gas:1200000})
      },
      rejectCandidate:function(candidateId){
        return contract.methods.rejectCandiate(candidateId).send({from:first_account,gas:1200000})
      },
      addVote:function(candidateId,electionId,addr){
        return contract.methods.vote(candidateId,electionId).send({from:addr,gas:1200000})
         }
    };