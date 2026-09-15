import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  secretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  merklePath(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array[]];
  pathDirections(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, boolean[]];
}

export type ImpureCircuits<PS> = {
  castBallot(context: __compactRuntime.CircuitContext<PS>,
             chosenOption_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closePoll(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  publicStats(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, [Uint8Array,
                                                                                                  boolean,
                                                                                                  bigint]>;
}

export type ProvableCircuits<PS> = {
  castBallot(context: __compactRuntime.CircuitContext<PS>,
             chosenOption_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closePoll(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  publicStats(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, [Uint8Array,
                                                                                                  boolean,
                                                                                                  bigint]>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  castBallot(context: __compactRuntime.CircuitContext<PS>,
             chosenOption_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closePoll(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  publicStats(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, [Uint8Array,
                                                                                                  boolean,
                                                                                                  bigint]>;
}

export type Ledger = {
  readonly pollTitle: string;
  readonly optionLabels: string[];
  readonly optionCount: bigint;
  tallies: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): bigint;
    [Symbol.iterator](): Iterator<[bigint, bigint]>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly eligibilityRoot: Uint8Array;
  readonly isOpen: boolean;
  readonly totalBallots: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               title_0: string,
               labels_0: string[],
               numOptions_0: bigint,
               root_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
