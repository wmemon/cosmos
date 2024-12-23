import React, { useEffect, useState, useCallback } from "react";

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

interface HistoryRowProps {
  signature: string;
  time: string;
  type: string;
  amount: number;
  from: string;
  to: string;
}

function History() {
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
    const pollInterval = Math.min(5000 * Math.pow(1.5, retryCount), 30000); // Reduced exponential factor
    const maxRetries = 5; // Maximum number of retries

    let interval: NodeJS.Timeout;
    if (retryCount < maxRetries) {
      interval = setInterval(() => {
        fetchTransactions(false);
      }, pollInterval);
    } else {
      console.log('🛑 Maximum retries reached, stopping polling');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
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

  const HistoryRow = ({ signature, time, type, amount, from, to }: HistoryRowProps) => {
    return (
      <div className="flex flex-col py-3 px-4 bg-white-0.05 rounded-lg hover:bg-white-0.09 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="tracking-[2.5%] text-xl leading-5 text-white font-semibold">
              {shortenAddress(signature)}
            </h3>
            <span className="px-2 py-1 rounded-full bg-white-0.09 text-sm text-white-0.7">
              {type || 'Unknown'}
            </span>
          </div>
          <span className="tracking-[2.5%] text-sm text-white-0.4">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-white-0.4">From</span>
            <span className="text-white">{shortenAddress(from)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-white-0.4">To</span>
            <span className="text-white">{shortenAddress(to)}</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-sm text-white-0.4">Amount</span>
            <span className="text-white font-semibold">{formatAmount(amount)}</span>
          </div>
        </div>
      </div>
    );
  };

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
        {retryCount > 0 && retryCount < 5 ? (
          <p className="text-white-0.4 text-sm mb-4">
            Retrying in {Math.min(5 * Math.pow(1.5, retryCount), 30)} seconds...
          </p>
        ) : retryCount >= 5 ? (
          <p className="text-white-0.4 text-sm mb-4">
            Maximum retries reached. Please try again later or contact support.
          </p>
        ) : null}
        <button 
          onClick={() => {
            setRetryCount(0);
            fetchTransactions(true);
          }}
          className="px-4 py-2 bg-white-0.1 rounded-lg hover:bg-white-0.2 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative p-2">
      {isPolling && (
        <div className="absolute top-2 right-4 z-10">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-white-0.4">
            No transactions yet
          </div>
        ) : (
          transactions.map((transaction) => (
            <HistoryRow
              key={transaction.signature}
              signature={transaction.signature}
              time={formatTime(transaction.timestamp)}
              type={transaction.type}
              amount={transaction.amount}
              from={transaction.from}
              to={transaction.to}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default History;
