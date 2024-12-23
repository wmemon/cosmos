import type { NextApiRequest, NextApiResponse } from "next";

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

// Store active SSE clients
const clients = new Set<NextApiResponse>();

export function notifyClients(data: NotificationData) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial heartbeat
  res.write('data: {"type":"connected"}\n\n');

  // Add client to the Set
  clients.add(res);

  // Remove client when connection closes
  req.on('close', () => {
    clients.delete(res);
  });
} 