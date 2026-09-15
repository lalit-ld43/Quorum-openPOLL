'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { type Observable } from 'rxjs';
import { MainLayout } from '@/components/layout/main-layout';
import { PollDashboard } from '@/components/poll/poll-dashboard';
import { useDeployedBoardContext } from '@/hooks/use-deployed-board-context';
import type { BoardDeployment } from '@/services/midnight';
import { ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { NEXT_PUBLIC_CONTRACT_ADDRESS } from '@/config';

export default function HomePage() {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployments, setBoardDeployments] = useState<Array<Observable<BoardDeployment>>>([]);

  useEffect(() => {
    const subscription = boardApiProvider.boardDeployments$.subscribe(setBoardDeployments);
    return () => subscription.unsubscribe();
  }, [boardApiProvider]);

  // Handle wallet auto-reconnect or manual connect
  const handleConnect = useCallback(() => {
    const addressStr = NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (addressStr) {
      boardApiProvider.resolve(addressStr as ContractAddress);
      localStorage.setItem('walletConnected', 'true');
    } else {
      console.error('No contract address configured');
    }
  }, [boardApiProvider]);

  useEffect(() => {
    if (localStorage.getItem('walletConnected') === 'true' && boardDeployments.length === 0) {
      handleConnect();
    }
  }, [boardDeployments.length, handleConnect]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 sm:px-6 lg:px-8">
        {boardDeployments.length === 0 ? (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Quorum OpenPOLL
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Secure, anonymous, and verifiable zero-knowledge voting on the Midnight Network.
            </p>
            <button
              onClick={handleConnect}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all duration-300 backdrop-blur-md border border-white/20 hover:scale-105 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
            >
              Connect Wallet to Proceed
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-8">
            {boardDeployments.map((boardDeployment, idx) => (
              <PollDashboard key={idx} boardDeployment$={boardDeployment} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
