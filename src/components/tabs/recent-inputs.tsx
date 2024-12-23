// src/TransactionTable.js
import React, { useEffect, useState, useCallback, useRef } from "react";

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

const RecentInputs = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/websocket`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'transaction') {
          setTransactions(prev => [message.data, ...prev].slice(0, 50));
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to WebSocket');
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setError('Failed to connect to WebSocket');
    }
  }, []);

  const fetchInitialTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/transactions?type=recent');
      if (!response.ok) {
        throw new Error(
          `Failed to fetch transactions: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching initial transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load transactions: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch and WebSocket connection
    fetchInitialTransactions();
    connectWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchInitialTransactions, connectWebSocket]);

  const formatTime = useCallback((timestamp: number) => {
    try {
      const now = Date.now();
      const diff = now - timestamp * 1000;
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return 'Just now';
      if (minutes === 1) return '1m ago';
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours === 1) return '1h ago';
      if (hours < 24) return `${hours}h ago`;
      
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  }, []);

  const shortenAddress = useCallback((address: string) => {
    if (!address) return 'Unknown';
    try {
      return `${address.slice(0, 4)}..${address.slice(-4)}`;
    } catch (error) {
      console.error('Error shortening address:', error);
      return 'Invalid address';
    }
  }, []);

  const formatAmount = useCallback((amount: number) => {
    try {
      return amount.toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-white">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => {
            fetchInitialTransactions();
            connectWebSocket();
          }}
          className="px-4 py-2 bg-white-0.1 rounded-lg hover:bg-white-0.2 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="overflow-x-auto relative">
        {!isConnected && (
          <div className="absolute top-0 right-0 mr-4 mt-2 z-10">
            <div className="px-2 py-1 bg-yellow-500 text-black text-sm rounded-full">
              Reconnecting...
            </div>
          </div>
        )}
        <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <table className="w-full">
            <thead className="sticky top-0 bg-tabs-bg z-10">
              <tr className="text-white tracking-[2.5%] text-sm">
                <th scope="col" className="text-left pl-4 py-2">
                  Time
                </th>
                <th scope="col" className="text-left py-2">
                  From
                </th>
                <th scope="col" className="text-left py-2">
                  To
                </th>
                <th scope="col" className="text-right pr-4 py-2">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-white-0.4">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr 
                    key={transaction.signature} 
                    className="text-white tracking-[2.5%] text-sm hover:bg-white-0.05 rounded-lg transition-colors"
                  >
                    <td className="pl-4 py-3">
                      <div className="flex flex-col">
                        <span>{formatTime(transaction.timestamp)}</span>
                        <span className="text-white-0.4 text-xs">{transaction.type || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-[100px] bg-white-0.09">
                        {shortenAddress(transaction.from)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-[100px] bg-white-0.09">
                        {shortenAddress(transaction.to)}
                      </span>
                    </td>
                    <td className="text-right py-3 pr-4 font-semibold">
                      {formatAmount(transaction.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentInputs;
