import React, { useEffect, useState } from "react";

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
}

function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

    // Fetch initially
    fetchTransactions();

    // Poll every 30 seconds for new transactions
    const interval = setInterval(fetchTransactions, 30000);

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

  const HistoryRow = ({ signature, time, type }: HistoryRowProps) => {
    return (
      <div className="flex items-center justify-between py-2 px-4">
        <h3 className="tracking-[2.5%] text-xl leading-5 text-white font-semibold">
          {signature.slice(0, 8)}...
        </h3>
        <div className="flex items-center gap-4">
          <span className="tracking-[2.5%] text-xl leading-5 text-white-0.4 font-semibold">
            {type}
          </span>
          <span className="tracking-[2.5%] text-xl leading-5 text-white-0.4 font-semibold">
            {time}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((transaction) => (
        <HistoryRow
          key={transaction.signature}
          signature={transaction.signature}
          time={formatTime(transaction.timestamp)}
          type={transaction.type}
        />
      ))}
    </div>
  );
}

export default History;
