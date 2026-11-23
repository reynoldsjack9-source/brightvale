'use strict';
const {PNG}=require('pngjs');
const SIZE=256;

// Authored upper and lower limb guides reproduce the compact source bow's
// silhouette even where the old face cut intersects the tips.
const guides={
  attack:[
    [[174,83],[172,91],[182,102],[189,116],[188,136],[181,161],[165,183]],
    [[184,78],[183,83],[196,98],[205,111],[204,133],[191,158],[177,176]],
    [[147,79],[147,85],[160,101],[166,116],[164,143],[161,163],[146,184]],
    [[174,79],[173,85],[184,99],[191,118],[189,145],[183,166],[171,186]],
  ],
  cast:[
    [[174,100],[173,107],[180,122],[183,140],[180,162],[173,182],[160,202]],
    [[166,67],[166,75],[181,87],[193,100],[199,116],[203,144],[191,174]],
    [[162,50],[163,57],[181,64],[194,75],[207,98],[212,120],[197,160]],
    [[124,56],[125,64],[146,77],[159,96],[166,117],[166,139],[156,163]],
  ],
};

function nearLine(x,y,points,radius){
  for(let i=1;i<points.length;i++){
    const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
    if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<=radius)return true;
  }
  return false;
}

function protectBow(source,meta,pose){
  const points=guides[pose]?.[meta.frame];
  if(!points)return;
  // Seed wood along the guides, then retain its dark outline. This keeps
  // the bow tips without resurrecting adjacent face skin from the source.
  const wood=new Uint8Array(SIZE*SIZE);
  for(let y=45;y<211;y++)for(let x=112;x<225;x++){
    const q=y*SIZE+x,[r,g,b,a]=source.data.subarray(q*4,q*4+4);
    if(a>80&&r>100&&g>42&&r>g*1.17&&g>b*1.22&&b<125&&nearLine(x,y,points,7))wood[q]=1;
  }
  for(let q=0;q<wood.length;q++)if(wood[q]){
    const x=q%SIZE,y=q>>8;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const n=(y+dy)*SIZE+x+dx,[r,g,b,a]=source.data.subarray(n*4,n*4+4);
      if(a>0&&(wood[n]||(r<135&&g<100&&b<105)))meta.fg[n]=1;
    }
  }
}

function releasedStringBehindArm(source,pose,frame){
  if(pose!=='cast'||frame!==3)return source;
  const out=new PNG({width:SIZE,height:SIZE});
  source.data.copy(out.data);
  // Cast release has the string painted across the forearm in the compact
  // sheet. Repaint the short crossing from the adjacent arm and cuff; leave
  // the original string visible above and below the arm.
  for(let y=105;y<=128;y++){
    const center=130.6+(y-93)*.35;
    for(let x=Math.floor(center-2);x<=Math.ceil(center+2);x++){
      const i=(y*SIZE+x)*4;
      if(source.data[i+3]<100)continue;
      const leftX=Math.floor(center-4),rightX=Math.ceil(center+4);
      const left=((y+2)*SIZE+leftX)*4,right=((y-2)*SIZE+rightX)*4;
      if(source.data[left+3]<215||source.data[right+3]<215)continue;
      const mix=Math.max(0,Math.min(1,(x-center+1)/2));
      for(let k=0;k<3;k++)out.data[i+k]=Math.round(source.data[left+k]*(1-mix)+source.data[right+k]*mix);
      out.data[i+3]=255;
    }
  }
  // Paint a continuous cuff interior across the occluded string. The palette
  // is the original warm cloth highlight and the adjacent sleeve shadow.
  for(let y=111;y<=122;y++){
    const center=130.6+(y-93)*.35;
    for(let x=Math.floor(center-1.5);x<=Math.ceil(center+2.5);x++){
      const i=(y*SIZE+x)*4;
      if(out.data[i+3]<247)continue;
      const mix=Math.max(0,Math.min(1,(x-center+1)/3));
      out.data[i]=Math.round(229+12*mix);
      out.data[i+1]=Math.round(185+38*mix);
      out.data[i+2]=Math.round(151+37*mix);
    }
  }
  return out;
}

module.exports={protectBow,releasedStringBehindArm};
