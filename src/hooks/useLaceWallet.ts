import { useCallback, useState } from "react";

// Midnight wallet extensions inject themselves under window.midnight.
// 1AM wallet uses window.midnight['1am'] or window.midnight.oneam.
// Lace wallet uses window.midnight.mnLace.
// See: https://docs.midnight.network — "Connect a wallet"
declare global {
  interface Window {
    midnight?: Record<
      string,
      | {
          enable: () => Promise<{ address: string }>;
          isEnabled: () => Promise<boolean>;
        }
      | undefined
    >;
  }
}

/** Returns the first available Midnight wallet adapter, preferring 1AM. */
function getWalletAdapter() {
  const m = window.midnight;
  if (!m) return undefined;
  // 1AM wallet (prefer)
  const oneam = m["1am"] ?? m["oneam"];
  if (oneam) return oneam;
  // Lace wallet (fallback)
  return m["mnLace"];
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
      setError("No Midnight wallet extension detected. Please install 1AM or Lace and reload.");
      return;
    }
    try {
      setStatus("connecting");
      const { address } = await wallet.enable();
      setAddress(address);
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
