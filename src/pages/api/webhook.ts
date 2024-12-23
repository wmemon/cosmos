import type { NextApiRequest, NextApiResponse } from "next";

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
// In production, you might want to use a database
const recentTransactions: Transaction[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const events = req.body as HeliusEvent[];
    
    events.forEach((event) => {
      // Extract relevant information from the event
      const transaction = {
        signature: event.signature,
        timestamp: event.timestamp,
        amount: event.tokenTransfers?.[0]?.tokenAmount || 0,
        type: event.type,
        from: event.tokenTransfers?.[0]?.fromUserAccount || "",
        to: event.tokenTransfers?.[0]?.toUserAccount || "",
      };

      // Add to recent transactions, keeping only last 50
      recentTransactions.unshift(transaction);
      if (recentTransactions.length > 50) {
        recentTransactions.pop();
      }
    });

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// API endpoint to get recent transactions
export const getRecentTransactions = () => {
  return recentTransactions;
}; 