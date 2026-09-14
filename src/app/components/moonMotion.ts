export type Motion2 = { x: number; y: number };

// Analytically integrate a damped velocity: equal travel at 30, 60, or 144 Hz.
export function stepMoonMotion(velocity: Motion2, input: Motion2, dt: number) {
  const magnitude = Math.hypot(input.x, input.y);
  const normalization = Math.max(1, magnitude);
  const target = { x: input.x / normalization * 1.12, y: input.y / normalization * 1.12 };
  const response = magnitude > 0 ? 7 : 5;
  const decay = Math.exp(-response * dt);
  const next = { x: target.x + (velocity.x - target.x) * decay, y: target.y + (velocity.y - target.y) * decay };
  const travel = { x: target.x * dt + (velocity.x - target.x) * (1 - decay) / response, y: target.y * dt + (velocity.y - target.y) * (1 - decay) / response };
  return { velocity: next, travel };
}
