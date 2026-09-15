import { Header } from "./components/Header";
import { BallotStub } from "./components/BallotStub";
import { LiveTally } from "./components/LiveTally";
import { PrivacyLedger } from "./components/PrivacyLedger";
import { useLaceWallet } from "./hooks/useLaceWallet";
import { useMidnightProviders, type WalletConnectorAPI } from "./hooks/useMidnightProviders";

function App() {
  const wallet = useLaceWallet();
  const { boardAPI, boardState, error: midnightError } = useMidnightProviders(wallet.walletAPI as unknown as WalletConnectorAPI | null);

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

        {boardState ? (
          <>
            <section className="mb-10">
              <BallotStub boardState={boardState} boardAPI={boardAPI} />
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              <LiveTally boardState={boardState} />
              <PrivacyLedger />
            </section>
          </>
        ) : (
          <section className="py-20 text-center">
            <p className="text-parchment/60 animate-pulse">
              {wallet.status === "connected" 
                ? "Synchronizing with Midnight Network..."
                : "Connect your wallet to participate in the poll."}
            </p>
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
