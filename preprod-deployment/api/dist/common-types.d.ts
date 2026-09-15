import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { VotingPrivateState, Contract, Witnesses } from '@midnight-ntwrk/voting-contract';
export declare const votingPrivateStateKey = "votingPrivateState";
export type PrivateStateId = typeof votingPrivateStateKey;
export type PrivateStates = {
    readonly votingPrivateState: VotingPrivateState;
};
export type VotingContract = Contract<VotingPrivateState, Witnesses<VotingPrivateState>>;
export type VotingCircuitKeys = Exclude<keyof VotingContract['impureCircuits'], number | symbol>;
export type VotingProviders = MidnightProviders<VotingCircuitKeys, PrivateStateId, VotingPrivateState>;
export type DeployedVotingContract = FoundContract<VotingContract>;
export type VotingDerivedState = {
    readonly pollTitle: string;
    readonly optionLabels: string[];
    readonly optionCount: number;
    readonly tallies: Record<number, bigint>;
    readonly isOpen: boolean;
    readonly eligibilityRoot: Uint8Array;
    readonly totalBallots: bigint;
};
