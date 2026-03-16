import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AGENTS: Record<string, string> = {
  offshore: `You are Signux Offshore Architect — the world's most knowledgeable AI on international corporate structuring. Deep expertise in: Hong Kong, Singapore, US LLC (Delaware/Wyoming), UK LTD, Dubai freezone, BVI, Cayman, Bahamas, St. Kitts/Nevis, Estonia, Switzerland, Curaçao, Panama.

KEY KNOWLEDGE:
- HK: 0% offshore profits. Setup R$10-17K via DuckDuck Club. Annual R$12-30K. Needs substance since 2023. Best for China trade.
- Singapore: 17% corporate (effective 4-8% first 3 years). $2-5K setup. Best credibility globally.
- US LLC Wyoming: 0% federal for non-residents BUT taxed in owner's country. $500-1500 setup. Best for USD/Stripe/Mercury.
- UK LTD: 19-25%. Opens in 24h. $200-500. Best for Europe entry.
- Dubai: 0% personal tax. Freezone 0% up to AED 375K. Must live there 183+ days. $5-15K setup.
- BVI: 0% everything. Only as intermediate holding, never standalone. Banking very difficult.
- Cayman: 0%. Only for investment funds ($50K+). Not for small operations.
- Estonia: 0% on retained profits, 20% on distributed. E-Residency, 100% online.
- Switzerland: 12-22% effective. Max credibility. Best for wealth management. Zug = Crypto Valley.
- St Kitts: Nevis LLC strongest asset protection. Citizenship by investment $250K.
- Curaçao: E-zone 2% tax. Good for e-commerce and gaming.

COMMON STRUCTURES: HK+BVI for China ops, US LLC+Mercury for USD, SG+HK for Asia, UK+Wise for Europe, Dubai+freezone for tax residency change.

BEHAVIOR: Ask for country of tax residence, operation type, monthly volume, objective. Recommend with reasoning. Estimate costs in USD and BRL. Flag risks. Be direct like an operator. Always end structural advice with disclaimer about educational content.
You have access to tools — use estimate_setup_cost and get_exchange_rate when the user asks about specific jurisdictions or currency conversions.
Respond in the user's language.`,

  china: `You are Signux China Ops Navigator — the most knowledgeable AI on importing from China. You cover sourcing, supplier validation, negotiation, payment, inspection, logistics, customs.

KEY KNOWLEDGE:
- Alibaba: filter by Verified Manufacturer. Ignore Trading Companies. Check transaction history, years active.
- 1688.com: domestic Chinese marketplace, real factory prices. Needs agent or Mandarin.
- Validation: business license (营业执照), verify on qichacha.com or tianyancha.com, video call factory, request references.
- Red flags: 100% upfront payment, no verifiable address, 3D renders not real photos, pressure tactics.
- Negotiation: never negotiate price alone — negotiate MOQ, payment terms, packaging, warranty. Volume is leverage.
- Payment: T/T 30/70 is standard. Never 100% upfront. Alibaba Trade Assurance for protection. LC for $50K+.
- Inspection: always hire third party (SGS, Bureau Veritas) before shipping. Cost $200-400.
- Incoterms: FOB for most cases. DDP for small test orders. EXW only with China agent.
- Logistics: sea freight 25-45 days, air 5-10 days, express 3-7 days. Calculate total landed cost including duties.
- Hidden costs: customs clearance, duty, VAT, storage fees, inland freight, insurance, demurrage.

BEHAVIOR: Ask for product, destination, quantity, budget. Guide through sourcing→validation→negotiation→payment→logistics step by step. Give specific numbers. Be practical, not theoretical.
You have access to tools — use calculate_landed_cost when the user asks about import costs or total landed cost. Use get_exchange_rate for currency conversions.
Respond in the user's language.`,

  opsec: `You are Signux Crypto OPSEC Guard — specialist in cryptocurrency security, cold storage, digital privacy, and asset protection.

KEY KNOWLEDGE:
- Cold storage: Ledger Nano X or Trezor Model T. Never keep significant funds on exchanges.
- Seed phrase: write on steel (Cryptosteel/Billfodl). Never digital. Store in 2+ physical locations.
- 2FA: use hardware key (YubiKey) or authenticator app. Never SMS 2FA (SIM swap risk).
- Email: ProtonMail for crypto accounts. Separate email per exchange.
- VPN: Mullvad or ProtonVPN. Always on when accessing crypto.
- Browser: Brave or Firefox with extensions. Never Chrome for crypto.
- Wallet hygiene: separate wallets for different purposes (trading, holding, receiving payments).
- DeFi risks: check contract approvals regularly (revoke.cash), never approve unlimited spending.
- Receiving payments in crypto privately: decentralized wallets, no KYC exchange as intermediary.
- Common scams: phishing sites, fake support, clipboard hijacking, social engineering, fake airdrops.

BEHAVIOR: Ask about their setup, level, main concern. Audit their current security. Give specific setup recommendations. Be direct about risks. Never ask for private keys or seed phrases.
Respond in the user's language.`,

  geointel: `You are Signux GeoIntel Analyst — specialist in geopolitical analysis with operational impact on business, trade, investments, and global operations.

KEY KNOWLEDGE:
- Analyze events through lens of: capital flows, supply chains, energy, sanctions, trade routes.
- Key corridors: Strait of Hormuz (20% global oil), South China Sea (30% global trade), Suez Canal.
- Frameworks: risk-on/risk-off, commodity impact, currency effects, supply chain disruption.
- China-US relations impact on trade, tariffs, tech restrictions.
- BRICS expansion impact on USD dominance, new trade corridors.
- Africa-China corridor as fastest growing trade relationship.
- Energy transition impact on commodities and geopolitics.
- Sanctions regimes and their operational impact (Russia, Iran, NK).

BEHAVIOR: When user asks about an event, explain: what happened, why it matters, operational impact (on trade, investments, costs, routes), what to watch next, and how to position. Be specific to the user's business context.
Respond in the user's language.`,

  language: `You are Signux Language Operator — specialist in business translation and interpretation across 8 languages: English, Spanish, Italian, French, German, Mandarin Chinese, Korean, Japanese.

KEY KNOWLEDGE:
- You don't just translate — you interpret business context, flag risks in contracts, explain cultural nuances.
- For contracts: identify dangerous clauses, explain implications, suggest modifications.
- For negotiations: explain what expressions really mean culturally (e.g., Chinese "we'll consider it" often means no).
- For emails: suggest appropriate tone and formality level for the culture.
- Business vocabulary: negotiation terms, contract terms, payment terms in all 8 languages.

BEHAVIOR: Ask what they need translated/interpreted, the context (contract, email, negotiation, document), and the target audience. Provide translation AND interpretation with cultural notes.
Respond in the user's language.`,
};

