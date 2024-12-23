export const config = {
  runtime: 'edge',
  regions: ['iad1'], // specify the region you want to deploy to
};

type NotificationData = {
  type: 'new-transactions' | 'connected';
  transactions?: Array<{
    signature: string;
    timestamp: number;
    amount: number;
    type: string;
    from: string;
    to: string;
  }>;
};

// Store active clients using a Map with ReadableStreamController
const clients = new Map<string, ReadableStreamDefaultController>();

export function notifyClients(data: NotificationData) {
  clients.forEach((controller) => {
    try {
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error notifying client:', error);
    }
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const clientId = crypto.randomUUID();
      clients.set(clientId, controller);

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clients.delete(clientId);
      });
    },
    cancel() {
      // Clean up will be handled by abort event
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 