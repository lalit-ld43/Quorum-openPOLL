import { useCallback, useState } from "react";

// Midnight wallet extensions inject themselves under window.midnight.
// 1AM wallet uses the Midnight DApp Connector API:
//   window.midnight['1am'] → { apiVersion, enable(networkId) → ConnectedAPI }
// Lace wallet uses a simpler API:
//   window.midnight.mnLace → { enable() → { address } }
// See: https://docs.midnight.network — "Connect a wallet"
declare global {
  interface Window {
    midnight?: Record<string, MidnightWalletAdapter | undefined>;
  }
}

/** Union of both wallet API shapes we may encounter. */
type MidnightWalletAdapter =
  | {
      // Midnight DApp Connector API (1AM wallet)
      apiVersion: string;
      enable: (networkId: string) => Promise<ConnectedAPI>;
      isEnabled?: () => Promise<boolean>;
    }
  | {
      // Legacy Lace API
      enable: () => Promise<{ address: string }>;
      isEnabled?: () => Promise<boolean>;
      apiVersion?: never;
    };

/** Subset of the ConnectedAPI returned by the 1AM DApp Connector. */
interface ConnectedAPI {
  getConnectionStatus?: () => Promise<unknown>;
  address?: string;
  changeAddress?: string;
  [key: string]: unknown;
}

/**
 * Scans window.midnight for the best available wallet adapter.
 * Prefers any adapter that exposes `apiVersion` (DApp Connector API / 1AM),
 * then falls back to the plain Lace adapter (mnLace).
 */
function getWalletAdapter(): MidnightWalletAdapter | undefined {
  const m = window.midnight;
  if (!m) return undefined;

  // Debug: log entire window.midnight structure so we can inspect 1AM's shape
  console.log("[Quorum] window.midnight keys:", Object.keys(m));
  Object.entries(m).forEach(([key, val]) => {
    console.log(`[Quorum] window.midnight['${key}']:`, val, "keys:", val ? Object.keys(val) : "N/A");
  });

  // Prefer DApp Connector API wallets (1AM, future wallets) — they expose apiVersion
  const dappConnector = Object.values(m).find(
    (w) => w && typeof w === "object" && "apiVersion" in w
  );
  if (dappConnector) {
    console.log("[Quorum] Using DApp Connector wallet:", dappConnector);
    return dappConnector;
  }

  // Fallback: legacy Lace API
  const lace = m["mnLace"];
  if (lace) console.log("[Quorum] Using Lace wallet:", lace);
  return lace;
}

function isDappConnector(
  w: MidnightWalletAdapter
): w is Extract<MidnightWalletAdapter, { apiVersion: string }> {
  return "apiVersion" in w && typeof w.apiVersion === "string";
}

export type WalletStatus = "disconnected" | "connecting" | "connected" | "unavailable" | "error";

export function useLaceWallet() {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    const wallet = getWalletAdapter();

    if (!wallet) {
      setStatus("unavailable");
      setError(
        "No Midnight wallet detected. Please install the 1AM extension, configure it for Preprod, and reload."
      );
      return;
    }

    try {
      setStatus("connecting");

      if (isDappConnector(wallet)) {
        // 1AM / DApp Connector API — enable() requires a networkId
        const connectedAPI = await wallet.enable("preprod");
        // ConnectedAPI doesn't have a plain address field — just mark as connected
        const addr =
          typeof connectedAPI === "object" && connectedAPI !== null
            ? ((connectedAPI as ConnectedAPI).address ??
              (connectedAPI as ConnectedAPI).changeAddress ??
              null)
            : null;
        setAddress(addr ?? "connected");
      } else {
        // Legacy Lace API — enable() returns { address }
        const result = await (wallet as { enable: () => Promise<{ address: string }> }).enable();
        setAddress(result.address);
      }

      setStatus("connected");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Wallet connection was declined.");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setStatus("disconnected");
  }, []);

  return { status, address, error, connect, disconnect };
}
