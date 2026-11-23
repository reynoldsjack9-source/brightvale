'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const root='art/creator/compact-options/v3';
const manifest=JSON.parse(fs.readFileSync(root+'/manifest.json'));
let checked=0;
for(const pose of ['idle','run','attack','cast','jump']){
  const source=PNG.sync.read(fs.readFileSync(`art/ranger-compact-${pose}.png`));
  for(let frame=0;frame<source.width/256;frame++){
    const eligible=new Set();
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const i=(y*source.width+frame*256+x)*4,[r,g,b,a]=source.data.subarray(i,i+4);
      if(a>100&&r>g*1.15&&g>b*1.2&&r>80&&r<240&&g>40&&g<190&&b<130)eligible.add(y*256+x);
    }
    const materials=[];
    while(eligible.size){
      const patch=[eligible.values().next().value];eligible.delete(patch[0]);
      for(let j=0;j<patch.length;j++)for(const q of [patch[j]-1,patch[j]+1,patch[j]-256,patch[j]+256])if(eligible.delete(q))patch.push(q);
      const xs=patch.map(q=>q%256),ys=patch.map(q=>q>>8);
      if(patch.length>20&&Math.max(...ys)-Math.min(...ys)>35&&(Math.max(...xs)+Math.min(...xs))/2>manifest.classes.ranger[pose].landmarks[frame].chin[0]+18)materials.push(patch);
    }
    for(const gender of manifest.genders)for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
      const key=`${root}/ranger-${gender}-${hair}-${face}-${pose}`;
      const image=PNG.sync.read(fs.readFileSync(key+'.png')),mask=PNG.sync.read(fs.readFileSync(key+'-mask.png'));
      if(pose==='cast'&&frame===3){
        // Hold the string above and below the arm, and check that the
        // intervening pixels remain opaque forearm/cuff paint.
        const pixel=(x,y)=>(y*source.width+frame*256+x)*4;
        for(const [x,y] of [[133,101],[145,133]])assert.ok(image.data[pixel(x,y)+3]>180,key+' has a missing release string');
        for(const [x,y] of [[137,115],[139,121]]){
          const i=pixel(x,y);
          assert.ok(image.data[i+3]>240&&image.data[i]>145,key+' string crosses the forearm');
        }
      }
      for(const patch of materials)for(const q of patch){
        const x=q%256,y=q>>8,i=(y*source.width+frame*256+x)*4;
        // Connected brown patches can include belt, sleeve and arrow glow.
        // Cast frame 1's actual bow starts at x=165.
        if(pose==='cast'&&frame===1&&x<164)continue;
        if(source.data[i+3]<250)continue;
        // Semi-transparent source edges blend against the new hair beneath the
        // foreground. Alpha >=250 permits at most five levels of this blend.
        for(let c=0;c<3;c++)assert.ok(Math.abs(image.data[i+c]-source.data[i+c])<=6,`${key} bow changed f${frame} ${x},${y}`);
        assert.ok(image.data[i+3]>=source.data[i+3],`${key} bow alpha lost`);
        assert.notEqual(mask.data[i],2,`${key} hair dyes bow f${frame} ${x},${y}`);
        assert.notEqual(mask.data[i],3,`${key} eye color dyes bow f${frame} ${x},${y}`);checked++;
      }
    }
  }
}
assert.ok(checked>75000,'Bow material coverage unexpectedly small: '+checked);
console.log(`PASS: ${checked.toLocaleString()} source bow material pixels retained across all front poses and both genders`);
