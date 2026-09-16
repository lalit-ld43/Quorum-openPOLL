# Quorum
![CI](https://github.com/lalit-ld43/Quorum-openPOLL/actions/workflows/ci.yml/badge.svg)
> Anonymous ballots, publicly verifiable tallies — built on Midnight.

## Live Demo
[https://quorum-open-poll.vercel.app/](https://quorum-open-poll.vercel.app/)

## Contract Addresses & Verification
This dashboard connects to three independent governance smart contracts deployed on the Midnight Preprod Network.

| Poll Topic | Contract Address | Midnight Explorer Link |
|------------|------------------|------------------------|
| **DAO Treasury** | `7d2753a1c0e67ad599a11a62174066b7dd07f2b3b6807f24adbe82671e27c123` | [View Contract](https://preprod.midnightexplorer.com/contracts/0x7d2753a1c0e67ad599a11a62174066b7dd07f2b3b6807f24adbe82671e27c123) |
| **Board Election** | `918b1b4a90e69b31e71c628432cab41f2592d97d41b244e54793931c41e8bcb0` | [View Contract](https://preprod.midnightexplorer.com/contracts/0x918b1b4a90e69b31e71c628432cab41f2592d97d41b244e54793931c41e8bcb0) |
| **Code of Conduct** | `f2f8bd1854ee0cf1b99e70f8127618bc37809618e8fc217e45cd2d3f514a7adc` | [View Contract](https://preprod.midnightexplorer.com/contracts/0xf2f8bd1854ee0cf1b99e70f8127618bc37809618e8fc217e45cd2d3f514a7adc) |

### Verified Vote Transaction Example
To see an example of a successfully verified zero-knowledge ballot being cast on the network, see this finalized transaction:
[View Verified Vote on Midnight Explorer](https://preprod.midnightexplorer.com/transactions/0x50b97c10509127dfa88d5a5cbb4451a31af80c94766a6c0f49903d56dd5b52bf)

## What This Does
Quorum lets anyone open a poll (2–4 options) and lets registered voters
cast exactly one anonymous ballot each. Every ballot is proved in
zero-knowledge against an eligibility credential before it can increment
a public tally — so results are verifiable in real time on-chain, but no
one, including the poll creator, can see who voted for what.

Choose an option, generate a one-time voting credential, and cast your
ballot — the app walks through proof generation and shows you the
private receipt that's the only trace your ballot leaves behind.

## Privacy Model
- **PUBLIC:** poll question and options, live per-option vote counts, the
  set of spent credential nullifiers, poll open/closed status.
- **PRIVATE:** the voter's registration secret, and any mapping between a
  voter's identity and the option they chose.
- **PROVED without revealing:** that the caller holds a valid, unused
  voting credential for this poll — without revealing *which* credential,
  or linking it to the option they picked.

## Privacy Claim
An on-chain observer can see the exact vote count for every option at
any moment, and can confirm no credential voted twice (the nullifier
set only ever grows, never repeats). What they cannot see, at any
point, is which nullifier belongs to which voter, or which option a
specific voter chose — the ledger never stores that link in the first
place, so there is nothing to later deanonymize.

## Tech Stack
- **Contract:** Compact (`contracts/voting.compact`) — Midnight's ZK smart
  contract language
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Wallet:** Lace (Midnight/Preprod connector)
- **Tests:** Vitest, mirroring the circuit's logic in TypeScript
- **CI/CD:** GitHub Actions

## Prerequisites
- Node.js v22+
- npm
- [Midnight `compact` CLI](https://docs.midnight.network) (for compiling
  the contract and deploying to Preprod)
- [Lace wallet](https://docs.midnight.network) browser extension, funded
  on Preprod, for live on-chain interaction

## Setup & Run Locally
```bash
# 1. Install dependencies
npm install

# 2. (Once the Midnight toolchain is installed) compile the contract
npm run compact:compile

# 3. Run the app
npm run dev
```
The app runs fully interactively against a local TypeScript simulator
(`src/lib/votingSimulator.ts`) that mirrors the compiled circuit's rules,
so the UI can be reviewed before the contract is deployed to Preprod.
Once deployed, swap the simulator calls in `src/App.tsx` for the
generated Midnight.js contract bindings in `managed/voting`.

## Run Tests
```
npm test
```

## CI/CD
On every push and pull request to `main`, the GitHub Actions pipeline
(`.github/workflows/ci.yml`) checks out the code, installs dependencies
on Node 22, compiles the Compact contract when the toolchain is present,
lints, runs the full Vitest suite, and produces a production build —
failing the run if any step errors.

## Product Proposal
See [PROPOSAL.md](./PROPOSAL.md).
