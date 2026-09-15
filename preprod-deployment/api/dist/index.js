/**
 * Provides types and utilities for working with Quorum voting contracts.
 *
 * @packageDocumentation
 */
import * as Voting from '@midnight-ntwrk/voting-contract';
import { votingPrivateStateKey, } from './common-types.js';
import { CompiledVotingContractContract, createVotingPrivateState } from '@midnight-ntwrk/voting-contract';
import * as utils from './utils/index.js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { map } from 'rxjs';
export class VotingAPI {
    deployedContract;
    logger;
    constructor(deployedContract, providers, logger) {
        this.deployedContract = deployedContract;
        this.logger = logger;
        this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
        providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
        this.state$ = providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(map((contractState) => Voting.ledger(contractState.data)), map((ledgerState) => {
            const talliesMap = {};
            for (const [key, value] of ledgerState.tallies) {
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
        }));
    }
    deployedContractAddress;
    state$;
    async castBallot(optionIndex) {
        this.logger?.info(`casting ballot for option: ${optionIndex}`);
        const txData = await this.deployedContract.callTx.castBallot(BigInt(optionIndex));
        return txData.public.txHash;
    }
    async closePoll() {
        this.logger?.info('closing poll');
        const txData = await this.deployedContract.callTx.closePoll();
        return txData.public.txHash;
    }
    static async join(providers, contractAddress, logger) {
        logger?.info({ joinContract: { contractAddress } });
        const deployedVotingContract = await findDeployedContract(providers, {
            contractAddress,
            compiledContract: CompiledVotingContractContract,
            privateStateId: votingPrivateStateKey,
            initialPrivateState: await VotingAPI.getPrivateState(providers, contractAddress),
        });
        return new VotingAPI(deployedVotingContract, providers, logger);
    }
    static async getPrivateState(providers, contractAddress) {
        providers.privateStateProvider.setContractAddress(contractAddress);
        const existingPrivateState = await providers.privateStateProvider.get(votingPrivateStateKey);
        return existingPrivateState ?? createVotingPrivateState(utils.randomBytes(32));
    }
}
export * as utils from './utils/index.js';
export * from './common-types.js';
//# sourceMappingURL=index.js.map