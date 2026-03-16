import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    return NextResponse.json({
      USDBRL: data.rates?.BRL || 5.2,
      USDHKD: data.rates?.HKD || 7.8,
      USDCNY: data.rates?.CNY || 7.2,
      USDEUR: data.rates?.EUR || 0.92,
      USDGBP: data.rates?.GBP || 0.79,
      USDKRW: data.rates?.KRW || 1350,
      updated: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