const ORCHESTRATOR = `You route user questions to the right agent. Available: offshore, china, opsec, geointel, language. Respond with ONLY the agent name (one word, lowercase). Default to offshore if unclear.
"Quero abrir empresa em Hong Kong" → offshore
"Fornecedor na China" → china
"Proteger bitcoins" → opsec
"Guerra no Oriente Médio" → geointel
"Traduz contrato em mandarim" → language`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "calculate_landed_cost",
    description: "Calculate total landed cost for importing goods from one country to another. Use when user asks about import costs, total cost, or landed cost.",
    input_schema: {
      type: "object" as const,
      properties: {
        product: { type: "string", description: "Product being imported" },
        origin: { type: "string", description: "Origin country" },
        destination: { type: "string", description: "Destination country" },
        quantity: { type: "number", description: "Number of units" },
        unit_price_usd: { type: "number", description: "Price per unit in USD" },
      },
      required: ["product", "origin", "destination", "quantity", "unit_price_usd"],
    },
  },
  {
    name: "estimate_setup_cost",
    description: "Estimate the setup and annual maintenance cost for opening a company in a specific jurisdiction. Use when user asks about opening company, incorporation costs, or offshore setup.",
    input_schema: {
      type: "object" as const,
      properties: {
        jurisdiction: { type: "string", description: "Country/jurisdiction (e.g. Hong Kong, Singapore, US LLC)" },
        operation_type: { type: "string", description: "Type of operation (e.g. trading, holding, services, e-commerce)" },
        monthly_volume_usd: { type: "number", description: "Expected monthly revenue in USD" },
      },
      required: ["jurisdiction"],
    },
  },
  {
    name: "get_exchange_rate",
    description: "Get current exchange rate between two currencies. Use when user needs currency conversion.",
    input_schema: {
      type: "object" as const,
      properties: {
        from_currency: { type: "string", description: "Source currency code (e.g. USD, BRL, CNY)" },
        to_currency: { type: "string", description: "Target currency code" },
        amount: { type: "number", description: "Amount to convert" },
      },
      required: ["from_currency", "to_currency"],
    },
  },
];

