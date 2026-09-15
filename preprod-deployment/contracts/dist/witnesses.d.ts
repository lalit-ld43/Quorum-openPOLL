import { Ledger } from "./managed/voting/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
export type VotingPrivateState = {
    readonly secretKey: Uint8Array;
};
export declare const createVotingPrivateState: (secretKey: Uint8Array) => {
    secretKey: Uint8Array<ArrayBufferLike>;
};
export declare const witnesses: {
    secretKey: ({ privateState, }: WitnessContext<Ledger, VotingPrivateState>) => [VotingPrivateState, Uint8Array];
    merklePath: ({ privateState, }: WitnessContext<Ledger, VotingPrivateState>) => [VotingPrivateState, [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array]];
    pathDirections: ({ privateState, }: WitnessContext<Ledger, VotingPrivateState>) => [VotingPrivateState, [boolean, boolean, boolean, boolean, boolean]];
};
