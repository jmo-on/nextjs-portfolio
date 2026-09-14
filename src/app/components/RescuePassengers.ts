import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createPassengerFactory() {
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const limb = new THREE.CylinderGeometry(1, 1, 1, 12);
  const material = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: .85 });
  const skins = [0xf1c8ab, 0xd5a07c, 0xa86e4c, 0x704733, 0x493127].map(material);
  const clothes = [0xe1b252, 0x6889b9, 0xb65c62, 0xe7e0cd, 0x78977b, 0x977baf].map(material);
  const trousers = [0x303747, 0x536049, 0x685b54].map(material);
  const alienSkin = material(0x77c76a), eyes = material(0x142224), boots = material(0x343137), hair = material(0x292329);
  const allMaterials = [...skins, ...clothes, ...trousers, alienSkin, eyes, boots, hair];
  function build(alien: boolean, index: number) {
    const group = new THREE.Group();
    const skin = alien ? alienSkin : skins[index % skins.length];
    const top = alien ? alienSkin : clothes[index % clothes.length];
    const bottom = alien ? alienSkin : trousers[index % trousers.length];
    const ellipsoid = (m: THREE.Material, p: number[], s: number[]) => { const part = new THREE.Mesh(sphere, m); part.position.set(p[0],p[1],p[2]); part.scale.set(s[0],s[1],s[2]); group.add(part); return part; };
    const bone = (m: THREE.Material, a: number[], b: number[], radius: number) => {
      const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
      const part = new THREE.Mesh(limb, m); part.position.copy(start).add(end).multiplyScalar(.5); part.scale.set(radius,delta.length(),radius);part.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); group.add(part);
      ellipsoid(m,a,[radius,radius,radius]); ellipsoid(m,b,[radius,radius,radius]);
    };
    // Identical tucked posture for passengers and aliens: knees up, arms wrapped around shins.
    ellipsoid(top,[0,.12,-.07],[.18,.25,.13]);
    ellipsoid(skin,[0,.43,.035],alien?[.17,.20,.14]:[.14,.16,.13]);
    if (!alien) ellipsoid(hair,[0,.52,.002],[.145,.09,.13]);
    for (const side of [-1,1]) {
      const x = side * .115;
      bone(bottom,[x,-.08,-.03],[x,.08,.22],.08);
      bone(bottom,[x,.08,.22],[x,-.23,.17],.06);
      ellipsoid(boots,[x,-.26,.22],[.08,.055,.12]);
      bone(top,[side*.18,.25,-.04],[side*.22,.11,.20],.055);
      bone(skin,[side*.22,.11,.20],[side*.08,.02,.29],.04);
      const eye=ellipsoid(eyes,[side*.058,.45,.155],alien?[.048,.068,.015]:[.018,.015,.014]);eye.rotation.z=side*-.3;
    }
    return group;
  }
  const templates = new Map<string, THREE.Group>();
  const merged: THREE.BufferGeometry[] = [];
  function create(alien: boolean, index: number) {
    const key = alien ? 'alien' : String(index % 30);
    let template = templates.get(key);
    if (!template) {
      const source = build(alien, index % 30);
      const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
      source.children.forEach(child => {
        const mesh = child as THREE.Mesh; mesh.updateMatrix();
        const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrix);
        const material = mesh.material as THREE.Material;
        const batch = batches.get(material) || []; batch.push(geometry); batches.set(material, batch);
      });
      template = new THREE.Group();
      batches.forEach((geometries, material) => {
        const geometry = mergeGeometries(geometries)!; geometries.forEach(g => g.dispose());
        merged.push(geometry); template!.add(new THREE.Mesh(geometry, material));
      });
      templates.set(key, template);
    }
    const group = template.clone();
    group.userData.alien = alien;
    group.userData.angularVelocity = new THREE.Vector3(.12 + (index%4)*.07, .10 + (index%3)*.08, (index%2?1:-1)*.18);
    group.rotation.set(index*.43,index*.31,index*.21);
    return group;
  }
  // Prepare variants before play to avoid geometry merging during a flight.
  for (let i = 0; i < 30; i++) create(false, i);
  create(true, 0);
  return { create, dispose() { merged.forEach(g=>g.dispose()); templates.clear(); sphere.dispose(); limb.dispose(); allMaterials.forEach(m=>m.dispose()); } };
}
