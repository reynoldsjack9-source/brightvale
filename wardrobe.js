'use strict';
const spriteData={
  "Vanguard": [
    "art/vanguard-compact-idle.png",
    "art/vanguard-wardrobe-alt.png"
  ],
  "Arcanist": [
    "art/arcanist-compact-idle.png",
    "art/arcanist-wardrobe-alt.png"
  ],
  "Ranger": [
    "art/ranger-compact-idle.png",
    "art/ranger-wardrobe-alt.png"
  ]
};

// Each polygon isolates a piece of the 256 px sprite. Offsets align the new
// piece to the approved idle pose without redrawing the face or the stance.
const geometry={
  Vanguard:{
    base:{
      hat:[['35 0 L186 0 187 84 169 87 154 78 136 79 127 82 115 77 105 78 98 88 87 93 82 106 73 116 66 135 36 135Z']],
      body:[['38 145 L82 120 107 119 118 126 137 127 146 122 161 127 163 153 151 160 140 160 147 181 154 188 164 191 171 212 154 213 150 194 130 192 116 192 105 194 97 197 86 211 76 210 86 192 91 184 92 168 83 158 70 169 59 173 49 199 35 199Z']],
      boots:[['76 224 L120 224 123 248 77 248Z'],['124 224 L168 224 171 248 123 248Z']],
      gloves:[['71 155 L81 156 91 160 94 169 90 178 83 178 67 172 67 165Z'],['143 158 L152 154 160 158 166 170 171 181 170 193 158 198 150 194 147 185 148 177 141 169Z']],
      weapon:[['63 171 L72 171 97 184 98 191 93 197 84 195 76 216 47 241 41 241 42 212 56 188 51 184 55 176Z']],
    },
    alt:{
      hat:[['60 0 L210 0 208 87 184 87 176 78 158 75 147 81 135 77 125 79 115 90 104 87 99 94 94 107 84 132 61 133Z',-17,0]],
      body:[['87 115 L114 114 126 119 142 125 158 117 175 119 186 131 185 150 169 155 167 168 180 187 201 222 196 226 172 227 169 201 151 199 142 193 135 199 106 199 101 216 116 226 93 226 87 203 92 188 109 174 109 156 92 151 85 143Z',-17,3]],
      boots:[['103 196 L138 196 137 247 103 247Z',-19,0],['146 197 L185 197 185 247 146 247Z',-18,0]],
      gloves:[['93 148 L107 146 121 154 121 167 114 183 101 191 87 185 90 167Z',-17,4],['164 152 L180 148 188 158 193 179 187 191 170 188 162 170Z',-16,7]],
      weapon:[['49 183 L80 183 96 175 104 175 104 182 93 194 89 198 95 210 102 217 90 240 52 248 49 225Z',-13,3]],
    },
  },
  Arcanist:{
    base:{
      hat:[['48 9 L183 9 185 60 174 77 167 72 159 57 145 59 135 67 122 74 108 77 94 83 84 96 61 96 48 82Z']],
      body:[['66 146 L90 122 95 107 112 103 122 108 136 111 141 120 153 127 153 137 161 138 162 152 156 174 152 184 157 201 149 218 126 219 111 216 88 215 74 210 83 189 87 175 78 174 64 167Z']],
      boots:[['79 216 L121 216 124 248 79 248Z'],['121 216 L163 216 164 248 121 248Z']],
      gloves:[['80 155 L102 157 112 167 107 181 94 182 82 175 77 169Z'],['156 136 L176 135 179 147 174 158 157 158 152 149Z']],
      weapon:[['154 82 L186 81 193 112 179 125 175 137 165 137 161 126 164 117 154 108Z'],['161 154 L173 154 171 177 166 195 166 230 151 232 151 220 155 199 155 177Z']],
    },
    alt:{
      hat:[['58 6 L190 7 190 60 176 72 168 58 155 58 143 63 135 70 118 71 106 78 89 80 81 94 60 97Z',-5,1]],
      body:[['76 140 L92 123 89 108 113 97 126 101 139 102 150 110 157 123 164 134 159 144 158 160 154 169 158 188 148 205 132 211 121 215 105 208 84 214 80 204 87 187 95 174 89 172 81 162 76 156Z',0,3]],
      boots:[['85 203 L124 203 123 246 83 246Z',-2,0],['123 203 L163 203 167 246 124 246Z',-2,0]],
      gloves:[['91 149 L109 149 112 157 111 172 100 175 91 171 88 162Z',-6,7],['161 127 L176 128 180 139 177 150 160 152 157 143Z',-3,6]],
      weapon:[['160 73 L195 73 197 107 179 115 177 130 165 130 163 122 168 111 160 109Z',-3,5],['160 147 L175 148 170 180 166 205 166 231 151 233 153 211 156 176Z',-3,6]],
    },
  },
  Ranger:{
    base:{
      hat:[['49 11 L167 11 170 66 163 70 149 57 137 59 126 63 114 70 102 73 91 86 85 100 65 108 51 103Z']],
      body:[['78 110 L93 103 110 99 118 105 132 108 144 112 158 130 157 145 163 153 152 170 153 188 153 201 92 201 91 191 97 175 90 170 86 154 88 144 82 126Z']],
      boots:[['87 198 L123 198 123 248 85 248Z'],['122 197 L163 197 166 248 121 248Z']],
      gloves:[['86 147 L103 151 108 164 104 179 94 186 81 183 80 171 81 158Z'],['146 147 L161 145 167 152 179 159 180 174 172 181 158 182 149 171Z']],
      weapon:[['157 149 L170 120 171 111 190 111 194 135 181 162 174 163 174 157 166 155Z'],['157 174 L171 175 175 176 175 190 169 210 149 212 147 202 153 188Z']],
    },
    alt:{
      hat:[['61 9 L174 8 178 62 169 60 156 51 143 54 134 61 120 62 110 67 103 78 100 90 106 98 114 104 107 112 93 111 85 117 70 122 61 112Z',-3,0]],
      body:[['79 112 L91 105 106 99 116 101 125 109 144 108 150 121 153 132 154 146 161 151 149 159 149 173 153 185 151 199 96 199 96 186 100 173 101 158 97 151 86 151 85 131Z',-2,3]],
      boots:[['91 194 L124 194 126 248 88 248Z',-2,0],['123 194 L166 194 169 248 122 248Z',-3,0]],
      gloves:[['87 148 L106 150 109 163 105 177 93 181 86 177 82 168Z',0,1],['145 146 L158 149 168 155 178 159 182 170 177 177 164 179 150 169Z',-2,2]],
      weapon:[['158 149 L168 123 172 113 190 112 193 129 192 149 180 164 173 162 170 155 164 154Z',-3,1],['154 173 L171 173 175 175 175 191 168 209 153 213 147 206 150 191Z',-1,2]],
    },
  },
};

