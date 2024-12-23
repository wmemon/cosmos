export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

type NotificationData = {
  type: 'new-transactions' | 'signal' | 'connected';
  transactions?: Array<{
    signature: string;
    timestamp: number;
    amount: number;
    type: string;
    from: string;
    to: string;
  }>;
  signal?: unknown;
  peerId?: string;
};

// Store connected peers
const peers = new Map<string, ReadableStreamDefaultController>();

export function notifyPeers(data: NotificationData) {
  peers.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (error) {
      console.error('Error notifying peer:', error);
    }
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method === 'POST') {
    try {
      const signal = await req.json();
      notifyPeers({ type: 'signal', signal });
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // For GET requests, set up SSE for signaling
  const stream = new ReadableStream({
    start(controller) {
      const peerId = crypto.randomUUID();
      peers.set(peerId, controller);

      // Send initial connection message
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected', peerId })}\n\n`));

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        peers.delete(peerId);
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