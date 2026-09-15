'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { type Observable } from 'rxjs';
import { type VotingDerivedState, type DeployedVotingAPI } from '@midnight-ntwrk/voting-api';
import type { BoardDeployment } from '@/services/midnight';
import { CheckCircle2, LoaderCircle, ExternalLink, LogOut, XCircle } from 'lucide-react';

export interface PollDashboardProps {
  boardDeployment$: Observable<BoardDeployment>;
}

export const PollDashboard: React.FC<Readonly<PollDashboardProps>> = ({ boardDeployment$ }) => {
  const [boardDeployment, setBoardDeployment] = useState<BoardDeployment>();
  const [deployedBoardAPI, setDeployedBoardAPI] = useState<DeployedVotingAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [boardState, setBoardState] = useState<VotingDerivedState>();
  const [isWorking, setIsWorking] = useState(true);
  const [txHash, setTxHash] = useState<string>();

  useEffect(() => {
    const subscription = boardDeployment$.subscribe(setBoardDeployment);
    return () => subscription.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!boardDeployment || boardDeployment.status === 'in-progress') return;

    setIsWorking(false);

    if (boardDeployment.status === 'failed') {
      setErrorMessage(
        boardDeployment.error.message.length ? boardDeployment.error.message : 'Encountered an unexpected error.',
      );
      return;
    }

    setDeployedBoardAPI(boardDeployment.api);
    const subscription = boardDeployment.api.state$.subscribe(setBoardState);
    return () => subscription.unsubscribe();
  }, [boardDeployment]);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem('walletConnected');
    window.location.reload();
  }, []);

  const handleVote = useCallback(
    async (optionIndex: number) => {
      if (!deployedBoardAPI) return;
      try {
        setIsWorking(true);
        setErrorMessage(undefined);
        setTxHash(undefined);
        const hash = await deployedBoardAPI.castBallot(optionIndex);
        setTxHash(hash);
      } catch (error: unknown) {
        setErrorMessage(error instanceof Error ? error.message : String(error));
      } finally {
        setIsWorking(false);
      }
    },
    [deployedBoardAPI],
  );

  if (!boardState) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 animate-pulse">
        <LoaderCircle className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-300">Synchronizing with Midnight Network...</p>
      </div>
    );
  }

  const totalVotes = Number(boardState.totalBallots);

  return (
    <div className="relative overflow-hidden p-8 sm:p-12 bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-pink-500/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />

      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-white mb-2">{boardState.pollTitle}</h2>
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full border border-white/5">
              <span className={`w-2 h-2 rounded-full mr-2 ${boardState.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
              {boardState.isOpen ? 'Active Poll' : 'Poll Closed'}
            </span>
            <span>•</span>
            <span>{totalVotes} total votes</span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors group"
          title="Disconnect Wallet"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-start space-x-3">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {txHash && (
        <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="flex items-center space-x-3 text-green-400">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold text-green-300">Transaction Successful!</p>
              <p className="text-sm opacity-80">Your vote has been securely recorded on-chain.</p>
            </div>
          </div>
          <a
            href={`https://explorer.preprod.midnight.network/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-full text-green-300 text-sm font-medium transition-colors"
          >
            Verify on Explorer
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      )}

      <div className="space-y-6">
        {boardState.optionLabels.map((label, idx) => {
          const tally = Number(boardState.tallies[idx] || 0n);
          const percentage = totalVotes > 0 ? (tally / totalVotes) * 100 : 0;

          return (
            <div key={idx} className="relative group">
              <button
                onClick={() => handleVote(idx)}
                disabled={isWorking || !boardState.isOpen}
                className="w-full text-left p-6 bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 rounded-2xl border border-white/5 transition-all duration-300 overflow-hidden relative z-10"
              >
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 transition-all duration-1000 ease-out z-0"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative z-10 flex justify-between items-center">
                  <span className="text-xl font-medium text-white group-hover:text-pink-300 transition-colors">
                    {label}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 font-mono text-sm">{tally} votes</span>
                    <span className="text-white font-bold min-w-[3rem] text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {isWorking && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center rounded-[3rem] z-50">
          <div className="bg-gray-800 p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center">
            <LoaderCircle className="w-12 h-12 text-pink-500 animate-spin mb-4" />
            <p className="text-white font-medium">Awaiting wallet signature...</p>
            <p className="text-gray-400 text-sm mt-2">Please check your Midnight extension popup.</p>
          </div>
        </div>
      )}
    </div>
  );
};
