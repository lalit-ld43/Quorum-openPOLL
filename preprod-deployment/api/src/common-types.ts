// This file is part of midnightntwrk/example-bboard.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { VotingPrivateState, Contract, Witnesses } from '@midnight-ntwrk/voting-contract';

export const votingPrivateStateKey = 'votingPrivateState';
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
