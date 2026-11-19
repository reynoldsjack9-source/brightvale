'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const root='art/creator/compact-options',m=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
assert.deepEqual(m.faces,['Bright','Bold','Gentle']);assert.equal(m.hairstyles.length,3);let frames=0,sheets=0,bodyPixels=0;
for(const cls of Object.keys(m.classes))for(const pose of Object.keys(m.classes[cls])){
  const original=PNG.sync.read(fs.readFileSync(`art/${cls}-compact-${pose}.png`)),meta=m.classes[cls][pose];
  assert.equal(meta.frames,original.width/256);
  for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
    const key=`${root}/${cls}-${hair}-${face}-${pose}`,p=PNG.sync.read(fs.readFileSync(key+'.png')),mask=PNG.sync.read(fs.readFileSync(key+'-mask.png'));
    assert.equal(p.width,original.width,key);assert.equal(p.height,256,key);assert.equal(mask.width,p.width);assert.equal(mask.height,p.height);
    for(let x=0;x<mask.width;x++)assert.equal(mask.data[x*4+3],0,'New head clipped at the top: '+key);
    const kinds=new Set();for(let i=0;i<mask.data.length;i+=4)if(mask.data[i+3]){assert.ok([1,2,3,255].includes(mask.data[i]),'Invalid color region: '+key);kinds.add(mask.data[i]);}
    assert.ok(kinds.has(2),'Hair color region missing: '+key);assert.ok(kinds.has(255),'Ink region missing: '+key);
    for(let f=0;f<meta.frames;f++){
      const below=Math.ceil(meta.landmarks[f].chin[1]+12);
      for(let y=below;y<256;y++)for(let x=0;x<256;x++){
        const i=(y*p.width+f*256+x)*4;if(original.data[i+3]!==255)continue;
        assert.equal(p.data[i+3],255,'Body alpha changed: '+key);
        for(let c=0;c<3;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=1,'Body paint changed: '+key+' frame '+f+' at '+x+','+y);
        bodyPixels++;
      }
      frames++;
    }sheets++;
  }
}
console.log(`PASS: ${sheets} complete animation sheets, ${frames} frames, nine feature combinations per class; ${bodyPixels.toLocaleString()} protected body pixels unchanged; semantic color masks valid.`);
