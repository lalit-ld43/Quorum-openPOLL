import { Header } from "./components/Header";
import { BallotStub } from "./components/BallotStub";
import { LiveTally } from "./components/LiveTally";
import { PrivacyLedger } from "./components/PrivacyLedger";
import { useLaceWallet } from "./hooks/useLaceWallet";
import { useMidnightProviders, type WalletConnectorAPI } from "./hooks/useMidnightProviders";

function App() {
  const wallet = useLaceWallet();
  const { boardAPIs, boardStates, error: midnightError, initStep } = useMidnightProviders(wallet.walletAPI as unknown as WalletConnectorAPI | null);

  // We no longer need forceRender as state is observable
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <Header
        status={wallet.status}
        address={wallet.address}
        error={wallet.error || midnightError}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
      />

      <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-12">
        <section className="mb-10">
          <p className="font-mono text-[11px] text-parchment/40 mb-3">
            🌓 first quarter — half light, half shadow
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-parchment leading-tight max-w-xl">
            Exactly as much of your vote is disclosed as you decide.
          </h1>
          <p className="text-parchment/60 mt-3 max-w-lg leading-relaxed">
            Cast an anonymous ballot below. Your choice is proved, not
            published — only the aggregate tally is public, verifiable
            on-chain the moment you vote.
          </p>
        </section>

        {boardStates.length > 0 && boardStates.every(s => s !== null) ? (
          <div className="space-y-16">
            {boardStates.map((state, idx) => (
              <div key={idx} className="relative">
                <section className="mb-10">
                  <BallotStub boardState={state!} boardAPI={boardAPIs[idx]} />
                </section>

                <section className="grid gap-6 sm:grid-cols-2">
                  <LiveTally boardState={state!} />
                  <PrivacyLedger />
                </section>
                
                {idx < boardStates.length - 1 && (
                  <div className="mt-16 border-b border-parchment/10 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink px-4 text-parchment/20 text-xl font-mono">
                      ***
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <section className="py-20 text-center">
            <p className="text-parchment/60 animate-pulse">
              {wallet.status === "connected" 
                ? "Synchronizing with Midnight Network..."
                : "Connect your wallet to participate in the polls."}
            </p>
            {wallet.status === "connected" && (
              <p className="text-parchment/40 mt-2 font-mono text-xs">
                {initStep}
              </p>
            )}
            {midnightError && (
              <div className="mt-6 border border-seal/30 bg-seal/10 text-seal rounded-md p-4 inline-block max-w-lg text-sm text-left">
                <strong className="block mb-1">Initialization Error</strong>
                <span className="font-mono">{midnightError}</span>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-parchment/10">
        <div className="mx-auto max-w-3xl px-6 py-6 flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-mono text-[11px] text-parchment/35">
            built on midnight · compact contracts
          </p>
          <p className="font-mono text-[11px] text-parchment/35">
            level 3 · first quarter submission
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
