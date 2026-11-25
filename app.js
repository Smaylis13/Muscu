let data={};
try{data=JSON.parse(localStorage.getItem('muscu-prog')||'{}')}catch(e){data={}}
Object.values(data).forEach(p=>{if(p.exos!==undefined){p.ex=p.exos.split('\n').map(s=>s.trim()).filter(Boolean).map(n=>({n}));delete p.exos;delete p.titre}if(!p.ex)p.ex=[]});
function save(){try{localStorage.setItem('muscu-prog',JSON.stringify(data))}catch(e){}}
const $=id=>document.getElementById(id);
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=e=>e.n+(e.s&&e.r?' '+e.s+'×'+e.r:'')+(e.kg?' '+e.kg+' kg':'');
const lines=p=>(p.ex||[]).map(fmt);
const has=p=>!!p&&p.ex.length>0;
let cur=new Date();cur.setDate(1);
let openKey=null,copyFrom=null,timer=null;

function render(){
  $('mois').textContent=cur.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const first=new Date(cur.getFullYear(),cur.getMonth(),1);
  const off=(first.getDay()+6)%7;const start=new Date(first);start.setDate(off>=5?1+(7-off):1-off);
  const todayK=key(new Date());
  let h='';
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    if(d.getDay()===0||d.getDay()===6)continue;
    if(i>0&&i%7===0&&d.getMonth()!==cur.getMonth())break;
    const k=key(d),p=data[k];
    const cls=['cell',d.getMonth()!==cur.getMonth()?'out':'',has(p)?'has':'',p&&p.skip?'skip':'',p&&p.rest?'rest':'',k===todayK?'today':''].join(' ');
    const lab=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+(p&&p.skip?' : pas entraîné':p&&p.rest?' : repos':has(p)?' : programme prévu':'');
    h+=`<button class="${cls}" data-k="${k}" aria-label="${lab}"><span class="n">${d.getDate()}</span>${p?lines(p).map(l=>`<span class="t">${esc(l)}</span>`).join(''):''}${p&&p.skip?'<span class="x">✕</span>':''}${p&&p.rest?'<span class="x z">😴</span>':''}</button>`;
  }
  $('grid').innerHTML=h;
}
function dateLabel(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
function closeSheet(){$('veil').classList.remove('on');openKey=null;clearInterval(timer)}

function showView(k){
  clearInterval(timer);openKey=k;const p=data[k]||{ex:[]};
  const st=p.skip?'Pas entraîné':p.rest?'Jour de repos':has(p)?'Programme du jour':'Pas de séance prévue';
  $('sheet').innerHTML=`<h2 id="sd">${dateLabel(k)}</h2><p class="sub">${st}</p>
  ${has(p)?`<ul class="ex">${p.ex.map(e=>`<li>${esc(fmt(e))}</li>`).join('')}</ul>`:'<p class="empty">Aucun exercice pour ce jour.</p>'}
  <div class="row">${has(p)?'<button class="btn main" id="go">Démarrer la séance</button>':''}
  <button class="btn ${has(p)?'':'main'}" id="edit">${has(p)?'Modifier':'Ajouter un programme'}</button>
  ${has(p)?'<button class="btn" id="cp">Copier</button>':`<button class="btn" id="rest">${p.rest?'Retirer le repos':'😴 Jour de repos'}</button>`}
  <button class="btn" id="close">Fermer</button></div>`;
  $('edit').onclick=()=>showEdit(k);$('close').onclick=closeSheet;
  if($('go'))$('go').onclick=()=>showSession(k);
  if($('cp'))$('cp').onclick=()=>{copyFrom=k;closeSheet();$('bn').hidden=false};
  if($('rest'))$('rest').onclick=()=>{const q=data[k]||{ex:[]};if(q.rest)delete q.rest;else{q.rest=true;delete q.skip}if(!q.rest&&!q.skip&&!q.ex.length)delete data[k];else data[k]=q;save();render();showView(k)};
  $('veil').classList.add('on');$('edit').focus();
}

function showSession(k){
  const p=data[k];p.d=p.ex.map(()=>0);const t0=Date.now();
  const draw=()=>{$('sl').innerHTML=p.ex.map((e,i)=>{const n=Number(e.s)||1;return`<div class="sx"><b>${esc(fmt(e))}</b><div class="chips">${Array.from({length:n},(_,j)=>`<button class="chip ${j<p.d[i]?'on':''}" data-i="${i}" data-j="${j}" aria-label="Série ${j+1}">${n>1?j+1:'✓'}</button>`).join('')}</div></div>`}).join('')};
  $('sheet').innerHTML=`<h2 id="sd">Séance en cours</h2><p class="chr" id="chr">00:00</p><div id="sl"></div><div class="row" style="margin-top:16px"><button class="btn main" id="fin">Terminer</button></div>`;
  draw();
  $('sl').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const i=+b.dataset.i,j=+b.dataset.j;p.d[i]=(j+1===p.d[i])?j:j+1;save();draw()};
  clearInterval(timer);timer=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);$('chr').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},1000);
  $('fin').onclick=()=>{save();closeSheet()};
}

