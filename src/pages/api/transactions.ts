import { getRecentTransactions } from "./webhook";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

export const config = {
  runtime: 'edge',
  regions: ['iad1'], // specify the region you want to deploy to
};

type HeliusTokenTransfer = {
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
};

type HeliusTransaction = {
  signature: string;
  timestamp: number;
  type: string;
  tokenTransfers: HeliusTokenTransfer[];
};

type Transaction = {
  signature: string;
  timestamp: number;
  amount: number;
  type: string;
  from: string;
  to: string;
};

async function fetchHeliusTransactions(): Promise<Transaction[]> {
  if (!HELIUS_API_KEY || !TOKEN_ADDRESS) {
    console.warn('⚠️ Missing Helius API key or token address, returning empty array');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${TOKEN_ADDRESS}/transactions?api-key=${HELIUS_API_KEY}&limit=50`
    );

    if (!response.ok) {
      console.error(`❌ Helius API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json() as HeliusTransaction[];
    console.log('📥 Helius API response:', data);

    // Transform Helius data to match our transaction format
    return data.map((event) => ({
      signature: event.signature,
      timestamp: event.timestamp,
      amount: event.tokenTransfers?.[0]?.tokenAmount || 0,
      type: event.type,
      from: event.tokenTransfers?.[0]?.fromUserAccount || "",
      to: event.tokenTransfers?.[0]?.toUserAccount || "",
    }));
  } catch (error) {
    console.error('❌ Error fetching from Helius:', error);
    return [];
  }
}

export default async function handler(req: Request) {
  console.log('📊 Transactions endpoint called');
  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  if (req.method !== "GET") {
    console.log('❌ Invalid method:', req.method);
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Get webhook transactions (recent inputs)
    const webhookTransactions = getRecentTransactions();

    // If type is 'recent', only return webhook transactions
    if (type === 'recent') {
      console.log('✅ Returning recent transactions:', {
        webhookCount: webhookTransactions.length,
        timestamp: new Date().toISOString()
      });

      return new Response(JSON.stringify(webhookTransactions), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Otherwise, get transactions from both sources for history
    const heliusTransactions = await fetchHeliusTransactions();

    // Combine and deduplicate transactions
    const allTransactions = [...webhookTransactions, ...heliusTransactions];
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [tx.signature, tx])).values()
    );

    // Sort by timestamp, most recent first
    const sortedTransactions = uniqueTransactions.sort((a, b) => b.timestamp - a.timestamp);

    console.log('✅ Returning all transactions:', {
      webhookCount: webhookTransactions.length,
      heliusCount: heliusTransactions.length,
      totalCount: sortedTransactions.length,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify(sortedTransactions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({
      message: "Internal server error",
      error: errorMessage
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 