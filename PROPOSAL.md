# Product Proposal

## What is the product, and who uses it?
**Quorum: A Private Multi-Poll Governance Dashboard.** 
This product is designed for DAOs, corporate boards, and community organizations that need to conduct legally binding or highly sensitive votes. It allows registered members to cast exactly one anonymous ballot per poll, while ensuring that the overall tally remains completely public and cryptographically verifiable.

## Why Midnight specifically?
If we built this on a transparent blockchain like Ethereum or Cardano, every voter's wallet address would be permanently linked to their specific vote on the public ledger. This destroys the fundamental democratic requirement of a secret ballot. 
Midnight solves this by using zero-knowledge cryptography. It allows the smart contract to verify that the voter is eligible and hasn't voted twice, *without* ever revealing the voter's identity or linking their identity to the option they chose. Midnight provides the exact combination of **private state** (the voter's identity) and **public state** (the live vote tally) required for a true secret ballot.

## Data Model
| Data Point                     | Type            | Disclosed To |
|---------------------------------|-----------------|--------------|
| Poll question & option labels   | Public ledger   | Everyone     |
| Per-option vote tally           | Public ledger   | Everyone     |
| Spent nullifier set             | Public ledger   | Everyone     |
| Voter registration secret       | Private witness | No one       |
| Voter's chosen option (raw)     | Private witness | No one       |
| Cryptographic ZK Proof          | Public ledger   | Everyone     |

## Mainnet Feasibility
Yes, this is highly realistic to reach Mainnet by Level 6. The core circuit logic (verifying eligibility against a Merkle tree and accumulating tallies) is already fully implemented and deployed on Preprod. Future iterations will simply focus on adding an admin interface to dynamically deploy new polls and a robust identity provider for issuing the initial voting credentials.
