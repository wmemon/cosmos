import { getRecentTransactions } from "./webhook";

export const config = {
  runtime: 'edge',
  regions: ['iad1'], // specify the region you want to deploy to
};

export default async function handler(req: Request) {
  console.log('📊 Transactions endpoint called');

  if (req.method !== "GET") {
    console.log('❌ Invalid method:', req.method);
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const transactions = getRecentTransactions();
    console.log('✅ Returning transactions:', {
      count: transactions.length,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
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