const slots = {body:'Body', boots:'Boots', gloves:'Gloves', hat:'Hat', weapon:'Weapon'};
const names = {
  Vanguard:[['Clover Guard','Ember Guard'],['Squire Boots','Iron Greaves'],['Blue Bracers','Ember Gauntlets'],['Red Headband','Suncrest Helm'],['Silver Sword','Ember Axe']],
  Arcanist:[['Amethyst Robe','Moonweave Coat'],['Gold Cuff Boots','Moonstep Boots'],['Silk Cuffs','Starweaver Gloves'],['Goldbell Hat','Moonshade Hat'],['Sun Orb Staff','Crescent Staff']],
  Ranger:[['Clover Tunic','Foxtrail Coat'],['Trail Boots','Highland Boots'],['Leather Gloves','Foxhide Gloves'],['Feather Bandana','Scout Hood'],['Willow Bow','Bramble Bow']],
};
const key='brightvale-wardrobe-v1';
const blank=()=>Object.fromEntries(Object.keys(slots).map(slot=>[slot,0]));
let saved={};
try{saved=JSON.parse(localStorage.getItem(key))||{};}catch{}
let hero=Object.hasOwn(names,saved.hero)?saved.hero:'Vanguard';
const outfits=Object.fromEntries(Object.keys(names).map(name=>[name,Object.fromEntries(Object.keys(slots).map(slot=>[slot,saved.outfits?.[name]?.[slot]===1?1:0]))]));
const byId=id=>document.getElementById(id);
const images={};
const layers={};

function persist(){
  try{localStorage.setItem(key,JSON.stringify({hero,outfits}));}catch{}
}

