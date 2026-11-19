'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const root='art/creator/compact-options/v3',m=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
assert.equal(m.version,3);assert.deepEqual(m.genders,['male','female']);assert.deepEqual(m.faces,['Bright','Bold','Gentle']);
assert.deepEqual(m.featuresByGender?.female,{faces:['Freckled','Angular','Heart'],hairstyles:['Feathered pixie','Twin buns','Crown braid']});
assert.deepEqual(m.featuresByGender?.male,{faces:['Bright','Bold','Gentle'],hairstyles:['Curly crop','Side-swept bob','Tied back']});
assert.deepEqual(Object.keys(m.classes).sort(),['arcanist','ranger','vanguard']);
for(const poses of Object.values(m.classes))assert.deepEqual(Object.keys(poses).sort(),['attack','cast','climb','idle','jump','run']);
const read=p=>PNG.sync.read(fs.readFileSync(p)),regions=JSON.parse(fs.readFileSync('tools/creator-regions.json','utf8'));
let frames=0,sheets=0,bodyPixels=0,irisPixels=0,bowPixels=0;
for(const gender of m.genders)for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
  const mask=read(`${root}/head-${gender}-${hair}-${face}-mask.png`),r=(gender==='female'?regions.female:regions.heads)[hair-1];
  const browPoints=(gender==='female'?[[[128,122,2],[200,120,2]],[[138,133,2],[211,131,2]],[[139,137,2],[210,137,2]]]:[[[144,124,2],[191,124,2]],[[140,128,2],[201,137,2]],[[160,138,2],[229,139,2]]])[hair-1];
  const ears=(gender==='female'?[[69,164,8],[75,166,8],[68,185,8]]:[[65,166,8],[77,175,8],[98,193,8]])[hair-1];
  const mouth=(gender==='female'?[[170,191,3],[181,199,3],[176,214,3]]:[[159,196,4],[182,209,4],[202,219,3]])[hair-1];
  const safe=[...browPoints,ears,mouth];
  if(gender==='female'&&face===1)safe.push(...[[[139,182,2],[213,181,2]],[[147,185,2],[217,184,2]],[[146,196,2],[211,194,2]]][hair-1]);
  for(const [cx,cy,rad]of safe)for(let y=-rad;y<=rad;y++)for(let x=-rad;x<=rad;x++){
    const px=Math.round((cx+x)*mask.width/r.size[0]),py=Math.round((cy+y)*mask.height/r.size[1]);
    assert.notEqual(mask.data[(py*mask.width+px)*4],2,`Hair mask leaks onto ear/brow/mouth: ${gender}/${hair}/${face} at ${px},${py}`);
  }
  let eyes=0;for(let i=0;i<mask.data.length;i+=4)if(mask.data[i]===3)eyes++;
  assert.ok(eyes>250,`Iris paint missing: ${gender}/${hair}/${face}`);
}
for(const cls of Object.keys(m.classes))for(const pose of Object.keys(m.classes[cls])){
  const original=read(`art/${cls}-compact-${pose}.png`),meta=m.classes[cls][pose],base=read(`${root}/base-${cls}-${pose}-mask.png`);
  assert.equal(meta.frames,original.width/256);assert.equal(Object.keys(meta.coverage).length,18,`Incomplete sample manifest: ${cls}/${pose}`);if(pose==='idle'){let n=0;for(let i=0;i<base.data.length;i+=4)if(base.data[i]===3)n++;assert.ok(n>25,cls+' original eyes have no color mask');}
  for(const gender of m.genders)for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
    const key=`${root}/${cls}-${gender}-${hair}-${face}-${pose}`,p=read(key+'.png'),mask=read(key+'-mask.png');
    assert.equal(p.width,original.width,key);assert.equal(p.height,256,key);assert.equal(mask.width,p.width);assert.equal(mask.height,p.height);
    const kinds=new Set();let irises=0;for(let i=0;i<mask.data.length;i+=4)if(mask.data[i+3]){assert.ok([1,2,3,4,255].includes(mask.data[i]),'Invalid region: '+key);kinds.add(mask.data[i]);if(mask.data[i]===3)irises++;}
    assert.ok(kinds.has(2),'Hair region missing: '+key);assert.ok(kinds.has(255),'Ink missing: '+key);
    if(pose!=='climb')assert.ok(irises>20*meta.frames,'Visible iris coverage too small: '+key);
    irisPixels+=irises;
    for(let f=0;f<meta.frames;f++){
      const lm=meta.landmarks[f],below=Math.ceil(lm.chin[1]+18);
      for(let y=below;y<256;y++)for(let x=0;x<256;x++){
        const i=(y*p.width+f*256+x)*4;if(original.data[i+3]!==255)continue;
        assert.equal(p.data[i+3],255,'Body alpha changed: '+key+` ${f} ${x},${y}`);
        for(let c=0;c<3;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=1,'Body changed: '+key+` ${f} ${x},${y}`);
        bodyPixels++;
      }
      // Independently check neck/collar and both shoulders for erased chunks.
      if(pose==='idle'){
        const boxes=cls==='vanguard'?[[91,134,109,149],[143,132,154,147],[120,126,130,130]]:cls==='arcanist'?[[96,119,114,132],[140,120,146,132],[123,107,129,110]]:[[98,120,111,133],[136,124,144,135],[121,110,130,115]];
        for(const [x0,y0,x1,y1]of boxes)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
          const i=(y*p.width+f*256+x)*4;if(original.data[i+3]===255)assert.ok(p.data[i+3]>220,`Neck/shoulder hole: ${key} ${x},${y}`);
        }
      }
      if(cls==='vanguard'&&pose==='attack'&&f===0)for(let y=98;y<=144;y++)for(let x=38;x<=86;x++){
        const i=(y*p.width+x)*4,[r,g,b,a]=original.data.subarray(i,i+4);if(a<250)continue;
        const gold=r>160&&g>r*.73&&b<100,blue=b>r*1.2&&b>g*1.1;
        if(!gold&&!blue)continue;
        for(let c=0;c<3;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=6,`Sword grip changed: ${key} ${x},${y}`);
        assert.ok(p.data[i+3]>=a,`Sword grip alpha lost: ${key}`);assert.notEqual(mask.data[i],2,'Hair paints sword grip: '+key);
      }
      // The held bow, hand and string stay opaque and cannot be hair dyed.
      if(cls==='ranger'&&pose==='idle')for(let y=119;y<210;y++)for(let x=151;x<189;x++){
        const i=(y*p.width+f*256+x)*4;if(original.data[i+3]!==255)continue;
        for(let c=0;c<4;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=1,`Bow/grip changed: ${key} ${x},${y}`);
        assert.notEqual(mask.data[i],2,'Hair color paints the bow: '+key);bowPixels++;
      }
      frames++;
    }sheets++;
  }
}
assert.equal(sheets,324);assert.equal(frames,1188);
console.log(`PASS: ${sheets} sheets / ${frames} frames, both genders and all nine face/hair combinations; ${bodyPixels.toLocaleString()} body, ${bowPixels.toLocaleString()} bow/grip pixels unchanged; ${irisPixels.toLocaleString()} iris pixels; ear/brow/mouth masks isolated.`);