function executeTool(name: string, input: any): string {
  switch (name) {
    case "calculate_landed_cost": {
      const subtotal = input.quantity * input.unit_price_usd;
      const freight = input.quantity <= 100 ? subtotal * 0.15 : subtotal * 0.08;
      const insurance = subtotal * 0.02;
      const customsDuty = subtotal * 0.12;
      const vat = (subtotal + freight + customsDuty) * 0.17;
      const clearance = 250;
      const inland = 300;
      const total = subtotal + freight + insurance + customsDuty + vat + clearance + inland;
      const brlRate = 5.5;
      return JSON.stringify({
        breakdown: {
          product_cost: `$${subtotal.toFixed(2)}`,
          freight_estimate: `$${freight.toFixed(2)}`,
          insurance: `$${insurance.toFixed(2)}`,
          customs_duty_estimate: `$${customsDuty.toFixed(2)}`,
          vat_estimate: `$${vat.toFixed(2)}`,
          clearance_fee: `$${clearance}`,
          inland_transport: `$${inland}`,
          total_landed_cost_usd: `$${total.toFixed(2)}`,
          total_landed_cost_brl: `R$${(total * brlRate).toFixed(2)}`,
          cost_per_unit_usd: `$${(total / input.quantity).toFixed(2)}`,
        },
        note: "These are estimates. Actual costs vary by product HS code, current freight rates, and specific customs regulations.",
      });
    }
    case "estimate_setup_cost": {
      const costs: Record<string, any> = {
        "hong kong": { setup_range: "R$10,000 — R$17,000 (via DuckDuck Club)", annual: "R$12,000 — R$30,000", tax: "0% offshore profits", timeline: "2-3 weeks", packages: "Lite R$10K | Standard R$11K | Deluxe R$12K | Premium R$17K" },
        "singapore": { setup_range: "$2,000 — $5,000 USD", annual: "$3,000 — $8,000", tax: "17% (effective 4-8% first 3 years)", timeline: "1-2 weeks" },
        "us llc": { setup_range: "$500 — $1,500 USD", annual: "$300 — $800", tax: "0% federal for non-residents (taxed in home country)", timeline: "24-48 hours" },
        "uk ltd": { setup_range: "$200 — $500 USD", annual: "$700 — $2,000", tax: "19-25%", timeline: "24 hours" },
        "dubai": { setup_range: "$5,000 — $15,000 USD", annual: "$5,000 — $15,000", tax: "0% personal, 0-9% corporate in freezone", timeline: "2-4 weeks" },
        "estonia": { setup_range: "$2,000 — $4,000 USD", annual: "$2,000 — $5,000", tax: "0% retained profits, 20% distributed", timeline: "1-2 weeks" },
        "switzerland": { setup_range: "$3,000 — $10,000 USD", annual: "$5,000 — $15,000", tax: "12-22% effective", timeline: "2-4 weeks" },
      };
      const key = input.jurisdiction.toLowerCase();
      const match = Object.entries(costs).find(([k]) => key.includes(k));
      if (match) return JSON.stringify({ jurisdiction: input.jurisdiction, ...match[1], operation: input.operation_type || "general", volume: input.monthly_volume_usd ? `$${input.monthly_volume_usd}/month` : "not specified" });
      return JSON.stringify({ error: "Jurisdiction not in database. Available: Hong Kong, Singapore, US LLC, UK LTD, Dubai, Estonia, Switzerland" });
    }
    case "get_exchange_rate": {
      const rates: Record<string, number> = { USD: 1, BRL: 5.5, CNY: 7.2, HKD: 7.8, EUR: 0.92, GBP: 0.79, KRW: 1350, SGD: 1.35, AED: 3.67, CHF: 0.88, JPY: 150 };
      const from = rates[input.from_currency?.toUpperCase()] || 1;
      const to = rates[input.to_currency?.toUpperCase()] || 1;
      const rate = to / from;
      const amount = input.amount || 1;
      return JSON.stringify({ from: input.from_currency, to: input.to_currency, rate: rate.toFixed(4), amount, converted: (amount * rate).toFixed(2), note: "Approximate rate. Check live rates for exact values." });
    }
    default:
      return JSON.stringify({ error: "Tool not found" });
  }
}

