// src/TransactionTable.js
import React, { useEffect, useState, useCallback } from "react";
import { useUpdates } from "@/hooks/useUpdates";

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

  const handleNewTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactions(prev => {
      const combined = [...newTransactions, ...prev];
      return combined.slice(0, 50); // Keep only last 50
    });
  }, []);

  // Use SSE for real-time updates
  useUpdates(handleNewTransactions);

  // Initial fetch
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp * 1000; // Convert to milliseconds
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

  return (
    <div>
      <div className="overflow-x-auto">
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
            {transactions.map((transaction) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInputs;
