'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const root='art/creator/compact-options/v3',m=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
assert.equal(m.version,3);assert.deepEqual(m.genders,['male','female']);assert.deepEqual(m.faces,['Steady','Rugged','Keen']);
assert.deepEqual(m.featuresByGender?.female,{faces:['Freckled','Angular','Heart'],hairstyles:['Feathered pixie','Twin buns','Crown braid']});
assert.deepEqual(m.featuresByGender?.male,{faces:['Steady','Rugged','Keen'],hairstyles:['Close crop','Short side part','Short spikes']});
assert.deepEqual(Object.keys(m.classes).sort(),['arcanist','ranger','vanguard']);
for(const poses of Object.values(m.classes))assert.deepEqual(Object.keys(poses).sort(),['attack','cast','climb','idle','jump','run']);
const read=p=>PNG.sync.read(fs.readFileSync(p)),regions=JSON.parse(fs.readFileSync('tools/creator-regions.json','utf8'));
{
  const {femaleBody}=require('./creator-body.cjs'),shirt=new PNG({width:256,height:256}),fg=new Uint8Array(256*256);
  for(let y=85;y<190;y++)for(let x=100;x<=132;x++){const i=(y*256+x)*4;shirt.data.set([110,80,180,255],i);}
  for(let y=112;y<118;y++)for(let x=140;x<145;x++){const q=y*256+x;fg[q]=1;shirt.data.set([240,190,100,255],q*4);}
  const shaped=femaleBody(shirt,{chin:[128,80],angle:0,fg},'idle'),width=y=>{let n=0;for(let x=90;x<140;x++)if(shaped.data[(y*256+x)*4+3]>128)n++;return n;};
  assert.ok(width(104)>33&&width(104)<=37,'Chest tailoring should be slight');
  assert.ok(width(122)<33&&width(122)>=27,'Waist tailoring should remain proportionate');
  for(let q=0;q<fg.length;q++)if(fg[q]||Math.floor(q/256)>=159)for(let k=0;k<4;k++)assert.equal(shaped.data[q*4+k],shirt.data[q*4+k],'Equipment or lower-body anchor moved');
}
let frames=0,sheets=0,bodyPixels=0,irisPixels=0,bowPixels=0;
for(const gender of m.genders)for(let hair=1;hair<=3;hair++)for(let face=1;face<=3;face++){
  const mask=read(`${root}/head-${gender}-${hair}-${face}-mask.png`),r=(gender==='female'?regions.female:regions.heads)[hair-1];
  const browPoints=(gender==='female'?[[[128,122,2],[200,120,2]],[[138,133,2],[211,131,2]],[[139,137,2],[210,137,2]]]:[[[117,121,2],[185,125,2]],[[117,134,2],[190,139,2]],[[117,138,2],[190,140,2]]])[hair-1];
  const ears=(gender==='female'?[[69,164,8],[75,166,8],[68,185,8]]:[[35,161,6],[35,172,6],[35,179,6]])[hair-1];
  const mouth=(gender==='female'?[[170,191,3],[181,199,3],[176,214,3]]:[[150,190,3],[154,204,3],[155,208,3]])[hair-1];
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
    if(gender==='female'&&hair===1&&face===1&&pose==='idle'){
      let shaped=0;const lm=meta.landmarks[0];
      for(let y=Math.ceil(lm.chin[1]+20);y<lm.chin[1]+70;y++)for(let x=100;x<150;x++){
        const i=(y*p.width+x)*4;if(original.data[i+3]&&p.data[i+3]&&[0,1,2,3].some(k=>Math.abs(p.data[i+k]-original.data[i+k])>4))shaped++;
      }
      assert.ok(shaped>50,`Female outfit shaping missing: ${cls}`);
    }
    assert.equal(p.width,original.width,key);assert.equal(p.height,256,key);assert.equal(mask.width,p.width);assert.equal(mask.height,p.height);
    const kinds=new Set();let irises=0;for(let i=0;i<mask.data.length;i+=4)if(mask.data[i+3]){assert.ok([1,2,3,4,255].includes(mask.data[i]),'Invalid region: '+key);kinds.add(mask.data[i]);if(mask.data[i]===3)irises++;}
    assert.ok(kinds.has(2),'Hair region missing: '+key);assert.ok(kinds.has(255),'Ink missing: '+key);
    if(pose!=='climb')assert.ok(irises>20*meta.frames,'Visible iris coverage too small: '+key);
    irisPixels+=irises;
    for(let f=0;f<meta.frames;f++){
      const lm=meta.landmarks[f],below=Math.ceil(lm.chin[1]+18);
      for(let y=below;y<256;y++)for(let x=0;x<256;x++){
        const a=lm.angle*Math.PI/180,dx=x-lm.chin[0],dy=y-lm.chin[1],u=Math.cos(a)*dx+Math.sin(a)*dy+12,v=-Math.sin(a)*dx+Math.cos(a)*dy;
        if(gender==='female'&&v>0&&v<78&&Math.abs(u)<43)continue;
        const i=(y*p.width+f*256+x)*4;if(original.data[i+3]!==255)continue;
        assert.equal(p.data[i+3],255,'Body alpha changed: '+key+` ${f} ${x},${y}`);
        for(let c=0;c<3;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=1,'Body changed: '+key+` ${f} ${x},${y}`);
        bodyPixels++;
      }
      // Independently check neck/collar and both shoulders for erased chunks.
      if(pose==='idle'){
        // A custom jaw must meet the neck/collar, including in class-card art.
        for(let ny=-3;ny<=5;ny++){
          const a=lm.angle*Math.PI/180;let connected=false;
          for(let nx=-17;nx<=-2;nx++){const x=Math.round(lm.chin[0]+nx*Math.cos(a)-ny*Math.sin(a)),y=Math.round(lm.chin[1]+nx*Math.sin(a)+ny*Math.cos(a));if(p.data[(y*p.width+f*256+x)*4+3]>220)connected=true;}
          assert.ok(connected,`Floating head/neck gap: ${key} neck row ${ny}`);
        }
        if(cls==='arcanist')for(let y=105;y<=118;y++)for(let x=100;x<=118;x++){
          const i=(y*p.width+x)*4,[r,g,b,a]=original.data.subarray(i,i+4),purple=r>g*1.4&&b>g*1.5,gold=r>180&&g>150&&b<160;
          if(a===255&&(purple||gold))for(let k=0;k<4;k++)assert.ok(Math.abs(p.data[i+k]-original.data[i+k])<=1,`Original shoulder cape cut: ${key} ${x},${y}`);
        }
        const boxes=cls==='vanguard'?[[91,134,109,149],[143,132,154,147],[120,126,130,130]]:cls==='arcanist'?[[96,119,114,132],[140,120,146,132],[123,107,129,110]]:[[98,120,111,133],[136,124,144,135],[121,110,130,115]];
        for(const [x0,y0,x1,y1]of boxes)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
          const i=(y*p.width+f*256+x)*4;
          if(original.data[i+3]===255){
            let alpha=p.data[i+3];
            // Female shoulder contours intentionally move inward by 1–2 px;
            // an empty patch larger than that remains a missing-body failure.
            if(gender==='female')for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)alpha=Math.max(alpha,p.data[((y+dy)*p.width+f*256+x+dx)*4+3]);
            assert.ok(alpha>220,`Neck/shoulder hole: ${key} ${x},${y}`);
          }
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
