'use strict';
const {PNG}=require('pngjs');
// A small clothing deformation in the torso's local frame. Feet, head,
// hands and authored foreground equipment remain at their source anchors.
function femaleBody(source,meta,pose,cls='arcanist'){
  const n=256,out=new PNG({width:n,height:n}),clean=PNG.sync.read(PNG.sync.write(source));
  for(let q=0;q<n*n;q++)if(meta.fg[q])clean.data[q*4+3]=0;
  const rad=meta.angle*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad),[cx,cy]=meta.chin;
  const heights={vanguard:[18,23,34,49,68],arcanist:[18,28,42,61,78],ranger:[18,26,38,53,72]}[cls];
  const profile=[[0,1],[heights[0],1],[heights[1],pose==='climb'?.98:1.065],[heights[2],.88],[heights[3],1.04],[heights[4],1]];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const dx=x-cx,dy=y-cy,u=c*dx+s*dy+12,v=-s*dx+c*dy;
    let scale=1;
    if(v>0&&v<heights[4]){for(let j=1;j<profile.length;j++)if(v<=profile[j][0]){const [a,sa]=profile[j-1],[b,sb]=profile[j];scale=sa+(sb-sa)*(v-a)/(b-a);break;}}
    // Feather into stationary arms and cape rather than moving their roots.
    scale=1+(scale-1)*Math.max(0,Math.min(1,(42-Math.abs(u))/14));
    const su=u/scale-12,px=c*su-s*v+cx,py=s*su+c*v+cy,i=(y*n+x)*4;
    const x0=Math.floor(px),y0=Math.floor(py),fx=px-x0,fy=py-y0;let alpha=0;const rgb=[0,0,0];
    for(let oy=0;oy<=1;oy++)for(let ox=0;ox<=1;ox++){
      const xx=x0+ox,yy=y0+oy;if(xx<0||xx>=n||yy<0||yy>=n)continue;
      const j=(yy*n+xx)*4,w=(ox?fx:1-fx)*(oy?fy:1-fy),a=clean.data[j+3]*w;alpha+=a;for(let k=0;k<3;k++)rgb[k]+=clean.data[j+k]*a;
    }
    out.data[i+3]=Math.round(alpha);if(alpha)for(let k=0;k<3;k++)out.data[i+k]=Math.round(rgb[k]/alpha);
    if(meta.fg[y*n+x])source.data.copy(out.data,i,i,i+4);
  }
  return out;
}
module.exports={femaleBody};
