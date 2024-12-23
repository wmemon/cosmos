import { useEffect, useCallback } from 'react';

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

export function useTransactionUpdates(onNewTransactions: (transactions: Transaction[]) => void) {
  const setupSSE = useCallback(() => {
    const eventSource = new EventSource('/api/transaction-updates');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-transactions') {
        onNewTransactions(data.transactions);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
      // Try to reconnect after 5 seconds
      setTimeout(setupSSE, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [onNewTransactions]);

  useEffect(() => {
    return setupSSE();
  }, [setupSSE]);
} 