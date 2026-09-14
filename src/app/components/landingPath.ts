import * as THREE from 'three';
export const LANDING_DURATION = 4.6;
const smooth = (t: number) => t * t * (3 - 2 * t);
// Stay on an outer approach shell, then descend along the landing-site normal.
export function landingPosition(start: THREE.Vector3, dockNormal: THREE.Vector3, progress: number, out: THREE.Vector3) {
  const t = THREE.MathUtils.clamp(progress, 0, 1);
  if (t < .70) {
    const u = smooth(t / .70);
    const initial = start.clone().normalize();
    const turn = new THREE.Quaternion().setFromUnitVectors(initial, dockNormal);
    turn.slerpQuaternions(new THREE.Quaternion(), turn.clone(), u);
    return out.copy(initial).applyQuaternion(turn).multiplyScalar(THREE.MathUtils.lerp(Math.max(3.8, start.length()), 3.8, u));
  }
  return out.copy(dockNormal).multiplyScalar(THREE.MathUtils.lerp(3.8, 2.64, smooth((t - .70) / .30)));
}
