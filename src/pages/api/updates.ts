export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

// Store active clients
const clients = new Set<ReadableStreamDefaultController>();

export function notifyClients(transactions: Transaction[]) {
  const encoder = new TextEncoder();
  const message = encoder.encode(`data: ${JSON.stringify(transactions)}\n\n`);
  
  clients.forEach((client) => {
    try {
      client.enqueue(message);
    } catch (error) {
      console.error('Error sending to client:', error);
      clients.delete(client);
    }
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);

      // Send an initial heartbeat
      controller.enqueue(new TextEncoder().encode(': connected\n\n'));

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clients.delete(controller);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
} 