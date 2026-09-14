export type RunState = { total: number; lives: number; best: number };
export function newRun(best: number): RunState { return { total: 0, lives: 3, best }; }
export function resolvePassenger(run: RunState, alien: boolean, caught: boolean): RunState {
  if (run.lives <= 0) return run;
  if (alien && caught) return { ...run, lives: Math.max(0, run.lives - 1) };
  if (alien || !caught) return run;
  const total = run.total + 1;
  return { total, lives: run.lives, best: Math.max(run.best, total) };
}
