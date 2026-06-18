import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a production environment, this would fetch from a real commodities API or scrape a government portal.
    // Since there is no free, reliable public API for Philippine fuel prices, we simulate a live updating 
    // value based on the current date to provide the "live" experience without brittle scraping.
    
    const today = new Date();
    // Create a daily seed so the price stays consistent throughout the day but updates at midnight
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Average PH diesel price baseline (around ~60-65 PHP)
    const basePrice = 62.25;
    
    // Deterministic fluctuation between -2.00 and +2.00
    const fluctuation = Math.sin(seed) * 2.00;
    const currentPrice = Number((basePrice + fluctuation).toFixed(2));

    return NextResponse.json({
      price: currentPrice,
      currency: 'PHP',
      lastUpdated: today.toISOString(),
      source: 'Simulated Market Data'
    });
  } catch (error) {
    return NextResponse.json({ price: 62.25, currency: 'PHP' }, { status: 500 });
  }
}
