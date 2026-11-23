'use strict';
const {PNG}=require('pngjs');
const SIZE=256;

// The chest, waist and hips sit at different heights on the three outfits.
const PROFILES={
  vanguard:[[7,1],[15,.94],[25,1.13],[39,.81],[55,1.14],[77,1]],
  arcanist:[[7,1],[15,.94],[27,1.13],[38,.83],[54,1.14],[79,1]],
  ranger:[[7,1],[15,.94],[25,1.12],[38,.82],[55,1.14],[76,1]],
};

function shapeAt(height,profile,rear){
  for(let i=1;i<profile.length;i++){
    const [lo,start]=profile[i-1],[hi,end]=profile[i];
    if(height<lo||height>hi)continue;
    const t=(height-lo)/(hi-lo);
    const shape=start+(end-start)*t*t*(3-2*t);
    return rear&&height<30&&shape>1?1:shape;
  }
  return 1;
}

function femaleMap(meta,cls,pose,pins){
  const angle=meta.angle*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle);
  const [chinX,chinY]=meta.chin;
  const mapX=new Float32Array(SIZE*SIZE),mapY=new Float32Array(SIZE*SIZE);
  const lock=new Uint8Array(SIZE*SIZE);
  // Ease into held equipment over six pixels. The cut-free deformation keeps
  // adjacent arm and sleeve paint connected to the stationary grip.
  for(let q=0;q<pins.length;q++)if(pins[q]){
    const x=q%SIZE,y=q>>8;
    for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){
      const xx=x+dx,yy=y+dy;
      if(xx<0||xx>=SIZE||yy<0||yy>=SIZE)continue;
      const weight=Math.round(255*Math.max(0,1-Math.hypot(dx,dy)/6));
      const at=yy*SIZE+xx;
      lock[at]=Math.max(lock[at],weight);
    }
  }
  for(let q=0;q<mapX.length;q++){
    const x=q%SIZE,y=q>>8,dx=x-chinX,dy=y-chinY;
    const u=cos*dx+sin*dy+12,v=-sin*dx+cos*dy;
    const shape=shapeAt(v,PROFILES[cls],pose==='climb');
    const torso=Math.max(0,1-Math.max(0,Math.abs(u)-19)/16);
    const delta=(u/shape-u)*torso*(1-lock[q]/255);
    mapX[q]=x+delta*cos;
    mapY[q]=y+delta*sin;
  }
  return {x:mapX,y:mapY};
}

function warpBody(image,map){
  const out=new PNG({width:SIZE,height:SIZE});
  for(let q=0;q<map.x.length;q++){
    const x=map.x[q],y=map.y[q],x0=Math.floor(x),y0=Math.floor(y);
    const fx=x-x0,fy=y-y0,offset=q*4;
    let alpha=0;
    const rgb=[0,0,0];
    for(let dy=0;dy<=1;dy++)for(let dx=0;dx<=1;dx++){
      const px=x0+dx,py=y0+dy;
      if(px<0||px>=SIZE||py<0||py>=SIZE)continue;
      const i=(py*SIZE+px)*4;
      const a=image.data[i+3]*(dx?fx:1-fx)*(dy?fy:1-fy);
      alpha+=a;
      for(let c=0;c<3;c++)rgb[c]+=image.data[i+c]*a;
    }
    out.data[offset+3]=Math.round(alpha);
    if(alpha)for(let c=0;c<3;c++)out.data[offset+c]=Math.round(rgb[c]/alpha);
  }
  return out;
}

module.exports={femaleMap,warpBody};
