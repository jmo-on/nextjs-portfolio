export const STAR_INTERVAL = 1.05;
export const STAR_SPEED = 7.5;
export const FLIGHT_SPEED = 8.5;
export const MAX_LANE_STEP = .9;

// A continuous trail, bounded independently of the player's current position.
// Even while flying toward stars at maximum speed, each lane change is reachable.
export function nextStarLane(previous: number, index: number, limit: number) {
  const desired = Math.sin(index * .65) * Math.min(limit, 1.9);
  return Math.max(-limit, Math.min(limit, previous + Math.max(-MAX_LANE_STEP, Math.min(MAX_LANE_STEP, desired - previous))));
}

export function swallowedStarScale(progress: number) {
  return Math.pow(Math.max(0, 1 - progress / .10), 3);
}

export function stepTail(bend: number, speed: number, target: number, dt: number) {
  // Substeps keep the damped elastic response stable through frame-time spikes.
  const steps = Math.max(1, Math.ceil(dt * 120)), h = dt / steps;
  for (let i = 0; i < steps; i++) {
    speed += ((target - bend) * 70 - speed * 16) * h;
    bend += speed * h;
  }
  return { bend, speed };
}

export function stepReturn(amount: number, hold: number, leftHeldAtEdge: boolean, dt: number) {
  hold = leftHeldAtEdge ? hold + dt : 0;
  const target = leftHeldAtEdge ? Math.min(1, hold / 2) : 0;
  amount += (target - amount) * (1 - Math.exp(-dt * 3));
  return { amount, hold, landing: hold >= 2 };
}
