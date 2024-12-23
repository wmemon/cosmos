import { notifyClients } from "./transaction-updates";

export const config = {
  runtime: 'edge',
  regions: ['iad1'], // specify the region you want to deploy to
};

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

export default async function handler(req: Request) {
  console.log('🌟 Webhook received');

  if (req.method !== "POST") {
    console.log('❌ Invalid method:', req.method);
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const events = (await req.json()) as HeliusEvent[];
    console.log('📥 Received events:', JSON.stringify(events, null, 2));
    
    const newTransactions: Transaction[] = [];
    
    events.forEach((event, index) => {
      console.log(`\n🔄 Processing event ${index + 1}/${events.length}`);
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

      console.log('📊 Current transaction count:', recentTransactions.length);
    });

    // Notify all connected clients about new transactions
    if (newTransactions.length > 0) {
      notifyClients({
        type: 'new-transactions',
        transactions: newTransactions
      });
    }

    console.log('✅ Webhook processed successfully');
    return new Response(JSON.stringify({
      message: "Webhook processed successfully",
      processedCount: events.length,
      totalStoredTransactions: recentTransactions.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return new Response(JSON.stringify({
      message: "Internal server error",
      error: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// API endpoint to get recent transactions
export function getRecentTransactions() {
  console.log('📤 Returning transactions:', recentTransactions.length);
  return recentTransactions;
} 