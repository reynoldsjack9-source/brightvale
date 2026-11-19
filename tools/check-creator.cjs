const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const source=fs.readFileSync('brightvale.html','utf8');
for(const m of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
const index=fs.readFileSync('index.html','utf8');assert.equal(index.split('<body>\n')[1].slice(0,-16),source);console.log('PASS: inline JavaScript parses; index wrapper synchronized');
const vm=require('node:vm');
const lookCode=source.slice(source.indexOf('  const DEFAULT={compactVersion:'),source.indexOf('  // These are finished animation sheets'));
const activeCode=source.match(/  const activeFeatures=o=>[^\n]+/)[0];
const context={clamp:(n,a,b)=>Math.max(a,Math.min(b,n))};
vm.createContext(context);vm.runInContext(lookCode+'\n'+activeCode+'\nthis.migrate=normalize;',context);
const old=context.migrate({compactVersion:2,skin:3,hairColor:4,eyeColor:5,outfit:2},'archer');
assert.equal(old.gender,'female');assert.equal(old.hairStyle,0);assert.equal(old.skin,3);assert.equal(old.eyeColor,5);
const legacy=context.migrate({gender:'female',skin:0,hairColor:0,eyeColor:0},'warrior');
assert.equal(legacy.gender,'female');assert.equal(legacy.hairStyle,1);assert.equal(legacy.faceStyle,1);assert.equal(legacy.skin,1);
const current=context.migrate({compactVersion:3,gender:'male',hairStyle:3,faceStyle:2,skin:4},'archer');
assert.equal(current.gender,'male');assert.equal(current.hairStyle,3);assert.equal(current.faceStyle,2);assert.equal(current.skin,4);
console.log('PASS: legacy, v2 and v3 appearance migration preserves colors and gender');
vm.runInContext('this.featureSets={faces:FACES,hair:HAIRSTYLES};',context);
for(const sets of Object.values(context.featureSets)){assert.equal(sets.male.length,3);assert.equal(sets.female.length,3);assert.equal(sets.male.filter(s=>sets.female.includes(s)).length,0);}
console.log('PASS: each gender has three distinct face and hairstyle choices');
if(process.argv.includes('--baseline')){const base=cp.execFileSync('git',['show','HEAD:brightvale.html'],{encoding:'utf8'});const sim=x=>x.slice(x.indexOf('   SIMULATION'),x.indexOf('   CLIENT')).replace(/\r/g,'');assert.equal(sim(source),sim(base));console.log('PASS: simulation block unchanged');}
