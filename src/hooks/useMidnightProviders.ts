/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { type VotingDerivedState, type DeployedVotingAPI, VotingAPI, type VotingProviders, type VotingCircuitKeys } from "@midnight-ntwrk/voting-api";
import { type VotingPrivateState } from "@midnight-ntwrk/voting-contract";
import { inMemoryPrivateStateProvider } from "../lib/in-memory-private-state-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
import {
  Binding,
  FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  TransactionId,
} from "@midnight-ntwrk/midnight-js-protocol/ledger";
import type { UnboundTransaction } from "@midnight-ntwrk/midnight-js-types";
import { pino } from "pino";

const logger = pino({ level: "info" });

// Fallback to hardcoded addresses if not set
const CONTRACT_ADDRESSES = (import.meta.env.VITE_CONTRACT_ADDRESSES || "7d2753a1c0e67ad599a11a62174066b7dd07f2b3b6807f24adbe82671e27c123,918b1b4a90e69b31e71c628432cab41f2592d97d41b244e54793931c41e8bcb0,f2f8bd1854ee0cf1b99e70f8127618bc37809618e8fc217e45cd2d3f514a7adc").split(',');

export interface WalletConnectorAPI {
  getConfiguration(): Promise<{ proverServerUri?: string; indexerUri: string; indexerWsUri: string }>;
  getShieldedAddresses(): Promise<{ shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string }>;
  balanceUnsealedTransaction(tx: string): Promise<{ tx: string }>;
  submitTransaction(tx: string): Promise<void>;
}

export function useMidnightProviders(connectedAPI: WalletConnectorAPI | null) {
  const [boardAPIs, setBoardAPIs] = useState<DeployedVotingAPI[]>([]);
  const [boardStates, setBoardStates] = useState<(VotingDerivedState | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initStep, setInitStep] = useState<string>("Initializing...");

  useEffect(() => {
    if (!connectedAPI) {
      setBoardAPIs([]);
      setBoardStates([]);
      setInitStep("Waiting for wallet...");
      return;
    }

    let isSubscribed = true;

    async function initialize(api: WalletConnectorAPI) {
      try {
        setInitStep("Fetching configuration...");
        const zkConfigPath = window.location.origin;
        const keyMaterialProvider = new FetchZkConfigProvider<VotingCircuitKeys>(zkConfigPath, fetch.bind(window));
        
        const config = await api.getConfiguration();
        
        setInitStep("Getting shielded addresses...");
        const shieldedAddresses = await api.getShieldedAddresses();

        setInitStep("Setting up providers...");
        const privateStateProvider = inMemoryPrivateStateProvider<string, VotingPrivateState>();

        const providers: VotingProviders = {
          privateStateProvider,
          zkConfigProvider: keyMaterialProvider,
          proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
          publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
          walletProvider: {
            getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
            getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
            balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
              const serializedTx = toHex(tx.serialize());
              const received = await api.balanceUnsealedTransaction(serializedTx);
              return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
                "signature",
                "proof",
                "binding",
                fromHex(received.tx),
              );
            },
          },
          midnightProvider: {
            submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
              await api.submitTransaction(toHex(tx.serialize()));
              const txIdentifiers = tx.identifiers();
              return txIdentifiers[0]!;
            },
          },
        };

        setInitStep(`Joining ${CONTRACT_ADDRESSES.length} contracts...`);
        const apis: DeployedVotingAPI[] = [];
        for (const address of CONTRACT_ADDRESSES) {
          const votingApi = await VotingAPI.join(providers, address.trim(), logger);
          apis.push(votingApi);
        }
        
        setInitStep("Subscribing to state...");
        if (isSubscribed) {
          setBoardAPIs(apis);
          setBoardStates(new Array(apis.length).fill(null));
          
          apis.forEach((api, index) => {
            api.state$.subscribe((state) => {
              if (isSubscribed) {
                setBoardStates((prev) => {
                  const newStates = [...prev];
                  newStates[index] = state;
                  return newStates;
                });
                setInitStep("Connected");
              }
            });
          });
        }
      } catch (e: unknown) {
        console.error("Error initializing Midnight API:", e);
        if (isSubscribed) {
          setError(e instanceof Error ? e.message : "Failed to connect to smart contract.");
          setInitStep("Error occurred");
        }
      }
    }

    initialize(connectedAPI);

    return () => {
      isSubscribed = false;
    };
  }, [connectedAPI]);

  return { boardAPIs, boardStates, error, initStep };
}
