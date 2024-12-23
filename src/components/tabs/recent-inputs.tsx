// src/TransactionTable.js
import React, { useEffect, useState, useCallback } from "react";

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
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTransactions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsPolling(true);
      }
      setError(null);

      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error(
          `Failed to fetch transactions: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setTransactions(data);
      setRetryCount(0); // Reset retry count on successful fetch
    } catch (error) {
      console.error('Error fetching transactions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load transactions: ${errorMessage}`);
      
      // Increment retry count
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTransactions(true);

    // Set up polling with exponential backoff
    const pollInterval = Math.min(5000 * Math.pow(2, retryCount), 30000); // Max 30s
    const interval = setInterval(() => {
      fetchTransactions(false);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchTransactions, retryCount]);

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
        <p className="text-white-0.4 text-sm mb-4">
          {retryCount > 0 ? `Retrying in ${Math.min(5 * Math.pow(2, retryCount), 30)} seconds...` : ''}
        </p>
        <button 
          onClick={() => fetchTransactions(true)}
          className="px-4 py-2 bg-white-0.1 rounded-lg hover:bg-white-0.2 transition-colors"
        >
          Retry Now
        </button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="overflow-x-auto relative">
        {isPolling && (
          <div className="absolute top-0 right-0 mr-4 mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <table className="w-full">
          <thead>
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
  );
};

export default RecentInputs;
