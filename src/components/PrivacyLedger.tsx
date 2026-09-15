export function PrivacyLedger() {
  return (
    <div className="border border-parchment/12 rounded-sm p-6">
      <h3 className="font-display text-lg text-parchment mb-4">
        What an observer can see
      </h3>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="font-mono text-[11px] text-moss-light mb-2">public</p>
          <ul className="space-y-1.5 text-sm text-parchment/75">
            <li>· the poll question and options</li>
            <li>· each option's running vote count</li>
            <li>· the set of spent credential nullifiers</li>
            <li>· whether the poll is open or closed</li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] text-seal-light mb-2">private</p>
          <ul className="space-y-1.5 text-sm text-parchment/75">
            <li>· your voting credential secret</li>
            <li>· which credential belongs to which voter</li>
            <li>· any link between a nullifier and a choice</li>
            <li>· your wallet's identity relative to a specific vote</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-parchment/10">
        <p className="text-sm text-parchment/60 leading-relaxed">
          Each ballot proves, in zero-knowledge, that the caller holds a
          valid credential and hasn't voted before — without revealing{" "}
          <em className="not-italic text-parchment/80">which</em> credential,
          or exposing any voter-to-choice mapping on-chain.
        </p>
      </div>
    </div>
  );
}
