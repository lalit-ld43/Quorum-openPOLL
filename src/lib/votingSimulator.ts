// votingSimulator.ts
//
// A pure-TypeScript mirror of contracts/voting.compact's circuit logic.
// It exists so the UI is fully interactive before `compact compile` +
// Preprod deployment, and so `tests/voting.test.ts` can exercise the
// same rules the circuit enforces (membership proof, nullifier reuse,
// tally-only disclosure) without the Midnight toolchain.
//
// This file intentionally never stores a (voter -> choice) mapping
// anywhere, in memory or otherwise — only:
//   - the running per-option counters (public)
//   - the set of spent nullifiers (public)
// mirroring exactly what the real ledger would hold.

export type PollOption = { id: number; label: string };

export interface PollState {
  title: string;
  options: PollOption[];
  tallies: Record<number, number>;
  nullifiers: Set<string>;
  eligibleLeaves: Set<string>; // hashed voter commitments (the "root" set)
  isOpen: boolean;
  totalBallots: number;
}

export interface CastResult {
  ok: boolean;
  error?: string;
  optionId?: number;
  nullifier?: string;
}

// Stand-in for `persistentHash` — deterministic, non-reversible enough
// for a client-side simulation. Swapped for the real Compact hash once
// compiled against the Midnight proof server.
async function hash(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createPoll(title: string, labels: string[]): PollState {
  if (labels.length < 2 || labels.length > 4) {
    throw new Error("poll needs 2-4 options");
  }
  const options = labels.map((label, id) => ({ id, label }));
  const tallies: Record<number, number> = {};
  options.forEach((o) => (tallies[o.id] = 0));
  return {
    title,
    options,
    tallies,
    nullifiers: new Set(),
    eligibleLeaves: new Set(),
    isOpen: true,
    totalBallots: 0,
  };
}

// Registration: in production this happens off-chain / at credential
// issuance time. Here we just derive the same leaf hash the circuit
// would check membership of.
export async function registerVoter(poll: PollState, voterSecret: string) {
  const leaf = await hash(voterSecret);
  poll.eligibleLeaves.add(leaf);
  return leaf;
}

// Mirrors circuit `castBallot`.
export async function castBallot(
  poll: PollState,
  voterSecret: string,
  chosenOption: number
): Promise<CastResult> {
  if (!poll.isOpen) return { ok: false, error: "Poll is closed." };
  if (!poll.options.some((o) => o.id === chosenOption)) {
    return { ok: false, error: "Not a valid option for this poll." };
  }

  const leaf = await hash(voterSecret);
  if (!poll.eligibleLeaves.has(leaf)) {
    return { ok: false, error: "This credential is not on the eligibility list." };
  }

  const nullifier = await hash(`${voterSecret}:${poll.title}`);
  if (poll.nullifiers.has(nullifier)) {
    return { ok: false, error: "A ballot has already been cast with this credential." };
  }

  poll.nullifiers.add(nullifier);
  poll.tallies[chosenOption] += 1;
  poll.totalBallots += 1;

  return { ok: true, optionId: chosenOption, nullifier };
}

export function closePoll(poll: PollState) {
  if (!poll.isOpen) throw new Error("already closed");
  poll.isOpen = false;
}

export function leadingOption(poll: PollState): PollOption | null {
  if (poll.options.length === 0) return null;
  return poll.options.reduce((best, o) =>
    poll.tallies[o.id] > poll.tallies[best.id] ? o : best
  );
}
