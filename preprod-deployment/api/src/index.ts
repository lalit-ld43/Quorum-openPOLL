/**
 * Provides types and utilities for working with Quorum voting contracts.
 *
 * @packageDocumentation
 */

import * as Voting from '@midnight-ntwrk/voting-contract';

import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type VotingDerivedState,
  type VotingContract,
  type VotingProviders,
  type DeployedVotingContract,
  votingPrivateStateKey,
} from './common-types.js';
import { CompiledVotingContractContract, Witnesses, createVotingPrivateState } from '@midnight-ntwrk/voting-contract';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { map, type Observable } from 'rxjs';

/** @internal */

export interface DeployedVotingAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;

  castBallot: (optionIndex: number) => Promise<string>;
  closePoll: () => Promise<string>;
}

export class VotingAPI implements DeployedVotingAPI {
  private constructor(
    public readonly deployedContract: DeployedVotingContract,
    providers: VotingProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    
    this.state$ = providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
      map((contractState) => Voting.ledger(contractState.data)),
      map((ledgerState) => {
        const talliesMap: Record<number, bigint> = {};
        for (const [key, value] of ledgerState.tallies.entries()) {
          talliesMap[Number(key)] = value;
        }

        return {
          pollTitle: ledgerState.pollTitle,
          optionLabels: ledgerState.optionLabels,
          optionCount: Number(ledgerState.optionCount),
          tallies: talliesMap,
          isOpen: ledgerState.isOpen,
          eligibilityRoot: ledgerState.eligibilityRoot,
          totalBallots: ledgerState.totalBallots,
        };
      })
    );
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;

  async castBallot(optionIndex: number): Promise<string> {
    this.logger?.info(`casting ballot for option: ${optionIndex}`);
    const txData = await this.deployedContract.callTx.castBallot(BigInt(optionIndex));
    return txData.public.txHash;
  }

  async closePoll(): Promise<string> {
    this.logger?.info('closing poll');
    const txData = await this.deployedContract.callTx.closePoll();
    return txData.public.txHash;
  }

  static async join(providers: VotingProviders, contractAddress: ContractAddress, logger?: Logger): Promise<VotingAPI> {
    logger?.info({ joinContract: { contractAddress } });

    const deployedVotingContract = await findDeployedContract<VotingContract>(providers, {
      contractAddress,
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState: await VotingAPI.getPrivateState(providers, contractAddress),
    });

    return new VotingAPI(deployedVotingContract, providers, logger);
  }

  private static async getPrivateState(
    providers: VotingProviders,
    contractAddress: ContractAddress,
  ): Promise<any> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(votingPrivateStateKey);
    return existingPrivateState ?? createVotingPrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