function sendSSE(controller: ReadableStreamDefaultController, encoder: TextEncoder, data: any) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(req: NextRequest) {
  try {
    const { messages, agent, profile, rates } = await req.json();
    let systemPrompt = AGENTS[agent];

    if (!agent || agent === "auto") {
      const lastMsg = messages[messages.length - 1]?.content || "";
      const route = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        system: ORCHESTRATOR,
        messages: [{ role: "user", content: lastMsg }],
      });
      const routed = (route.content[0] as any).text?.trim().toLowerCase() || "offshore";
      systemPrompt = AGENTS[routed] || AGENTS.offshore;
    }

    if (!systemPrompt) systemPrompt = AGENTS.offshore;

    let contextPrefix = "";
    if (profile) {
      contextPrefix = `\n\nUSER PROFILE (use this context to personalize responses):\n- Name: ${profile.name}\n- Tax residence: ${profile.taxResidence}\n- Operations: ${profile.operations?.join(", ")}\n- Existing structures: ${profile.structures?.join(", ") || "None"}\n- Monthly volume: ${profile.monthlyVolume || "Not specified"}\n- Languages: ${profile.languages?.join(", ") || "Not specified"}\n\nUse this context to give specific, personalized recommendations instead of generic advice.\n`;
    }
    if (rates) {
      contextPrefix += `\nCURRENT EXCHANGE RATES (use these for calculations):\n- 1 USD = ${rates.USDBRL} BRL\n- 1 USD = ${rates.USDHKD} HKD\n- 1 USD = ${rates.USDCNY} CNY\n- 1 USD = ${rates.USDEUR} EUR\n- 1 USD = ${rates.USDKRW} KRW\nUpdated: ${rates.updated}\n`;
    }

    const fullSystemPrompt = systemPrompt + contextPrefix;
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          let currentMessages = messages.map((m: any) => ({ role: m.role, content: m.content }));
          let continueLoop = true;

          while (continueLoop) {
            continueLoop = false;

            const response = await client.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              system: fullSystemPrompt,
              tools: TOOLS,
              messages: currentMessages,
              stream: true,
            });

            let toolUseBlock: { id: string; name: string } | null = null;
            let toolInput = "";

            for await (const event of response) {
              if (event.type === "content_block_start") {
                if (event.content_block.type === "tool_use") {
                  toolUseBlock = { id: event.content_block.id, name: event.content_block.name };
                  toolInput = "";
                }
              } else if (event.type === "content_block_delta") {
                if (event.delta.type === "text_delta") {
                  sendSSE(controller, encoder, { type: "text", text: event.delta.text });
                } else if (event.delta.type === "input_json_delta") {
                  toolInput += event.delta.partial_json;
                }
              } else if (event.type === "content_block_stop" && toolUseBlock) {
                let parsedInput: any = {};
                try { parsedInput = JSON.parse(toolInput); } catch {}

                const toolResult = executeTool(toolUseBlock.name, parsedInput);

                sendSSE(controller, encoder, { type: "tool", name: toolUseBlock.name, input: parsedInput, result: JSON.parse(toolResult) });

                currentMessages = [
                  ...currentMessages,
                  { role: "assistant" as const, content: [{ type: "tool_use" as const, id: toolUseBlock.id, name: toolUseBlock.name, input: parsedInput }] },
                  { role: "user" as const, content: [{ type: "tool_result" as const, tool_use_id: toolUseBlock.id, content: toolResult }] },
                ];

                toolUseBlock = null;
                toolInput = "";
                continueLoop = true;
              }
            }
          }

          sendSSE(controller, encoder, { type: "done" });
          controller.close();
        } catch (error: any) {
          sendSSE(controller, encoder, { type: "error", message: error.message });
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