function canvas(){
  const cv=document.createElement('canvas');
  cv.width=cv.height=256;
  return cv;
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=src;
  });
}

function path(points){return new Path2D('M'+points+'Z');}

function layer(image, specs){
  const cv=canvas();
  const ctx=cv.getContext('2d');
  for(const [outline,dx=0,dy=0,sx=1,sy=1] of specs){
    ctx.save();
    ctx.translate(dx,dy);
    ctx.scale(sx,sy);
    ctx.clip(path(outline));
    ctx.drawImage(image,0,0);
    ctx.restore();
  }
  return cv;
}

function thumb(layerCanvas){
  const rgba=layerCanvas.getContext('2d').getImageData(0,0,256,256).data;
  let x0=256,y0=256,x1=-1,y1=-1;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    if(rgba[(y*256+x)*4+3]<90)continue;
    x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
  }
  const icon=document.createElement('canvas');
  icon.width=76;icon.height=72;
  if(x1<x0)return icon.toDataURL();
  const w=x1-x0+1,h=y1-y0+1,scale=Math.min(64/w,64/h);
  icon.getContext('2d').drawImage(layerCanvas,x0,y0,w,h,(76-w*scale)/2,(72-h*scale)/2,w*scale,h*scale);
  return icon.toDataURL();
}

function drawPortrait(){
  const ctx=byId('portrait').getContext('2d');
  ctx.clearRect(0,0,256,256);
  const equipped=outfits[hero];
  const art=layers[hero];
  ctx.drawImage(images[hero][0],0,0);
  const changed=Object.keys(slots).filter(slot=>equipped[slot]===1);
  if(!changed.length)return;
  ctx.globalCompositeOperation='destination-out';
  for(const slot of changed){
    for(const [outline] of geometry[hero].base[slot])ctx.fill(path(outline));
  }
  ctx.globalCompositeOperation='source-over';
  for(const slot of ['boots','body','weapon','gloves','hat']){
    if(equipped[slot]===1)ctx.drawImage(art[slot][1],0,0);
    else if(slot==='weapon'||slot==='gloves')ctx.drawImage(art[slot][0],0,0);
  }
}

function render(){
  byId('hero-name').textContent=hero;
  drawPortrait();
  for(const button of byId('classes').children)button.setAttribute('aria-pressed',String(button.dataset.hero===hero));
  byId('inventory').innerHTML=Object.entries(slots).map(([slot,label],row)=>`<div class="slot" role="group" aria-label="${label}"><h3>${label}</h3>${names[hero][row].map((name,i)=>`<button type="button" class="piece" data-slot="${slot}" data-item="${i}" aria-pressed="${outfits[hero][slot]===i}"><img alt="" src="${layers[hero][slot].icons[i]}"><span>${name}</span></button>`).join('')}</div>`).join('');
}

async function start(){
  await Promise.all(Object.keys(names).map(async name=>{
    const sources=await Promise.all(spriteData[name].map(loadImage));
    images[name]=sources;
    layers[name]=Object.fromEntries(Object.keys(slots).map(slot=>{
      const set=[layer(sources[0],geometry[name].base[slot]),layer(sources[1],geometry[name].alt[slot])];
      set.icons=set.map(thumb);
      return [slot,set];
    }));
  }));
  for(const name of Object.keys(names)){
    const button=document.createElement('button');
    button.type='button';button.dataset.hero=name;button.textContent=name;
    button.addEventListener('click',()=>{hero=name;persist();render();});
    byId('classes').append(button);
  }
  byId('inventory').addEventListener('click',event=>{
    const button=event.target.closest('button[data-slot]');
    if(!button)return;
    const {slot,item}=button.dataset;
    outfits[hero][slot]=Number(item);persist();render();
    byId('inventory').querySelector(`[data-slot="${slot}"][data-item="${item}"]`).focus({preventScroll:true});
    byId('status').textContent=`Equipped ${button.textContent.trim()}.`;
  });
  byId('reset').addEventListener('click',()=>{outfits[hero]=blank();persist();render();byId('status').textContent=`${hero} outfit reset.`;});
  render();
  document.body.dataset.ready='true';
}

start().catch(()=>{byId('inventory').textContent='The wardrobe art could not be loaded.';});
