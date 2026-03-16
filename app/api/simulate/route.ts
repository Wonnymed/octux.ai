import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// STAGE 1: GRAPH BUILD — Extract entities from scenario
async function buildGraph(scenario: string) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: `You are a business scenario analyst. Extract ALL entities and relationships from the scenario. Return ONLY valid JSON:
{
  "entities": [
    { "name": "string", "type": "product|company|country|market|person|regulation|currency", "details": "string" }
  ],
  "relationships": [
    { "from": "string", "to": "string", "type": "trades_with|imports_from|regulated_by|competes_with|ships_to|pays_tax_to", "details": "string" }
  ],
  "key_variables": ["string"],
  "critical_questions": ["string"]
}`,
    messages: [{ role: "user", content: scenario }],
  });
  const text = (response.content[0] as any).text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { entities: [], relationships: [], key_variables: [], critical_questions: [] }; }
}

// STAGE 2: ENV SETUP — Generate agent personas based on graph
async function setupAgents(graph: any, scenario: string) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `You are a simulation architect. Based on the entity graph, generate 4-6 specialized business agent personas for this simulation. Each agent represents a real player in the business scenario.

Return ONLY valid JSON:
{
  "agents": [
    {
      "id": "string (snake_case)",
      "name": "string (human name)",
      "role": "string (e.g. 'Chinese Factory Owner in Guangzhou')",
      "emoji": "string (1 emoji)",
      "personality": "string (2-3 sentences: negotiation style, risk tolerance, priorities)",
      "knowledge": "string (what this agent knows: pricing, regulations, routes, market data)",
      "objectives": "string (what this agent wants from the deal)",
      "bias": "string (natural bias: e.g. 'tends to overstate quality', 'conservative on timelines')"
    }
  ],
  "simulation_parameters": {
    "rounds": 3,
    "scenario_type": "import|offshore|investment|market_entry|deal",
    "time_horizon": "string (e.g. '45 days', '6 months')",
    "key_metrics": ["total_cost", "timeline", "risk_level", "roi_estimate"]
  }
}

Create agents that would NATURALLY be involved in this scenario. Be creative and realistic. Give them human names and real personalities. Not all agents should agree — some should push back, challenge assumptions, or present alternative views.`,
    messages: [{ role: "user", content: `SCENARIO: ${scenario}\n\nENTITY GRAPH:\n${JSON.stringify(graph)}` }],
  });
  const text = (response.content[0] as any).text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { agents: [], simulation_parameters: { rounds: 3, scenario_type: "deal", time_horizon: "30 days", key_metrics: [] } }; }
}

// STAGE 3: SIMULATE — Run multi-round agent interactions
async function runSimulation(agents: any[], scenario: string, graph: any, params: any, userContext: any) {
  const allMessages: any[] = [];

  for (let round = 1; round <= Math.min(params.rounds || 3, 4); round++) {
    for (const agent of agents) {
      const previousDiscussion = allMessages
        .map(m => `[${m.agentName} (${m.role}) — Round ${m.round}]: ${m.content}`)
        .join("\n\n");

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are ${agent.name}, ${agent.role}.

PERSONALITY: ${agent.personality}
KNOWLEDGE: ${agent.knowledge}
OBJECTIVES: ${agent.objectives}
BIAS: ${agent.bias}

You are in round ${round} of ${params.rounds} of a business simulation.

RULES:
- Stay in character at ALL times. You ARE this person.
- Reference specific numbers, prices, timelines, regulations when possible.
- React to what other agents said — agree, disagree, challenge, build upon.
- In round 1: Give your initial analysis and position.
- In round 2+: Respond to others, refine your position, negotiate, challenge assumptions.
- Be specific. Real numbers. Real timelines. Real risks.
- If you disagree with another agent, say so directly and explain why.
- Speak in the user's language (Portuguese if scenario is in Portuguese).`,
        messages: [{
          role: "user",
          content: `SCENARIO: ${scenario}\n\nENTITY GRAPH: ${JSON.stringify(graph)}\n\nUSER CONTEXT: ${JSON.stringify(userContext || {})}\n\nPREVIOUS DISCUSSION:\n${previousDiscussion || "This is the opening round. Present your initial analysis."}\n\nYour analysis for round ${round}:`
        }],
      });

      const content = (response.content[0] as any).text || "";
      allMessages.push({
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        content,
        round,
      });
    }
  }
  return allMessages;
}

// STAGE 4: REPORT — Generate comprehensive analysis
async function generateReport(scenario: string, graph: any, agents: any[], simulation: any[], params: any) {
  const simText = simulation.map(m =>
    `[${m.emoji} ${m.agentName} (${m.role}) — Round ${m.round}]:\n${m.content}`
  ).join("\n\n---\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You are Signux ReportAgent. Generate a comprehensive simulation report.

RULES:
- Be specific with ALL numbers — never say "varies" without giving a range
- Use the ENTITY GRAPH for accurate relationships
- Reference what specific agents said to support conclusions
- Calculate all costs in USD AND BRL (use approximate rate 1 USD = 5.5 BRL)
- The report must be actionable — reader should know exactly what to do next
- Respond in the user's language`,
    messages: [{
      role: "user",
      content: `SCENARIO: ${scenario}

ENTITY GRAPH:
${JSON.stringify(graph)}

AGENTS IN SIMULATION:
${agents.map((a: any) => `${a.emoji} ${a.name} — ${a.role}`).join("\n")}

FULL SIMULATION (${simulation.length} interactions across ${params.rounds} rounds):
${simText}

Generate the report with EXACTLY these sections:

## EXECUTIVE SUMMARY
3-4 lines. What was simulated, key finding, recommendation.

## COST BREAKDOWN
Table format with ALL costs itemized. Include: product, freight, insurance, customs duty, VAT/taxes, clearance fees, inland transport, agent fees, bank fees, contingency. Show total in USD and BRL.

## TIMELINE
Week by week or phase by phase. From day 1 to completion. Include milestones and dependencies.

## RISK MAP
Each risk with:
- Description
- Probability: Low / Medium / High
- Impact: Low / Medium / High
- Mitigation strategy

## THREE SCENARIOS
### Optimistic
Numbers, timeline, profit margin

### Realistic
Numbers, timeline, profit margin

### Pessimistic
Numbers, timeline, what goes wrong

## KEY INSIGHTS FROM SIMULATION
What the agents revealed that wasn't obvious. Disagreements. Unexpected risks. Hidden opportunities.

## FINAL VERDICT
### GO or NO-GO
Clear recommendation with 3 reasons why.
If GO: exact next steps (numbered, actionable)
If NO-GO: what would need to change for it to become viable`
    }],
  });

  return (response.content[0] as any).text || "";
}

// MAIN ENDPOINT
export async function POST(req: NextRequest) {
  try {
    const { scenario, context } = await req.json();

    const graph = await buildGraph(scenario);
    const { agents, simulation_parameters } = await setupAgents(graph, scenario);
    const simulation = await runSimulation(agents, scenario, graph, simulation_parameters, context);
    const report = await generateReport(scenario, graph, agents, simulation, simulation_parameters);

    return NextResponse.json({
      stages: {
        graph,
        agents,
        simulation_parameters,
      },
      simulation,
      report,
      metadata: {
        total_interactions: simulation.length,
        rounds: simulation_parameters.rounds,
        agents_count: agents.length,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
