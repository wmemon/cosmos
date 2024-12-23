import { useEffect, useCallback, useRef } from 'react';
import Peer from 'simple-peer';

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

export function useWebRTC(onNewTransactions: (transactions: Transaction[]) => void) {
  const peerRef = useRef<Peer.Instance | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const setupWebRTC = useCallback(() => {
    // Create a new peer
    const peer = new Peer({
      initiator: true,
      trickle: false,
    });

    peer.on('signal', (data) => {
      // Send signal data to the server
      fetch('/api/rtc-signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(console.error);
    });

    peer.on('data', (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        if (parsedData.type === 'new-transactions' && Array.isArray(parsedData.transactions)) {
          onNewTransactions(parsedData.transactions);
        }
      } catch (error) {
        console.error('Error processing WebRTC data:', error);
      }
    });

    peer.on('error', (error) => {
      console.error('WebRTC Error:', error);
      // Clean up and try to reconnect
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setTimeout(setupWebRTC, 5000);
    });

    peerRef.current = peer;

    // Set up signaling channel
    const eventSource = new EventSource('/api/rtc-signal');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'signal' && peer) {
          peer.signal(data.signal);
        }
      } catch (error) {
        console.error('Error processing signal:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
        setTimeout(setupWebRTC, 5000);
      }
    };

    return () => {
      eventSource.close();
      if (peer) {
        peer.destroy();
      }
    };
  }, [onNewTransactions]);

  useEffect(() => {
    const cleanup = setupWebRTC();
    return () => {
      cleanup();
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [setupWebRTC]);
} 