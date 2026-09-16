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

// Fallback to hardcoded address if VITE_CONTRACT_ADDRESS is not set
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0a37c26d078364b1210e5458eb365feb45716c8e5092766f70ae1b3b1dd2487f";

export interface WalletConnectorAPI {
  getConfiguration(): Promise<{ proverServerUri?: string; indexerUri: string; indexerWsUri: string }>;
  getShieldedAddresses(): Promise<{ shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string }>;
  balanceUnsealedTransaction(tx: string): Promise<{ tx: string }>;
  submitTransaction(tx: string): Promise<void>;
}

export function useMidnightProviders(connectedAPI: WalletConnectorAPI | null) {
  const [boardAPI, setBoardAPI] = useState<DeployedVotingAPI | null>(null);
  const [boardState, setBoardState] = useState<VotingDerivedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initStep, setInitStep] = useState<string>("Initializing...");

  useEffect(() => {
    if (!connectedAPI) {
      setBoardAPI(null);
      setBoardState(null);
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

        setInitStep(`Joining contract at ${CONTRACT_ADDRESS}...`);
        const votingApi = await VotingAPI.join(providers, CONTRACT_ADDRESS, logger);
        
        setInitStep("Subscribing to state...");
        if (isSubscribed) {
          setBoardAPI(votingApi);
          votingApi.state$.subscribe((state) => {
            if (isSubscribed) {
              setBoardState(state);
              setInitStep("Connected");
            }
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

  return { boardAPI, boardState, error, initStep };
}
