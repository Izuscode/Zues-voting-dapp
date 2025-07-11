// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        string name;
        address addr;
        uint voteCount;
    }

    struct VotingEvent {
        string title;
        uint endTime;
        bool ended;
        uint candidateCount;
    }

    mapping(uint => VotingEvent) public events;
    mapping(uint => mapping(uint => Candidate)) public eventCandidates;
    mapping(uint => mapping(address => bool)) public hasVoted;

    uint public eventCount;

    event EventCreated(uint eventId, string title, uint endTime);
    event Voted(uint eventId, address voter, uint candidateIndex);
    event VotingEnded(uint eventId, string winner);

    function createEvent(string memory _title, uint _durationMinutes) public {
        eventCount++;
        VotingEvent storage ve = events[eventCount];
        ve.title = _title;
        ve.endTime = block.timestamp + (_durationMinutes * 1 minutes);
        emit EventCreated(eventCount, _title, ve.endTime);
    }

    function registerCandidate(uint _eventId, string memory _name, address _addr) public {
        VotingEvent storage ve = events[_eventId];
        require(block.timestamp < ve.endTime, "Event ended");

        uint cId = ve.candidateCount;
        eventCandidates[_eventId][cId] = Candidate(_name, _addr, 0);
        ve.candidateCount++;
    }

    function vote(uint _eventId, uint _candidateIndex) public {
        VotingEvent storage ve = events[_eventId];
        require(block.timestamp < ve.endTime, "Voting ended");
        require(!hasVoted[_eventId][msg.sender], "Already voted");

        hasVoted[_eventId][msg.sender] = true;
        eventCandidates[_eventId][_candidateIndex].voteCount++;

        emit Voted(_eventId, msg.sender, _candidateIndex);
    }

    function getCandidates(uint _eventId) public view returns (Candidate[] memory) {
        VotingEvent storage ve = events[_eventId];
        Candidate[] memory list = new Candidate[](ve.candidateCount);

        for (uint i = 0; i < ve.candidateCount; i++) {
            list[i] = eventCandidates[_eventId][i];
        }

        return list;
    }

    function endVoting(uint _eventId) public returns (string memory winnerName) {
        VotingEvent storage ve = events[_eventId];
        require(block.timestamp >= ve.endTime, "Voting not ended yet");
        require(!ve.ended, "Already ended");

        ve.ended = true;
        uint maxVotes = 0;
        uint winnerIndex;

        for (uint i = 0; i < ve.candidateCount; i++) {
            if (eventCandidates[_eventId][i].voteCount > maxVotes) {
                maxVotes = eventCandidates[_eventId][i].voteCount;
                winnerIndex = i;
            }
        }

        winnerName = eventCandidates[_eventId][winnerIndex].name;
        emit VotingEnded(_eventId, winnerName);
        return winnerName;
    }
}

