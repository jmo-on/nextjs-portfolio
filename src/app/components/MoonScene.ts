import * as THREE from 'three';
import { stepMoonMotion } from './moonMotion';
import { createStarCollector } from './StarCollector';
import { createPassengerFactory } from './RescuePassengers';
import { landingPosition, LANDING_DURATION } from './landingPath';
import { newRun, resolvePassenger, RunState } from './runRules';
import { nextStarLane, swallowedStarScale, stepReturn, RETURN_HOLD_SECONDS, STAR_INTERVAL, STAR_SPEED, FLIGHT_SPEED } from './flightPhysics';

export type FlightSave = RunState;
export type FlightProgress = { travel: number; flying: boolean; save: FlightSave };
type Phase = 'moon' | 'ignition' | 'takeoff' | 'flight' | 'gameover' | 'landing' | 'offboarding';
const clamp = THREE.MathUtils.clamp;
const smooth = (x: number) => x * x * (3 - 2 * x);

// NASA SVS CGI Moon Kit: LROC color and LOLA elevation, stored locally.
// Sources and attribution are recorded in public/textures/README.md.
function moonMaps() {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/textures/moon-color.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  const bump = loader.load('/textures/moon-height.jpg');
  bump.colorSpace = THREE.NoColorSpace;
  for (const map of [texture, bump]) { map.wrapS = THREE.RepeatWrapping; map.anisotropy = 4; }
  return { texture, bump };
}

