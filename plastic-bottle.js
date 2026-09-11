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
  const baseContour=[[0,-1.883],[.20,-1.884],[.38,-1.889],[.46,-1.900],[.49,-1.919],[.514,-1.953],[.538,-1.988],[.565,-2.018],[.59,-2.025],[.616,-2.017],[.640,-1.997],[.655,-1.970],[radius,-1.935]];
  const profile=[...baseContour,[radius,-1.90],[radius,shoulderBase]];
  // Smooth shoulder with a vertical tangent where it meets the cylindrical label area.
  const shoulder=new THREE.CubicBezierCurve(new THREE.Vector2(radius,shoulderBase),new THREE.Vector2(radius,shoulderBase+.30),new THREE.Vector2(.43,neck-.15),new THREE.Vector2(.274,neck));
  shoulder.getPoints(56).slice(1).forEach(p=>profile.push([p.x,p.y]));
  profile.push([.274,neck+.15],[.242,neck+.15],[.242,neck+.10],[0,neck+.10]);
  lathe(profile,plastic).name='Rounded shoulder and cylindrical plastic body';
  // Moulded base details are geometry, so they remain visible under changing light.
  const baseDetail=new THREE.Group();baseDetail.name='Recessed HDPE base with mould seam';group.add(baseDetail);
  const embossMaterial=new THREE.MeshStandardMaterial({color:0xe7e7e2,roughness:.48});
  function baseY(r){for(let i=1;i<baseContour.length;i++){if(r<=baseContour[i][0]){const a=baseContour[i-1],b=baseContour[i];return THREE.MathUtils.lerp(a[1],b[1],(r-a[0])/(b[0]-a[0]));}}return baseContour.at(-1)[1];}
  // A shallow tapered weld seam runs across the recessed floor, as on the reference.
  const seamVertices=[],seamIndices=[];
  for(let i=0;i<=96;i++){const z=-.55+1.10*i/96;const taper=Math.sin(Math.PI*i/96);const w=.009*taper+.0003;const y=baseY(Math.abs(z));seamVertices.push(-w,y-.0007,z,0,y-.009*taper-.0008,z,w,y-.0007,z);if(i<96){const a=i*3,b=a+3;seamIndices.push(a,a+1,b,a+1,b+1,b,a+1,a+2,b+1,a+2,b+2,b+1);}}
  const seamGeometry=new THREE.BufferGeometry();seamGeometry.setAttribute('position',new THREE.Float32BufferAttribute(seamVertices,3));seamGeometry.setIndex(seamIndices);seamGeometry.computeVertexNormals();
  const seam=mesh(seamGeometry,plastic,baseDetail);seam.name='Central mould parting seam';
  function raisedStroke(points,width=.0045){const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,baseY(Math.hypot(x,z))-.003,z)));return mesh(new THREE.TubeGeometry(curve,points.length*8,width,6,false),embossMaterial,baseDetail);}
  // Three embossed bent arrows form the recycling mark on the underside.
  const markX=.235,markZ=.065;
  for(let i=0;i<3;i++){const a=i*2*Math.PI/3;const transform=([x,z])=>[markX+x*Math.cos(a)-z*Math.sin(a),markZ+x*Math.sin(a)+z*Math.cos(a)];raisedStroke([[-.086,.055],[-.024,-.052],[.006,-.09],[.036,-.042]].map(transform),.005);raisedStroke([[-.009,-.047],[.006,-.09],[.047,-.078]].map(transform),.005);}
  const glyphs={H:[[[0,0],[0,1]],[[.65,0],[.65,1]],[[0,.5],[.65,.5]]],D:[[[0,0],[0,1],[.40,1],[.65,.8],[.65,.2],[.40,0],[0,0]]],P:[[[0,0],[0,1],[.5,1],[.65,.84],[.65,.64],[.5,.50],[0,.50]]],E:[[[.65,0],[0,0],[0,1],[.65,1]],[[0,.5],[.5,.5]]],'2':[[[0,.85],[.12,1],[.50,1],[.65,.85],[.65,.68],[0,.10],[0,0],[.65,0]]]};
  function raisedText(text,x,z,size){[...text].forEach((c,i)=>glyphs[c]?.forEach(stroke=>raisedStroke(stroke.map(([px,py])=>[x+(i*.90+px)*size,z+(py-1)*size]),.0038)));}
  raisedText('2',markX-.018,markZ+.03,.058);raisedText('HDPE',.134,.242,.06);raisedText('2',.21,-.185,.06);
  ring(.274,.009,neck+.045,plastic);ring(.277,.009,neck+.108,plastic);
  const label=mesh(new THREE.CylinderGeometry(radius+.001,radius+.001,labelHeight,192,1,true),new THREE.MeshPhysicalMaterial({map:labelMap,roughness:.5,metalness:0,clearcoat:.12,clearcoatRoughness:.45}));
  label.position.y=labelBottom+labelHeight/2;label.rotation.y=-2*Math.PI*((700-50)/1463);label.name='Full original label at native aspect ratio';
  // Two interchangeable closures share the same neck. Neither moves the bottle or camera.
  const cap=new THREE.Group();cap.name='Ribbed screw cap';cap.position.y=neck+.018;group.add(cap);
  const spray=new THREE.Group();spray.name='White trigger sprayer';spray.position.y=neck+.018;group.add(spray);
  // Hollow closures enclose the bottle threads; the sprayer collar has a separate top opening.
  function ribbedCollar(parent,height,r=.309,opening=0){
    const inner=.291;
    lathe([[inner,0],[r-.01,0],[r,.018],[r,height-.026],[r-.008,height-.008],[r-.022,height],[opening,height],[opening,height-.024],[inner,height-.024],[inner,0]],headPlastic,parent).name='Hollow ribbed closure';
    const ribGeometry=new THREE.CylinderGeometry(.005,.005,height-.075,5);
    for(let i=0;i<52;i++){const a=i*Math.PI*2/52;const rib=mesh(ribGeometry,headPlastic,parent);rib.position.set(Math.sin(a)*(r+.001),height/2,Math.cos(a)*(r+.001));}
    ring(r,.006,.027,headPlastic,parent);ring(r-.006,.006,height-.022,headPlastic,parent);
  }
  ribbedCollar(cap,.35);ribbedCollar(spray,.41,.309,.226);
  // The real attachment has three distinct levels: collar, narrow smooth neck, housing foot.
  // Keep all upper-head geometry clear of the collar rather than sinking the housing into it.
  lathe([[0,.401],[.223,.401],[.223,.470],[.225,.482],[.231,.490],[0,.490]],headPlastic,spray).name='Smooth connector above collar';
  const upperHead=new THREE.Group();upperHead.name='Sprayer upper assembly';upperHead.position.y=.20;spray.add(upperHead);
  lathe([[0,.278],[.226,.278],[.240,.290],[.248,.307],[.248,.44],[0,.44]],headPlastic,upperHead).name='Integral housing mounting foot';
  // Rounded extrusion of an explicitly modelled side silhouette, with real depth on all sides.
  function moldedPart(shape,depth,bevel,material,parent=upperHead){const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:5,curveSegments:32});g.translate(0,0,-depth/2);return mesh(g,material,parent);}
  const housing=new THREE.Shape();
  housing.moveTo(-.77,.96);housing.bezierCurveTo(-.45,.96,-.10,.94,.10,.91);
  housing.bezierCurveTo(.35,.89,.58,.70,.64,.53);
  housing.bezierCurveTo(.70,.38,.40,.36,.22,.37);
  housing.bezierCurveTo(.02,.37,-.15,.40,-.24,.50);
  housing.bezierCurveTo(-.30,.63,-.51,.72,-.77,.72);housing.closePath();
  moldedPart(housing,.41,.045,headPlastic).name='Curved sprayer housing';
  // The curved trigger is separated from the pump by a visible finger opening.
  const trigger=new THREE.Shape();trigger.moveTo(-.47,.70);
  trigger.bezierCurveTo(-.54,.64,-.61,.43,-.77,.24);
  trigger.bezierCurveTo(-.87,.13,-.97,.035,-1.025,.005);
  trigger.bezierCurveTo(-1.04,-.035,-.99,-.05,-.945,-.025);
  trigger.bezierCurveTo(-.69,.095,-.57,.27,-.47,.40);
  trigger.bezierCurveTo(-.41,.48,-.31,.41,-.26,.40);
  trigger.lineTo(-.30,.53);trigger.bezierCurveTo(-.36,.60,-.37,.68,-.47,.70);trigger.closePath();
  moldedPart(trigger,.15,.022,headPlastic).name='Curved finger trigger';
  const hinge=mesh(new THREE.CylinderGeometry(.062,.062,.21,32),insetPlastic,upperHead);hinge.rotation.x=Math.PI/2;hinge.position.set(-.42,.62,0);
  const nozzle=new THREE.Shape();nozzle.moveTo(-1.045,.715);nozzle.lineTo(-.785,.715);nozzle.lineTo(-.785,.975);nozzle.lineTo(-1.045,.975);nozzle.closePath();
  moldedPart(nozzle,.31,.013,headPlastic).name='Square adjustable nozzle';
  const nozzleFace=mesh(new THREE.CylinderGeometry(.104,.104,.007,48),insetPlastic,upperHead);nozzleFace.rotation.z=Math.PI/2;nozzleFace.position.set(-1.063,.845,0);
  const outlet=mesh(new THREE.CylinderGeometry(.017,.017,.01,24),new THREE.MeshStandardMaterial({color:0x777f81,roughness:.65}),upperHead);outlet.rotation.z=Math.PI/2;outlet.position.set(-1.069,.845,0);
  const dipTube=mesh(new THREE.CylinderGeometry(.025,.025,3.4,16),new THREE.MeshPhysicalMaterial({color:0xe5e8e4,transparent:true,opacity:.5,roughness:.35}),spray);dipTube.position.y=-1.6;
  group.position.y=-.30;
  function setSprayer(enabled){cap.visible=!enabled;spray.visible=enabled;}
  setSprayer(false);
  return {group,setSprayer,floorY:-2.325};
}
