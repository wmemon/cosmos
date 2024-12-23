import type { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';

// Initialize Pusher with debug logging
console.log('🔧 Initializing Pusher with config:', {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

type TokenBalanceChange = {
  accountIndex: number;
  mint: string;
  rawTokenAmount: {
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
};

type HeliusEvent = {
  accountData: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: TokenBalanceChange[];
  }>;
  signature: string;
  timestamp: number;
  tokenTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
  }>;
  type: string;
};

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

// Store transactions in memory (this will reset on cold starts)
let recentTransactions: Transaction[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('📥 Webhook received');

  if (req.method !== "POST") {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const events = req.body as HeliusEvent[];
    console.log('📥 Received events:', JSON.stringify(events, null, 2));
    
    const newTransactions: Transaction[] = [];
    
    for (const event of events) {
      console.log(`\n🔄 Processing event`);
      console.log('📝 Event details:', {
        signature: event.signature,
        type: event.type,
        timestamp: new Date(event.timestamp * 1000).toISOString()
      });

      // Extract relevant information from the event
      const transaction = {
        signature: event.signature,
        timestamp: event.timestamp,
        amount: event.tokenTransfers?.[0]?.tokenAmount || 0,
        type: event.type,
        from: event.tokenTransfers?.[0]?.fromUserAccount || "",
        to: event.tokenTransfers?.[0]?.toUserAccount || "",
      };

      console.log('💾 Processed transaction:', transaction);
      newTransactions.push(transaction);

      // Add to recent transactions, keeping only last 50
      recentTransactions = [transaction, ...recentTransactions].slice(0, 50);

      // Broadcast via Pusher
      try {
        console.log('📤 Broadcasting transaction via Pusher:', {
          channel: 'transactions',
          event: 'new-transaction',
          data: transaction
        });
        await pusher.trigger('transactions', 'new-transaction', transaction);
        console.log('📢 Transaction broadcasted successfully');
      } catch (error) {
        console.error('❌ Error broadcasting via Pusher:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      }
    }

    console.log('✅ Webhook processed successfully');
    return res.status(200).json({
      message: "Webhook processed successfully",
      processedCount: events.length,
      totalStoredTransactions: recentTransactions.length
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: String(error)
    });
  }
}

// API endpoint to get recent transactions
export function getRecentTransactions() {
  console.log('📤 Returning transactions:', recentTransactions.length);
  return recentTransactions;
} 