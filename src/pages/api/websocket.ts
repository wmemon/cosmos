import { WebSocket, WebSocketServer } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocketServer(server: any) {
  if (wss) return; // Already initialized

  wss = new WebSocketServer({ server });
  console.log('🚀 WebSocket server initialized');

  wss.on('connection', (ws: WebSocket) => {
    console.log('👤 Client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('👋 Client disconnected');
      clients.delete(ws);
    });

    // Send initial message
    ws.send(JSON.stringify({ type: 'connected' }));
  });
}

export function broadcastTransaction(transaction: any) {
  console.log('📢 Broadcasting transaction:', transaction.signature);
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'transaction',
        data: transaction
      }));
    }
  });
}

export function getConnectedClientsCount() {
  return clients.size;
} 