import { useCallback, useState } from "react";

// Midnight wallet extensions inject themselves under window.midnight.
// 1AM wallet (DApp Connector API v4):
//   window.midnight['1am'] → { rdns, name, icon, apiVersion, connect(networkId) → ConnectedAPI }
// Lace wallet (legacy):
//   window.midnight.mnLace → { enable() → { address } }
// See: https://docs.midnight.network — "Connect a wallet"
declare global {
  interface Window {
    midnight?: Record<string, OneAMWallet | LaceWallet | undefined>;
  }
}

/** 1AM wallet shape (Midnight DApp Connector API v4) */
interface OneAMWallet {
  rdns: string;
  name: string;
  icon?: string;
  apiVersion: string;
  // 1AM uses connect(), NOT enable()
  connect: (networkId: string) => Promise<ConnectedAPI>;
}

/** Legacy Lace wallet shape */
interface LaceWallet {
  enable: () => Promise<{ address: string }>;
  isEnabled?: () => Promise<boolean>;
}

/** Subset of ConnectedAPI returned by 1AM's connect() */
interface ConnectedAPI {
  address?: string;
  changeAddress?: string;
  getConnectionStatus?: () => Promise<unknown>;
  [key: string]: unknown;
}

function isOneAM(w: unknown): w is OneAMWallet {
  return (
    typeof w === "object" &&
    w !== null &&
    "apiVersion" in w &&
    "connect" in w &&
    typeof (w as OneAMWallet).connect === "function"
  );
}

function isLace(w: unknown): w is LaceWallet {
  return (
    typeof w === "object" &&
    w !== null &&
    "enable" in w &&
    typeof (w as LaceWallet).enable === "function"
  );
}

/**
 * Scans window.midnight for the best available wallet.
 * Prefers 1AM (DApp Connector API — uses connect()),
 * then falls back to Lace (legacy — uses enable()).
 */
function getWalletAdapter(): OneAMWallet | LaceWallet | undefined {
  const m = window.midnight;
  if (!m) return undefined;

  // Prefer 1AM / any DApp Connector wallet (has apiVersion + connect)
  const oneam = Object.values(m).find(isOneAM);
  if (oneam) return oneam;

  // Fallback: Lace
  const lace = m["mnLace"];
  if (isLace(lace)) return lace;

  return undefined;
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
        "No Midnight wallet detected. Install the 1AM extension, configure it for Preprod, and reload."
      );
      return;
    }

    try {
      setStatus("connecting");

      if (isOneAM(wallet)) {
        // 1AM DApp Connector API — uses connect(networkId)
        const connectedAPI = await wallet.connect("preprod");
        const addr =
          connectedAPI?.address ?? connectedAPI?.changeAddress ?? null;
        setAddress(addr ?? "1AM");
      } else if (isLace(wallet)) {
        // Legacy Lace API — uses enable()
        const result = await wallet.enable();
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
