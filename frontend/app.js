const CONTRACT_ADDRESS = "0xe8a4Ff3c0B94e48f400d85a05f036F32bd02927B";
const CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "eventId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "EventCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "eventId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "candidateIndex",
        type: "uint256",
      },
    ],
    name: "Voted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "eventId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "winner",
        type: "string",
      },
    ],
    name: "VotingEnded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_title",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_durationMinutes",
        type: "uint256",
      },
    ],
    name: "createEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256",
      },
    ],
    name: "endVoting",
    outputs: [
      {
        internalType: "string",
        name: "winnerName",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "eventCandidates",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eventCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "events",
    outputs: [
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "ended",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "candidateCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256",
      },
    ],
    name: "getCandidates",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        internalType: "struct Voting.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "registerCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_eventId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_candidateIndex",
        type: "uint256",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
let provider, signer, contract;

const connectButton = document.getElementById("connectButton");
const loadCandidatesBtn = document.getElementById("loadCandidatesBtn");

connectButton.onclick = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not found");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  connectButton.textContent = "Wallet Connected";
  connectButton.disabled = true;
};

loadCandidatesBtn.onclick = async () => {
  if (!contract) {
    alert("Please connect your wallet first.");
    return;
  }

  const eventId = parseInt(document.getElementById("eventIdInput").value);
  const candidates = await contract.getCandidates(eventId);
  const container = document.getElementById("candidates");
  container.innerHTML = "";

  candidates.forEach((candidate, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.border = "1px solid #ccc";
    wrapper.style.margin = "10px";
    wrapper.style.padding = "10px";

    wrapper.innerHTML = `
      <p><strong>${candidate.name}</strong></p>
      <p>Address: ${candidate.addr}</p>
      <p>Votes: ${candidate.voteCount}</p>
      <button>Vote</button>
    `;

    const voteBtn = wrapper.querySelector("button");
    voteBtn.onclick = async () => {
      try {
        const tx = await contract.vote(eventId, index);
        await tx.wait();
        alert("Voted successfully!");
        loadCandidatesBtn.click(); // reload candidates
      } catch (err) {
        alert("Voting failed. Maybe already voted?");
        console.error(err);
      }
    };

    container.appendChild(wrapper);
  });
};
