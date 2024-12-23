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
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Error notifying client:', error);
      clients.delete(client);
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Ensure the connection stays alive
  res.flushHeaders();

  // Send initial heartbeat
  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  // Keep the connection alive with periodic heartbeats
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch (error) {
      console.error('Heartbeat error:', error);
      clearInterval(heartbeat);
      clients.delete(res);
    }
  }, 30000); // Send heartbeat every 30 seconds

  // Add client to the Set
  clients.add(res);

  // Remove client when connection closes
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });

  // Handle connection timeout
  req.on('timeout', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
} 