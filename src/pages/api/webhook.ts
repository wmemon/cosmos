import type { NextApiRequest, NextApiResponse } from "next";
import { notifyClients } from "./transaction-updates";

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

// In-memory storage for recent transactions (last 50)
const recentTransactions: Transaction[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🌟 Webhook received:', {
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  if (req.method !== "POST") {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const events = req.body as HeliusEvent[];
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
      recentTransactions.unshift(transaction);
      if (recentTransactions.length > 50) {
        recentTransactions.pop();
      }

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
    return res.status(200).json({ 
      message: "Webhook processed successfully",
      processedCount: events.length,
      totalStoredTransactions: recentTransactions.length
    });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
}

// API endpoint to get recent transactions
export const getRecentTransactions = () => {
  console.log('📤 Returning transactions:', recentTransactions.length);
  return recentTransactions;
}; 