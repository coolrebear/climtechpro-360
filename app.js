import * as THREE from 'three';
import {OrbitControls} from './assets/OrbitControls.js';
const host=document.querySelector('#viewer'), loading=document.querySelector('#loading');
try {
const scene=new THREE.Scene();
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(31,1,0.1,100);const target=new THREE.Vector3(0,-.25,0);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=3.8;controls.maxDistance=14;controls.enablePan=true;controls.autoRotateSpeed=.75;
scene.add(new THREE.HemisphereLight(0xffffff,0x8c9ba9,2.6));
function light(color,intensity,x,y,z){const l=new THREE.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l)}
light(0xffffff,3.5,-3,6,5);light(0xd7e7ff,2,4,2,-3);light(0xffffff,1.2,0,-2,5);
const can=new THREE.Group();scene.add(can);
const radius=.66,bodyHeight=3.73,bodyY=-.39;
const metal=new THREE.MeshStandardMaterial({color:0xcbd0d5,metalness:.8,roughness:.22});
const white=new THREE.MeshPhysicalMaterial({color:0xf9fafc,metalness:.03,roughness:.28,clearcoat:.45,clearcoatRoughness:.25});
function lathe(profile,material,y=0){const g=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),160);const m=new THREE.Mesh(g,material);m.position.y=y;can.add(m);return m}
lathe([[0,-2.31],[.54,-2.31],[.61,-2.3],[.655,-2.26],[.669,-2.23],[.669,-2.19],[.657,-2.16],[.657,1.48],[.66,1.51],[.657,1.55],[.60,1.62],[.49,1.67],[0,1.67]],metal);
lathe([[0,1.555],[.654,1.555],[.667,1.57],[.667,2.355],[.664,2.39],[.645,2.425],[.59,2.449],[.42,2.466],[0,2.473]],white);
function ring(y,r,t){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,12,160),metal);m.rotation.x=Math.PI/2;m.position.y=y;can.add(m)}ring(-2.235,.65,.017);ring(-2.17,.659,.01);ring(1.51,.655,.015);
const map=await new THREE.TextureLoader().loadAsync('./assets/label.jpg');map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();
// Crop only the surrounding dimension marks; preserve all printed artwork, including the recycling footer.
map.offset.set(50/1536,12/1024);map.repeat.set(1463/1536,970/1024);
const label=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,bodyHeight,192,1,true),new THREE.MeshPhysicalMaterial({map,roughness:.48,metalness:.02,clearcoat:.18,clearcoatRoughness:.4}));label.position.y=bodyY;
// Cylinder u=0 faces +Z. Put the centre of the brand panel at the initial camera azimuth.
label.rotation.y=-2*Math.PI*((700-50)/1463);can.add(label);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const ctx=shadowCanvas.getContext('2d');const grad=ctx.createRadialGradient(128,128,8,128,128,125);grad.addColorStop(0,'rgba(33,48,66,.26)');grad.addColorStop(.45,'rgba(33,48,66,.10)');grad.addColorStop(1,'rgba(33,48,66,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.8,3.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.32;scene.add(shadow);
let baseDistance=12;function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}resize();new ResizeObserver(resize).observe(host);
function view(back=false){controls.target.copy(target);camera.position.set(0,.4,back?-baseDistance:baseDistance);controls.update()}
view();loading.hidden=true;loading.style.display='none';
const rotate=document.querySelector('#rotate');function stop(){controls.autoRotate=false;rotate.setAttribute('aria-pressed','false');rotate.textContent='自动旋转'}
document.querySelector('#front').onclick=()=>{stop();view()};document.querySelector('#back').onclick=()=>{stop();view(true)};document.querySelector('#reset').onclick=()=>{stop();view()};
function zoom(f){const d=camera.position.clone().sub(controls.target);d.setLength(THREE.MathUtils.clamp(d.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(d);controls.update()}
document.querySelector('#plus').onclick=()=>zoom(.8);document.querySelector('#minus').onclick=()=>zoom(1.25);rotate.onclick=()=>{controls.autoRotate=!controls.autoRotate;rotate.setAttribute('aria-pressed',String(controls.autoRotate));rotate.textContent=controls.autoRotate?'暂停旋转':'自动旋转'};controls.addEventListener('start',stop);
host.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON')return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key)){e.preventDefault();stop();if(e.key==='Home')view();else if(e.key==='+'||e.key==='ArrowUp')zoom(.9);else if(e.key==='-'||e.key==='ArrowDown')zoom(1.1);else {const d=camera.position.clone().sub(controls.target);d.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?.15:-.15);camera.position.copy(controls.target).add(d);}}});
let last=0;function animate(t){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);if(t-last>150){const a=((THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())%360)+360)%360;document.querySelector('#angle').textContent=(a<12||a>348)?'正面视角':Math.abs(a-180)<12?'背面视角':`${Math.round(a)}° 环绕视角`;last=t}}requestAnimationFrame(animate);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.style.display='grid';loading.textContent='图形显示已暂停，请刷新页面重新加载。'});
}catch(e){console.error(e);loading.textContent='3D 加载失败，请刷新页面或使用支持 WebGL 的浏览器。'}
