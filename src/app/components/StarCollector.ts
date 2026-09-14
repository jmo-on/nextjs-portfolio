import * as THREE from 'three';

export function createStarCollector() {
  const group = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({ color: 0xd9dedf, metalness: .55, roughness: .3 });
  const navy = new THREE.MeshStandardMaterial({ color: 0x283e56, metalness: .45, roughness: .4 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc7a268, metalness: .7, roughness: .3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x559ac1, emissive: 0x123c58, emissiveIntensity: .6, metalness: .4, roughness: .16 });
  const energy = new THREE.MeshStandardMaterial({ color: 0xa5ebff, emissive: 0x4cbbff, emissiveIntensity: 1.5 });
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const part = new THREE.Mesh(geometry, material); part.position.set(x,y,z); part.castShadow = true; part.receiveShadow = true; parent.add(part); return part;
  };
  const fuselage = add(new THREE.SphereGeometry(.38, 32, 24), hull, group, -.15, 0, 0); fuselage.scale.set(2.8, .8, 1);
  const stripe = add(new THREE.SphereGeometry(.385, 32, 16), navy, group, -.15, 0, 0); stripe.scale.set(2.35,.2,1.01);
  for (const side of [-1,1]) {
    const shape = new THREE.Shape(); shape.moveTo(.2,side*.20); shape.lineTo(-.85,side*.9); shape.lineTo(-1.1,side*.75); shape.lineTo(-.75,side*.2); shape.closePath();
    add(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:2,steps:1}),navy,group,0,0,-.04);
    const pod=add(new THREE.CylinderGeometry(.11,.14,.6,20),hull,group,-.77,side*.46,0);pod.rotation.z=Math.PI/2;
    const engine=add(new THREE.CircleGeometry(.10,20),energy,group,-1.075,side*.46,0);engine.rotation.y=-Math.PI/2;
  }
  const hatch = new THREE.Group(); hatch.position.set(-.18,0,.24); group.add(hatch);
  const canopy=add(new THREE.SphereGeometry(.27,28,20),glass,hatch,.12,0,.025);canopy.scale.set(1.5,.8,.65);
  const collector=add(new THREE.TorusGeometry(.21,.045,12,32),brass,group,.88,0,0);collector.rotation.y=Math.PI/2;
  const aperture=add(new THREE.CircleGeometry(.18,32),energy,group,.90,0,0);aperture.rotation.y=Math.PI/2;
  const legs = new THREE.Group();group.add(legs);
  // Local +Z is the canopy side; landing gear extends from the -Z belly.
  // Each foot is fitted to the spherical surface instead of intersecting it.
  for(const x of [-.62,.45])for(const side of [-1,1]){
    const y=side*.28;
    const footZ=(Math.sqrt(2.25**2-(x*.72)**2-(y*.72)**2)-2.64)/.72;
    const length=-.20-footZ;
    const strut=add(new THREE.CylinderGeometry(.025,.03,length,12),brass,legs,x,y,(-.20+footZ)/2);strut.rotation.x=Math.PI/2;
    add(new THREE.BoxGeometry(.18,.14,.035),navy,legs,x,y,footZ+.0175);
  }
  const flameMaterial=new THREE.MeshBasicMaterial({color:0x85d8ff,transparent:true,opacity:.8,depthWrite:false});
  const flame=add(new THREE.ConeGeometry(.15,1.2,20),flameMaterial,group,-1.6,0,0);flame.rotation.z=Math.PI/2;
  const exhaust=new THREE.PointLight(0x66cfff,0,3);exhaust.position.x=-1;group.add(exhaust);
  return { group, collectorPosition:new THREE.Vector3(.92,0,0), cockpitPosition:new THREE.Vector3(-.06,0,.39),
    update(time:number,power:number,open:number,gear:number,collect:number,damage:number){
      hatch.rotation.x = open * -1.1;legs.scale.z=Math.max(.01,gear);legs.visible=gear>.02;
      flame.visible=power>.02;flame.scale.y=power*(1+Math.sin(time*42)*.07);exhaust.intensity=power*2;
      energy.emissiveIntensity=1.5+collect*3;hull.emissive.setHex(damage>0?0x9a2030:0x000000);hull.emissiveIntensity=damage;
    }
  };
}
