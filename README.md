# Quorum
![CI](https://github.com/lalit-ld43/Quorum-openPOLL/actions/workflows/ci.yml/badge.svg)
> Anonymous ballots, publicly verifiable tallies — built on Midnight.

## Live Demo
[LIVE URL — add after deploying, e.g. Vercel/Netlify]

## Contract Address
| Network  | Address                          |
|----------|-----------------------------------|
| Preprod  | `743db6cf817d773097159a8d209fd2df42b567d9e13581721d080a0885d73570` |

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
