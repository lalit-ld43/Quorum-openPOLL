import { useState } from "react";
import { PollState, registerVoter, castBallot } from "../lib/votingSimulator";

type CastPhase = "idle" | "proving" | "done" | "error";

function randomSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function BallotStub({
  poll,
  onCast,
}: {
  poll: PollState;
  onCast: () => void;
}) {
  const [secret, setSecret] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [phase, setPhase] = useState<CastPhase>("idle");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGenerateCredential() {
    const s = randomSecret();
    setSecret(s);
    await registerVoter(poll, s);
    setRegistered(true);
  }

  async function handleCast() {
    if (!secret || chosen === null) return;
    setPhase("proving");
    setErrorMsg(null);
    // Simulated proof-generation latency — mirrors the real proof server
    // round trip once compiled against the Midnight toolchain.
    await new Promise((r) => setTimeout(r, 900));
    const result = await castBallot(poll, secret, chosen);
    if (result.ok) {
      setReceipt(result.nullifier!.slice(0, 16));
      setPhase("done");
      onCast();
    } else {
      setErrorMsg(result.error ?? "Ballot could not be cast.");
      setPhase("error");
    }
  }

  if (!poll.isOpen && phase !== "done") {
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
          ballot · {poll.title.length > 40 ? poll.title.slice(0, 40) + "…" : poll.title}
        </p>
        <h2 className="font-display text-2xl mt-1 mb-6">{poll.title}</h2>

        {!registered ? (
          <div className="space-y-3">
            <p className="text-sm text-ink/70 leading-relaxed">
              Generate a one-time voting credential. It's created on your
              device and never leaves it — only its hash membership is ever
              proved on-chain.
            </p>
            <button
              onClick={handleGenerateCredential}
              className="w-full font-mono text-sm bg-ink text-parchment rounded-sm py-3 hover:bg-ink-light transition-colors"
            >
              generate credential
            </button>
          </div>
        ) : phase === "done" ? (
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
              <span className="text-sm font-medium">Ballot recorded.</span>
            </div>
            <div className="border border-ink/15 rounded-sm p-4 bg-parchment-dim/60">
              <p className="text-[11px] text-ink/50 mb-1">your private receipt</p>
              <p className="font-mono text-sm break-all">{receipt}…</p>
              <p className="text-[11px] text-ink/45 mt-2 leading-relaxed">
                This is the only trace of your ballot. It proves a ballot was
                cast — it does not appear anywhere linked to your identity or
                your chosen option.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              {poll.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 border rounded-sm px-4 py-3 cursor-pointer transition-colors ${
                    chosen === opt.id
                      ? "border-seal bg-seal/5"
                      : "border-ink/15 hover:border-ink/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="option"
                    className="accent-[#A13D2B]"
                    checked={chosen === opt.id}
                    onChange={() => setChosen(opt.id)}
                  />
                  <span className="text-sm">{opt.label}</span>
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
                  generating proof…
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
          {poll.totalBallots} ballot{poll.totalBallots === 1 ? "" : "s"} cast
        </span>
        <span className="font-mono text-[11px] text-ink/40">
          {poll.isOpen ? "open" : "closed"}
        </span>
      </div>
    </div>
  );
}
