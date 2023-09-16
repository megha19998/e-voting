// SPDX-License-Identifier: GPL-3.0
pragma experimental ABIEncoderV2;

pragma solidity >=0.5.1;

contract Election {

     struct Candidate {
        uint id;
        string name;
        string email;
        uint voteCount;
        uint electionId;
        candidate_status applicationStatus;
    }

     struct election{
        uint id;
        string subject;
        string description;
        string startDate;
        string endDate;
        election_status status;
    }

    struct Voter{
        uint id;
        string email;
        bool voted;
    }

    enum election_status{ CREATED, STARTED , COMPLETED}
    enum candidate_status{ APPLIED, APPROVED, REJECTED }

    election[] elections;
    uint electionCount=0;
    address private admin;
    Candidate[] public candidates;
    uint public candidatesCount;
    uint voterCount=0;
    
    
    
    constructor() public{
        admin=msg.sender;
    }
   

    modifier onlyAdmin(){
        require(admin==msg.sender,"admin access reqd");
        _;
    }


    event votedEvent (
        uint indexed _candidateId
    );


    function addElection(string memory subject,
    string memory description,
    string memory startDate,
    string memory endDate) public onlyAdmin {
        electionCount+=1;
       elections.push(election(electionCount,subject,description,startDate,endDate,election_status.CREATED));
    //    for(uint i=0;i<candidates_list.length;i++){
    //        addCandidate(candidates_list[i],candidates_list[i],electionCount);
    //    }
    }

    function showAllElections() public view returns(election[] memory){
        return elections;
    }

    function showElection(uint  id) public view returns(election memory){
        return elections[id-1];
    }

    function showCandidates() public view returns(Candidate[] memory)
    {
      return candidates;
    }

    function startElection(uint id) public onlyAdmin {
        require(id<=electionCount && id>0,"Invalid elction id");
        elections[id-1].status=election_status.STARTED;
    }

    function endElection(uint id) public onlyAdmin{
        require(id<=electionCount && id>0,"Invalid elction id");
        elections[id-1].status=election_status.COMPLETED;
    }

    function addCandidate (string memory _name,string memory _email,uint  elec_id) public {
        candidatesCount ++;
        candidates.push(Candidate(candidatesCount, _name,_email ,0,elec_id,candidate_status.APPLIED));
    }

    function approveCandiate(uint _candidateId) public onlyAdmin {
       candidates[_candidateId-1].applicationStatus=candidate_status.APPROVED;
   }
   
   function rejectCandiate(uint _candidateId) public onlyAdmin {
       candidates[_candidateId-1].applicationStatus=candidate_status.REJECTED;
   }


     mapping(address => uint) public voter;
     mapping(address => uint) public lastVote;
     mapping(address => mapping(uint=>bool)) public votedList;
     
     Voter[] public voterList;

     address public addr;
     
     function createVoter(uint ct) private returns(Voter memory){
         Voter memory v;
         v.id=ct;
         return v;
     }

     function addVoter(address  _voter) public
    // returns(Voter storage)
     {
         //mapping(uint=>bool) memory ele_voted;
         //votedList[_voter]=ele_voted;
         voterCount+=1;
         addr=_voter;
         voter[_voter]=voterCount;
         Voter memory voterIns=createVoter(voterCount);
         voterList.push(voterIns);
         
         //return voterIns;
     }
     
    uint public len=0;
    
    function winner(uint _electionId) public returns (Candidate memory) 
    {
        //require(admin==msg.sender,"Admin Only");
        require(_electionId>=1 && _electionId<=electionCount,"Election ID not valid");
        require(elections[_electionId-1].status==election_status.COMPLETED,"Election is not completed yet");
        
        
        uint count=0;
        for(uint i=0;i<candidatesCount;i++)
        {
            if(candidates[i].electionId==_electionId)
            {
                count++;
            }
        }
        Candidate [] memory resultCandidate = new Candidate[](count);
        uint j=0;
        for(uint i=0;i<candidatesCount;i++)
        {
            if(candidates[i].electionId==_electionId)
            {
                resultCandidate[j++]=candidates[i];
            }
        }

        Candidate memory winnerCandidate;
        winnerCandidate=resultCandidate[0];
        for(uint i=1;i<j;i++)
        {
            if(resultCandidate[i].voteCount>winnerCandidate.voteCount)
            winnerCandidate=resultCandidate[i];
        }
        return winnerCandidate;
    }
    
    
    function vote (uint _candidateId ,uint _electionId)public 
    {
    
    require(voterList[voter[msg.sender]-1].id>0,"User not registered as valid voter");
        //require(!voterList[voter[msg.sender]-1].voted[_electionId-1],"already voted");
        require(_electionId<=electionCount,"Election ID does not exist");
        require(votedList[msg.sender][_electionId]==false,"already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        require(elections[candidates[_candidateId-1].electionId-1].status==election_status.STARTED,"election not live");
       //voterList[voter[msg.sender]-1].voted.push(_electionId-1);

        candidates[_candidateId-1].voteCount ++;
        lastVote[msg.sender]=_candidateId;
        votedList[msg.sender][_electionId]=true;

       // emit votedEvent(_candidateId);
    }
}