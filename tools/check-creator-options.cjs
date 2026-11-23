'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const root='art/creator/compact-options/v3',m=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8'));
assert.equal(m.version,3);assert.deepEqual(m.genders,['male','female']);assert.deepEqual(m.faces,['Steady','Rugged','Keen']);
assert.deepEqual(m.featuresByGender?.female,{faces:['Freckled','Angular','Heart'],hairstyles:['Feathered pixie','Twin buns','Crown braid']});
assert.deepEqual(m.featuresByGender?.male,{faces:['Steady','Rugged','Keen'],hairstyles:['Close crop','Short side part','Short spikes']});
assert.deepEqual(Object.keys(m.classes).sort(),['arcanist','ranger','vanguard']);
for(const poses of Object.values(m.classes))assert.deepEqual(Object.keys(poses).sort(),['attack','cast','climb','idle','jump','run']);
const read=p=>PNG.sync.read(fs.readFileSync(p)),regions=JSON.parse(fs.readFileSync('tools/creator-regions.json','utf8'));
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
      assert.ok(shaped>150,`Female outfit shaping missing: ${cls}`);
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
        if(gender==='female'&&v>6&&v<81&&Math.abs(u)<36)continue;
        const i=(y*p.width+f*256+x)*4;if(original.data[i+3]!==255)continue;
        assert.equal(p.data[i+3],255,'Body alpha changed: '+key+` ${f} ${x},${y}`);
        for(let c=0;c<3;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=1,'Body changed: '+key+` ${f} ${x},${y}`);
        bodyPixels++;
      }
      if(pose==='idle'){
        const points={
          vanguard:{body:[128,145],arms:[[90,154],[153,158]],shoulders:[[104,128],[149,132]],face:[137,101]},
          arcanist:{body:[133,142],arms:[[94,151],[160,151]],shoulders:[[116,113],[143,123]],face:[134,79]},
          ranger:{body:[129,150],arms:[[102,144],[164,167]],shoulders:[[105,124],[145,127]],face:[135,92]},
        }[cls];
        const solid=(x,y)=>p.data[(y*p.width+x)*4+3]>=160;
        const queue=[points.body[1]*256+points.body[0]],visited=new Set(queue);
        for(let j=0;j<queue.length;j++){
          const q=queue[j],x=q%256,y=q>>8;
          for(const [xx,yy] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
            if(xx<0||xx>255||yy<0||yy>255||!solid(xx,yy))continue;
            const next=yy*256+xx;
            if(!visited.has(next)){visited.add(next);queue.push(next);}
          }
        }
        for(const [x,y] of [...points.arms,...points.shoulders,points.face])
          assert.ok(visited.has(y*256+x),'Disconnected collar, shoulder or arm: '+key+' at '+x+','+y);
        // A pinhole in a solid shoulder used to pass the old coverage check.
        for(const [x,y] of [...points.arms,...points.shoulders])
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)
            assert.ok(solid(x+dx,y+dy),'Transparent shoulder or arm pixel: '+key);
      }
      if(cls==='vanguard'&&pose==='attack'&&f===0)for(let y=98;y<=144;y++)for(let x=38;x<=86;x++){
        const i=(y*p.width+x)*4,[r,g,b,a]=original.data.subarray(i,i+4);if(a<250)continue;
        const gold=r>160&&g>r*.73&&b<100,blue=b>r*1.2&&b>g*1.1;
        if(!gold&&!blue)continue;
        for(let c=0;c<3;c++)assert.ok(Math.abs(p.data[i+c]-original.data[i+c])<=6,`Sword grip changed: ${key} ${x},${y}`);
        assert.ok(p.data[i+3]>=a,`Sword grip alpha lost: ${key}`);assert.notEqual(mask.data[i],2,'Hair paints sword grip: '+key);
      }
      // The held bow, hand and string stay opaque and cannot be hair dyed.
      if(cls==='ranger'&&pose==='idle')for(let y=119;y<210;y++)for(let x=(y<151?157:155);x<189;x++){
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
