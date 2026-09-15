import { PollState, leadingOption } from "../lib/votingSimulator";

export function LiveTally({ poll }: { poll: PollState }) {
  const total = poll.totalBallots || 0;
  const leader = leadingOption(poll);

  return (
    <div className="border border-parchment/12 rounded-sm p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-lg text-parchment">Public tally</h3>
        <span className="font-mono text-[11px] text-parchment/40">
          live · on-chain
        </span>
      </div>

      <div className="space-y-4">
        {poll.options.map((opt) => {
          const count = poll.tallies[opt.id] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isLeader = leader?.id === opt.id && total > 0;
          return (
            <div key={opt.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className={isLeader ? "text-parchment" : "text-parchment/70"}>
                  {opt.label}
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
        {total} total ballot{total === 1 ? "" : "s"} · {poll.nullifiers.size} spent
        credential{poll.nullifiers.size === 1 ? "" : "s"}
      </p>
    </div>
  );
}
