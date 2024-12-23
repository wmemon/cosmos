export const config = {
  runtime: 'edge',
  regions: ['iad1'],
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
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  try {
    // Create and encode the initial message
    const encoder = new TextEncoder();
    const initialMessage = encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    const stream = new ReadableStream({
      start: async (controller) => {
        const clientId = crypto.randomUUID();
        clients.set(clientId, controller);

        // Send initial message
        controller.enqueue(initialMessage);

        // Clean up on close
        req.signal.addEventListener('abort', () => {
          clients.delete(clientId);
        });
      },
      cancel() {
        // Cleanup will be handled by abort event
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Accel-Buffering': 'no',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('SSE Setup Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 