export function createMoonScene(host: HTMLDivElement, update: (state: FlightProgress) => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // Bound high-DPI rendering cost while keeping the scene antialiased.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x05070d, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 120);
  camera.position.set(0, 0, 13);
  const ambient = new THREE.AmbientLight(0xc4ccd8, .42); scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xfff7ec, 3.1);
  sun.position.set(-5, 7, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  sun.shadow.normalBias = .025; scene.add(sun);
  const rim = new THREE.DirectionalLight(0x9dacc2, .38); rim.position.set(5, -1, -4); scene.add(rim);
  const material = (color: number, metalness = 0, roughness = .8) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  const maps = moonMaps();
  const moonMaterial = new THREE.MeshStandardMaterial({ map: maps.texture, bumpMap: maps.bump, bumpScale: .045, displacementMap: maps.bump, displacementScale: .018, displacementBias: -.009, roughness: 1, color: 0xffffff });
  const world = new THREE.Group(); world.position.y = -.38; scene.add(world);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.25, 192, 128), moonMaterial);
  moon.rotation.y = -1.4; moon.receiveShadow = true; world.add(moon);
  const landingNormal = new THREE.Vector3(.43, .81, .4).normalize();
  const home = landingNormal.clone().multiplyScalar(2.64);
  const avatarNormal = new THREE.Vector3(-.38, .85, .36).normalize();
  const fixedNormal = new THREE.Vector3(0, .8, .6);
  world.quaternion.setFromUnitVectors(avatarNormal, fixedNormal);
  const heldKeys = new Set<string>();
  const walkingDirection = new THREE.Vector3();
  const walkingAxis = new THREE.Vector3();
  const stepRotation = new THREE.Quaternion();
  const facingRotation = new THREE.Quaternion();
  const targetFacing = new THREE.Quaternion();
  const leanRotation = new THREE.Quaternion();
  let velocity = { x: 0, y: 0 }, gait = 0, gaitWeight = 0, bodyLean = 0, bodyBounce = 0;
  const standingRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), fixedNormal);
  const up = new THREE.Vector3(0, 1, 0);

  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, position: number[] = [0, 0, 0]) {
    const obj = new THREE.Mesh(geometry, mat); obj.position.set(position[0], position[1], position[2]); obj.castShadow = true; obj.receiveShadow = true; parent.add(obj); return obj;
  }
  // Portrait reference: softly parted black hair, oval face, dark almond eyes,
  // and a slight smile. Human proportions with a collared work shirt.
  const avatar = new THREE.Group(); scene.add(avatar); avatar.scale.setScalar(.65);
  const shirt = material(0xf3eee6), pants = material(0x596347), skin = material(0xd8b597), hair = material(0x171a20, .05, .48), boots = material(0x39352e);
  const torso = mesh(new THREE.CapsuleGeometry(.15, .26, 8, 20), shirt, avatar, [0, .74, 0]); torso.scale.set(1.12, 1, .64);
  mesh(new THREE.CylinderGeometry(.065, .075, .11, 16), skin, avatar, [0, 1.01, 0]);
  const head = mesh(new THREE.SphereGeometry(.15, 32, 24), skin, avatar, [0, 1.16, .004]); head.scale.set(.87, 1.12, .82);
  const jaw = mesh(new THREE.SphereGeometry(.10, 24, 16), skin, avatar, [0, 1.095, .013]); jaw.scale.set(.94, .86, 1.04);
  const cap = mesh(new THREE.SphereGeometry(.155, 32, 20, 0, Math.PI * 2, 0, Math.PI * .61), hair, avatar, [0, 1.20, -.018]); cap.scale.set(.97, 1, .88);
  for (const side of [-1, 1]) {
    const fringe = mesh(new THREE.SphereGeometry(.10, 24, 16), hair, avatar, [side * .065, 1.25, .09]); fringe.scale.set(.77, .60, .45); fringe.rotation.z = side * -.48;
    const sideburn = mesh(new THREE.CapsuleGeometry(.022, .085, 6, 12), hair, avatar, [side * .119, 1.164, -.005]); sideburn.rotation.z = side * -.12;
    const ear = mesh(new THREE.SphereGeometry(.027, 16, 12), skin, avatar, [side * .13, 1.15, .004]); ear.scale.set(.65, 1.5, .8);
    const collar = mesh(new THREE.BoxGeometry(.067, .087, .018), shirt, avatar, [side * .042, .954, .075]); collar.rotation.z = side * -.38;
  }
  const eyeMaterial = material(0x272323), eyeWhite = material(0xd8d3c7), lips = material(0x9c6d60);
  for (const x of [-.051, .051]) {
    const eye = mesh(new THREE.SphereGeometry(.027, 20, 12), eyeWhite, avatar, [x, 1.166, .116]); eye.scale.set(1, .42, .27);
    const iris = mesh(new THREE.SphereGeometry(.011, 16, 12), eyeMaterial, avatar, [x, 1.167, .123]); iris.scale.z = .35;
    const brow = mesh(new THREE.CapsuleGeometry(.006, .038, 4, 10), hair, avatar, [x, 1.199, .116]); brow.rotation.z = Math.PI / 2 + (x < 0 ? -.09 : .09);
  }
  const nose = mesh(new THREE.SphereGeometry(.022, 20, 16), skin, avatar, [0, 1.132, .124]); nose.scale.set(.68, 1.4, 1.05);
  const smile = new THREE.CatmullRomCurve3([new THREE.Vector3(-.043, 1.091, .106), new THREE.Vector3(0, 1.086, .12), new THREE.Vector3(.043, 1.099, .105)]);
  mesh(new THREE.TubeGeometry(smile, 20, .004, 6, false), lips, avatar);
  mesh(new THREE.BoxGeometry(.27, .032, .17), boots, avatar, [0, .51, 0]);
  mesh(new THREE.BoxGeometry(.03, .025, .015), material(0x9c9687, .6), avatar, [0, .51, .093]);
  for (let i = 0; i < 4; i++) mesh(new THREE.SphereGeometry(.006, 8, 6), material(0xbcb7ac), avatar, [0, .62 + i * .077, .10]);
  const legs: THREE.Group[] = [], knees: THREE.Group[] = [], arms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .08, .49, 0); avatar.add(leg); legs.push(leg);
    mesh(new THREE.CapsuleGeometry(.061, .11, 6, 12), pants, leg, [0, -.10, 0]);
    mesh(new THREE.BoxGeometry(.055, .075, .045), pants, leg, [side * .048, -.12, .025]);
    const knee = new THREE.Group(); knee.position.y = -.22; leg.add(knee); knees.push(knee);
    mesh(new THREE.CapsuleGeometry(.05, .12, 6, 12), pants, knee, [0, -.10, 0]);
    const boot = mesh(new THREE.BoxGeometry(.115, .08, .19), boots, knee, [0, -.225, .03]); boot.rotation.x = -.04;
    const arm = new THREE.Group(); arm.position.set(side * .185, .88, 0); avatar.add(arm); arms.push(arm);
    mesh(new THREE.CapsuleGeometry(.048, .22, 4, 8), shirt, arm, [0, -.12, 0]);
    mesh(new THREE.SphereGeometry(.05, 8, 8), skin, arm, [0, -.29, 0]);
  }

  const collector = createStarCollector();
  const ship = collector.group; scene.add(ship); ship.scale.setScalar(.72);
  const cockpitPosition = new THREE.Vector3();
  const parkedRotation = new THREE.Quaternion(), departureRotation = new THREE.Quaternion();
  const dockForward = new THREE.Vector3(1,0,0).addScaledVector(landingNormal,-landingNormal.x).normalize();
  const dockSide = new THREE.Vector3().crossVectors(landingNormal,dockForward).normalize();
  const dockRotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(dockForward,dockSide,landingNormal));
  const flightRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.15,0,.05));

  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(700 * 3);
  for (let i = 0; i < 700; i++) { starPositions[i * 3] = (Math.random() - .5) * 65; starPositions[i * 3 + 1] = (Math.random() - .5) * 38; starPositions[i * 3 + 2] = -4 - Math.random() * 35; }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xc3d1e7, size: .026, transparent: true, opacity: .65, sizeAttenuation: true })); scene.add(stars);
  const streakData = new Float32Array(80 * 6);
  for (let i = 0; i < 80; i++) {
    const x = (Math.random() - .5) * 42, y = (Math.random() - .5) * 20, z = -2 - Math.random() * 9;
    streakData.set([x, y, z, x + .3 + Math.random() * .9, y, z], i * 6);
  }
  const streakGeometry = new THREE.BufferGeometry(); streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakData, 3));
  const streakMaterial = new THREE.LineBasicMaterial({ color: 0xbfcce2, transparent: true, opacity: .25 });
  const streaks = new THREE.LineSegments(streakGeometry, streakMaterial); scene.add(streaks);
  const passengers = createPassengerFactory();
  const rocks: THREE.Group[] = [];
  const popup = document.createElement('span'); popup.className = 'space-points'; host.appendChild(popup);
  const boardPrompt = document.createElement('span');
  boardPrompt.className = 'boarding-bubble'; boardPrompt.textContent = 'Enter ↵';
  boardPrompt.setAttribute('aria-label', 'Press Enter to board the star collector');
  boardPrompt.hidden = true; host.appendChild(boardPrompt);
  const returnIndicator = document.createElement('div');
  returnIndicator.className = 'return-indicator'; returnIndicator.hidden = true;
  returnIndicator.innerHTML = '<span class="return-ring"><span>←</span></span><span>Hold to land<small>1 sec</small></span>';
  returnIndicator.setAttribute('role', 'progressbar');
  returnIndicator.setAttribute('aria-label', 'Hold Left to land');
  returnIndicator.setAttribute('aria-valuemin', '0'); returnIndicator.setAttribute('aria-valuemax', '100');
  host.appendChild(returnIndicator);
  const boardingStart = new THREE.Vector3();
  let save: FlightSave = newRun(0);
  // This run's catches are submitted to the shared scoreboard by the UI.
  let phase: Phase = 'moon', phaseTime = 0, travel = 0, cooldown = 0, returnHold = 0, returnAmount = 0;
  let width = 1, height = 1, last = 0, frame = 0, time = 0, spawnTime = 0, popTime = 2, bite = 0, damage = 0;
  let paused = document.hidden, disposed = false;
  let flightVelocityY = 0, lane = 0, starIndex = 0;
  const flightPosition = new THREE.Vector3(.6, .1, 1);
  const shipStart = new THREE.Vector3(), landStart = new THREE.Vector3();
  let landTravel = 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const emit = () => update({ travel, flying: phase === 'flight' || phase === 'gameover' || (phase === 'landing' && save.lives === 0), save: { ...save } });
  const canBoard = () => phase === 'moon' && cooldown === 0 && avatarNormal.distanceTo(landingNormal) < .32;
  function board() {
    if (!canBoard()) return;
    save = newRun(save.best); damage = 0; bite = 0;
    boardingStart.copy(avatar.position); velocity = { x: 0, y: 0 }; heldKeys.clear();
    boardPrompt.hidden = true; change('ignition'); host.focus({ preventScroll: true });
  }
  function change(next: Phase) { phase = next; phaseTime = 0; emit(); }
  function clearRocks() { for (const rock of rocks) scene.remove(rock); rocks.length = 0; }
  function land() { if (phase !== 'flight' && phase !== 'gameover') return; landTravel = travel; landStart.copy(ship.position).sub(new THREE.Vector3(-travel * 10, -.38, 0)); clearRocks(); popup.style.opacity = '0'; change('landing'); }
  function starResult(red: boolean, caught: boolean) {
    const before = save.lives; save = resolvePassenger(save, red, caught);
    if (save.lives < before) { damage = 1; popup.textContent = '−1 👽'; popTime = 0; }
    else if (!red && caught) { bite = 1; popup.textContent = '+1'; popTime = 0; }
    emit();
    if (save.lives === 0) { clearRocks(); heldKeys.clear(); change('gameover'); }
  }
  function resize() {
    width = host.clientWidth; height = host.clientHeight; renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < .8 ? 17.5 : 14.5;
    camera.fov = camera.aspect < .6 ? 48 : 38;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const key = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    heldKeys.add(e.key);
    if (e.key === 'Enter' && !e.repeat) board();
  };
  const keyup = (e: KeyboardEvent) => { heldKeys.delete(e.key); };

  const visibility = () => { paused = document.hidden; heldKeys.clear(); last = 0; };
  const blur = () => { paused = true; heldKeys.clear(); last = 0; };
  const focus = () => { paused = false; last = 0; };
  window.addEventListener('keydown', key); window.addEventListener('keyup', keyup);
  document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', blur); window.addEventListener('focus', focus);
  const moonCenter = new THREE.Vector3(0, -.38, 0);
  const temp = new THREE.Vector3();
  function animate(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    const dt = paused ? 0 : Math.min((now - (last || now)) / 1000, .05); last = now; time += dt; phaseTime += dt; cooldown = Math.max(0, cooldown - dt); damage = Math.max(0, damage - dt * 1.8);
    if (phase === 'moon') {
      travel = 0;
      const dx = Number(heldKeys.has('ArrowRight')) - Number(heldKeys.has('ArrowLeft'));
      const dy = Number(heldKeys.has('ArrowUp')) - Number(heldKeys.has('ArrowDown'));
      // Rolling the entire moon keeps the player fixed and carries the parked ship
      // with the same surface, including beyond the visible hemisphere.
      const disembarking = cooldown > 3;
      const previousSpeed = Math.hypot(velocity.x, velocity.y);
      const motion = stepMoonMotion(velocity, { x: disembarking ? -.45 : dx, y: dy }, dt);
      velocity = motion.velocity;
      const speed = Math.hypot(velocity.x, velocity.y);
      const distance = Math.hypot(motion.travel.x, motion.travel.y);
      walkingDirection.set(motion.travel.x, motion.travel.y * .6, -motion.travel.y * .8);
      if (distance > .000001) {
        walkingDirection.normalize();
        walkingAxis.crossVectors(fixedNormal, walkingDirection).normalize();
        stepRotation.setFromAxisAngle(walkingAxis, -distance);
        world.quaternion.premultiply(stepRotation).normalize();
        avatarNormal.copy(fixedNormal).applyQuaternion(world.quaternion.clone().invert());
      }
      if (speed > .015) targetFacing.setFromAxisAngle(up, Math.atan2(velocity.x, -velocity.y));
      facingRotation.slerp(targetFacing, 1 - Math.exp(-dt * 10));
      gait += distance / .45 * Math.PI * 2;
      gaitWeight += (Math.min(1, speed / .8) - gaitWeight) * (1 - Math.exp(-dt * 10));
      bodyBounce = reducedMotion ? 0 : (1 - Math.cos(gait * 2)) * .009 * gaitWeight;
      const acceleration = dt > 0 ? (speed - previousSpeed) / dt : 0;
      bodyLean += (clamp(speed * .10 + acceleration * .025, -.10, .22) - bodyLean) * (1 - Math.exp(-dt * 8));
      leanRotation.setFromEuler(new THREE.Euler(bodyLean, 0, reducedMotion ? 0 : Math.sin(gait) * .025 * gaitWeight));
      legs.forEach((leg, i) => {
        const swing = Math.sin(gait + i * Math.PI);
        leg.rotation.x = swing * .5 * gaitWeight;
        knees[i].rotation.x = Math.max(0, -swing) * .72 * gaitWeight;
      });
      arms.forEach((arm, i) => { arm.rotation.x = -Math.sin(gait + i * Math.PI) * .36 * gaitWeight; arm.rotation.z = (i === 0 ? .06 : -.06) * gaitWeight; });
    } else if (phase === 'ignition') {
      const t = clamp(phaseTime / 1.1, 0, 1);
      avatar.scale.setScalar(.65 * (1 - smooth(clamp((t - .70) / .3, 0, 1))));
      legs.forEach((leg, i) => { leg.rotation.x = Math.sin(phaseTime * 13 + i * Math.PI) * .32 * (1 - t); knees[i].rotation.x *= Math.exp(-dt * 8); });
      if (phaseTime >= 2.0) { shipStart.copy(ship.position); departureRotation.copy(ship.quaternion); change('takeoff'); }
    } else if (phase === 'takeoff') {
      travel = smooth(clamp(phaseTime / 3, 0, 1));
      ship.position.lerpVectors(shipStart, flightPosition, travel); ship.position.addScaledVector(landingNormal.clone().applyQuaternion(world.quaternion), Math.sin(travel * Math.PI) * .85);
      if (phaseTime >= 3) { flightVelocityY = 0; lane = ship.position.y; starIndex = 0; returnHold = 0; returnAmount = 0; spawnTime = 0; change('flight'); }
    } else if (phase === 'flight') {
      const horizontal = Number(heldKeys.has('ArrowRight')) - Number(heldKeys.has('ArrowLeft'));
      const vertical = Number(heldKeys.has('ArrowUp')) - Number(heldKeys.has('ArrowDown'));
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - 1);
      flightVelocityY += (vertical * FLIGHT_SPEED - flightVelocityY) * (1 - Math.exp(-dt * 18));
      ship.position.y = clamp(ship.position.y + flightVelocityY * dt, -halfHeight * .72, halfHeight * .72);
      if (Math.abs(ship.position.y) >= halfHeight * .72) flightVelocityY = 0;
      if (horizontal) ship.position.x = clamp(ship.position.x + horizontal * dt * 6, -1.3, 1.5);
      const returning = stepReturn(returnAmount, returnHold, heldKeys.has('ArrowLeft') && !heldKeys.has('ArrowRight') && !heldKeys.has('ArrowUp') && !heldKeys.has('ArrowDown') && ship.position.x <= -1.25, dt);
      returnAmount = returning.amount; returnHold = returning.hold;
      travel = 1 - returnAmount * .30;
      if (returning.landing) { returnHold = 0; land(); }
      else {
        spawnTime += dt; popTime += dt; bite = Math.max(0, bite - dt * 2.8);
        const halfWidth = halfHeight * camera.aspect;
        if (spawnTime >= STAR_INTERVAL) {
          spawnTime -= STAR_INTERVAL;
          const isRed = starIndex > 4 && starIndex % 7 === 5;
          const star = passengers.create(isRed, starIndex); star.userData.red = isRed;
          // Wider, bounded lane changes use the extra time between passengers.
          lane = nextStarLane(lane, starIndex++, halfHeight * .5);
          star.position.set(halfWidth + 1, lane + (isRed ? (starIndex % 2 ? 1.6 : -1.6) : 0), 1);
          star.scale.setScalar(.9); scene.add(star); rocks.push(star);
        }
        const mouthPosition = collector.collectorPosition.clone().multiplyScalar(.72).applyQuaternion(ship.quaternion).add(ship.position);
        for (let i = rocks.length - 1; i >= 0; i--) {
          const star = rocks[i];
          if (typeof star.userData.swallow === 'number') {
            star.userData.swallow += dt;
            star.position.copy(mouthPosition);
            star.scale.setScalar(star.userData.originalScale * swallowedStarScale(star.userData.swallow));
            star.visible = star.userData.swallow < .10;
            if (star.userData.swallow >= .14) { scene.remove(star); rocks.splice(i, 1); starResult(false, true); }
            continue;
          }
          const previousX = star.position.x;
          star.position.x -= dt * STAR_SPEED;
          const spin = star.userData.angularVelocity as THREE.Vector3;
          star.rotation.x += spin.x * dt; star.rotation.y += spin.y * dt; star.rotation.z += spin.z * dt;
          const caught = previousX >= mouthPosition.x - .35 && star.position.x <= mouthPosition.x + .45 && Math.abs(star.position.y - mouthPosition.y) < .72;
          if (caught && star.userData.red) {
            scene.remove(star); rocks.splice(i, 1); starResult(true, true);
            if (save.lives === 0) break;
            continue;
          }
          if (caught) {
            bite = 1; star.userData.swallow = 0; star.userData.originalScale = star.scale.x;
          }
          if (!caught && star.position.x < -halfWidth - 2) {
            scene.remove(star); rocks.splice(i, 1); starResult(Boolean(star.userData.red), false);
            if (save.lives === 0) break;
          }
        }
      }
    } else if (phase === 'gameover') {
      if (phaseTime > 1.4) land();
    } else if (phase === 'landing') {
      const progress = clamp(phaseTime / LANDING_DURATION, 0, 1);
      travel = landTravel * (1 - smooth(progress));
      const normal = landingNormal.clone().applyQuaternion(world.quaternion);
      landingPosition(landStart, normal, progress, ship.position);
      ship.position.add(moonCenter).add(new THREE.Vector3(-travel * 10, 0, 0));
      if (phaseTime >= LANDING_DURATION) { travel = 0; flightVelocityY = 0; change('offboarding'); }
    } else if (phase === 'offboarding') {
      if (phaseTime > 1.6) { avatarNormal.copy(fixedNormal).applyQuaternion(world.quaternion.clone().invert()); avatar.scale.setScalar(.65); cooldown = 4; change('moon'); }
    }
    world.position.x = -travel * 10;
    avatar.position.copy(fixedNormal).multiplyScalar(2.27 + (phase === 'moon' ? bodyBounce : 0)).add(world.position); avatar.quaternion.copy(standingRotation).multiply(facingRotation).multiply(leanRotation);
    avatar.visible = phase === 'moon' || phase === 'ignition' || phase === 'offboarding';
    world.updateMatrixWorld(true);
    parkedRotation.copy(world.quaternion).multiply(dockRotation);
    if (phase === 'moon' || phase === 'ignition' || phase === 'offboarding') {
      ship.position.copy(home).applyQuaternion(world.quaternion).add(world.position); ship.quaternion.copy(parkedRotation);
    } else if (phase === 'takeoff') ship.quaternion.slerpQuaternions(departureRotation, flightRotation, smooth(clamp(phaseTime / 2.4,0,1)));
    else if (phase === 'landing') ship.quaternion.slerp(parkedRotation, 1 - Math.exp(-dt * 3));
    else { ship.rotation.x += (-.15 - ship.rotation.x) * dt * 2; ship.rotation.z += ((phase === 'flight' ? flightVelocityY * .018 : .05) - ship.rotation.z) * dt * 2; }
    ship.visible = true; ship.scale.setScalar(.72);
    cockpitPosition.copy(collector.cockpitPosition).multiplyScalar(.72).applyQuaternion(ship.quaternion).add(ship.position);
    if (phase === 'ignition') {
      const t = smooth(clamp(phaseTime / 1.3, 0, 1));
      avatar.position.lerpVectors(boardingStart, cockpitPosition, t).addScaledVector(fixedNormal, Math.sin(t * Math.PI) * .10);
      avatar.scale.setScalar(.65 * (1 - smooth(clamp((phaseTime - 1.05) / .25, 0, 1))));
    } else if (phase === 'offboarding') {
      const t = smooth(clamp((phaseTime - .2) / 1.2, 0, 1));
      const feet = fixedNormal.clone().multiplyScalar(2.27).add(world.position);
      avatar.position.lerpVectors(cockpitPosition, feet, t).addScaledVector(fixedNormal, Math.sin(t * Math.PI) * .08);
      avatar.scale.setScalar(.65 * smooth(clamp(phaseTime / .3, 0, 1)));
      legs.forEach((leg, i) => { leg.rotation.x = Math.sin(phaseTime * 12 + i * Math.PI) * .28 * Math.sin(t * Math.PI); });
    }
    const openHatch = phase === 'ignition' ? 1 - smooth(clamp((phaseTime - 1.3) / .6, 0, 1)) : phase === 'offboarding' ? 1 : 0;
    const gear = phase === 'moon' || phase === 'ignition' || phase === 'offboarding' ? 1 : phase === 'landing' ? smooth(clamp((phaseTime - 3.2) / 1.4, 0, 1)) : phase === 'takeoff' ? 1 - clamp(phaseTime, 0, 1) : 0;
    const power = phase === 'moon' || phase === 'offboarding' ? 0 : phase === 'ignition' ? clamp((phaseTime - 1.4) / .6, 0, 1) : phase === 'landing' ? 1 - smooth(clamp(phaseTime / LANDING_DURATION, 0, 1)) : 1;
    collector.update(time, power, openHatch, gear, bite, damage);
    boardPrompt.hidden = !canBoard();
    if (!boardPrompt.hidden) {
      const projected = cockpitPosition.clone().add(new THREE.Vector3(0, .55, .2)).project(camera);
      boardPrompt.style.left = `${clamp((projected.x * .5 + .5) * width, 55, width - 55)}px`;
      boardPrompt.style.top = `${clamp((-projected.y * .5 + .5) * height, 55, height - 55)}px`;
    }
    const drift = phase === 'flight' ? 14 : phase === 'takeoff' ? travel * 14 : .008;
    streaks.visible = !reducedMotion && (phase === 'flight' || phase === 'takeoff');
    if (streaks.visible) {
      for (let i = 0; i < streakData.length; i += 6) {
        const shift = dt * 19; streakData[i] -= shift; streakData[i + 3] -= shift;
        if (streakData[i + 3] < -22) { streakData[i] += 44; streakData[i + 3] += 44; }
      }
      streakGeometry.attributes.position.needsUpdate = true;
    }
    if (!reducedMotion || phase !== 'moon') { for (let i = 0; i < starPositions.length; i += 3) { starPositions[i] -= dt * drift; if (starPositions[i] < -33) starPositions[i] += 66; } starGeometry.attributes.position.needsUpdate = true; }
    if (phase === 'flight') {
      const projected = ship.position.clone().add(new THREE.Vector3(.9, .3, 0)).project(camera);
      popup.style.left = `${(projected.x * .5 + .5) * width}px`; popup.style.top = `${(-projected.y * .5 + .5) * height - popTime * 24}px`;
      popup.style.opacity = String(clamp(1 - popTime, 0, 1));
    } else popup.style.opacity = '0';
    returnIndicator.hidden = phase !== 'flight' || ship.position.x > -1.1;
    if (!returnIndicator.hidden) {
      const progress = clamp(returnHold / RETURN_HOLD_SECONDS, 0, 1);
      returnIndicator.style.setProperty('--progress', `${progress * 360}deg`);
      returnIndicator.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      const projected = ship.position.clone().add(new THREE.Vector3(-.2, -.9, 0)).project(camera);
      returnIndicator.style.left = `${(projected.x * .5 + .5) * width}px`;
      returnIndicator.style.top = `${(-projected.y * .5 + .5) * height}px`;
    }
    if (phase !== 'moon' && phase !== 'ignition') emit();
    renderer.render(scene, camera);
  }
  emit(); frame = requestAnimationFrame(animate);
  return {
    
    dispose() {
      disposed = true; passengers.dispose(); cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('keydown', key); window.removeEventListener('keyup', keyup);
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', blur); window.removeEventListener('focus', focus);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(obj => { if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) { geometries.add(obj.geometry); for (const mat of Array.isArray(obj.material) ? obj.material : [obj.material]) materials.add(mat); } });
      geometries.add(streakGeometry); materials.add(streakMaterial); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); maps.texture.dispose(); maps.bump.dispose(); renderer.dispose(); renderer.domElement.remove(); popup.remove(); boardPrompt.remove(); returnIndicator.remove();
    },
  };
}
