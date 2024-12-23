import { useEffect, useCallback, useRef } from 'react';

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

export function useUpdates(onNewTransactions: (transactions: Transaction[]) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const setupSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/updates');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const transactions = JSON.parse(event.data);
        if (Array.isArray(transactions)) {
          onNewTransactions(transactions);
        }
      } catch (error) {
        console.error('Error processing update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
      eventSourceRef.current = null;
      // Try to reconnect after 5 seconds
      setTimeout(setupSSE, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [onNewTransactions]);

  useEffect(() => {
    const cleanup = setupSSE();
    return () => {
      cleanup();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [setupSSE]);
} 