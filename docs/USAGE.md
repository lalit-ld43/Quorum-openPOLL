# Usage notes

## Circuit walkthrough (`contracts/voting.compact`)

- `createPoll(title, labels, numOptions, root)` — poll creator opens a
  poll with 2–4 options and publishes the Merkle root of eligible
  voters' hashed credentials.
- `castBallot(chosenOption)` — a voter supplies two private witnesses
  (`voterSecret`, `voterMerklePath`), the circuit proves membership
  against `eligibilityRoot`, derives a poll-scoped nullifier, checks it
  hasn't been spent, then increments only the chosen option's public
  counter.
- `closePoll()` — freezes further ballots without altering the tally.

## Going from simulator to deployed contract

1. Install the Midnight `compact` CLI and run
   `npm run compact:compile` — this populates `managed/voting` with the
   generated TypeScript bindings and verifier keys.
2. Replace the calls into `src/lib/votingSimulator.ts` inside
   `src/App.tsx` with calls into the generated `managed/voting` contract
   client (see Midnight.js docs for `deployContract` /
   `findDeployedContract`).
3. Deploy to Preprod, record the contract address, and add it to the
   README's Contract Address table.
4. Fund a Preprod test wallet in Lace and connect it from the header.

## Manual steps still required before submission

- [ ] Compile the contract and deploy to Preprod
- [ ] Add the real Preprod contract address to `README.md`
- [ ] Fill in every `[I WILL FILL THIS IN]` section of `PROPOSAL.md`
- [ ] Submit the chosen idea (Private Voting) for approval
- [ ] Record the 1-minute demo video (see checklist below)
- [ ] Make 10+ meaningful, incremental commits
- [ ] Deploy the frontend (e.g. Vercel/Netlify) and add the live URL

## Demo video checklist
1. Full flow: connect Lace wallet → generate credential → cast ballot →
   see tally update
2. Terminal showing `npm test` output (11 passing)
3. README showing the green CI badge