const rowHtml=e=>`<div class="er"><input class="en" data-f="n" value="${esc(e.n||'')}" placeholder="Exercice" aria-label="Exercice" autocomplete="off"><input data-f="s" type="number" inputmode="numeric" min="0" value="${e.s||''}" placeholder="Séries" aria-label="Séries"><input data-f="r" type="number" inputmode="numeric" min="0" value="${e.r||''}" placeholder="Reps" aria-label="Répétitions"><input data-f="kg" type="number" inputmode="decimal" step="0.5" min="0" value="${e.kg||''}" placeholder="kg" aria-label="Charge en kg"><button class="ic rm" aria-label="Supprimer l’exercice">✕</button></div>`;

function showEdit(k){
  const p=data[k]||{ex:[]};
  $('sheet').innerHTML=`<h2 id="sd">${dateLabel(k)}</h2><p class="sub">${has(p)?'Modifier le programme':'Nouveau programme'}</p>
  <div id="rows">${(p.ex.length?p.ex:[{}]).map(rowHtml).join('')}</div>
  <button class="btn" id="add">+ Exercice</button>
  <div class="row" style="margin-top:16px"><button class="btn main" id="ok">Enregistrer</button><button class="btn" id="no">Annuler</button>${has(p)?'<button class="btn del" id="rm">Supprimer</button>':''}</div>`;
  $('add').onclick=()=>{$('rows').insertAdjacentHTML('beforeend',rowHtml({}));$('rows').lastElementChild.querySelector('input').focus()};
  $('rows').onclick=e=>{const b=e.target.closest('.rm');if(b)b.parentElement.remove()};
  $('ok').onclick=()=>{
    const ex=[...document.querySelectorAll('#rows .er')].map(r=>{const g=f=>r.querySelector(`[data-f="${f}"]`).value.trim();return{n:g('n'),s:g('s'),r:g('r'),kg:g('kg')}}).filter(e=>e.n);
    const q=data[k]||{ex:[]};q.ex=ex;q.d=[];if(ex.length){delete q.skip;delete q.rest}
    if(!ex.length&&!q.skip&&!q.rest)delete data[k];else data[k]=q;
    save();render();closeSheet();
  };
  $('no').onclick=()=>showView(k);
  if($('rm'))$('rm').onclick=()=>{delete data[k];save();render();closeSheet()};
  $('rows').querySelector('input').focus();
}

function toggleSkip(k){
  const q=data[k]||{ex:[]};
  if(q.skip)delete q.skip;
  else if(q.ex.length){if(navigator.vibrate)navigator.vibrate([20,40,20]);return}
  else{q.skip=true;delete q.rest}
  if(!q.skip&&!q.rest&&!q.ex.length)delete data[k];else data[k]=q;
  save();render();
}
let lpT=null,lp=false,lpX=0,lpY=0;
const lpClear=()=>{clearTimeout(lpT);lpT=null};
$('grid').addEventListener('pointerdown',e=>{lp=false;const b=e.target.closest('.cell');if(!b||copyFrom)return;lpX=e.clientX;lpY=e.clientY;lpClear();lpT=setTimeout(()=>{lp=true;lpT=null;if(navigator.vibrate)navigator.vibrate(30);toggleSkip(b.dataset.k)},500)});
$('grid').addEventListener('pointermove',e=>{if(lpT&&Math.hypot(e.clientX-lpX,e.clientY-lpY)>10)lpClear()});
['pointerup','pointercancel','pointerleave'].forEach(n=>$('grid').addEventListener(n,lpClear));
$('grid').addEventListener('contextmenu',e=>e.preventDefault());
$('grid').onclick=e=>{
  if(lp){lp=false;return}
  const b=e.target.closest('.cell');if(!b)return;const k=b.dataset.k;
  if(copyFrom){
    if(k!==copyFrom){data[k]={ex:data[copyFrom].ex.map(x=>({...x}))};save()}
    copyFrom=null;$('bn').hidden=true;render();return;
  }
  showView(k);
};
$('bn-x').onclick=()=>{copyFrom=null;$('bn').hidden=true};
$('veil').onclick=e=>{if(e.target===$('veil'))closeSheet()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&openKey)closeSheet()});
$('prev').onclick=()=>{cur.setMonth(cur.getMonth()-1);render()};
$('next').onclick=()=>{cur.setMonth(cur.getMonth()+1);render()};
$('today').onclick=()=>{cur=new Date();cur.setDate(1);render()};

