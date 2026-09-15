import { describe, it, expect } from "vitest";
import {
  createPoll,
  registerVoter,
  castBallot,
  closePoll,
  leadingOption,
} from "../src/lib/votingSimulator";

describe("circuit logic — createPoll / castBallot tallying", () => {
  it("initializes every option's counter to zero", () => {
    const poll = createPoll("Where should we host demo day?", [
      "Rooftop",
      "Warehouse",
      "Online",
    ]);
    expect(Object.values(poll.tallies)).toEqual([0, 0, 0]);
    expect(poll.totalBallots).toBe(0);
  });

  it("increments only the chosen option's public counter", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    const result = await castBallot(poll, "voter-a-secret", 0);

    expect(result.ok).toBe(true);
    expect(poll.tallies[0]).toBe(1);
    expect(poll.tallies[1]).toBe(0);
    expect(poll.totalBallots).toBe(1);
  });

  it("rejects a vote for an option index that doesn't exist", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    const result = await castBallot(poll, "voter-a-secret", 7);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not a valid option/i);
  });
});

describe("state transitions — eligibility, nullifiers, poll lifecycle", () => {
  it("rejects a voter whose secret was never registered (no eligibility proof)", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    const result = await castBallot(poll, "unregistered-secret", 0);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not on the eligibility list/i);
  });

  it("rejects a second ballot cast with the same credential (nullifier reuse)", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");

    const first = await castBallot(poll, "voter-a-secret", 0);
    const second = await castBallot(poll, "voter-a-secret", 1);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.error).toMatch(/already been cast/i);
    expect(poll.totalBallots).toBe(1);
  });

  it("allows two distinct registered voters to each cast exactly one ballot", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    await registerVoter(poll, "voter-b-secret");

    const a = await castBallot(poll, "voter-a-secret", 0);
    const b = await castBallot(poll, "voter-b-secret", 0);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(poll.tallies[0]).toBe(2);
    expect(poll.totalBallots).toBe(2);
  });

  it("refuses new ballots once the poll is closed, but preserves the tally", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    await castBallot(poll, "voter-a-secret", 0);
    closePoll(poll);

    await registerVoter(poll, "voter-b-secret");
    const late = await castBallot(poll, "voter-b-secret", 1);

    expect(poll.isOpen).toBe(false);
    expect(late.ok).toBe(false);
    expect(late.error).toMatch(/closed/i);
    expect(poll.tallies[0]).toBe(1);
  });

  it("computes the leading option from public tallies alone", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    await registerVoter(poll, "voter-b-secret");
    await registerVoter(poll, "voter-c-secret");
    await castBallot(poll, "voter-a-secret", 0);
    await castBallot(poll, "voter-b-secret", 0);
    await castBallot(poll, "voter-c-secret", 1);

    expect(leadingOption(poll)?.label).toBe("Yes");
  });
});

describe("privacy — no voter-to-choice linkage is ever recorded", () => {
  it("the returned nullifier does not equal or embed the raw voter secret", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    const result = await castBallot(poll, "voter-a-secret", 0);

    expect(result.nullifier).toBeDefined();
    expect(result.nullifier).not.toBe("voter-a-secret");
    expect(result.nullifier).not.toContain("voter-a-secret");
    // A SHA-256 hex digest — fixed length, not a recognizable transform
    // of the input secret.
    expect(result.nullifier).toMatch(/^[0-9a-f]{64}$/);
  });

  it("PollState never exposes a mapping from a voter identifier to an option", () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    const keys = Object.keys(poll);
    // Only aggregate/public fields should exist on the poll object.
    expect(keys).toEqual(
      expect.arrayContaining([
        "title",
        "options",
        "tallies",
        "nullifiers",
        "eligibleLeaves",
        "isOpen",
        "totalBallots",
      ])
    );
    expect(keys).not.toContain("voteLog");
    expect(keys).not.toContain("voterChoices");
    expect(keys).not.toContain("ballots");
  });

  it("two different voters choosing the same option produce different nullifiers", async () => {
    const poll = createPoll("Adopt proposal #12?", ["Yes", "No"]);
    await registerVoter(poll, "voter-a-secret");
    await registerVoter(poll, "voter-b-secret");

    const a = await castBallot(poll, "voter-a-secret", 0);
    const b = await castBallot(poll, "voter-b-secret", 0);

    expect(a.nullifier).not.toBe(b.nullifier);
  });
});
