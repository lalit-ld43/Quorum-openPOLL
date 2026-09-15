import { useState } from "react";
import type { VotingDerivedState, DeployedVotingAPI } from "@midnight-ntwrk/voting-api";

export function BallotStub({
  boardState,
  boardAPI,
}: {
  boardState: VotingDerivedState;
  boardAPI: DeployedVotingAPI | null;
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "proving" | "done" | "error">("idle");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleCast() {
    if (chosen === null || !boardAPI) return;
    setPhase("proving");
    setErrorMsg(null);
    try {
      const txHash = await boardAPI.castBallot(chosen);
      setReceipt(txHash);
      setPhase("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }

  if (!boardState.isOpen && phase !== "done") {
    return (
      <div className="paper-grain bg-parchment text-ink rounded-sm p-8 text-center">
        <p className="font-display text-lg">This poll has closed.</p>
        <p className="text-sm text-ink/60 mt-1">
          The tally below is final and will not change.
        </p>
      </div>
    );
  }

  return (
    <div className="paper-grain bg-parchment text-ink rounded-sm overflow-hidden shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)]">
      <div className="p-8">
        <p className="font-mono text-[11px] tracking-wide text-ink/50">
          ballot · {boardState.pollTitle.length > 40 ? boardState.pollTitle.slice(0, 40) + "…" : boardState.pollTitle}
        </p>
        <h2 className="font-display text-2xl mt-1 mb-6">{boardState.pollTitle}</h2>

        {phase === "done" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-moss">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12l5 5L20 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">Ballot recorded on-chain.</span>
            </div>
            <div className="border border-ink/15 rounded-sm p-4 bg-parchment-dim/60">
              <p className="text-[11px] text-ink/50 mb-1">transaction hash</p>
              <p className="font-mono text-xs break-all">
                <a 
                  href={`https://explorer.preprod.midnight.network/transaction/${receipt}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="underline hover:text-moss transition-colors"
                >
                  {receipt}
                </a>
              </p>
              <p className="text-[11px] text-ink/45 mt-2 leading-relaxed">
                This transaction proves a ballot was cast securely without revealing your identity or chosen option.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              {boardState.optionLabels.map((label, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 border rounded-sm px-4 py-3 cursor-pointer transition-colors ${
                    chosen === idx
                      ? "border-seal bg-seal/5"
                      : "border-ink/15 hover:border-ink/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="option"
                    className="accent-[#A13D2B]"
                    checked={chosen === idx}
                    onChange={() => setChosen(idx)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            {errorMsg && (
              <p className="text-sm text-seal border border-seal/30 bg-seal/5 rounded-sm px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleCast}
              disabled={chosen === null || phase === "proving"}
              className="w-full font-mono text-sm bg-seal text-parchment rounded-sm py-3.5 hover:bg-seal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {phase === "proving" ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-parchment/40 border-t-parchment animate-spin" />
                  generating zk proof…
                </>
              ) : (
                "cast ballot"
              )}
            </button>
          </div>
        )}
      </div>

      <div className="tear-edge h-3 bg-ink/[0.06]" />
      <div className="px-8 py-3 bg-ink/[0.03] flex justify-between items-center">
        <span className="font-mono text-[11px] text-ink/40">
          {Number(boardState.totalBallots)} ballot{Number(boardState.totalBallots) === 1 ? "" : "s"} cast
        </span>
        <span className="font-mono text-[11px] text-ink/40">
          {boardState.isOpen ? "open" : "closed"}
        </span>
      </div>
    </div>
  );
}
