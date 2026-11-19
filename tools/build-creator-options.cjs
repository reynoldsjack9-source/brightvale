'use strict';
// Bake finished face/hair drawings into complete compact animation sheets.
// No runtime head rig, no body rescaling, and no changes to original hero PNGs.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp'),{PNG}=require('pngjs');
const DIR='art/creator/compact-options',CLASSES=['vanguard','arcanist','ranger'],POSES=['idle','run','attack','cast','jump','climb'];
const hsl=(r,g,b)=>{r/=255;g/=255;b/=255;const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;return[d?60*(hi===r?(g-b)/d+(g<b?6:0):hi===g?(b-r)/d+2:(r-g)/d+4):0,d/(1-Math.abs(2*l-1))||0,l];};
function skin(d,i){const r=d[i],g=d[i+1],b=d[i+2];return d[i+3]>100&&r>190&&g>125&&b>90&&r>g&&g>b&&g/r>.65&&b/r>.52&&b/r<.87&&(g-b)/(r-b)<.62;}
function components(p,predicate){const w=p.width,h=p.height,good=new Uint8Array(w*h),seen=new Uint8Array(w*h),parts=[];for(let i=0;i<good.length;i++)good[i]=predicate(p.data,i*4,i%w,Math.floor(i/w))?1:0;for(let i=0;i<good.length;i++)if(good[i]&&!seen[i]){const pts=[i];seen[i]=1;for(let j=0;j<pts.length;j++){const q=pts[j],x=q%w;for(const n of [x?q-1:-1,x<w-1?q+1:-1,q-w,q+w])if(n>=0&&n<good.length&&good[n]&&!seen[n]){seen[n]=1;pts.push(n);}}if(pts.length>3)parts.push(pts);}return parts.sort((a,b)=>b.length-a.length);}
const bounds=(pts,w)=>{let x0=w,y0=1e6,x1=0,y1=0;for(const p of pts){const x=p%w,y=Math.floor(p/w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return{x0,y0,x1,y1};};
function hull(points){points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lo=[],hi=[];for(const p of points){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of points.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
function inside(x,y,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
const framePNG=(p,f)=>{const out=new PNG({width:256,height:256});PNG.bitblt(p,out,f*256,0,256,256,0,0);return out;};
function landmarks(p,cls,pose,frame){
  const rear=pose==='climb',parts=components(p,(d,i,x,y)=>y<190&&skin(d,i)),face=parts[0],fb=face?bounds(face,256):null;
  let chin,angle=0,scale,points=[];
  if(!rear){
    if(!face||face.length<200)throw Error(`Face missing: ${cls}/${pose}/${frame}`);
    const low=face.filter(q=>Math.floor(q/256)>=fb.y1-2);chin=[low.reduce((s,q)=>s+q%256,0)/low.length,fb.y1+3];
    const whites=components(p,(d,i,x,y)=>x>fb.x0&&x<fb.x1&&y>fb.y0&&y<fb.y1-5&&d[i]>215&&d[i+1]>215&&d[i+2]>215&&d[i+3]>120).filter(a=>a.length>7).slice(0,2);
    if(whites.length===2){const centers=whites.map(a=>[a.reduce((s,q)=>s+q%256,0)/a.length,a.reduce((s,q)=>s+Math.floor(q/256),0)/a.length]).sort((a,b)=>a[0]-b[0]);angle=Math.atan2(centers[1][1]-centers[0][1],centers[1][0]-centers[0][0])*180/Math.PI-3;angle=Math.max(-18,Math.min(20,angle));}
    const idleWidth={vanguard:76,arcanist:55,ranger:60}[cls];scale=(fb.x1-fb.x0)/idleWidth;
    // Raised weapons can occlude part of a face: use nearby intact frame scale.
    if(cls==='vanguard'&&pose==='cast')scale=[.84,.84,.79,.80][frame];
    if(cls==='ranger'&&pose==='cast'){scale=.90;angle=0;}
    scale=Math.max(.72,Math.min(1.15,scale));
    for(let y=0;y<=Math.min(230,chin[1]+8);y++)for(let x=0;x<256;x++){
      const i=(y*256+x)*4,d=p.data;if(d[i+3]<80)continue;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);
      if(x<fb.x0-65||x>fb.x1+38)continue;
      const head=cls==='vanguard'?((h>15&&h<42&&d[i]>d[i+1]*1.32&&l>.32)||(h<10&&s>.45&&x<fb.x0+7&&y<chin[1]+5)):
        cls==='arcanist'?(h>260&&h<315&&s>.25&&y<chin[1]-1):
        ((h>5&&h<38&&l>.22&&l<.65)||(h>55&&h<130&&s>.3&&y<chin[1]-2)||(h>30&&h<55&&l>.65&&y<fb.y0));
      if(head||face.includes(y*256+x))points.push([x,y]);
    }
    // Include the complete face silhouette; chin stays on the original collar.
    for(const q of face)points.push([q%256,Math.floor(q/256)]);
  }else{
    const cutoff={vanguard:99,arcanist:123,ranger:128}[cls],hair=components(p,(d,i,x,y)=>{if(y>cutoff||d[i+3]<100)return false;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);return cls==='vanguard'?h>15&&h<42&&d[i]>d[i+1]*1.32&&l>.32:cls==='arcanist'?h>260&&h<315&&s>.25:h>5&&h<135&&s>.25&&l>.2&&x<165;})[0];
    const hb=bounds(hair,256);chin=[(hb.x0+hb.x1)/2,{vanguard:98,arcanist:124,ranger:126}[cls]];
    if(cls==='vanguard'){chin[1]=hb.y1+15;scale=(hb.x1-hb.x0)/105;}
    else if(cls==='arcanist'){chin[1]=hb.y1+2;scale=(hb.x1-hb.x0)/93;}
    else{chin[1]=hb.y1-1;scale=(hb.x1-hb.x0)/80;}
    scale=Math.max(.8,Math.min(1.15,scale));for(const q of hair)points.push([q%256,Math.floor(q/256)]);
    // Headgear belongs to the old hairstyle; include its full outline/feather.
    for(let y=0;y<chin[1];y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;if(p.data[i+3]<100)continue;const [h,s,l]=hsl(...p.data.subarray(i,i+3));if(cls==='vanguard'&&h<10&&s>.4&&x>hb.x0&&x<hb.x1)points.push([x,y]);if(cls==='arcanist'&&x>hb.x0-4&&x<hb.x1+10&&y>hb.y0&&y<hb.y1)points.push([x,y]);if(cls==='ranger'&&x>hb.x0-5&&x<hb.x1+5&&y<hb.y1)points.push([x,y]);}
  }
  if(rear){
    const anchors={vanguard:[[120,95],[120,100],[131,99],[126.5,98]],arcanist:[[128,122],[127,124],[128,120],[133,117]],ranger:[[119,123],[124,130],[119,123],[122,130]]};
    chin=anchors[cls][frame];scale=1;points=[];
    const range=cls==='ranger'?[55,180]:cls==='arcanist'?[75,185]:[50,190];
    for(let y=0;y<=chin[1]+2;y++)for(let x=range[0];x<=range[1];x++)if(p.data[(y*256+x)*4+3]>0)points.push([x,y]);
  }
  // Cover the full old head silhouette, including antialiased hair tips,
  // accessories and ink. Foreground equipment is restored separately below.
  if(!rear){points=[];for(let y=0;y<=chin[1]+2;y++)for(let x=Math.max(0,fb.x0-75);x<=Math.min(255,fb.x1+45);x++)if(p.data[(y*256+x)*4+3]>0)points.push([x,y]);}
  else {const xs=points.map(p=>p[0]),x0=Math.max(0,Math.min(...xs)-18),x1=Math.min(255,Math.max(...xs)+18);points=[];for(let y=0;y<chin[1]+2;y++)for(let x=x0;x<=x1;x++)if(p.data[(y*256+x)*4+3]>0)points.push([x,y]);}
  let poly=hull(points),center=poly.reduce((s,p)=>[s[0]+p[0]/poly.length,s[1]+p[1]/poly.length],[0,0]);poly=poly.map(([x,y])=>[x+(x<center[0]?-3:3),y+(y<center[1]?-3:2)]);
  const accessories=new Set();
  if(cls==='vanguard'&&!rear)for(const part of components(p,(d,i)=>{if(d[i+3]<100)return false;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);return (h<12||h>345)&&s>.4&&l>.28;})){const b=bounds(part,256);if(b.y0<fb.y0+35&&b.y1<chin[1]+8&&b.x1<fb.x0+12)for(const q of part){const x=q%256,y=Math.floor(q/256);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<256&&y+dy>=0&&y+dy<256)accessories.add((y+dy)*256+x+dx);}}
  if(cls==='arcanist'&&!rear)for(const part of components(p,(d,i)=>{if(d[i+3]<100)return false;const [h,s]=hsl(d[i],d[i+1],d[i+2]);return h>250&&h<320&&s>.25;})){
    const b=bounds(part,256);if(b.y0<fb.y0+4&&b.y1<chin[1]+25&&(b.x0+b.x1)/2<fb.x1-5)for(const q of part){const x=q%256,y=Math.floor(q/256);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<256&&y+dy>=0&&y+dy<256)accessories.add((y+dy)*256+x+dx);}
  }
  const weaponPixels=new Set();
  if(cls==='arcanist'&&pose==='cast')for(const part of components(p,(d,i)=>{if(d[i+3]<140)return false;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);return (h>20&&h<70&&s>.25&&l>.28)||(s<.25&&l>.8);})){if(part.some(q=>{const x=q%256,y=Math.floor(q/256);return frame===0?x>156&&y>150&&y<168:x>150&&y<68;}))for(const q of part)weaponPixels.add(q);}
  if(cls==='arcanist'&&!rear){
    const faceCenter=(fb.x0+fb.x1)/2;
    for(const part of components(p,(d,i)=>{if(d[i+3]<150)return false;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);return h>30&&h<65&&s>.3&&l>.35;})){
      const b=bounds(part,256),w=b.x1-b.x0+1,h=b.y1-b.y0+1,cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;
      if(w>6&&h>6&&w/h>.5&&w/h<1.8&&cx>faceCenter+18&&cy<chin[1]+12)for(let y=Math.max(0,b.y0-3);y<=Math.min(255,b.y1+3);y++)for(let x=Math.max(0,b.x0-3);x<=Math.min(255,b.x1+3);x++)if(((x-cx)/(w/2+3))**2+((y-cy)/(h/2+3))**2<=1)weaponPixels.add(y*256+x);
    }
    for(const part of components(p,(d,i)=>{if(d[i+3]<150)return false;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);return h>10&&h<35&&s>.3&&l>.25&&l<.6;})){
      const b=bounds(part,256);if(b.y1-b.y0>18&&b.x1-b.x0<25&&(b.x0+b.x1)/2>faceCenter+22)for(const q of part)weaponPixels.add(q);
    }
  }
  return{accessories,weaponPixels,chin,angle,scale,poly,frame,face:rear?null:fb,facePoints:rear?[]:face,skinParts:parts};
}
async function prepareHeads(){
  const source=await sharp(`${DIR}/heads-source.png`).metadata(),heads=[];
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    const x0=Math.round(col*source.width/3),x1=Math.round((col+1)*source.width/3),y0=Math.round(row*source.height/4),y1=Math.round((row+1)*source.height/4);
    const png=PNG.sync.read(await sharp(`${DIR}/heads-source.png`).extract({left:x0,top:y0,width:x1-x0,height:y1-y0}).png().toBuffer()),pts=[];
    for(let q=0;q<png.width*png.height;q++)if(png.data[q*4+3]>60)pts.push(q);const b=bounds(pts,png.width);
    const crop=await sharp(PNG.sync.write(png)).extract({left:b.x0,top:b.y0,width:b.x1-b.x0+1,height:b.y1-b.y0+1}).png().toBuffer();
    const cp=PNG.sync.read(crop),skinPart=components(cp,(d,i)=>skin(d,i))[0];let anchor=[cp.width/2,cp.height-1];
    if(row<3){const sb=bounds(skinPart,cp.width),low=skinPart.filter(q=>Math.floor(q/cp.width)>=sb.y1-2);anchor=[low.reduce((s,q)=>s+q%cp.width,0)/low.length,sb.y1+2];}
    const head={buffer:crop,width:cp.width,height:cp.height,anchor};heads.push(head);await sharp(crop).toFile(`${DIR}/head-${row<3?(row+1)+'-'+(col+1):'rear-'+(col+1)}.png`);
  }return heads;
}
function preserve(p,lm,cls,pose){
  const out=new PNG({width:256,height:256}),d=p.data,keep=new Uint8Array(65536),fb=lm.face;
  const faceSet=new Set(lm.facePoints);
  for(const part of lm.skinParts)for(const q of part){if(cls==='ranger'&&(fb||(!(q%256>=157)&&Math.floor(q/256)<110)))continue;const x=q%256,y=Math.floor(q/256);if((fb&&(x<fb.x0-5||x>fb.x1+5)&&y>fb.y0-22)||(!fb&&(x<lm.chin[0]-40||x>lm.chin[0]+40)))keep[q]=1;}
  for(let q=0;q<65536;q++){const i=q*4,x=q%256,y=Math.floor(q/256);if(d[i+3]<160)continue;const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);
    // Foreground arms and weapons remain in front of the new finished drawing.
    if(cls==='vanguard'&&((h>210&&h<240&&s>.35)||(s<.3&&l>.4&&(!fb||x<fb.x0-2||x>fb.x1+2||y<fb.y0-3))||(h>38&&h<62&&s>.5)))keep[q]=1;
    if(cls==='arcanist'&&fb&&x>fb.x1+12&&y>fb.y0+8)keep[q]=1;
    if(cls==='arcanist'&&pose==='cast'&&lm.frame>0&&fb&&x>fb.x1+3&&h>10&&h<35&&y<fb.y0+10)keep[q]=1;
    if(cls==='ranger'&&fb){const weaponX={attack:[163,163,163,163],cast:[164,159,171,125]}[pose]?.[lm.frame];if(weaponX&&x>=weaponX)keep[q]=1;}
    if(!fb&&cls==='arcanist'){
      if((lm.chin[0]<131&&x<87&&y>73)||(x>176&&y>87))keep[q]=1;
    }
    if(!fb&&cls==='ranger'&&((x>=133&&y>=104)||(x>=161&&y>=35)||(x>=153&&y<75&&y>35)))keep[q]=1;
    // Below the face/neck seam is untouched body art, including the collar.
    if(y>lm.chin[1]-1)keep[q]=1;
  }
  for(const q of lm.weaponPixels)keep[q]=1;
  const wide=new Uint8Array(65536);for(let q=0;q<65536;q++)if(keep[q]){const x=q%256,y=Math.floor(q/256);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx>=0&&x+dx<256&&y+dy>=0&&y+dy<256)wide[(y+dy)*256+x+dx]=1;}}
  for(let q=0;q<65536;q++)if(wide[q]&&!lm.accessories.has(q)&&inside(q%256,Math.floor(q/256),lm.poly))d.copy(out.data,q*4,q*4,q*4+4);
  return PNG.sync.write(out);
}
(async()=>{
  fs.mkdirSync(DIR,{recursive:true});const heads=await prepareHeads(),manifest={version:1,classes:fs.existsSync(`${DIR}/manifest.json`)?JSON.parse(fs.readFileSync(`${DIR}/manifest.json`,'utf8')).classes:{},faces:['Bright','Bold','Gentle'],hairstyles:['Curly crop','Side-swept bob','Tied back']};
  for(const cls of CLASSES){const only=process.argv.find(a=>a.startsWith('--class='))?.split('=')[1];if(only&&cls!==only)continue;manifest.classes[cls]={};for(const pose of POSES){
    const source=PNG.sync.read(fs.readFileSync(`art/${cls}-compact-${pose}.png`)),frames=source.width/256,lms=[],bases=[],front=[];
    for(let f=0;f<frames;f++){const original=framePNG(source,f),lm=landmarks(original,cls,pose,f);lms.push(lm);front.push(preserve(original,lm,cls,pose));const base=PNG.sync.read(PNG.sync.write(original));for(let q=0;q<65536;q++)if(inside(q%256,Math.floor(q/256),lm.poly)||lm.accessories.has(q))base.data[q*4+3]=0;bases.push(PNG.sync.write(base));}
    manifest.classes[cls][pose]={frames,headBounds:[],landmarks:lms.map(l=>({chin:l.chin,angle:l.angle,scale:l.scale,poly:l.poly}))};
    for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
      if(process.argv.includes('--sample')&&(hair!==1||face!==1))continue;
      const out=new PNG({width:source.width,height:256}),partMask=new PNG({width:source.width,height:256});
      for(let f=0;f<frames;f++){
        const lm=lms[f],head=heads[pose==='climb'?9+hair-1:(hair-1)*3+face-1],height=(pose==='climb'?{vanguard:88,arcanist:92,ranger:102}:{vanguard:110,arcanist:98,ranger:102})[cls]*lm.scale,fitHeight=(cls==='arcanist'&&pose==='jump')?Math.min(height,lm.chin[1]-6):height,scale=fitHeight/head.height;
        const uri=head.buffer.toString('base64'),svg=Buffer.from(`<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg"><g transform="translate(${lm.chin[0]} ${lm.chin[1]}) rotate(${lm.angle}) scale(${scale})"><image href="data:image/png;base64,${uri}" x="${-head.anchor[0]}" y="${-head.anchor[1]}" width="${head.width}" height="${head.height}"/></g></svg>`);
        const headLayer=await sharp(svg).png().toBuffer();
        const finished=await sharp(bases[f]).composite([{input:headLayer},{input:front[f]}]).png().toBuffer();const fp=PNG.sync.read(finished),hp=PNG.sync.read(headLayer);PNG.bitblt(fp,out,0,0,256,256,f*256,0);
        for(let q=0;q<65536;q++){
          const i=q*4,d=hp.data;if(d[i+3]<100||Math.abs(fp.data[i]-d[i])+Math.abs(fp.data[i+1]-d[i+1])+Math.abs(fp.data[i+2]-d[i+2])>25)continue;
          const [h,s,l]=hsl(d[i],d[i+1],d[i+2]);let kind=255,white=false;
          if(l>.24&&s>.28){
            const x=q%256,y=Math.floor(q/256);for(let dy=-3;dy<=3&&!white;dy++)for(let dx=-3;dx<=3;dx++){const k=((y+dy)*256+x+dx)*4;if(d[k]>225&&d[k+1]>225&&d[k+2]>225&&d[k+3]>200){white=true;break;}}
            if(white&&h>15&&h<43&&l<.61)kind=3;
            else if(skin(d,i))kind=1;
            else if(h>3&&h<40&&l<.7)kind=2;
          }
          const mi=(Math.floor(q/256)*source.width+f*256+q%256)*4;partMask.data[mi]=kind;partMask.data[mi+3]=255;
        }
        if(hair===1&&face===1){manifest.classes[cls][pose].headBounds.push([lm.chin[0]-height*.9,lm.chin[1]-height*1.1,lm.chin[0]+height*.7,lm.chin[1]+5]);}
      }
      await sharp(PNG.sync.write(out)).png({compressionLevel:9}).toFile(`${DIR}/${cls}-${hair}-${face}-${pose}.png`);
      await sharp(PNG.sync.write(partMask)).png({palette:true,compressionLevel:9}).toFile(`${DIR}/${cls}-${hair}-${face}-${pose}-mask.png`);
    }
    console.log('Baked',cls,pose,frames,'frames');
  }}fs.writeFileSync(`${DIR}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;});
