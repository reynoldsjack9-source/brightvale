/* Brightvale's local skill preview. All coordinates are in game pixels. */
window.BrightvaleVFX = (() => {
  'use strict';
  const TAU = Math.PI * 2;
  const themes = {
    steel:['#8cc9ff','#e4f6ff','#ffffff'], gold:['#ff9c36','#ffdb75','#fffbea'],
    ember:['#ef522f','#ffab4d','#fff3bb'], frost:['#52bfee','#a8ecff','#f4fdff'],
    storm:['#7678ff','#a8dbff','#f7faff'], violet:['#9b68ee','#d9a7ff','#fff3ff'],
    wind:['#54b49c','#c6f7c1','#f8fff2'], earth:['#c46e42','#f5c38b','#fff2ca'],
  };
  const clamp = n => Math.max(0, Math.min(1,n));
  const out = n => 1 - (1-clamp(n))**3;
  const pulse = (t, rise=.09) => clamp(t/rise) * (1-clamp(t))**1.45;
  const tint = (hex,a) => `${hex}${Math.round(clamp(a)*255).toString(16).padStart(2,'0')}`;
  const hash = n => { const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  function line(c, points) {
    c.beginPath(); points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
  }
  function ellipse(c,x,y,rx,ry,start=0,end=TAU) {
    c.beginPath(); c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,start,end);
  }
  function glow(c,x,y,r,color,amount) {
    const g=c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,tint(color,amount));g.addColorStop(.32,tint(color,amount*.52));g.addColorStop(1,tint(color,0));
    c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  }
  function luminous(c,theme,width,amount){
    c.lineCap='round';c.lineJoin='round';
    for(const [color,w,alpha] of [[theme[0],width*3.1,.18],[theme[0],width*1.8,.55],[theme[1],width,1],[theme[2],Math.max(.65,width*.32),1]]){
      c.strokeStyle=tint(color,alpha*amount);c.lineWidth=w;c.stroke();
    }
  }
  function twinkle(c,x,y,r,theme,a,angle=0){
    if(r<.3||a<.02)return;
    c.save();c.translate(x,y);c.rotate(angle);c.scale(1,.75);
    c.fillStyle=tint(theme[1],a);line(c,[[0,-r],[r*.16,-r*.18],[r,0],[r*.16,r*.18],[0,r],[-r*.16,r*.18],[-r,0],[-r*.16,-r*.18]]);c.closePath();c.fill();
    c.fillStyle=tint(theme[2],a);c.fillRect(-r*.09,-r*.15,r*.18,r*.3);c.restore();
  }
  function flecks(c,t,seed,theme,count,rx,ry,ground=false){
    for(let i=0;i<count;i++){
      const h=hash(seed+i*7),delay=hash(seed+i*11)*.26,u=clamp((t-delay)/(1-delay));
      if(t<delay)continue;
      const angle=hash(seed+i*4)*TAU,s=(.35+h*.7)*out(u);
      const x=Math.cos(angle)*rx*s,y=ground?-Math.abs(Math.sin(angle))*ry*Math.sin(Math.PI*u*.86)*(.3+h*.8):Math.sin(angle)*ry*s;
      if(i%4===0)twinkle(c,x,y,(2+h*6)*(1-u),theme,(1-u)*.92,angle+u);
      else {const length=(2+h*8)*(1-u);line(c,[[x-Math.cos(angle)*length,y-Math.sin(angle)*length],[x,y]]);c.lineWidth=1+h;c.strokeStyle=tint(theme[i%2],(1-u)**1.5);c.stroke();}
    }
  }
  function ribbon(c,t,theme,reach,wide){
    const a=pulse(t),p=out(t),tip=-1.52+p*3.12;
    for(let band=0;band<(wide?2:1);band++){
      const r=reach-band*17, end=tip-band*.48,start=end-(1.35+p*.58);
      const point=(ang,offset)=>[Math.cos(ang)*(r+offset)+9,Math.sin(ang)*(r*.64+offset*.75)];
      const outer=[],inner=[];
      for(let i=0;i<=30;i++){
        const u=i/30,ang=start+(end-start)*u,w=(wide?14:10)*Math.sin(Math.PI*u)**.8;
        outer.push(point(ang,w));inner.unshift(point(ang,-w*.42));
      }
      const g=c.createLinearGradient(0,-r*.6,r,r*.48);
      g.addColorStop(0,tint(theme[0],0));g.addColorStop(.52,tint(theme[0],a*.82));g.addColorStop(.79,tint(theme[1],a));g.addColorStop(1,tint(theme[2],a*.82));
      line(c,outer.concat(inner));c.closePath();c.fillStyle=g;c.fill();
      line(c,outer.slice(7));luminous(c,theme,2.6,a*.95);
      const [x,y]=point(end,0);glow(c,x,y,24,theme[0],a*.38);twinkle(c,x,y,6+4*a,theme,a);
    }
    flecks(c,t,13,theme,wide?27:15,reach*1.12,reach*.64);
  }
  function ring(c,t,theme,radius,ratio,start=0,end=TAU){
    if(t<0||t>=1)return;
    const r=5+out(t)*(radius-5),a=pulse(t,.065);
    ellipse(c,0,0,r,r*ratio,start,end);luminous(c,theme,2.9*(1-t)+.8,a);
  }
  function shards(c,t,theme,radius,ice){
    for(let i=0;i<15;i++){
      const h=hash(i+17),sign=i%2?1:-1,delay=h*.19;
      if(t<=delay)continue;
      const u=(t-delay)/(1-delay),x=sign*(15+out(u)*radius*(.35+h*.65)),y=-Math.sin(Math.PI*u)*((ice?40:52)+h*29);
      const size=(5+14*h)*(1-u*.62),a=(1-u)**.8;
      c.save();c.translate(x,y);c.rotate(sign*(.28+u*.84));
      const pts=ice?[[0,-size],[size*.37,-size*.12],[size*.26,size*.53],[-size*.35,size*.34],[-size*.44,-size*.2]]:[[0,-size*.51],[size*.54,-size*.16],[size*.36,size*.46],[-size*.42,size*.54],[-size*.56,-size*.13]];
      line(c,pts);c.closePath();c.fillStyle=tint(theme[0],a);c.fill();c.lineWidth=1.1;c.strokeStyle=tint(ice?theme[2]:'#83472f',a);c.stroke();
      line(c,[pts[0],[0,0],pts[2],pts[1]]);c.closePath();c.fillStyle=tint(theme[1],a*.87);c.fill();c.restore();
    }
  }
  function fracture(c,t){
    const a=pulse(t),length=out(t)*164;
    for(const dir of [-1,1]){
      const p=[[0,0]];
      for(let i=1;i<=9;i++)p.push([dir*length*i/9,(hash(i*dir)-.5)*10]);
      line(c,p);luminous(c,themes.gold,2.5,a*.85);
      for(let i=2;i<9;i+=2){const [x,y]=p[i];line(c,[[x,y],[x+dir*13,y-5],[x+dir*24,y-3]]);luminous(c,themes.earth,1.2,a*.65);}
    }
  }
  function gust(c,t,theme,long,spread){
    const a=pulse(t);
    for(let i=0;i<7;i++){
      const y=(i-3)*spread*.3,run=long*(.53+hash(i+4)*.47),x=out(t)*37;
      c.beginPath();c.moveTo(x-run,y*.84);c.quadraticCurveTo(x-run*.33,y-6,x+10,y*.51);luminous(c,theme,1.2+hash(i)*1.5,a*(.58+hash(i+13)*.4));
    }
    flecks(c,t,31,theme,11,long*.63,spread*.9);
  }
  function flame(c,t){
    const theme=themes.ember,a=pulse(t,.04),r=16+out(t)*70;
    glow(c,0,0,r*1.5,theme[0],a*.56);
    for(let i=0;i<9;i++){
      const ang=i*TAU/9+t*.46,s=r*(.55+hash(i)*.42);
      c.save();c.rotate(ang);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(s*.44,-s*.16,s*.84,-s*.55,s,-s*.05);c.bezierCurveTo(s*.81,-s*.2,s*.76,s*.37,s*.42,s*.31);c.quadraticCurveTo(s*.12,s*.38,0,0);
      const g=c.createLinearGradient(0,0,s,0);g.addColorStop(0,tint(theme[2],a));g.addColorStop(.38,tint(theme[1],a*.94));g.addColorStop(1,tint(theme[0],a*.13));c.fillStyle=g;c.fill();c.restore();
    }
    ring(c,t,themes.gold,105,.58);flecks(c,t,22,theme,28,130,103);
  }
  function lightning(c,points,t){
    const a=pulse(t,.035),theme=themes.storm;
    for(let j=1;j<points.length;j++){
      const start=points[j-1],end=points[j],dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy)||1;
      const n=Math.max(5,Math.ceil(len/19)),path=[];
      for(let i=0;i<=n;i++){
        const u=i/n,bend=(hash(i+j*23+Math.floor(t*12)*17)-.5)*26*Math.sin(Math.PI*u);
        path.push([start.x+dx*u-dy/len*bend,start.y+dy*u+dx/len*bend]);
      }
      line(c,path);luminous(c,theme,2.4,a);
      for(let i=2;i<n-1;i+=3){const [x,y]=path[i],s=i%2?1:-1;line(c,[[x,y],[x+11,y+s*13],[x+20,y+s*10],[x+26,y+s*22]]);luminous(c,theme,1,a*.7);}
      glow(c,end.x,end.y,32,theme[0],a*.54);twinkle(c,end.x,end.y,8,theme,a);
    }
  }
  function orbit(c,t,theme,r,vertical=false){
    const a=pulse(t),p=out(t);
    glow(c,0,0,r*1.28,theme[0],a*.31);
    for(let i=0;i<3;i++){
      const rr=(.3+p*.7)*r*(1-i*.16),phase=t*7+i*TAU/3;
      c.save();c.rotate(vertical?.27-i*.29:.07-i*.07);
      ellipse(c,0,0,vertical?rr*.56:rr,vertical?rr:rr*.45,phase,phase+2.5);luminous(c,theme,2.4-i*.42,a*(1-i*.13));c.restore();
      twinkle(c,Math.cos(phase+2.5)*rr*(vertical?.55:1),Math.sin(phase+2.5)*rr*(vertical?1:.45),7-i,theme,a,phase*.3);
    }
    flecks(c,t,44,theme,22,r,r*.92);
  }
  function release(c,t,theme,count){
    const a=pulse(t,.06),p=out(t);
    glow(c,0,0,count>1?27:19,theme[0],a*.52);
    for(let i=0;i<count;i++){
      const y=(i-(count-1)/2)*12,shift=28*p;
      c.beginPath();c.moveTo(-21+shift*.2,y-2);c.quadraticCurveTo(1+shift*.4,y-7,22+shift,y);luminous(c,theme,1.5,a);
      twinkle(c,8+shift,y,6,theme,a);
    }
    flecks(c,t,51,theme,9,37,21);
  }
  function draw(c,name,x,y,t,facing=1,extra={}){
    if(t<=0||t>=1)return;
    c.save();
    if(name==='chain'){lightning(c,extra.points||[],t);c.restore();return;}
    c.translate(x,y);c.scale(facing,1);
    switch(name){
      case 'slash': ribbon(c,t,themes.steel,58,false);break;
      case 'cleave': ribbon(c,t,themes.gold,99,true);break;
      case 'earthsplitter': fracture(c,t);ring(c,t,themes.earth,181,.13);shards(c,t,themes.earth,142,false);flecks(c,t,83,themes.gold,24,174,63,true);break;
      case 'warcry': orbit(c,t,themes.gold,89);ring(c,t-.12,themes.ember,110,.68);break;
      case 'charge': gust(c,t,themes.steel,130,31);break;
      case 'spark': release(c,t,themes.gold,1);break;
      case 'fire': release(c,t,themes.ember,1);break;
      case 'fireburst': flame(c,t);break;
      case 'nova': ring(c,t,themes.frost,166,.34);ring(c,t-.14,themes.steel,144,.28);shards(c,t,themes.frost,137,true);flecks(c,t,91,themes.frost,25,161,78,true);break;
      case 'blink': orbit(c,t,themes.violet,64,true);break;
      case 'arrow': release(c,t,themes.wind,1);break;
      case 'twin': release(c,t,themes.wind,2);break;
      case 'pierce': release(c,t,themes.frost,1);gust(c,t,themes.frost,67,13);break;
      case 'rain': ring(c,t,themes.wind,120,.14);flecks(c,t,68,themes.wind,19,126,41,true);break;
      case 'vault': ring(c,t,themes.wind,64,.19);gust(c,t,themes.wind,66,19);break;
    }
    c.restore();
  }
  function projectile(c,name,clock){
    const theme={spark:themes.gold,fire:themes.ember,arrow:themes.wind,bigarrow:themes.frost}[name];
    if(!theme)return;
    const r=name==='fire'?19:name==='bigarrow'?13:8, length=name==='bigarrow'?83:name==='fire'?57:name==='spark'?33:26;
    c.save();glow(c,2,0,r*1.85,theme[0],name==='arrow'?.15:.43);
    for(let i=0;i<(name==='arrow'?1:3);i++){
      const y=(i-1)*3,wave=Math.sin(clock*35+i*3)*r*.39;
      const g=c.createLinearGradient(-length,0,10,0);g.addColorStop(0,tint(theme[0],0));g.addColorStop(.62,tint(theme[0],.57));g.addColorStop(1,tint(theme[2],.93));
      c.beginPath();c.moveTo(-length+i*9,y+wave);c.quadraticCurveTo(-length*.34,y-wave,7,y*.4);c.lineWidth=i===1?2.8:1.25;c.strokeStyle=g;c.stroke();
    }
    if(name!=='arrow')twinkle(c,7,0,r*.52,theme,.9,clock*4);
    c.restore();
  }
  function storm(c,x,y,half,clock,seed,alpha){
    const theme=themes.wind;c.save();c.translate(x,y);
    ellipse(c,0,0,half,9);luminous(c,theme,1.5,alpha*.73);
    for(let i=0;i<10;i++){
      const u=(clock*2.2+hash(seed+i*19))%1,xx=(hash(seed+i*31)-.5)*half*1.88;
      if(u<.89){const yy=-241*(1-u);line(c,[[xx+16,yy-39],[xx,yy]]);luminous(c,theme,1.25,alpha*.46);}
      else twinkle(c,xx,-4,5*(1-u)*10,theme,alpha*.89);
    }
    c.restore();
  }
  const castNames={warrior:{basic:'slash',a:'cleave',s:'earthsplitter',d:'warcry',f:'charge'},mage:{basic:'spark',a:'fire',d:'nova'},archer:{basic:'arrow',a:'twin',s:'pierce',d:'rain',f:'vault'}};
  const life={slash:.32,cleave:.43,earthsplitter:.79,warcry:.86,charge:.44,spark:.28,fire:.32,fireburst:.65,chain:.38,nova:.75,blink:.62,arrow:.23,twin:.31,pierce:.38,rain:.55,vault:.48};
  function createLayer(){
    const effects=[];
    function add(name,x,y,facing=1,extra={}){
      if(effects.length>=48)effects.shift();
      effects.push({name,x,y,facing,extra,age:0});
    }
    return {
      cast(e){
        const name=castNames[e.cls]?.[e.key];if(!name)return;
        const f=e.facing||1,ground=['earthsplitter','rain','vault','nova'].includes(name);
        const x=e.x+(name==='rain'?175*f:['spark','fire','arrow','twin','pierce'].includes(name)?23*f:0);
        add(name,x,e.y-(ground?1:name==='charge'?30:36),f);
      },
      event(e){
        if(e.type==='bolt')add('chain',0,0,1,{points:e.pts});
        if(e.type==='explode')add('fireburst',e.x,e.y);
        if(e.type==='blink'){add('blink',e.from,e.y-30);add('blink',e.to,e.y-30,-1);}
      },
      draw(c,dt){
        for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.age+=dt;const t=e.age/life[e.name];if(t>=1)effects.splice(i,1);else draw(c,e.name,e.x,e.y,t,e.facing,e.extra);}
      },
      clear(){effects.length=0;},
    };
  }
  return {createLayer, draw, projectile, storm, life};
})();
