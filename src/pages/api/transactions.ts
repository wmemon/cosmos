import type { NextApiRequest, NextApiResponse } from "next";
import { getRecentTransactions } from "./webhook";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('📊 Transactions endpoint called:', {
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (req.method !== "GET") {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const transactions = getRecentTransactions();
    console.log('✅ Returning transactions:', {
      count: transactions.length,
      timestamp: new Date().toISOString()
    });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
} 