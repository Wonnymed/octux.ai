# PF-13 — SimulationBlock Orchestrator

Master component combining PF-10 (Phases) + PF-11 (Agents) + PF-12 (Consensus) into one orchestrated inline chat experience.

## Modes
- STREAMING: expanded view with phases + agents + consensus updating in real-time
- COMPLETE: auto-collapses to summary bar, expandable to full analysis
- ERROR: red border with error message + token refund note

## Architecture
SimulationBlock → SimulationHeader + StreamingBody (phases, consensus, agents) | CompletedBody (summary, sparkline, scoreboard) | CollapsedSummary | SimulationError
