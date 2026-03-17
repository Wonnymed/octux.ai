import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    return NextResponse.json({
      USDBRL: data.rates?.BRL || 5.2,
      USDCNY: data.rates?.CNY || 7.2,
      USDHKD: data.rates?.HKD || 7.8,
      USDEUR: data.rates?.EUR || 0.92,
      USDGBP: data.rates?.GBP || 0.79,
      USDKRW: data.rates?.KRW || 1350,
      USDSGD: data.rates?.SGD || 1.35,
      USDAED: data.rates?.AED || 3.67,
      USDCHF: data.rates?.CHF || 0.88,
      USDJPY: data.rates?.JPY || 150,
      USDINR: data.rates?.INR || 83,
      USDTHB: data.rates?.THB || 35,
      USDMXN: data.rates?.MXN || 17,
      USDCOP: data.rates?.COP || 4000,
      USDARS: data.rates?.ARS || 850,
      USDNGN: data.rates?.NGN || 1500,
      USDZAR: data.rates?.ZAR || 18.5,
      USDTRY: data.rates?.TRY || 32,
      updated: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
