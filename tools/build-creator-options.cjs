'use strict';
// Whole-sprite baker. Source head paint, body paint and foreground equipment
// are tracked independently; a bounding box is never used to cut out a head.
const fs = require('node:fs');
const sharp = require('sharp');
const {PNG} = require('pngjs');
const {femaleBody} = require('./creator-body.cjs');
const ROOT = 'art/creator/compact-options';
const OUT = ROOT + '/v3';
const MASKS_ONLY=process.argv.includes('--masks-only');
const CLASSES = ['vanguard','arcanist','ranger'];
const POSES = ['idle','run','attack','cast','jump','climb'];
const REGIONS = JSON.parse(fs.readFileSync('tools/creator-regions.json','utf8'));
const OLD = JSON.parse(fs.readFileSync(ROOT + '/manifest.json','utf8'));
const N = 256;
function hsl(r,g,b) {
  r/=255;g/=255;b/=255;const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;
  return [d?60*(hi===r?(g-b)/d+(g<b?6:0):hi===g?(b-r)/d+2:(r-g)/d+4):0,d/(1-Math.abs(2*l-1))||0,l];
}
function parts(p, fn, min=4) {
  const w=p.width,h=p.height,eligible=new Uint8Array(w*h),seen=new Uint8Array(w*h),out=[];
  for(let q=0;q<eligible.length;q++)eligible[q]=fn(p.data,q*4,q%w,Math.floor(q/w))?1:0;
  for(let q=0;q<eligible.length;q++)if(eligible[q]&&!seen[q]) {
    const a=[q];seen[q]=1;
    for(let j=0;j<a.length;j++){const v=a[j],x=v%w;for(const t of [x?v-1:-1,x<w-1?v+1:-1,v-w,v+w])if(t>=0&&t<seen.length&&eligible[t]&&!seen[t]){seen[t]=1;a.push(t);}}
    if(a.length>=min)out.push(a);
  }
  return out.sort((a,b)=>b.length-a.length);
}
function box(a,w=N) {let x0=w,y0=1e6,x1=0,y1=0;for(const q of a){x0=Math.min(x0,q%w);x1=Math.max(x1,q%w);y0=Math.min(y0,Math.floor(q/w));y1=Math.max(y1,Math.floor(q/w));}return{x0,y0,x1,y1,cx:(x0+x1)/2,cy:(y0+y1)/2};}
function inside(x,y,a) {let yes=false;for(let i=0,j=a.length-1;i<a.length;j=i++)if((a[i][1]>y)!==(a[j][1]>y)&&x<(a[j][0]-a[i][0])*(y-a[i][1])/(a[j][1]-a[i][1])+a[i][0])yes=!yes;return yes;}
function hull(a,w=N) {
  const p=a.map(q=>[q%w,Math.floor(q/w)]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lo=[],hi=[];
  for(const v of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),v)<=0)lo.pop();lo.push(v);}
  for(const v of p.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),v)<=0)hi.pop();hi.push(v);}
  return lo.slice(0,-1).concat(hi.slice(0,-1));
}
function dilate(mask,r,w=N,h=N) {const out=new Uint8Array(mask.length);for(let q=0;q<mask.length;q++)if(mask[q]){const x=q%w,y=Math.floor(q/w);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r+1&&x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)out[(y+dy)*w+x+dx]=1;}return out;}
function fill(mask,poly,w=N,h=N){const b=poly.reduce((b,p)=>[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])],[w,h,0,0]);for(let y=Math.max(0,Math.floor(b[1]));y<=Math.min(h-1,Math.ceil(b[3]));y++)for(let x=Math.max(0,Math.floor(b[0]));x<=Math.min(w-1,Math.ceil(b[2]));x++)if(inside(x,y,poly))mask[y*w+x]=1;}
function isSkin(d,i) {const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>100&&h>8&&h<36&&l>.58&&s>.2&&d[i+2]/d[i]>.52;}
function isBody(cls,h,s,l) {return s>.25&&l>.24&&(cls==='vanguard'?h>207&&h<240:cls==='arcanist'?(h>250&&h<320)||(h>36&&h<65):h>55&&h<140||(h>32&&h<58&&l>.65));}
function ellipse(mask,cx,cy,rx,ry,w=N,h=N){for(let y=Math.max(0,Math.floor(cy-ry));y<=Math.min(h-1,Math.ceil(cy+ry));y++)for(let x=Math.max(0,Math.floor(cx-rx));x<=Math.min(w-1,Math.ceil(cx+rx));x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)mask[y*w+x]=1;}
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
function sourceData(p,cls,pose,f) {
  const rear=pose==='climb',d=p.data,old=OLD.classes[cls][pose].landmarks[f],skin=parts(p,(d,i,x,y)=>y<190&&isSkin(d,i));
  const expected=[old.chin[0]-7,old.chin[1]-20];
  const candidates=skin.filter(a=>{const b=box(a);return b.x1-b.x0>20&&b.y1-b.y0>14;});
  candidates.sort((a,b)=>{const x=box(a),y=box(b);return Math.hypot(x.cx-expected[0],x.cy-expected[1])-Math.hypot(y.cx-expected[0],y.cy-expected[1]);});
  let fb=candidates.length?box(candidates[0]):{x0:old.chin[0]-40,x1:old.chin[0]+25,y0:old.chin[1]-40,y1:old.chin[1]-3,cx:old.chin[0]-7,cy:old.chin[1]-20};
  if(cls==='vanguard'&&pose==='jump'&&f===1)fb={x0:101,x1:164,y0:73,y1:102,cx:132.5,cy:87.5};
  if(cls==='vanguard'&&pose==='cast'&&f===1)fb={x0:99,x1:151,y0:108,y1:143,cx:125,cy:125.5};
  if(cls==='ranger'&&pose==='cast'&&f===2)fb={x0:106,x1:160,y0:88,y1:117,cx:133,cy:102.5};
  const chin=[old.chin[0],old.chin[1]+4],angle=old.angle,scale=old.scale,erase=new Uint8Array(N*N),fg=new Uint8Array(N*N),cap=new Uint8Array(N*N),faceArea=new Uint8Array(N*N),body=new Uint8Array(N*N);
  if(!rear){
    fill(faceArea,[[fb.x0,fb.y0],[fb.x1,fb.y0],[fb.x1,fb.y1],[fb.x0,fb.y1]]);
    const tail=cls==='ranger'?17:cls==='arcanist'?7:0;
    const left=cls==='arcanist'?fb.x0-70:cls==='ranger'?fb.x0-57:fb.x0-85,right=fb.x1+(cls==='arcanist'?40:25);
    fill(erase,[[left,0],[right,0],[right,fb.y0+12],[fb.x1+4,fb.y1-10],[fb.x1+3,fb.y1],[chin[0]+2,chin[1]+1],[chin[0]-13,chin[1]+1],[fb.x0-4,fb.y1+tail],[cls==='ranger'?fb.x0-40:fb.x0-18,fb.y1+tail],[left,fb.y0+(cls==='vanguard'?20:13)]]);
  }else{
    const anchors={vanguard:[[120,100],[120,105],[131,104],[126.5,103]],arcanist:[[128,124],[127,126],[128,123],[133,120]],ranger:[[119,127],[124,134],[119,127],[122,134]]};chin[0]=anchors[cls][f][0];chin[1]=anchors[cls][f][1];
    const w=cls==='arcanist'?62:58;
    fill(erase,[[chin[0]-w,0],[chin[0]+w,0],[chin[0]+w,chin[1]-20],[chin[0]+25,chin[1]+2],[chin[0]-25,chin[1]+2],[chin[0]-w,chin[1]-20]]);
  }
  for(let q=0;q<cap.length;q++)cap[q]=erase[q]&&!faceArea[q]?1:0;
  const protect=poly=>fill(fg,poly);
  if(cls==='vanguard'){
    // Cape and sword are independent authored foreground regions.
    for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>50&&(h<15||h>340)&&s>.35&&l>.25;}))if(box(a).y1>chin[1]+18){const m=new Uint8Array(N*N);for(const q of a)m[q]=1;const ink=dilate(m,3);for(let q=0;q<fg.length;q++)if(ink[q])fg[q]=1;}
    for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>70&&s<.3&&l>.4;}))if(a.length>100&&box(a).y1-box(a).y0>28){const b=box(a);protect([[b.x0-14,b.y0-14],[b.x1+14,b.y0-14],[b.x1+14,b.y1+14],[b.x0-14,b.y1+14]]);}
    if(pose==='cast'&&f===1){protect([[102,100],[154,100],[158,120],[145,125],[113,122],[102,116]]);protect([[98,116],[114,116],[115,143],[98,143]]);protect([[149,115],[165,115],[165,143],[149,143]]);}
    if(rear)for(const a of parts(p,(d,i,x,y)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>70&&h>210&&h<240&&s>.25&&Math.abs(x-chin[0])>34&&y<chin[1]+10;})){const m=new Uint8Array(N*N);for(const q of a)m[q]=1;const ink=dilate(m,3);for(let q=0;q<fg.length;q++)if(ink[q])fg[q]=1;}
  }
  if(cls==='arcanist'){
    const regions={idle:[[[158,83],[190,83],[190,240],[148,240],[152,126]]],run:[[[195,91],[229,91],[229,132],[190,160],[157,165],[155,144],[185,120],[185,113]]],attack:[[[23,82],[57,82],[65,112],[159,193],[147,206],[52,129],[23,123]],[[163,121],[245,121],[245,163],[164,163]],[[159,117],[255,117],[255,162],[156,162]],[[158,83],[189,83],[189,239],[148,239]]],cast:[[[153,140],[181,140],[181,174],[140,198],[96,239],[84,231],[132,170]],[[147,52],[175,52],[175,81],[169,85],[174,115],[170,138],[147,157],[142,146],[154,127],[156,83],[146,78]],[[120,0],[239,0],[239,84],[180,84],[178,145],[158,148],[160,80],[120,72]],[[139,33],[211,33],[211,86],[175,88],[173,146],[153,152],[155,90],[139,80]]],jump:[[[153,80],[190,80],[190,230],[149,230]],[[170,22],[207,22],[207,158],[163,158]],[[170,58],[211,58],[211,213],[163,213]]],climb:[[[74,97],[111,97],[125,204],[99,204]],[[73,98],[111,98],[124,209],[96,209]],[[70,100],[106,100],[124,211],[97,211]],[[83,94],[119,94],[136,211],[106,211]]]};
    let v=regions[pose];if(pose==='idle'||pose==='run')protect(v[0]);else protect(v[f]);
    // Hands and sleeves raised alongside the head remain in front of the hair.
    if(pose==='jump'&&f>0)protect(f===1?[[46,70],[79,70],[90,101],[65,112],[46,101]]:[[49,94],[79,94],[91,123],[67,133],[48,122]]);
    if(pose==='attack'&&f===2)protect([[84,137],[191,137],[191,160],[82,163]]);
    if(rear){protect([[58,75],[84,75],[104,105],[108,121],[88,133],[62,106]]);if(f>1)protect([[155,68],[183,68],[189,105],[159,125],[150,108]]);}
  }
  if(cls==='ranger'){
    // The complete bow/string/held hand is copied verbatim from the source.
    const right=fb.x1+(pose==='cast'&&f===2?1:3);
    if(!rear){
      if(pose==='cast'&&f===2)protect([[163,42],[188,42],[218,76],[236,127],[204,182],[168,182],[190,129],[182,93],[163,66]]);
      else if(pose==='cast'&&f===3)protect([[119,46],[140,46],[161,76],[181,130],[156,188],[123,188],[147,129],[140,91],[119,65]]);
      else protect([[right,fb.y0-7],[255,fb.y0-7],[255,255],[right,255]]);
    }
    if(!rear){
      // White arrow feathers in the shoulder quiver, distinct from hat feather.
      for(const a of parts(p,(d,i,x,y)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>60&&x>fb.x0-24&&x<fb.x0+18&&y>fb.y1-9&&y<fb.y1+25&&h>25&&h<65&&l>.65;})){const b=box(a);protect([[b.x0-2,b.y0-2],[b.x1+2,b.y0-2],[b.x1+2,b.y1+2],[b.x0-2,b.y1+2]]);}
      if(pose==='attack'&&f===2)protect([[44,110],[82,110],[82,136],[44,136]]);
    }else{
      protect([[chin[0]+27,29],[chin[0]+62,29],[chin[0]+62,153],[chin[0]+18,153],[chin[0]+18,114]]);
      protect([[chin[0]-11,110],[chin[0]+34,106],[chin[0]+34,180],[chin[0]-15,180]]);
      protect([[chin[0]-41,128],[chin[0]-20,128],[chin[0]-16,181],[chin[0]-44,181]]);
    }
  }
  // Preserve connected body paint beneath the new head, including its outline.
  // A robe/shoulder component extends into the body; a hat component does not.
  const bodyPaint=new Uint8Array(N*N);
  for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>60&&isBody(cls,h,s,l);}))if(box(a).y1>chin[1]+18)for(const q of a)bodyPaint[q]=1;
  if(cls==='ranger'&&!rear){
    for(const a of parts(p,(d,i,x,y)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>60&&x>fb.x0-27&&x<fb.x0+18&&y>fb.y1-10&&y<fb.y1+30&&h>25&&h<65&&l>.65;}))for(const q of a)bodyPaint[q]=1;
  }
  for(const a of skin){const b=box(a);if(b.y1>chin[1]+8&&b.y0>fb.y0+12&&!(b.cx>fb.x0&&b.cx<fb.x1&&b.y0<fb.y1))for(const q of a)bodyPaint[q]=1;}
  if(cls==='vanguard')for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>40&&(h<15||h>340)&&s>.3&&l>.2;}))if(box(a).y1>chin[1]+18)for(const q of a)bodyPaint[q]=1;
  if(cls==='arcanist'&&!rear){
    // The isolated shoulder cape is separated from the long robe by gold trim;
    // it must not be rejected merely because that paint component is short.
    const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    for(let q=0;q<bodyPaint.length;q++){const x=q%N-chin[0],y=Math.floor(q/N)-chin[1],u=c*x+s*y,v=-s*x+c*y,i=q*4,[h,ss,l]=hsl(d[i],d[i+1],d[i+2]);if(u>-52&&u<18&&v>=-5&&v<30&&d[i+3]>40&&isBody(cls,h,ss,l)&&!(h>250&&h<310&&l>.64))bodyPaint[q]=1;}
  }
  const bodyEdges=dilate(bodyPaint,3);for(let q=0;q<body.length;q++)body[q]=bodyEdges[q];
  // Remove the bandana tails separately from the long body cape.
  if(cls==='vanguard')for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>50&&(h<15||h>340)&&s>.35&&l>.25;}))if(box(a).y1<chin[1]+18){const m=new Uint8Array(N*N);for(const q of a)m[q]=1;const ink=dilate(m,3);for(let q=0;q<erase.length;q++)if(ink[q]){erase[q]=1;fg[q]=0;body[q]=0;}}
  // Retire all original head paint, including disconnected curls, cap feathers
  // and bandana ink. Whole connected patches distinguish it from long weapons.
  const retired=new Uint8Array(N*N);
  for(const a of parts(p,(d,i,x,y)=>{
    const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(d[i+3]<35||s<.2)return false;
    if(cls==='vanguard')return h>12&&h<42&&d[i]>d[i+1]*1.3&&l>.23;
    if(cls==='arcanist')return h>248&&h<322&&l>.24||h>32&&h<68&&l>.35;
    return h>4&&h<145&&l>.18;
  })){
    const b=box(a);let select=false;
    if(cls==='vanguard')select=b.y0<fb.y0-8&&b.y1<chin[1]+6;
    else if(cls==='arcanist'){
      const i=a[Math.floor(a.length/2)]*4,h=hsl(d[i],d[i+1],d[i+2])[0];let n=0;for(const q of a)if(fg[q])n++;
      select=b.y1<chin[1]+7&&b.y0<(rear?chin[1]-20:fb.y0+16)&&Math.abs(b.cx-chin[0])<130&&(h>240?(!rear||b.y0<chin[1]-35||Math.abs(b.cx-chin[0])<28):(rear?b.y1<chin[1]-15:b.x0<fb.x1-4&&n/a.length<.65));
    }else select=b.y0<(rear?chin[1]-30:fb.y0+7)&&b.y1<chin[1]+18&&Math.abs(b.cx-chin[0])<95&&(rear?b.cx<chin[0]+36:b.cx<fb.x1-2);
    if(select)for(const q of a)retired[q]=1;
  }
  const retiredInk=dilate(retired,4);
  for(let q=0;q<erase.length;q++)if(retiredInk[q]){erase[q]=1;fg[q]=0;body[q]=0;}
  if(!rear){
    const faceInk=dilate(faceArea,2);
    for(let q=0;q<fg.length;q++)if(faceInk[q]){
      const x=q%N,y=Math.floor(q/N);
      if(!(cls==='vanguard'&&pose==='cast'&&f===1&&(y<123||x<115||x>152)))fg[q]=0;
    }
  }
  if(!rear){
    for(const a of skin){const b=box(a);if(b.y0>=fb.y1-3&&b.y1>=fb.y1&&b.y1<chin[1]+10&&b.x1-b.x0<35&&Math.abs(b.cx-(chin[0]-12))<18)for(const q of a)body[q]=1;}
    if(cls==='vanguard'){
      const offset={idle:[10],run:[-5,-5,-5,-5,-5,-5],attack:[10,0,-28,14],cast:[15,15,-20,-12],jump:[1,13,-14]}[pose][f];
      for(let q=0;q<body.length;q++){const x=q%N,y=Math.floor(q/N);if(x<fb.x0-7&&y>=fb.y1+offset)body[q]=1;}
      const tails=new Uint8Array(N*N);for(let q=0;q<tails.length;q++){const i=q*4,x=q%N,y=Math.floor(q/N),[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(x<fb.x0-7&&y<fb.y1+offset&&d[i+3]>10&&(h<16||h>339)&&s>.25)tails[q]=1;}
      const ink=dilate(tails,4);for(let q=0;q<ink.length;q++)if(ink[q]&&Math.floor(q/N)<fb.y1+offset){const i=q*4,[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(fg[q]&&((h>38&&h<68&&s>.3)||(h>207&&h<245&&s>.3)||(s<.25&&l>.35)))continue;erase[q]=1;body[q]=0;fg[q]=0;}

    }
    if(cls==='arcanist'&&pose==='cast')for(let q=0;q<erase.length;q++){const x=q%N,y=Math.floor(q/N);if(x<fb.x0-4&&y>fb.y1-8&&y<chin[1]+4&&!body[q]){erase[q]=1;fg[q]=0;}}
    for(let q=0;q<erase.length;q++)if(q%N<fb.x1+12&&Math.floor(q/N)<fb.y0-10&&!fg[q])erase[q]=1;
  }
  // Final bow guard: connected wood extends far below the jaw, unlike hair.
  // Keep its original outline above the head too, including raised bow tips.
  if(cls==='ranger'&&!rear)for(const a of parts(p,(d,i)=>d[i+3]>100&&d[i]>d[i+1]*1.15&&d[i+1]>d[i+2]*1.2&&d[i]>80&&d[i]<240&&d[i+1]>40&&d[i+1]<190&&d[i+2]<130)){
    const b=box(a);if(a.length>20&&b.y1-b.y0>35&&b.cx>chin[0]+18){const wood=new Uint8Array(N*N);for(const q of a)wood[q]=1;const outline=dilate(wood,2);for(let q=0;q<fg.length;q++)if(outline[q])fg[q]=1;}
  }
  if(cls==='ranger'&&!rear)for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>60&&h>5&&h<38&&s>.25&&l>.17&&l<.63;})){
    const b=box(a);if(b.y0>fb.y1-6&&b.y1>chin[1]+7){const glove=new Uint8Array(N*N);for(const q of a)glove[q]=1;const ink=dilate(glove,2);for(let q=0;q<fg.length;q++)if(ink[q])fg[q]=1;}
  }
  if(cls==='vanguard'&&pose==='attack'&&f===0){
    const grip=new Uint8Array(N*N);
    for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>40&&h>22&&h<68&&s>.25;})){
      const b=box(a);if(b.x0>=36&&b.x1<=87&&b.y0>=96&&b.y1<=145)for(const q of a)grip[q]=1;
    }
    for(let y=96;y<=145;y++)for(let x=36;x<=87;x++){const i=(y*N+x)*4,[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(d[i+3]>40&&h>207&&h<245&&s>.04)grip[y*N+x]=1;}
    const ink=dilate(grip,3);for(let q=0;q<fg.length;q++)if(ink[q]){const i=q*4,[h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(grip[q]||(d[i]<95&&d[i+1]<95&&d[i+2]<110)||(h>207&&h<245&&s>.12))fg[q]=1;}
  }
  if(cls==='vanguard')for(const a of parts(p,(d,i)=>{const[h,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>70&&s<.3&&l>.4;})){
    const b=box(a);if(a.length>100&&b.y1-b.y0>28){const blade=new Uint8Array(N*N);fill(blade,hull(a));const ink=dilate(blade,2);for(let q=0;q<fg.length;q++)if(ink[q])fg[q]=1;}
  }
  // Head retirement must never shave the source outfit's upper contour.
  // Restore connected clothing paint and its ink after the head-only cuts.
  for(let q=0;q<body.length;q++){
    const i=q*4,[h,s,l]=hsl(d[i],d[i+1],d[i+2]),a=angle*Math.PI/180,v=-Math.sin(a)*(q%N-chin[0])+Math.cos(a)*(Math.floor(q/N)-chin[1]);
    if((bodyPaint[q]&&isBody(cls,h,s,l))||(bodyEdges[q]&&l<.2&&Math.floor(q/N)>chin[1]-6&&!faceArea[q])){body[q]=1;if(v<18)fg[q]=1;retired[q]=0;}
  }
  if(!rear){
    // Reuse the original painted short neck, including its original edge ink.
    // It sits behind the replacement face; no synthetic neck shape is added.
    const neck=new Uint8Array(N*N),rad=angle*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad);
    for(let q=0;q<neck.length;q++){const x=q%N-chin[0],y=Math.floor(q/N)-chin[1],u=c*x+s*y,v=-s*x+c*y;if(u>=-17&&u<=-2&&v>=-10&&v<=5&&isSkin(d,q*4))neck[q]=1;}
    const edge=dilate(neck,1);for(let q=0;q<neck.length;q++)if(neck[q]||(edge[q]&&d[q*4]<100&&d[q*4+1]<100&&d[q*4+2]<110)){body[q]=1;fg[q]=0;}
  }
  // Keep the Ranger's complete holding sleeve/hand silhouette stationary.
  if(cls==='ranger'&&pose==='idle')for(let y=119;y<210;y++)for(let x=151;x<189;x++)fg[y*N+x]=1;
  // Foreground silhouettes are copied exactly; face pixels are never restored.
  return {chin,angle:rear?0:angle,scale:rear?1:scale,face:fb,raw:erase,erase,fg,body,cap,faceArea,rear,retired};
}
function headSemantic(p,style,rear,gender,faceIndex) {
  const w=p.width,h=p.height,r=(gender==='female'?REGIONS.female:REGIONS.heads)[style-1],sx=w/r.size[0],sy=h/r.size[1],face=r.face.map(([x,y])=>[x*sx,y*sy]),mask=new Uint8Array(w*h),faceRegion=new Uint8Array(w*h),eyes=(r.eyesByFace?.[faceIndex-1]||r.eyes).map(e=>[e[0]*sx,e[1]*sy,e[2]*sx,e[3]*sy]);
  if(!rear){fill(faceRegion,face,w,h);for(const e of r.ears)ellipse(faceRegion,e[0]*sx,e[1]*sy,e[2]*sx,e[3]*sy,w,h);}
  if(!rear){
    // Include each identity's actual cheek contour and enclosed freckles/marks.
    // Flooding enclosed skin holes keeps the concave fringe outside the face.
    const skinParts=parts(p,(d,i)=>{const[hu,s,l]=hsl(d[i],d[i+1],d[i+2]);return d[i+3]>30&&hu>8&&hu<40&&s>.18&&l>.58&&d[i+2]/d[i]>.46;}),paint=new Uint8Array(w*h);
    for(const a of skinParts){const b=box(a,w);if(a===skinParts[0]||r.ears.some(e=>((b.cx-e[0]*sx)/(e[2]*sx))**2+((b.cy-e[1]*sy)/(e[3]*sy))**2<1))for(const q of a)paint[q]=1;}
    const outside=new Uint8Array(w*h),queue=[];
    const seed=q=>{if(!paint[q]&&!outside[q]){outside[q]=1;queue.push(q);}};
    for(let x=0;x<w;x++){seed(x);seed((h-1)*w+x);}for(let y=0;y<h;y++){seed(y*w);seed(y*w+w-1);}
    for(let j=0;j<queue.length;j++){const q=queue[j],x=q%w;for(const n of [x?q-1:-1,x<w-1?q+1:-1,q-w,q+w])if(n>=0&&n<paint.length)seed(n);}
    for(let q=0;q<paint.length;q++)if(!outside[q])paint[q]=1;
    const edge=dilate(paint,1,w,h);for(let q=0;q<faceRegion.length;q++)if(edge[q])faceRegion[q]=1;
  }
  for(let q=0;q<mask.length;q++){
    const i=q*4,d=p.data;if(d[i+3]<20)continue;const x=q%w,y=Math.floor(q/w),[hue,s,l]=hsl(d[i],d[i+1],d[i+2]);let kind=255;
    if(!rear&&eyes.some(e=>((x-e[0])/e[2])**2+((y-e[1])/e[3])**2<=1)&&hue>5&&hue<55&&s>.25&&l>.13&&l<.7&&d[i+1]/d[i]<.85&&d[i+2]/d[i]<.72)kind=3;
    else if(!rear&&faceRegion[q]){if(hue>5&&hue<45&&s>.18&&l>.4&&d[i]>d[i+1]&&d[i+1]>d[i+2])kind=1;}
    else if(hue>3&&hue<40&&s>.25&&l>.19&&l<.68)kind=2;
    mask[q]=kind;
  }
  // The jaw anchor is the actual outline, not a thresholded skin pixel. Hair
  // tips outside the centre jaw range cannot move the chin attachment point.
  let ay=h-1,ax=w/2;
  if(!rear){let maxY=0,points=[];for(let y=Math.floor(h*.75);y<h;y++)for(let x=Math.floor(w*.48);x<Math.ceil(w*.8);x++)if(p.data[(y*w+x)*4+3]>100){if(y>maxY){maxY=y;points=[];}if(y>=maxY)points.push(x);}const low=[];for(let y=maxY-1;y<=maxY;y++)for(let x=Math.floor(w*.48);x<Math.ceil(w*.8);x++)if(p.data[(y*w+x)*4+3]>100)low.push(x);ay=maxY+1;ax=low.reduce((a,b)=>a+b,0)/low.length;}
  return {mask,faceRegion,anchor:[ax,ay],eyes};
}
async function prepareHeads(gender) {
  const input=ROOT+(gender==='female'?'/heads-female-distinct-source.png':'/heads-male-masculine-source.png'),m=await sharp(input).metadata(),out=[];
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    const left=Math.round(col*m.width/3),top=Math.round(row*m.height/4),width=Math.round((col+1)*m.width/3)-left,height=Math.round((row+1)*m.height/4)-top;
    const cell=PNG.sync.read(await sharp(input).extract({left,top,width,height}).png().toBuffer()),points=[];
    for(let q=0;q<cell.width*cell.height;q++)if(cell.data[q*4+3]>40)points.push(q);const b=box(points,cell.width),buffer=await sharp(PNG.sync.write(cell)).extract({left:b.x0,top:b.y0,width:b.x1-b.x0+1,height:b.y1-b.y0+1}).png().toBuffer(),p=PNG.sync.read(buffer),style=row<3?row+1:col+1;
    const semantic=headSemantic(p,style,row===3,gender,col+1);out.push({p,buffer,...semantic});
    await sharp(buffer).png().toFile(`${OUT}/head-${gender}-${row<3?style+'-'+(col+1):'rear-'+style}.png`);
    const labels=new PNG({width:p.width,height:p.height});for(let q=0;q<semantic.mask.length;q++)if(semantic.mask[q]){labels.data[q*4]=semantic.mask[q];labels.data[q*4+3]=255;}
    await sharp(PNG.sync.write(labels)).png().toFile(`${OUT}/head-${gender}-${row<3?style+'-'+(col+1):'rear-'+style}-mask.png`);
  }return out;
}
function originalLabels(p,cls,meta){
  const mask=new Uint8Array(N*N),d=p.data,fb=meta.face;
  for(let q=0;q<mask.length;q++){const i=q*4;if(d[i+3]<10)continue;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);if(l<.17||s<.15)continue;
    if(isSkin(d,i)||(!meta.rear&&meta.faceArea[q]&&h>5&&h<40&&l>.48))mask[q]=1;
    else if(s>.25&&l>.24&&(cls==='vanguard'?h>207&&h<240:cls==='arcanist'?h>250&&h<320:h>65&&h<140))mask[q]=4;
    if(meta.retired[q]&&!meta.fg[q]&&!meta.faceArea[q]&&l>.2){if(cls==='vanguard'&&h>15&&h<42&&d[i]>d[i+1]*1.32)mask[q]=2;else if(cls==='arcanist'&&h>250&&h<300&&l>.57&&Math.floor(q/N)>(meta.rear?meta.chin[1]-35:fb.y0-19))mask[q]=2;else if(cls==='ranger'&&h>5&&h<38&&l<.65)mask[q]=2;}
  }
  if(!meta.rear){
    const w=fb.x1-fb.x0,h=fb.y1-fb.y0,e=cls==='arcanist'?[[.68,.44,.09,.25],[.93,.39,.07,.23]]:cls==='vanguard'?[[.58,.55,.085,.25],[.86,.52,.065,.23]]:[[.57,.55,.085,.25],[.9,.48,.065,.23]];
    for(const a of e){const eye=new Uint8Array(N*N);ellipse(eye,fb.x0+a[0]*w,fb.y0+a[1]*h,a[2]*w,a[3]*h);for(let q=0;q<eye.length;q++)if(eye[q]){const i=q*4,[hue,s,l]=hsl(d[i],d[i+1],d[i+2]);if(d[i+3]>80&&s>.25&&l>.13&&l<.74&&(cls==='arcanist'?hue>240&&hue<310:hue>5&&hue<55))mask[q]=3;}}
  }
  // Foreground hands and equipment can pass through the original eye bounds
  // during attacks. They retain skin/gear paint rather than inheriting iris dye.
  for(let q=0;q<mask.length;q++)if(meta.fg[q]&&mask[q]===3)mask[q]=isSkin(d,q*4)?1:0;
  return mask;
}
function frame(p,f){const out=new PNG({width:N,height:N});PNG.bitblt(p,out,f*N,0,N,N,0,0);return out;}
function maskPNG(labels,width,height){const out=new PNG({width,height});for(let q=0;q<labels.length;q++)if(labels[q]){out.data[q*4]=labels[q];out.data[q*4+3]=255;}return PNG.sync.write(out);}
async function writeSheet(path,buffer){
  // Publish complete PNGs atomically while the local game is reading assets.
  const encoded=await sharp(buffer).png({compressionLevel:6}).toBuffer(),temp=path+'.tmp';
  fs.writeFileSync(temp,encoded);fs.renameSync(temp,path);
}
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});const heads={male:await prepareHeads('male'),female:await prepareHeads('female')};if(process.argv.includes('--heads-only'))return;
  const oldManifest=fs.existsSync(OUT+'/manifest.json')?JSON.parse(fs.readFileSync(OUT+'/manifest.json','utf8')):null;
  const manifest={version:3,genders:['male','female'],faces:['Steady','Rugged','Keen'],hairstyles:['Close crop','Short side part','Short spikes'],featuresByGender:{male:{faces:['Steady','Rugged','Keen'],hairstyles:['Close crop','Short side part','Short spikes']},female:{faces:['Freckled','Angular','Heart'],hairstyles:['Feathered pixie','Twin buns','Crown braid']}},classes:oldManifest?.classes?structuredClone(oldManifest.classes):{}};
  const only=process.argv.find(a=>a.startsWith('--class='))?.split('=')[1],onlyPose=process.argv.find(a=>a.startsWith('--pose='))?.split('=')[1],onlyGender=process.argv.find(a=>a.startsWith('--gender='))?.split('=')[1];
  if(onlyGender&&!manifest.genders.includes(onlyGender))throw Error('Unknown gender: '+onlyGender);
  if(only&&!CLASSES.includes(only))throw Error('Unknown class: '+only);
  if(onlyPose&&!POSES.includes(onlyPose))throw Error('Unknown pose: '+onlyPose);
  for(const cls of CLASSES){if(only&&cls!==only)continue;if(!onlyPose||!manifest.classes[cls])manifest.classes[cls]={};for(const pose of POSES){if(onlyPose&&pose!==onlyPose)continue;
    const original=PNG.sync.read(fs.readFileSync(`art/${cls}-compact-${pose}.png`)),count=original.width/N,src=[],base=[],foreground=[],meta=[],baseLabels=[],baseMask=new Uint8Array(original.width*N);
    for(let f=0;f<count;f++){
      const p=frame(original,f),m=sourceData(p,cls,pose,f),b=PNG.sync.read(PNG.sync.write(p)),fg=new PNG({width:N,height:N});meta.push(m);src.push(p);
      for(let q=0;q<N*N;q++){if(m.erase[q])b.data[q*4+3]=0;if(m.fg[q]||!m.erase[q])p.data.copy(fg.data,q*4,q*4,q*4+4);}
      // Body paint accidentally touched by an ink expansion is restored before
      // the new face; equipment/quiver is restored again as the foreground.
      for(let q=0;q<N*N;q++)if(m.body[q])p.data.copy(b.data,q*4,q*4,q*4+4);
      base.push(PNG.sync.write(b));foreground.push(PNG.sync.write(fg));baseLabels.push(originalLabels(p,cls,m));
      for(let q=0;q<N*N;q++)baseMask[Math.floor(q/N)*original.width+f*N+q%N]=baseLabels[f][q];
    }
    await sharp(maskPNG(baseMask,original.width,N)).png().toFile(`${OUT}/base-${cls}-${pose}-mask.png`);
    manifest.classes[cls][pose]={frames:count,landmarks:meta.map(m=>({chin:m.chin,angle:m.angle,scale:m.scale,face:m.face})),coverage:onlyGender?{...oldManifest?.classes?.[cls]?.[pose]?.coverage}:{}};
    const female=src.map((p,f)=>femaleBody(p,meta[f],pose,cls)),femaleBase=[],femaleForeground=[],femaleLabels=[];
    for(let f=0;f<count;f++){
      const p=female[f],m=meta[f],b=PNG.sync.read(PNG.sync.write(p)),fg=new PNG({width:N,height:N});
      for(let q=0;q<N*N;q++){if(m.erase[q])b.data[q*4+3]=0;if(m.fg[q]||!m.erase[q])p.data.copy(fg.data,q*4,q*4,q*4+4);}
      for(let q=0;q<N*N;q++)if(m.body[q])p.data.copy(b.data,q*4,q*4,q*4+4);
      femaleBase.push(PNG.sync.write(b));femaleForeground.push(PNG.sync.write(fg));femaleLabels.push(originalLabels(p,cls,m));
    }
    for(const gender of manifest.genders)for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
      if(onlyGender&&gender!==onlyGender)continue;
      if(process.argv.includes('--sample')&&(hair!==1||face!==1))continue;
      const key=`${cls}-${gender}-${hair}-${face}-${pose}`,existing=MASKS_ONLY?PNG.sync.read(fs.readFileSync(`${OUT}/${key}.png`)):null;
      const out=new PNG({width:original.width,height:N}),labels=new Uint8Array(original.width*N),coverage={hair:0,skin:0,iris:0};
      for(let f=0;f<count;f++){
        const m=meta[f],head=heads[gender][pose==='climb'?9+hair-1:(hair-1)*3+face-1];
        let height=(pose==='climb'?{vanguard:90,arcanist:94,ranger:101}:{vanguard:110,arcanist:95,ranger:101})[cls]*m.scale;
        height=Math.min(height,m.chin[1]-5);const scale=height/head.p.height,rad=m.angle*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad),uri=head.buffer.toString('base64');
        // Match the original short-neck attachment; the original neck and
        // shoulder contours are preserved behind this whole replacement head.
        const joinY=m.chin[1]-(pose==='climb'?0:4)*m.scale;
        const svg=Buffer.from(`<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg"><g transform="translate(${m.chin[0]} ${joinY}) rotate(${m.angle}) scale(${scale})"><image href="data:image/png;base64,${uri}" x="${-head.anchor[0]}" y="${-head.anchor[1]}" width="${head.p.width}" height="${head.p.height}"/></g></svg>`),headLayer=await sharp(svg).png().toBuffer(),hp=PNG.sync.read(headLayer);
        const bodyBase=gender==='female'?femaleBase:base,bodyForeground=gender==='female'?femaleForeground:foreground,bodySource=gender==='female'?female:src,bodyLabels=gender==='female'?femaleLabels:baseLabels;
        const fp=existing?frame(existing,f):PNG.sync.read(await sharp(bodyBase[f]).composite([{input:headLayer},{input:bodyForeground[f]}]).png().toBuffer());
        for(const a of parts(fp,(d,i,x,y)=>d[i+3]>8,1)){const b=box(a);if(a.length<24&&b.x1<m.face.x1+5&&b.y1<m.chin[1]+5&&!a.some(q=>m.fg[q]))for(const q of a)fp.data[q*4+3]=0;}
        PNG.bitblt(fp,out,0,0,N,N,f*N,0);
        for(let q=0;q<N*N;q++){
          const i=q*4,x=q%N,y=Math.floor(q/N),global=y*original.width+f*N+x;if(!fp.data[i+3])continue;
          const originalVisible=(m.fg[q]||!m.erase[q]||m.body[q]&&hp.data[i+3]<30)&&bodySource[f].data[i+3]>20;
          if(originalVisible){labels[global]=bodyLabels[f][q]||255;continue;}
          if(hp.data[i+3]>30){const dx=(x-m.chin[0])/scale,dy=(y-joinY)/scale,sx=Math.round(cos*dx+sin*dy+head.anchor[0]),sy=Math.round(-sin*dx+cos*dy+head.anchor[1]);if(sx>=0&&sx<head.p.width&&sy>=0&&sy<head.p.height){const kind=head.mask[sy*head.p.width+sx];labels[global]=kind||255;if(kind===1)coverage.skin++;if(kind===2)coverage.hair++;if(kind===3)coverage.iris++;}}
        }
      }
      if(!MASKS_ONLY)await writeSheet(`${OUT}/${key}.png`,PNG.sync.write(out));
      await writeSheet(`${OUT}/${key}-mask.png`,maskPNG(labels,original.width,N));
      manifest.classes[cls][pose].coverage[`${gender}-${hair}-${face}`]=coverage;
    }
    console.log('Built',cls,pose,count,'frames for',onlyGender||'both genders');
  }}fs.writeFileSync(OUT+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;});
