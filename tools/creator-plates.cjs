'use strict';
const {PNG}=require('pngjs');
const sharp=require('sharp');
const SIZE=256;

const idleShoulders={
  vanguard:[[72,150],[86,137],[90,130],[95,125],[99,122],[107,122],[114,123],[120,126],[141,125],[147,124],[155,128],[163,139],[180,150]],
  arcanist:[[89,142],[101,124],[102,113],[107,108],[114,105],[123,105],[129,107],[139,108],[146,114],[152,128]],
  ranger:[[77,133],[82,123],[90,116],[98,116],[106,113],[112,110],[120,112],[131,114],[140,114],[147,119],[156,127],[163,134]],
};

function edgeHeight(line,x){
  for(let i=1;i<line.length;i++){
    const [a,y]=line[i-1],[b,z]=line[i];
    if(x>=a&&x<=b)return y+(z-y)*(x-a)/(b-a);
  }
  return Infinity;
}

function equipmentAt(cls,pose,x,y,meta){
  if(!meta.fg[y*SIZE+x])return false;
  if(pose==='idle'){
    if(cls==='ranger')return x>=157&&y>=116||x>=151&&y>=151&&y<193;
    if(cls==='arcanist')return x>=154&&y>=82;
    return x<96&&y>158;
  }
  return cls==='vanguard'&&pose==='attack'&&meta.frame===0&&x<88&&y>95&&y<147||
    Math.abs(x-meta.chin[0])>26&&y>=meta.chin[1]-14;
}

function makePlate(original,meta,cls,pose){
  const plate=new PNG({width:SIZE,height:SIZE});
  const depth=new Uint8Array(SIZE*SIZE),pins=new Uint8Array(SIZE*SIZE);
  for(let q=0;q<depth.length;q++){
    const x=q%SIZE,y=q>>8,i=q*4;
    if(!original.data[i+3])continue;
    if(cls==='ranger'&&pose==='cast'&&(meta.frame===1||meta.frame===2)&&x<83&&y>120&&y<144)continue;
    if(cls==='ranger'&&pose==='run'&&meta.frame===3&&x<68&&y<124)continue;
    const shoulder=pose==='idle'&&y>=edgeHeight(idleShoulders[cls],x)&&y<meta.chin[1]+25;
    const quiver=cls==='ranger'&&pose==='run'&&[2,5].includes(meta.frame)&&
      x>=91&&x<=112&&y>=111&&y<=125&&x+(y-111)*.7>=98;
    const string=cls==='ranger'&&pose==='cast'&&meta.frame===3&&y>=65&&y<=108&&
      Math.abs(x-(130.6+(y-93)*.35))<=2;
    if(meta.erase[q]&&!meta.body[q]&&!meta.fg[q]&&!shoulder&&!quiver&&!string)continue;
    original.data.copy(plate.data,i,i,i+4);
    depth[q]=meta.fg[q]||quiver?1:0;
    if(equipmentAt(cls,pose,x,y,meta))pins[q]=1;
    if(cls==='ranger'&&pose!=='climb'&&meta.fg[q]&&x>meta.chin[0]+5){
      const [r,g,b]=original.data.subarray(i,i+3);
      if(r>g*1.13&&g>b*1.18&&b<130)pins[q]=1;
    }
  }
  protectArms(plate,meta,cls,pose,pins);
  return {plate,depth,pins};
}

const idleArms={
  vanguard:[[[91,153],[80,172],[79,178]],[[148,151],[154,167],[164,188]]],
  arcanist:[[[98,137],[88,153],[95,169]],[[154,139],[153,151],[161,151]]],
  ranger:[[[105,138],[98,155],[94,173]],[[147,137],[150,148],[163,167]]],
};

function protectArms(plate,meta,cls,pose,pins){
  for(let q=0;q<pins.length;q++){
    const x=q%SIZE,y=q>>8,i=q*4;
    if(!plate.data[i+3])continue;
    const [r,g,b]=plate.data.subarray(i,i+3);
    const skin=r>175&&g>100&&g<r&&b>90&&b<g;
    // Raised hands are already depth-ordered. Hold the arms as one run of
    // source paint instead of pinning individual bits of skin and glove.
    const idleArm=pose==='idle'&&idleArms[cls].some(line=>line.some(([a,b],j)=>{
      if(!j)return false;
      const [c,d]=line[j-1],dx=a-c,dy=b-d;
      const t=Math.max(0,Math.min(1,((x-c)*dx+(y-d)*dy)/(dx*dx+dy*dy)));
      return Math.hypot(x-c-t*dx,y-d-t*dy)<9;
    }));
    if(idleArm||(pose!=='idle'&&skin&&y>meta.chin[1]+6&&Math.abs(x-meta.chin[0]+12)>18))pins[q]=1;
  }
}

async function neckPaint(meta,cls,pose){
  const {chin,angle,scale}=meta;
  const rear=pose==='climb';
  // Short curved neck and a collar-facing shadow. Its upper end is tucked
  // behind the jaw and its lower edge is covered by the original clothing.
  const shape=rear?'M-13 -13 Q0 -17 13 -13 L12 6 Q0 10 -12 6 Z':
    'M-27 -19 Q-18 -17 -7 -13 L-6 3 Q-8 8 -15 8 Q-23 7 -25 3 Z';
  const x=chin[0],y=chin[1]+(cls==='arcanist'?1:0);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">
      <path d="${shape}" fill="#e7a982" stroke="#38222b" stroke-width="2.2" stroke-linejoin="round"/>
      ${rear?'':'<path d="M-24 -4 Q-17 1 -8 0 L-8 3 Q-15 8 -23 3 Z" fill="#f4bf9e"/>'}
    </g></svg>`;
  return PNG.sync.read(await sharp(Buffer.from(svg)).png().toBuffer());
}

function over(out,q,front,back){
  const i=q*4,a=front.data[i+3]/255,b=back.data[i+3]*(1-a),alpha=a*255+b;
  if(alpha===0)return;
  out.data[i+3]=Math.round(alpha);
  for(let c=0;c<3;c++)out.data[i+c]=Math.round((front.data[i+c]*a*255+back.data[i+c]*b)/alpha);
}

function composeFrame(plate,depth,neck,head){
  const base=new PNG({width:SIZE,height:SIZE});
  const out=new PNG({width:SIZE,height:SIZE});
  for(let q=0;q<depth.length;q++){
    const i=q*4;
    over(base,q,plate,neck);
    // Draw the source only once. An arm, collar, or weapon can occlude the
    // head, but duplicating it over itself fattens its anti-aliased edges.
    if(depth[q]&&head.data[i+3])over(out,q,plate,head);
    else over(out,q,head,base);
  }
  return out;
}

module.exports={makePlate,neckPaint,composeFrame};
