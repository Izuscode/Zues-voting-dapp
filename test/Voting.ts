import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting } from "../typechain-types";

describe("Voting Contract", function () {
  let voting: Voting;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = (await VotingFactory.deploy()) as Voting;
    await voting.waitForDeployment();
  });

  it("should create a new voting event", async function () {
    const tx = await voting.createEvent("Test Election", 1);
    const receipt = await tx.wait();
    expect(await voting.eventCount()).to.equal(1);

    const eventData = await voting.events(1);
    expect(eventData.title).to.equal("Test Election");
  });

  it("should register candidates to the voting event", async function () {
    await voting.createEvent("Test Election", 1);
    await voting.registerCandidate(1, "Alice", addr1.address);
    await voting.registerCandidate(1, "Bob", addr2.address);

    const candidates = await voting.getCandidates(1);
    expect(candidates.length).to.equal(2);
    expect(candidates[0].name).to.equal("Alice");
    expect(candidates[1].name).to.equal("Bob");
  });

  it("should allow users to vote only once", async function () {
    await voting.createEvent("Test Election", 1);
    await voting.registerCandidate(1, "Alice", addr1.address);

    await voting.connect(addr2).vote(1, 0);

    await expect(voting.connect(addr2).vote(1, 0)).to.be.revertedWith(
      "Already voted"
    );
  });

  it("should not allow voting after end time", async function () {
    await voting.createEvent("Quick Vote", 0);
    await voting.registerCandidate(1, "Alice", addr1.address);

    await ethers.provider.send("evm_increaseTime", [60]);
    await ethers.provider.send("evm_mine", []);

    await expect(voting.connect(addr2).vote(1, 0)).to.be.revertedWith(
      "Voting ended"
    );
  });

  it("should correctly count votes and return the winner", async function () {
    await voting.createEvent("Test Election", 1);
    await voting.registerCandidate(1, "Alice", addr1.address);
    await voting.registerCandidate(1, "Bob", addr2.address);

    await voting.connect(addr3).vote(1, 1);
    await voting.connect(owner).vote(1, 1);
    await voting.connect(addr2).vote(1, 0);

    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine", []);

    const tx = await voting.endVoting(1);
    const receipt = await tx.wait();

    const parsed = receipt!.logs
      .map((log) => {
        try {
          return voting.interface.parseLog(log as any);
        } catch {
          return null;
        }
      })
      .find(
        (log): log is ReturnType<typeof voting.interface.parseLog> =>
          log !== null && log.name === "VotingEnded"
      );

    expect(parsed?.args?.winner).to.equal("Bob");
  });

  it("should not end voting twice", async function () {
    await voting.createEvent("Test Election", 1);
    await voting.registerCandidate(1, "Alice", addr1.address);

    await voting.connect(addr3).vote(1, 0);

    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine", []);

    await voting.endVoting(1);
    await expect(voting.endVoting(1)).to.be.revertedWith("Already ended");
  });
});
