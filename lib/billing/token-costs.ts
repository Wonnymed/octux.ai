export const TOKEN_COSTS = {
  chat: 0,
  swarm: 1,
  specialist: 1,
  compare: 3,
  stress_test: 1,
  premortem: 1,
} as const;

export type SimulationType = keyof typeof TOKEN_COSTS;

/** Simulation modes that consume monthly tokens (excludes chat). */
export type SimulationChargeType = Exclude<SimulationType, 'chat'>;

export const SIMULATION_CHARGE_TYPES: SimulationChargeType[] = [
  'swarm',
  'specialist',
  'compare',
  'stress_test',
  'premortem',
];

export function getTokenCost(type: SimulationType): number {
  return TOKEN_COSTS[type];
}

export function canAfford(userTokens: number, type: SimulationType): boolean {
  return userTokens >= TOKEN_COSTS[type];
}

export function parseSimulationChargeType(value: unknown): SimulationChargeType {
  if (
    typeof value === 'string' &&
    (SIMULATION_CHARGE_TYPES as readonly string[]).includes(value)
  ) {
    return value as SimulationChargeType;
  }
  return 'swarm';
}
