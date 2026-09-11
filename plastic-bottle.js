import * as THREE from 'three';

// Dimensions follow the cylindrical bottle and the side profile of the supplied trigger.
export function createPlasticBottle(labelMap) {
  const group=new THREE.Group();group.name='Plastic cleaning bottle';
  const plastic=new THREE.MeshPhysicalMaterial({color:0xf2f1ee,roughness:.4,metalness:0,clearcoat:.16,clearcoatRoughness:.38});
  const headPlastic=new THREE.MeshPhysicalMaterial({color:0xe4e6e2,roughness:.32,metalness:0,clearcoat:.23,clearcoatRoughness:.3});
  const insetPlastic=new THREE.MeshStandardMaterial({color:0xe1e3e1,roughness:.55});
  const radius=.66,labelHeight=2*Math.PI*radius*970/1463;
  const labelBottom=-1.85,labelTop=labelBottom+labelHeight;
  function mesh(geometry,material,parent=group){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function lathe(points,material,parent=group){return mesh(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),160),material,parent);}
  function ring(r,t,y,material,parent=group){const m=mesh(new THREE.TorusGeometry(r,t,10,96),material,parent);m.rotation.x=Math.PI/2;m.position.y=y;return m;}
  const shoulderBase=labelTop+.06;
  const neck=shoulderBase+.94;
  const profile=[[0,-1.982],[.42,-1.982],[.55,-1.995],[.60,-2],[.636,-1.982],[.655,-1.95],[radius,-1.90],[radius,shoulderBase]];
  // Smooth shoulder with a vertical tangent where it meets the cylindrical label area.
  const shoulder=new THREE.CubicBezierCurve(new THREE.Vector2(radius,shoulderBase),new THREE.Vector2(radius,shoulderBase+.30),new THREE.Vector2(.43,neck-.15),new THREE.Vector2(.274,neck));
  shoulder.getPoints(56).slice(1).forEach(p=>profile.push([p.x,p.y]));
  profile.push([.274,neck+.15],[.242,neck+.15],[.242,neck+.10],[0,neck+.10]);
  lathe(profile,plastic).name='Rounded shoulder and cylindrical plastic body';
  ring(.274,.009,neck+.045,plastic);ring(.277,.009,neck+.108,plastic);
  const label=mesh(new THREE.CylinderGeometry(radius+.001,radius+.001,labelHeight,192,1,true),new THREE.MeshPhysicalMaterial({map:labelMap,roughness:.5,metalness:0,clearcoat:.12,clearcoatRoughness:.45}));
  label.position.y=labelBottom+labelHeight/2;label.rotation.y=-2*Math.PI*((700-50)/1463);label.name='Full original label at native aspect ratio';
  // Two interchangeable closures share the same neck. Neither moves the bottle or camera.
  const cap=new THREE.Group();cap.name='Ribbed screw cap';cap.position.y=neck+.018;group.add(cap);
  const spray=new THREE.Group();spray.name='White trigger sprayer';spray.position.y=neck+.018;group.add(spray);
  function ribbedCollar(parent,height,r=.292){
    lathe([[0,0],[r-.03,0],[r,.018],[r,height-.026],[r-.008,height-.008],[r-.026,height],[0,height]],headPlastic,parent);
    const ribGeometry=new THREE.CylinderGeometry(.006,.006,height-.07,5);
    for(let i=0;i<52;i++){const a=i*Math.PI*2/52;const rib=mesh(ribGeometry,headPlastic,parent);rib.position.set(Math.sin(a)*(r+.001),height/2,Math.cos(a)*(r+.001));}
    ring(r,.006,.027,headPlastic,parent);ring(r-.006,.007,height-.022,headPlastic,parent);
  }
  ribbedCollar(cap,.35);ribbedCollar(spray,.41);
  // Rounded extrusion of an explicitly modelled side silhouette, with real depth on all sides.
  function moldedPart(shape,depth,bevel,material,parent=spray){const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,curveSegments:32});g.translate(0,0,-depth/2);return mesh(g,material,parent);}
  const housing=new THREE.Shape();
  housing.moveTo(-.77,.96);housing.bezierCurveTo(-.45,.96,-.10,.94,.10,.91);
  housing.bezierCurveTo(.35,.89,.58,.70,.64,.53);
  housing.bezierCurveTo(.70,.38,.40,.36,.22,.37);
  housing.bezierCurveTo(.02,.37,-.15,.40,-.24,.50);
  housing.bezierCurveTo(-.30,.63,-.51,.72,-.77,.72);housing.closePath();
  moldedPart(housing,.29,.055,headPlastic).name='Curved sprayer housing';
  const pump=mesh(new THREE.CylinderGeometry(.19,.215,.25,64),headPlastic,spray);pump.position.set(0,.47,0);
  // The curved trigger is separated from the pump by a visible finger opening.
  const trigger=new THREE.Shape();trigger.moveTo(-.47,.70);
  trigger.bezierCurveTo(-.54,.64,-.61,.43,-.77,.24);
  trigger.bezierCurveTo(-.87,.13,-.97,.035,-1.025,.005);
  trigger.bezierCurveTo(-1.04,-.035,-.99,-.05,-.945,-.025);
  trigger.bezierCurveTo(-.69,.095,-.57,.27,-.47,.40);
  trigger.bezierCurveTo(-.41,.48,-.31,.41,-.26,.40);
  trigger.lineTo(-.30,.53);trigger.bezierCurveTo(-.36,.60,-.37,.68,-.47,.70);trigger.closePath();
  moldedPart(trigger,.15,.022,headPlastic).name='Curved finger trigger';
  const hinge=mesh(new THREE.CylinderGeometry(.062,.062,.21,32),insetPlastic,spray);hinge.rotation.x=Math.PI/2;hinge.position.set(-.42,.62,0);
  const nozzle=new THREE.Shape();nozzle.moveTo(-1.045,.715);nozzle.lineTo(-.785,.715);nozzle.lineTo(-.785,.975);nozzle.lineTo(-1.045,.975);nozzle.closePath();
  moldedPart(nozzle,.31,.013,headPlastic).name='Square adjustable nozzle';
  const nozzleFace=mesh(new THREE.CylinderGeometry(.104,.104,.007,48),insetPlastic,spray);nozzleFace.rotation.z=Math.PI/2;nozzleFace.position.set(-1.063,.845,0);
  const outlet=mesh(new THREE.CylinderGeometry(.017,.017,.01,24),new THREE.MeshStandardMaterial({color:0x777f81,roughness:.65}),spray);outlet.rotation.z=Math.PI/2;outlet.position.set(-1.069,.845,0);
  // A fine molded split line is visible on the lower side of the housing.
  const seamPath=new THREE.CatmullRomCurve3([new THREE.Vector3(-.66,.72,.21),new THREE.Vector3(-.35,.62,.21),new THREE.Vector3(-.13,.47,.21),new THREE.Vector3(.20,.425,.20),new THREE.Vector3(.51,.45,.16)]);
  mesh(new THREE.TubeGeometry(seamPath,48,.003,6,false),insetPlastic,spray);
  const dipTube=mesh(new THREE.CylinderGeometry(.025,.025,3.4,16),new THREE.MeshPhysicalMaterial({color:0xe5e8e4,transparent:true,opacity:.5,roughness:.35}),spray);dipTube.position.y=-1.6;
  group.position.y=-.30;
  function setSprayer(enabled){cap.visible=!enabled;spray.visible=enabled;}
  setSprayer(false);
  return {group,setSprayer,floorY:-2.30};
}
