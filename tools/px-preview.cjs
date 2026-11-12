// Renders a restyled pixel-hero strip to a PNG so it can be checked without a browser.
// Usage: node tools/px-preview.cjs <class> <path/to/strip.png> <out.png> [scale] [frames e.g. 0,2,4] [sword]
// It runs the same PIXLIB code that is inside brightvale.html (between the PIXLIB markers).
const fs=require('fs'), zlib=require('zlib'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','brightvale.html'),'utf8');
const a=html.indexOf('/*PIXLIB-START'), b=html.indexOf('/*PIXLIB-END*/');
const PIXLIB=new Function(html.slice(a,b)+';return PIXLIB;')();

function decode(file){ // 8-bit RGBA / RGB / palette PNGs, no interlace
  const buf=fs.readFileSync(file); let o=8, w=0,h=0,ct=0, idat=[], plte=null, trns=null;
  while(o<buf.length){ const len=buf.readUInt32BE(o), type=buf.toString('latin1',o+4,o+8), data=buf.subarray(o+8,o+8+len);
    if(type==='IHDR'){ w=data.readUInt32BE(0); h=data.readUInt32BE(4); ct=data[9]; if(data[8]!==8||data[12]) throw new Error('unsupported PNG'); }
    else if(type==='IDAT') idat.push(data); else if(type==='PLTE') plte=data; else if(type==='tRNS') trns=data;
    o+=12+len; }
  const bpp={6:4,2:3,3:1,0:1,4:2}[ct], raw=zlib.inflateSync(Buffer.concat(idat)), stride=w*bpp, px=Buffer.alloc(h*stride);
  for(let y=0;y<h;y++){ const f=raw[y*(stride+1)], row=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));
    for(let x=0;x<stride;x++){ const l=x>=bpp?px[y*stride+x-bpp]:0, u=y?px[(y-1)*stride+x]:0, ul=(y&&x>=bpp)?px[(y-1)*stride+x-bpp]:0; let v=row[x];
      if(f===1) v+=l; else if(f===2) v+=u; else if(f===3) v+=(l+u)>>1; else if(f===4){ const p=l+u-ul,pa=Math.abs(p-l),pb=Math.abs(p-u),pc=Math.abs(p-ul); v+=(pa<=pb&&pa<=pc)?l:(pb<=pc?u:ul); }
      px[y*stride+x]=v&255; } }
  const out=new Uint8Array(w*h*4);
  for(let i=0;i<w*h;i++){ if(ct===6){ out.set(px.subarray(i*4,i*4+4),i*4); } else if(ct===2){ out[i*4]=px[i*3]; out[i*4+1]=px[i*3+1]; out[i*4+2]=px[i*3+2]; out[i*4+3]=255; }
    else if(ct===3){ const p=px[i]; out[i*4]=plte[p*3]; out[i*4+1]=plte[p*3+1]; out[i*4+2]=plte[p*3+2]; out[i*4+3]=trns&&p<trns.length?trns[p]:255; }
    else throw new Error('unsupported color type '+ct); }
  return {w,h,data:out};
}
function encode(w,h,rgba,file){
  const raw=Buffer.alloc(h*(w*4+1)); for(let y=0;y<h;y++){ raw[y*(w*4+1)]=0; Buffer.from(rgba.buffer,rgba.byteOffset+y*w*4,w*4).copy(raw,y*(w*4+1)+1); }
  const crcT=[]; for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xedb88320^(c>>>1):c>>>1; crcT[n]=c>>>0; }
  const crc=b=>{ let c=0xffffffff; for(const v of b) c=crcT[(c^v)&255]^(c>>>8); return (c^0xffffffff)>>>0; };
  const chunk=(t,d)=>{ const l=Buffer.alloc(4); l.writeUInt32BE(d.length); const td=Buffer.concat([Buffer.from(t,'latin1'),d]); const c=Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l,td,c]); };
  const ih=Buffer.alloc(13); ih.writeUInt32BE(w,0); ih.writeUInt32BE(h,4); ih[8]=8; ih[9]=6;
  fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
}
const [cls,src,dst,scaleArg,framesArg,swordArg]=process.argv.slice(2);
const img=decode(src), S=+(scaleArg||4), F=img.h, n=Math.round(img.w/F);
const frames=framesArg&&framesArg!=='all'?framesArg.split(',').map(Number):[...Array(n).keys()];
const px=cls==='raw'?new Uint32Array(img.data.buffer.slice(0)):PIXLIB.restyle(img.data,img.w,img.h,cls,swordArg==='sword');
// stats for sizing: bounding box of frame 0
let x0=1e9,x1=-1,y0=1e9,y1=-1; for(let y=0;y<F;y++) for(let x=0;x<F;x++) if(img.data[(y*img.w+x)*4+3]>127){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
console.log(`${path.basename(src)}: ${n} frames; frame 0 box x ${x0}-${x1}, y ${y0}-${y1} (height ${y1-y0+1})`);
// crop each frame to rows 40..128 to save space, on a sky-blue backdrop
const CY=40, CH=F-CY, W=frames.length*F*S, H=CH*S, out=new Uint8Array(W*H*4);
for(let i=0;i<W*H;i++){ out[i*4]=0xbf; out[i*4+1]=0xe6; out[i*4+2]=0xff; out[i*4+3]=255; }
frames.forEach((f,fi)=>{ for(let y=0;y<CH;y++) for(let x=0;x<F;x++){ const p=px[(y+CY)*img.w+f*F+x]; if(!(p>>>24)) continue;
  for(let sy=0;sy<S;sy++) for(let sx=0;sx<S;sx++){ const o=((y*S+sy)*W+(fi*F+x)*S+sx)*4; out[o]=p&255; out[o+1]=(p>>8)&255; out[o+2]=(p>>16)&255; out[o+3]=255; } } });
encode(W,H,out,dst);
