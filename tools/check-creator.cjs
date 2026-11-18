const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const source=fs.readFileSync('brightvale.html','utf8');
for(const m of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
const index=fs.readFileSync('index.html','utf8');assert.equal(index.split('<body>\n')[1].slice(0,-16),source);console.log('PASS: inline JavaScript parses; index wrapper synchronized');
if(process.argv.includes('--baseline')){const base=cp.execFileSync('git',['show','HEAD:brightvale.html'],{encoding:'utf8'});const sim=x=>x.slice(x.indexOf('   SIMULATION'),x.indexOf('   CLIENT')).replace(/\r/g,'');assert.equal(sim(source),sim(base));console.log('PASS: simulation block unchanged');}
