// src/TransactionTable.js
import React, { useEffect, useState } from "react";

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

  const fetchTransactions = async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsPolling(true);
      }
      setError(null);

      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Will retry soon...');
    } finally {
      setIsLoading(false);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTransactions(true);

    // Set up polling
    const interval = setInterval(() => {
      fetchTransactions(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
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
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}..${address.slice(-4)}`;
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
        <button 
          onClick={() => fetchTransactions(true)}
          className="px-4 py-2 bg-white-0.1 rounded-lg hover:bg-white-0.2 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
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
        <table className="w-full p-1">
          <thead>
            <tr className="font-bold text-white tracking-[2.5%] text-xl leading-5">
              <th scope="col" className="text-left pl-4">
                Time
              </th>
              <th scope="col" className="text-left py-2">
                From
              </th>
              <th scope="col" className="text-right pr-4 py-2">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-white-0.4">
                  No transactions yet
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr 
                  key={transaction.signature} 
                  className="text-white tracking-[2.5%] text-xl leading-5"
                >
                  <td className="pl-4 py-4">{formatTime(transaction.timestamp)}</td>
                  <td className="py-4">
                    <span className="px-2 rounded-[100px] bg-white-0.09">
                      {shortenAddress(transaction.from)}
                    </span>
                  </td>
                  <td className="text-right py-4 pr-4">
                    {transaction.amount.toFixed(2)}
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
