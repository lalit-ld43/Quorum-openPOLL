import type { VotingDerivedState } from "@midnight-ntwrk/voting-api";

export function LiveTally({ boardState }: { boardState: VotingDerivedState }) {
  const total = Number(boardState.totalBallots) || 0;
  
  // Find the highest tally
  const tallies = boardState.optionLabels.map((_, idx) => Number(boardState.tallies[idx] || 0n));
  const maxTally = tallies.length > 0 ? Math.max(...tallies) : 0;

  return (
    <div className="border border-parchment/12 rounded-sm p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-lg text-parchment">Public tally</h3>
        <span className="font-mono text-[11px] text-parchment/40">
          live · on-chain
        </span>
      </div>

      <div className="space-y-4">
        {boardState.optionLabels.map((label, idx) => {
          const count = tallies[idx] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isLeader = count === maxTally && total > 0;
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className={isLeader ? "text-parchment" : "text-parchment/70"}>
                  {label}
                </span>
                <span className="font-mono text-xs text-parchment/50">
                  {count} · {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-parchment/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                    isLeader ? "bg-moss-light" : "bg-parchment/30"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[11px] text-parchment/35 mt-5">
        {total} total ballot{total === 1 ? "" : "s"} cast
      </p>
    </div>
  );
}