let dl={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}};$('exp').hidden=false;
function wrap(x,text,maxW){const out=[];let line='';for(const w of text.split(' ')){const t=line?line+' '+w:w;if(x.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line);return out}
async function exportPng(){
  try{await document.fonts.ready}catch(e){}
  const W=1200,pad=30,gap=8,cw=(W-pad*2-gap*4)/5,fam='Barlow,system-ui,sans-serif',LH=28;
  const first=new Date(cur.getFullYear(),cur.getMonth(),1);
  const off=(first.getDay()+6)%7;const start=new Date(first);start.setDate(off>=5?1+(7-off):1-off);
  const c=document.createElement('canvas');const x=c.getContext('2d');
  x.font='500 22px '+fam;
  const weeks=[];
  for(let w=0;w<6;w++){
    const row=[];for(let j=0;j<5;j++){const d=new Date(start);d.setDate(start.getDate()+w*7+j);row.push(d)}
    if(w>0&&row[0].getMonth()!==cur.getMonth())break;
    weeks.push(row.map(d=>{const p=data[key(d)];return{d,skip:!!(p&&p.skip),rest:!!(p&&p.rest),inM:d.getMonth()===cur.getMonth(),l:p?lines(p).flatMap(s=>wrap(x,s,cw-24)):[]}}));
  }
  const heights=weeks.map(r=>Math.max(120,52+Math.max(...r.map(o=>o.l.length))*LH+16));
  const H=190+heights.reduce((a,b)=>a+b+gap,0)+pad;
  c.width=W;c.height=H;
  const rr=(X,Y,w,h)=>{x.beginPath();if(x.roundRect)x.roundRect(X,Y,w,h,10);else x.rect(X,Y,w,h)};
  x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.textBaseline='top';x.textAlign='left';x.fillStyle='#1B2127';x.font='700 56px '+fam;
  const titre=cur.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  x.fillText(titre.charAt(0).toUpperCase()+titre.slice(1),pad,40);
  ['Lun','Mar','Mer','Jeu','Ven'].forEach((n,i)=>{const X=pad+i*(cw+gap);rr(X,130,cw,48);x.fillStyle='#1B2127';x.fill();x.fillStyle='#fff';x.font='700 28px '+fam;x.textAlign='center';x.fillText(n,X+cw/2,139);x.textAlign='left'});
  let y=190;
  weeks.forEach((r,wi)=>{
    r.forEach((o,i)=>{const X=pad+i*(cw+gap),h=heights[wi],has=o.l.length>0;
      rr(X,y,cw,h);x.fillStyle=has?'#E3EAFF':'#fff';x.fill();x.strokeStyle=has?'#2B59FF':'#D5DBE0';x.lineWidth=2;x.stroke();
      x.globalAlpha=o.inM?1:.4;x.fillStyle='#1B2127';x.font='700 26px '+fam;x.fillText(String(o.d.getDate()),X+12,y+10);
      x.font='500 22px '+fam;o.l.forEach((t,k)=>x.fillText(t,X+12,y+48+k*LH));
      if(o.skip){x.fillStyle='#C23B22';x.font='700 64px '+fam;x.textAlign='center';x.fillText('✕',X+cw/2,y+h/2-32);x.textAlign='left'}
      if(o.rest){x.font='56px '+fam;x.textAlign='center';x.fillText('😴',X+cw/2,y+h/2-28);x.textAlign='left'}
      x.globalAlpha=1});
    y+=heights[wi]+gap;
  });
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));
  if(!blob)return;
  try{await dl.save({filename:'programme-muscu-'+cur.getFullYear()+'-'+String(cur.getMonth()+1).padStart(2,'0')+'.png',data:blob})}catch(e){}
}
$('exp').onclick=exportPng;
let sx=0,sy=0;const area=document.querySelector('main');
area.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
area.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5){cur.setMonth(cur.getMonth()+(dx<0?1:-1));render()}},{passive:true});
render();
