import { WalletStatus } from "../hooks/useLaceWallet";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Header({
  status,
  address,
  error,
  onConnect,
  onDisconnect,
}: {
  status: WalletStatus;
  address: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <header className="border-b border-parchment/10">
      <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 64 64" className="shrink-0">
            <circle cx="32" cy="32" r="30" className="fill-seal" />
            <path
              d="M20 34 L28 42 L44 24"
              fill="none"
              stroke="#EDE6D6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="font-display text-xl text-parchment leading-none">Quorum</p>
            <p className="font-mono text-[11px] text-parchment/50 mt-1">
              first quarter · midnight builder challenge
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {status === "connected" && address ? (
            <button
              onClick={onDisconnect}
              className="font-mono text-xs text-moss-light border border-moss/40 rounded px-3 py-1.5 hover:bg-moss/10 transition-colors"
            >
              {truncate(address)} · disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={status === "connecting"}
              className="font-mono text-xs text-parchment border border-parchment/30 rounded px-3 py-1.5 hover:border-seal-light hover:text-seal-light transition-colors disabled:opacity-50"
            >
              {status === "connecting" ? "connecting…" : "connect lace wallet"}
            </button>
          )}
          {status === "unavailable" && (
            <p className="text-[11px] text-parchment/40 max-w-[220px] text-right">
              {error}
            </p>
          )}
          {status === "error" && error && (
            <p className="text-[11px] text-seal-light max-w-[220px] text-right">{error}</p>
          )}
        </div>
      </div>
    </header>
  );
}
