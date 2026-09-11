import * as THREE from 'three';
import {OrbitControls} from './assets/OrbitControls.js';
import {createPlasticBottle} from './plastic-bottle.js?v=7';
const host=document.querySelector('#viewer'), loading=document.querySelector('#loading');
const translations={
 fr:{title:'CLIMTECHPRO · Vue produit à 360°',brandSub:'EXPLORER LE PRODUIT',tag:'Vue produit à 360°',eyebrow:'CLIMATISATION · AÉROSOL',headline:'Aérosol nettoyant\npour climatiseur',pack:'Emballage',packValue:'Capuchon blanc / étiquette intégrale',label:'Étiquette',labelValue:'Bleu et noir · 360°',hint:'Faites glisser pour tourner.\nZoomez avec la molette ou deux doigts.',view:'VUE 3D',front:'Face',back:'Dos',reset:'Réinitialiser',auto:'Rotation auto',pause:'Pause',frontView:'Vue de face',backView:'Vue de dos',orbit:'Vue à',footer:'Modèle d’après photo · Étiquette originale',explore:'FAITES GLISSER POUR EXPLORER',viewer:'Vue 3D interactive du produit : faites glisser pour tourner et défiler pour zoomer',minus:'Dézoomer',plus:'Zoomer',frontTitle:'Revenir à la vue de face',backTitle:'Afficher le dos',resetTitle:'Réinitialiser la vue et le zoom',loading:'Chargement du produit…',lost:'Affichage interrompu. Actualisez la page.',error:'Impossible de charger la vue 3D. Actualisez la page ou utilisez un navigateur compatible WebGL.'},
 en:{title:'CLIMTECHPRO · 360° Product View',brandSub:'PRODUCT EXPLORER',tag:'360° Product View',eyebrow:'AIR CONDITIONING · AEROSOL',headline:'Air conditioner\ncleaning aerosol',pack:'Packaging',packValue:'White cap / full-wrap label',label:'Label',labelValue:'Blue & black · 360°',hint:'Drag to rotate.\nScroll or pinch to explore the details.',view:'3D VIEW',front:'Front',back:'Back',reset:'Reset',auto:'Auto rotate',pause:'Pause',frontView:'Front view',backView:'Back view',orbit:'View at',footer:'Photo-based model · Original label',explore:'DRAG TO EXPLORE',viewer:'Interactive 3D product: drag to rotate and scroll to zoom',minus:'Zoom out',plus:'Zoom in',frontTitle:'Return to the front view',backTitle:'Show the back',resetTitle:'Reset view and zoom',loading:'Loading product…',lost:'Rendering paused. Please refresh the page.',error:'Unable to load 3D. Refresh the page or use a WebGL-compatible browser.'}
};
Object.assign(translations.fr,{category:'Produit',aerosol:'Aérosol',bottle:'Flacon plastique',bottleHeadline:'Nettoyant pour climatiseur\n en flacon',bottleEyebrow:'CLIMATISATION · FLACON',sprayer:'Pulvérisateur',sprayerOn:'Avec pulvérisateur',sprayerOff:'Bouchon vissé',bottlePack:'Bouchon vissé / étiquette intégrale',sprayerPack:'Pulvérisateur / étiquette intégrale'});
Object.assign(translations.en,{category:'Product',aerosol:'Aerosol can',bottle:'Plastic bottle',bottleHeadline:'Air conditioner\ncleaning bottle',bottleEyebrow:'AIR CONDITIONING · BOTTLE',sprayer:'Spray head',sprayerOn:'Spray head fitted',sprayerOff:'Screw cap fitted',bottlePack:'Screw cap / full-wrap label',sprayerPack:'Trigger sprayer / full-wrap label'});
let language='fr',loadingState='loading',currentAngle=0,currentProduct='aerosol',sprayerEnabled=false;
function updateProductText(){
 const isBottle=currentProduct==='bottle';
 document.querySelector('h1').textContent=t(isBottle?'bottleHeadline':'headline');
 document.querySelector('.eyebrow').textContent=t(isBottle?'bottleEyebrow':'eyebrow');
 document.querySelector('[data-i18n="packValue"]').textContent=t(isBottle?(sprayerEnabled?'sprayerPack':'bottlePack'):'packValue');
 document.querySelector('#sprayer-options').hidden=!isBottle;
 document.querySelector('#sprayer-status').textContent=t(sprayerEnabled?'sprayerOn':'sprayerOff');
 document.querySelector('#sprayer-toggle').setAttribute('aria-checked',String(sprayerEnabled));
 for(const id of ['aerosol','bottle'])document.querySelector('#product-'+id).setAttribute('aria-pressed',String(currentProduct===id));
 document.querySelector('#product-selector').setAttribute('aria-label',t('category'));
}
try{const saved=localStorage.getItem('climtechpro-language');if(saved in translations)language=saved;}catch{}
const t=key=>translations[language][key];
function updateAngle(){const a=currentAngle;document.querySelector('#angle').textContent=(a<12||a>348)?t('frontView'):Math.abs(a-180)<12?t('backView'):`${t('orbit')} ${Math.round(a)}°`;}
function updateRotationText(){const button=document.querySelector('#rotate');button.textContent=t(button.getAttribute('aria-pressed')==='true'?'pause':'auto');}
function applyLanguage(lang){language=lang;document.documentElement.lang=lang;document.title=t('title');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
for(const id of ['viewer','minus','plus'])document.getElementById(id).setAttribute('aria-label',t(id));
for(const id of ['front','back','reset'])document.getElementById(id).title=t(id+'Title');
for(const code of ['fr','en'])document.getElementById('lang-'+code).setAttribute('aria-pressed',String(lang===code));
loading.textContent=t(loadingState);updateAngle();updateRotationText();updateProductText();try{localStorage.setItem('climtechpro-language',lang);}catch{}}
document.querySelector('#lang-fr').onclick=()=>applyLanguage('fr');document.querySelector('#lang-en').onclick=()=>applyLanguage('en');applyLanguage(language);
try {
const scene=new THREE.Scene();
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;host.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(31,1,0.1,100);const target=new THREE.Vector3(0,-.25,0);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=3.8;controls.maxDistance=14;controls.enablePan=true;controls.autoRotateSpeed=.75;
scene.add(new THREE.HemisphereLight(0xffffff,0x8c9ba9,2.6));
function light(color,intensity,x,y,z){const l=new THREE.DirectionalLight(color,intensity);l.position.set(x,y,z);scene.add(l);return l;}
const keyLight=light(0xffffff,3.5,-3,6,5);
keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);keyLight.shadow.camera.left=-4;keyLight.shadow.camera.right=4;keyLight.shadow.camera.top=4;keyLight.shadow.camera.bottom=-4;keyLight.shadow.camera.near=.1;keyLight.shadow.camera.far=20;keyLight.shadow.bias=-.0002;keyLight.shadow.normalBias=.008;
light(0xd7e7ff,2,4,2,-3);light(0xffffff,1.2,0,-2,5);
const can=new THREE.Group();scene.add(can);
// Match the unwrapped cylinder surface to the actual cropped artwork pixels.
const radius=.66,labelWidth=1463,labelHeight=970;
const bodyHeight=2*Math.PI*radius*labelHeight/labelWidth,bodyY=-.45;
const labelBottom=bodyY-bodyHeight/2,top=bodyY+bodyHeight/2;
// Extend the bare can below the full label so the rolled rim cannot cover its footer.
// The artwork keeps its original aspect ratio and full pixel crop.
const bottom=labelBottom-.13;
const metal=new THREE.MeshStandardMaterial({color:0xcbd0d5,metalness:.8,roughness:.22});
const white=new THREE.MeshPhysicalMaterial({color:0xf9fafc,metalness:.03,roughness:.28,clearcoat:.45,clearcoatRoughness:.25});
function lathe(profile,material,y=0){const g=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),160);const m=new THREE.Mesh(g,material);m.position.y=y;can.add(m);return m}
lathe([[.669,bottom+.025],[.669,bottom+.065],[.657,bottom+.095],[.657,top+.005],[.66,top+.035],[.657,top+.075],[.60,top+.145],[.49,top+.195],[0,top+.195]],metal);
// Studio reflections belong only to the polished base, preserving the printed label.
const reflectionScene=new THREE.Scene();
reflectionScene.background=new THREE.Color(0x697582);
const studioRoom=new THREE.Mesh(new THREE.BoxGeometry(18,18,18),new THREE.MeshBasicMaterial({color:0x8e969d,side:THREE.BackSide}));reflectionScene.add(studioRoom);
function reflector(w,h,color,intensity,x,y,z){const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);reflectionScene.add(panel);}
reflector(4,12,0xffffff,4,-5,-3,3);
reflector(2,10,0xffffff,3,5,-2,1);
reflector(9,5,0xffffff,2,0,-7,-4);
reflector(3,9,0x151a22,1,1,-3,6);
reflector(5,7,0x242b34,1,-3,1,-6);
const pmrem=new THREE.PMREMGenerator(renderer);
const steelEnvironment=pmrem.fromScene(reflectionScene,.16,.1,40);
pmrem.dispose();
reflectionScene.traverse(object=>{if(object.isMesh){object.geometry.dispose();object.material.dispose();}});
const polishedSteel=new THREE.MeshPhysicalMaterial({color:0xe5e9ed,metalness:1,roughness:.38,envMap:steelEnvironment.texture,envMapIntensity:.7,clearcoat:0,clearcoatRoughness:.4});
// A recessed dished end: its centre sits inside the can, above the rolled contact rim.
const baseProfile=[];
for(let i=0;i<=64;i++){const r=.60*i/64;baseProfile.push([r,bottom+.22-.255*(r/.60)**2]);}
baseProfile.push([.609,bottom-.045],[.619,bottom-.054],[.630,bottom-.058],[.641,bottom-.054],[.650,bottom-.044],[.659,bottom-.026],[.665,bottom-.006],[.669,bottom+.025]);
const recessedBase=lathe(baseProfile,polishedSteel);recessedBase.name='Recessed polished stainless steel base';
lathe([[0,top+.08],[.654,top+.08],[.667,top+.095],[.667,top+.88],[.664,top+.915],[.645,top+.95],[.59,top+.974],[.42,top+.991],[0,top+.998]],white);
function ring(y,r,t){const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,12,160),metal);m.rotation.x=Math.PI/2;m.position.y=y;can.add(m)}ring(bottom+.02,.65,.017);ring(bottom+.085,.659,.01);ring(top+.035,.655,.015);
const map=await new THREE.TextureLoader().loadAsync('./assets/label.jpg');map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();
// Crop only the surrounding dimension marks; preserve all printed artwork, including the recycling footer.
map.offset.set(50/1536,12/1024);map.repeat.set(labelWidth/1536,labelHeight/1024);
const label=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,bodyHeight,192,1,true),new THREE.MeshPhysicalMaterial({map,roughness:.48,metalness:.02,clearcoat:.18,clearcoatRoughness:.4}));label.position.y=bodyY;
// Cylinder u=0 faces +Z. Put the centre of the brand panel at the initial camera azimuth.
label.rotation.y=-2*Math.PI*((700-50)/1463);can.add(label);
const plasticBottle=createPlasticBottle(map);plasticBottle.group.visible=false;scene.add(plasticBottle.group);
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const ctx=shadowCanvas.getContext('2d');const grad=ctx.createRadialGradient(128,128,8,128,128,125);grad.addColorStop(0,'rgba(33,48,66,.26)');grad.addColorStop(.45,'rgba(33,48,66,.10)');grad.addColorStop(1,'rgba(33,48,66,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.8,3.8),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=bottom-.065;scene.add(shadow);
let baseDistance=10.2;function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}resize();new ResizeObserver(resize).observe(host);
function view(back=false){controls.target.copy(target);camera.position.set(0,.4,back?-baseDistance:baseDistance);controls.update()}
view();loading.hidden=true;loading.style.display='none';
const rotate=document.querySelector('#rotate');function stop(){controls.autoRotate=false;rotate.setAttribute('aria-pressed','false');updateRotationText()}
function selectProduct(product){
 if(currentProduct===product)return;
 stop();const previousDistance=baseDistance;currentProduct=product;
 const isBottle=product==='bottle';can.visible=!isBottle;plasticBottle.group.visible=isBottle;
 baseDistance=isBottle?12.8:10.2;
 const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(baseDistance/previousDistance);
 offset.setLength(THREE.MathUtils.clamp(offset.length(),controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);
 shadow.position.y=isBottle?plasticBottle.floorY-.01:bottom-.065;
 updateProductText();controls.update();
}
document.querySelector('#product-aerosol').onclick=()=>selectProduct('aerosol');
document.querySelector('#product-bottle').onclick=()=>selectProduct('bottle');
document.querySelector('#sprayer-toggle').onclick=()=>{sprayerEnabled=!sprayerEnabled;plasticBottle.setSprayer(sprayerEnabled);updateProductText();};
document.querySelector('#front').onclick=()=>{stop();view()};document.querySelector('#back').onclick=()=>{stop();view(true)};document.querySelector('#reset').onclick=()=>{stop();view()};
function zoom(f){const d=camera.position.clone().sub(controls.target);d.setLength(THREE.MathUtils.clamp(d.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(d);controls.update()}
document.querySelector('#plus').onclick=()=>zoom(.8);document.querySelector('#minus').onclick=()=>zoom(1.25);rotate.onclick=()=>{controls.autoRotate=!controls.autoRotate;rotate.setAttribute('aria-pressed',String(controls.autoRotate));updateRotationText()};controls.addEventListener('start',stop);
host.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON')return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key)){e.preventDefault();stop();if(e.key==='Home')view();else if(e.key==='+'||e.key==='ArrowUp')zoom(.9);else if(e.key==='-'||e.key==='ArrowDown')zoom(1.1);else {const d=camera.position.clone().sub(controls.target);d.applyAxisAngle(new THREE.Vector3(0,1,0),e.key==='ArrowLeft'?.15:-.15);camera.position.copy(controls.target).add(d);}}});
let last=0;function animate(t){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);if(t-last>150){const a=((THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())%360)+360)%360;currentAngle=a;updateAngle();last=t}}requestAnimationFrame(animate);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();loading.style.display='grid';loadingState='lost';loading.textContent=t(loadingState)});
}catch(e){console.error(e);loadingState='error';loading.textContent=t(loadingState)}
