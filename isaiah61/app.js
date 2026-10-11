(()=>{
'use strict';
/* ═══ 유틸 ═══ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const byId=(a,id)=>a.find(x=>x.id===id);
const now=()=>Date.now();

/* ═══ 아이콘 ═══ */
const IC={
  plan:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14c2.5 0 4.5 1.9 4.5 5"/>',
  gear:'<path d="M3 8l9-5 9 5v9l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/>',
  time:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  sheet:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  phone:'<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  rot:'<path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check:'<path d="M5 12.500l4.500 4.500L19 7.500"/>', warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  cube:'<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9z"/><path d="M4 7.500L12 12l8-4.500M12 12v9"/>',
  sq:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h8V4"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.800"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  pin:'<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>',
  dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', ul:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  paste:'<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V3h6v2M9 11h6M9 15h4"/>',
  fov:'<path d="M12 20L4 6M12 20l8-14"/><path d="M4 6a12 12 0 0 1 16 0"/>', dist:'<path d="M4 12h16M4 8v8M20 8v8"/>',
  len:'<path d="M3 17L17 3M6 14l2 2M9 11l2 2M12 8l2 2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.500-7 8-7s8 3 8 7"/>',
  chev:'<path d="M9 5l7 7-7 7"/>', send:'<path d="M4 12l16-8-6 16-3-7z"/>',
  /* 카메라 종류 */
  gimbal:'<rect x="8" y="3" width="8" height="6" rx="1.500"/><path d="M5.500 8a6.500 6.500 0 0 0 13 0"/><path d="M12 14.500V21M10 21h4"/>',
  tripod:'<rect x="7" y="3" width="10" height="6" rx="1.500"/><path d="M12 9v4M12 13l-5 8M12 13l5 8M12 13v8"/>',
  hand:'<rect x="3" y="8" width="13" height="9" rx="2"/><path d="M16 11l5-2.500v8L16 14"/><path d="M7 8V6h5v2"/>',
  jib:'<path d="M3 20h8M7 20v-8M4 14L19 7"/><rect x="17" y="3" width="5" height="5" rx="1"/><path d="M3 13l2 3"/>',
  dolly:'<rect x="8" y="3" width="8" height="6" rx="1.500"/><path d="M12 9v4M3 16h18"/><circle cx="7" cy="19" r="1.800"/><circle cx="17" cy="19" r="1.800"/>'
};
const ic=(n,s=24)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24">${IC[n]||''}</svg>`;

const CAMS={
  gimbal:{n:'짐벌',c:'#8b5cf6',fov:65,rng:.20},
  tripod:{n:'트라이',c:'#2563eb',fov:40,rng:.28},
  hand:{n:'핸드헬드',c:'#f97316',fov:70,rng:.18},
  jib:{n:'지미집',c:'#e11d48',fov:45,rng:.26,len:.18},
  dolly:{n:'다나돌리',c:'#059669',fov:45,rng:.24,len:.20}
};
const STAT={ok:{n:'준비',i:'check'},check:{n:'점검',i:'warn'},miss:{n:'부족',i:'x'}};
const HUES=['#2563eb','#059669','#d97706','#7c3aed','#db2777','#0891b2','#65a30d','#dc2626'];
const hue=s=>{s=String(s||'?');let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return HUES[h%HUES.length];};
const ini=n=>{n=String(n||'?').trim();return /[가-힣]/.test(n)&&n.length>=3?n.slice(-2):n.slice(0,2);};
const short=n=>String(n||'').length>4?String(n).slice(0,4):n;
const TABS=[{k:'plan',n:'도면',i:'plan',c:'--c-plan'},{k:'people',n:'인원',i:'people',c:'--c-people'},{k:'gear',n:'장비',i:'gear',c:'--c-gear'},{k:'time',n:'시간',i:'time',c:'--c-time'},{k:'sheet',n:'시트',i:'sheet',c:'--c-sheet'}];

/* ═══ 데이터 ═══ */
const KEY='isaiah61.v1', UIK='isaiah61.ui';
const COLS=['people','gear','sessions','plans','marks'];
const fresh=()=>({schema:1,cfg:{date1:'',u:0},people:[],gear:[],sessions:[],plans:[],marks:[],del:{},
  presets:{roles:['총괄','카메라','짐벌','지미집','스위처','모니터','오디오','송출','스태프'],
    wear:['무전기','인컴','이어피스','조끼','명찰','헤드셋','배터리벨트','우비'],
    cats:['카메라','렌즈','짐벌','삼각대','지미집','돌리','모니터','오디오','조명','전원','케이블','기타']}});
let S=null;
try{S=JSON.parse(localStorage.getItem(KEY));}catch(e){}
if(!S||S.schema!==1)S=fresh();
{const f=fresh();S.presets=S.presets||f.presets;for(const k in f.presets)S.presets[k]=S.presets[k]||f.presets[k];for(const c of COLS)S[c]=S[c]||[];S.del=S.del||{};S.cfg=S.cfg||f.cfg;}
let V={tab:'plan',day:1,plan:null,sheetP:'all',roleF:'',dayOnly:false,catF:''};
try{Object.assign(V,JSON.parse(localStorage.getItem(UIK))||{});}catch(e){}
V.sel=null;V.armed=null;
const saveUI=()=>{try{localStorage.setItem(UIK,JSON.stringify({tab:V.tab,day:V.day,plan:V.plan,sheetP:V.sheetP,roleF:V.roleF,dayOnly:V.dayOnly,catF:V.catF}));}catch(e){}};
const P=id=>byId(S.people,id);
const sortKo=(a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko');

/* 날짜 */
const dayDate=n=>{if(!S.cfg.date1)return null;const d=new Date(S.cfg.date1+'T00:00:00');if(isNaN(d))return null;d.setDate(d.getDate()+n-1);return d;};
const todayN=()=>{const d=S.cfg.date1&&new Date(S.cfg.date1+'T00:00:00');if(!d||isNaN(d))return 0;const t=new Date();t.setHours(0,0,0,0);const n=Math.round((t-d)/864e5)+1;return n>=1&&n<=3?n:0;};
if(todayN())V.day=todayN();

/* ═══ 저장 · 동기화 ═══ */
const SB={url:'https://mgvqhrdhshpuamihfvnp.supabase.co',
  anon:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnFocmRoc2hwdWFtaWhmdm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTE4NjQsImV4cCI6MjEwNDE4Nzg2NH0.fjDJuG-47YHU63lydUSZGAGg3FQ-DLGLp9ufnJ4SN30',
  table:'carescript',row:'isaiah61'};
let DB=null,pushT=0;
const setSt=s=>{const d=$('#dot');if(d)d.className='dot '+s;};
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
function save(){persist();clearTimeout(pushT);setSt(DB?'wait':'off');pushT=setTimeout(push,700);}
function touch(it){it.u=now();return it;}
function mergeIn(rem){
  if(!rem||rem.schema!==1)return false;
  const before=JSON.stringify(S);
  const del={...(rem.del||{})};for(const k in S.del)del[k]=Math.max(del[k]||0,S.del[k]);
  for(const c of COLS){const m=new Map();for(const it of [...(S[c]||[]),...(rem[c]||[])]){const o=m.get(it.id);if(!o||(it.u||0)>(o.u||0))m.set(it.id,it);}
    S[c]=[...m.values()].filter(it=>!(del[it.id]>=(it.u||0)));}
  const cut=now()-30*864e5;for(const k in del)if(del[k]<cut)delete del[k];
  S.del=del;
  if(((rem.cfg||{}).u||0)>(S.cfg.u||0))S.cfg=rem.cfg;
  for(const k of ['roles','wear','cats'])S.presets[k]=[...new Set([...(S.presets[k]||[]),...(((rem.presets||{})[k])||[])])];
  return JSON.stringify(S)!==before;
}
async function push(){
  if(!DB)return;
  try{
    setSt('wait');
    const r=await DB.from(SB.table).select('content,rev').eq('id',SB.row).maybeSingle();
    if(r.error)throw r.error;
    if(r.data&&mergeIn(r.data.content)){persist();render();}
    const u=await DB.from(SB.table).upsert({id:SB.row,content:S,rev:((r.data&&r.data.rev)||0)+1,updated_at:new Date().toISOString()});
    if(u.error)throw u.error;
    setSt('ok');
  }catch(e){console.warn('[i61] push',e);setSt('err');}
}
async function pull(){
  if(!DB)return;
  try{
    const r=await DB.from(SB.table).select('content').eq('id',SB.row).maybeSingle();
    if(r.error)throw r.error;
    if(!r.data){push();return;}
    if(mergeIn(r.data.content)){persist();render();}
    setSt('ok');
  }catch(e){console.warn('[i61] pull',e);setSt('err');}
}
function initSync(){
  if(/[?&]solo/.test(location.search)||!(window.supabase&&window.supabase.createClient)){setSt('off');return;}
  DB=window.supabase.createClient(SB.url,SB.anon,{auth:{persistSession:false}});
  setSt('wait');
  pull().then(()=>{push();DB.channel('i61').on('postgres_changes',{event:'*',schema:'public',table:SB.table,filter:'id=eq.'+SB.row},()=>pull()).subscribe();});
  addEventListener('online',push);
}

/* CRUD */
function put(col,it){touch(it);const i=S[col].findIndex(x=>x.id===it.id);if(i<0)S[col].push(it);else S[col][i]=it;save();render();return it;}
function drop(col,id){
  S[col]=S[col].filter(x=>x.id!==id);S.del[id]=now();
  if(col==='people'){
    for(const m of S.marks.filter(m=>m.ref===id)){if(m.type==='person'){S.marks=S.marks.filter(x=>x.id!==m.id);S.del[m.id]=now();}else{m.ref=null;touch(m);}}
    for(const g of S.gear)if(g.owner===id){g.owner=null;touch(g);}
    for(const s of S.sessions)if((s.crew||[]).includes(id)){s.crew=s.crew.filter(x=>x!==id);touch(s);}
  }
  if(col==='plans'){for(const m of S.marks.filter(m=>m.plan===id))S.del[m.id]=now();S.marks=S.marks.filter(m=>m.plan!==id);}
  save();render();
}

/* ═══ 이미지 (도면 원본은 별도 행/IndexedDB) ═══ */
const idb=(()=>{let p;const open=()=>p||(p=new Promise((res,rej)=>{const r=indexedDB.open('isaiah61',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));
  const tx=(m,f)=>open().then(d=>new Promise((res,rej)=>{const t=d.transaction('img',m);const rq=f(t.objectStore('img'));t.oncomplete=()=>res(rq&&rq.result);t.onerror=()=>rej(t.error);}));
  return {get:k=>tx('readonly',s=>s.get(k)).catch(()=>null),set:(k,v)=>tx('readwrite',s=>s.put(v,k)).catch(()=>{})};})();
const IMG={},PEND={},IMGEL={};
const ikey=pl=>pl.id+'@'+pl.iv;
function imgOf(pl){
  const k=ikey(pl);
  if(IMG[k])return IMG[k];
  if(!PEND[k]){PEND[k]=(async()=>{
    let d=await idb.get(k);
    if(!d&&DB){try{const r=await DB.from(SB.table).select('content').eq('id',SB.row+'-img-'+k).maybeSingle();d=r.data&&r.data.content&&r.data.content.d;if(d)idb.set(k,d);}catch(e){}}
    if(d){IMG[k]=d;render();}else{setTimeout(()=>{delete PEND[k];},4000);}
  })();}
  return null;
}
async function putImg(pl,data){
  const k=ikey(pl);IMG[k]=data;await idb.set(k,data);
  if(DB){try{await DB.from(SB.table).upsert({id:SB.row+'-img-'+k,content:{d:data},rev:1,updated_at:new Date().toISOString()});}catch(e){console.warn(e);}}
}
const loadImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
async function shrink(file){
  const url=URL.createObjectURL(file);
  try{
    const im=await loadImg(url),M=2200,s=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight));
    const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);
    const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
    return {data:c.toDataURL('image/jpeg',.88),w:c.width,h:c.height};
  }finally{URL.revokeObjectURL(url);}
}
function pickImage(cb){
  const f=document.createElement('input');f.type='file';f.accept='image/*';
  f.onchange=async()=>{if(f.files[0]){try{cb(await shrink(f.files[0]));}catch(e){console.warn(e);}}};
  f.click();
}

/* ═══ 모달 · 폼 ═══ */
function modal(inner){
  const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="box">${inner}</div>`;document.body.append(o);
  const kd=e=>{if(e.key==='Escape')close();};
  const close=()=>{o.remove();document.removeEventListener('keydown',kd);};
  document.addEventListener('keydown',kd);
  o.addEventListener('pointerdown',e=>{if(e.target===o)close();});
  $$('[data-x]',o).forEach(b=>b.onclick=close);
  return {o,box:o.firstElementChild,close};
}
function avHTML(p,cls=''){return `<span class="av ${cls}" style="--c:${hue(p&&(p.role||p.name))}">${esc(ini(p&&p.name))}</span>`;}
function form(title,fields,val,onSave,onDel,tc){
  const d={...val};
  const m=modal(`<h3>${title}<button class="ib" data-x>${ic('x')}</button></h3><div class="ff" style="display:flex;flex-direction:column;gap:14px"></div>
    <div class="btns">${onDel?`<button class="btn del" data-del>${ic('trash')}</button>`:''}<button class="btn" data-ok style="--tc:${tc||'var(--c-plan)'}">${ic('check')}저장</button></div>`);
  const ff=$('.ff',m.box);
  const chipsOf=f=>f.pre?S.presets[f.pre]:f.opts;
  const body=f=>{
    const v=d[f.k];
    switch(f.t){
      case 'text':case 'tel':case 'time':case 'date':return `<input class="in" type="${f.t}" ${f.t==='tel'?'inputmode="tel"':''} value="${esc(v||'')}" data-in="${f.k}">`;
      case 'num':return `<input class="in" type="number" inputmode="numeric" min="0" value="${esc(v==null?1:v)}" data-in="${f.k}">`;
      case 'area':return `<textarea class="in" data-in="${f.k}">${esc(v||'')}</textarea>`;
      case 'chips':case 'multi':case 'days':case 'day':{
        const opts=f.t==='days'||f.t==='day'?[1,2,3]:chipsOf(f);
        const sel=f.t==='multi'||f.t==='days'?(v||[]):[v];
        return `<div class="chips">${opts.map(o=>`<button type="button" class="chip ${sel.includes(o)?'on':''}" data-c="${f.k}" data-v="${esc(o)}">${f.t==='days'||f.t==='day'?o+'일':esc(o)}</button>`).join('')}${f.pre?`<button type="button" class="chip add" data-add="${f.k}">${ic('plus',16)}</button>`:''}</div>`;}
      case 'status':return `<div class="chips">${Object.keys(STAT).map(k=>`<button type="button" class="chip ${v===k?'on':''}" data-c="${f.k}" data-v="${k}">${ic(STAT[k].i,16)}${STAT[k].n}</button>`).join('')}</div>`;
      case 'person':case 'persons':{
        const sel=f.t==='persons'?(v||[]):[v];
        return `<div class="chips">${S.people.slice().sort(sortKo).map(p=>`<button type="button" class="chip ${sel.includes(p.id)?'on':''}" data-pp="${f.k}" data-v="${p.id}">${esc(p.name)}</button>`).join('')||'<span class="sub">—</span>'}</div>`;}
    }
    return '';
  };
  const draw=f=>{$(`[data-k="${f.k}"] .fb`,ff).innerHTML=body(f);};
  ff.innerHTML=fields.map(f=>`<div class="fld" data-k="${f.k}"><span>${f.l}</span><div class="fb">${body(f)}</div></div>`).join('');
  const F=k=>fields.find(f=>f.k===k);
  ff.addEventListener('input',e=>{const k=e.target.dataset.in;if(k)d[k]=F(k).t==='num'?Number(e.target.value):e.target.value;});
  ff.addEventListener('click',e=>{
    const c=e.target.closest('[data-c]'),pp=e.target.closest('[data-pp]'),ad=e.target.closest('[data-add]');
    if(c){const f=F(c.dataset.c);let v=c.dataset.v;if(f.t==='days'||f.t==='day')v=Number(v);
      if(f.t==='multi'||f.t==='days'){const a=d[f.k]||[];d[f.k]=a.includes(v)?a.filter(x=>x!==v):[...a,v];}
      else d[f.k]=d[f.k]===v&&f.t==='chips'?'':v;
      draw(f);}
    if(pp){const f=F(pp.dataset.pp),v=pp.dataset.v;
      if(f.t==='persons'){const a=d[f.k]||[];d[f.k]=a.includes(v)?a.filter(x=>x!==v):[...a,v];}else d[f.k]=d[f.k]===v?null:v;
      draw(f);}
    if(ad){const f=F(ad.dataset.add);const inp=document.createElement('input');inp.placeholder='+';ad.replaceWith(inp);inp.focus();
      const done=()=>{const v=inp.value.trim();if(v){if(!S.presets[f.pre].includes(v))S.presets[f.pre].push(v);if(f.t==='multi')d[f.k]=[...(d[f.k]||[]),v];else d[f.k]=v;save();}draw(f);};
      inp.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();inp.onblur=null;done();}};inp.onblur=done;}
  });
  $('[data-ok]',m.box).onclick=()=>{
    for(const f of fields)if(f.req&&!String(d[f.k]||'').trim()){const i=$(`[data-in="${f.k}"]`,ff);if(i){i.focus();i.style.borderColor='var(--bad)';}return;}
    m.close();onSave(d);
  };
  if(onDel)$('[data-del]',m.box).onclick=()=>{m.close();onDel();};
  return m;
}

/* ═══ 편집 폼들 ═══ */
function editPerson(id){
  const p=id?P(id):{days:[1,2,3],wear:[],role:''};
  form(id?'인원':'인원 추가',[
    {k:'name',l:'이름',t:'text',req:1},{k:'role',l:'역할',t:'chips',pre:'roles'},{k:'phone',l:'연락처',t:'tel'},{k:'emerg',l:'비상연락',t:'tel'},
    {k:'wear',l:'착용장비',t:'multi',pre:'wear'},{k:'days',l:'근무일',t:'days'},{k:'note',l:'메모',t:'area'}
  ],p,v=>put('people',{...p,...v,id:p.id||uid()}),id&&(()=>drop('people',id)),'var(--c-people)');
}
function pastePeople(){
  const m=modal(`<h3>${ic('paste')}<button class="ib" data-x>${ic('x')}</button></h3><textarea class="in" style="min-height:200px" placeholder="이름, 역할, 연락처"></textarea>
    <div class="btns"><button class="btn" data-ok style="--tc:var(--c-people)">${ic('check')}</button></div>`);
  $('[data-ok]',m.box).onclick=()=>{
    const lines=$('textarea',m.box).value.split(/\n/).map(l=>l.trim()).filter(Boolean);
    for(const l of lines){const [name,role,phone]=l.split(/[,\t]/).map(s=>s.trim());if(!name)continue;
      if(role&&!S.presets.roles.includes(role))S.presets.roles.push(role);
      touch(S.people.push({id:uid(),name,role:role||'',phone:phone||'',emerg:'',wear:[],days:[1,2,3],note:''})&&S.people[S.people.length-1]);}
    m.close();save();render();
  };
}
function editGear(id){
  const g=id?byId(S.gear,id):{qty:1,status:'ok',cat:V.catF||''};
  form(id?'장비':'장비 추가',[
    {k:'name',l:'이름',t:'text',req:1},{k:'cat',l:'분류',t:'chips',pre:'cats'},{k:'qty',l:'수량',t:'num'},
    {k:'status',l:'상태',t:'status'},{k:'owner',l:'담당',t:'person'},{k:'note',l:'메모',t:'area'}
  ],g,v=>put('gear',{...g,...v,id:g.id||uid()}),id&&(()=>drop('gear',id)),'var(--c-gear)');
}
function editSession(id){
  const s=id?byId(S.sessions,id):{day:V.day,crew:[],start:'09:00',end:'10:00'};
  form(id?'세션':'세션 추가',[
    {k:'title',l:'세션',t:'text',req:1},{k:'day',l:'날짜',t:'day'},{k:'start',l:'시작',t:'time'},{k:'end',l:'끝',t:'time'},
    {k:'place',l:'장소',t:'text'},{k:'crew',l:'담당',t:'persons'},{k:'note',l:'메모',t:'area'}
  ],s,v=>put('sessions',{...s,...v,id:s.id||uid()}),id&&(()=>drop('sessions',id)),'var(--c-time)');
}

/* ═══ 도면: 형상 계산 ═══ */
function geo(m,pl){
  const T=CAMS[m.type],w=pl.w,h=pl.h,a=(m.rot||0)*Math.PI/180;
  const px=m.x*w,py=m.y*h,dx=Math.sin(a),dy=-Math.cos(a);
  let ox=px,oy=py,arm=null,rail=null;
  if(m.type==='jib'){const L=(m.len==null?T.len:m.len)*w;ox=px+dx*L;oy=py+dy*L;arm=[px,py,ox,oy];}
  if(m.type==='dolly'){const L=(m.len==null?T.len:m.len)*w/2,rx=Math.cos(a),ry=Math.sin(a);rail=[px-rx*L,py-ry*L,px+rx*L,py+ry*L];}
  const R=(m.rng==null?T.rng:m.rng)*w,f=(m.fov==null?T.fov:m.fov)*Math.PI/360,pts=[[ox,oy]];
  for(let k=0;k<=12;k++){const g=a-f+2*f*k/12;pts.push([ox+Math.sin(g)*R,oy-Math.cos(g)*R]);}
  return {pts,arm,rail,o:[ox,oy]};
}
function shapeSVG(m,pl,dim){
  const c=CAMS[m.type].c,g=geo(m,pl),op=dim?.08:1;
  let s=`<g opacity="${op}"><polygon points="${g.pts.map(p=>p.join(',')).join(' ')}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  if(g.arm)s+=`<line x1="${g.arm[0]}" y1="${g.arm[1]}" x2="${g.arm[2]}" y2="${g.arm[3]}" stroke="${c}" stroke-width="6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
  if(g.rail)s+=`<line x1="${g.rail[0]}" y1="${g.rail[1]}" x2="${g.rail[2]}" y2="${g.rail[3]}" stroke="${c}" stroke-width="7" stroke-dasharray="3 7" vector-effect="non-scaling-stroke"/><line x1="${g.rail[0]}" y1="${g.rail[1]}" x2="${g.rail[2]}" y2="${g.rail[3]}" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  return s+'</g>';
}
function markHTML(m,o={}){
  const per=P(m.ref),isP=m.type==='person';
  const col=isP?hue(per&&(per.role||per.name)):CAMS[m.type].c;
  const tok=isP?`<span class="tk" style="--c:${col}">${esc(ini(per?per.name:'?'))}</span>`:`<span class="tk cam" style="--c:${col}">${ic(m.type,22)}</span>`;
  const pill=isP?(per?`<span class="pill">${esc(short(per.name))}</span>`:''):`<span class="pill"><b>${esc(m.label||'')}</b>${per?esc(short(per.name)):''}</span>`;
  return `<div class="mk ${m.id===V.sel?'sel':''} ${o.dim?'dim':''} ${o.hl?'hl':''}" data-id="${m.id}" style="left:${m.x*100}%;top:${m.y*100}%">${tok}${pill}</div>`;
}
function mini(pl,day,pid){
  const data=imgOf(pl),ms=S.marks.filter(m=>m.plan===pl.id&&m.day===day),mine=m=>m.ref===pid;
  return `<div class="mini" style="aspect-ratio:${pl.w}/${pl.h}">${data?`<img src="${data}">`:''}<svg class="sh" viewBox="0 0 ${pl.w} ${pl.h}" preserveAspectRatio="none">${ms.filter(m=>m.type!=='person').map(m=>shapeSVG(m,pl,!mine(m))).join('')}</svg><div class="marks">${ms.map(m=>markHTML(m,{dim:!mine(m),hl:mine(m)})).join('')}</div></div>`;
}

/* ═══ 도면 뷰 ═══ */
const PV={el:null,mode:'2d',z:1,tx:0,ty:0,fitFor:'',buildFor:'',th:{theta:.3,phi:.95,dist:140,tx:0,tz:0},G:null};
const planNow=()=>{let p=byId(S.plans,V.plan);if(!p){p=S.plans[0]||null;V.plan=p&&p.id;}return p;};
const marksNow=()=>{const pl=planNow();return pl?S.marks.filter(m=>m.plan===pl.id&&m.day===V.day):[];};
let drag=null,pendR=false;

function buildPV(){
  const el=document.createElement('section');el.className='pv';
  el.innerHTML=`<div class="pbar"><div class="pchips"></div><div class="seg"><button data-m="2d" aria-label="2D">${ic('sq',20)}</button><button data-m="3d" aria-label="3D">${ic('cube',20)}</button></div><button class="ib" data-pa="edit" aria-label="도면 편집">${ic('edit',20)}</button></div>
  <div class="stage">
    <div class="world"><img draggable="false" alt=""><svg preserveAspectRatio="none"></svg><div class="marks m2"></div></div>
    <canvas id="gl" hidden></canvas><div class="marks m3" hidden></div>
    <div class="wbar" hidden></div>
    <div class="zoom"><button data-z="in">+</button><button data-z="out">−</button><button data-z="fit" aria-label="맞춤">${ic('fit',20)}</button><button data-z="wall" hidden aria-label="벽">${ic('cube',20)}</button></div>
    <button class="bigadd" data-pa="add" aria-label="도면 올리기">${ic('image',56)}</button>
    <div class="insp" hidden></div>
  </div>
  <div class="pal"></div>`;
  PV.el=el;PV.stage=$('.stage',el);PV.world=$('.world',el);PV.img=$('.world img',el);PV.svg=$('.world svg',el);
  PV.m2=$('.m2',el);PV.m3=$('.m3',el);PV.gl=$('#gl',el);PV.insp=$('.insp',el);PV.pal=$('.pal',el);PV.wbar=$('.wbar',el);

  el.addEventListener('click',e=>{
    const pl=e.target.closest('[data-pl]');if(pl){V.plan=pl.dataset.pl;V.sel=null;saveUI();render();return;}
    const pa=e.target.closest('[data-pa]');if(pa){if(pa.dataset.pa==='add')addPlan();else if(pa.dataset.pa==='edit')editPlan();return;}
    const mo=e.target.closest('[data-m]');if(mo){setMode(mo.dataset.m);return;}
    const z=e.target.closest('[data-z]');if(z){zoomBy(z.dataset.z);return;}
  });
  bindGestures(PV.stage);
  PV.stage.addEventListener('pointerdown',markDown);
  PV.insp.addEventListener('click',inspClick);
  PV.insp.addEventListener('input',inspInput);
  PV.insp.addEventListener('change',()=>{const m=byId(S.marks,V.sel);if(m){touch(m);save();}});
  PV.pal.addEventListener('pointerdown',palDown);
  PV.wbar.addEventListener('input',wallInput);
  PV.wbar.addEventListener('change',()=>{save();});
  new ResizeObserver(()=>onResize()).observe(PV.stage);
}

function updatePV(){
  const pl=planNow();
  $('.pchips',PV.el).innerHTML=S.plans.map(p=>`<button class="chip ${pl&&p.id===pl.id?'on':''}" data-pl="${p.id}">${esc(p.name)}</button>`).join('')+`<button class="chip add" data-pa="add" aria-label="도면 추가">${ic('plus',18)}</button>`;
  $$('.seg button',PV.el).forEach(b=>b.classList.toggle('on',b.dataset.m===PV.mode));
  $('[data-z="wall"]',PV.el).hidden=PV.mode!=='3d';
  $('.bigadd',PV.el).hidden=!!pl;
  $('[data-pa="edit"]',PV.el).hidden=!pl;
  PV.stage.classList.toggle('armed',!!V.armed);
  PV.world.hidden=PV.mode!=='2d'||!pl;PV.gl.hidden=PV.mode!=='3d'||!pl;PV.m3.hidden=PV.mode!=='3d'||!pl;
  PV.pal.hidden=!pl;
  if(!pl){PV.insp.hidden=true;return;}
  const data=imgOf(pl),k=ikey(pl);
  PV.world.style.width=pl.w+'px';PV.world.style.height=pl.h+'px';
  if(data&&PV.img.dataset.k!==k){PV.img.src=data;PV.img.dataset.k=k;}
  if(PV.fitFor!==k){PV.fitFor=k;fit2D();}
  if(PV.mode==='3d'&&data&&PV.buildFor!==k+'|'+wallKey(pl))build3D();
  renderMarks();renderInsp();renderPal();
}
function applyWorld(){PV.world.style.transform=`translate(${PV.tx}px,${PV.ty}px) scale(${PV.z})`;PV.world.style.setProperty('--inv',1/PV.z);}
function fit2D(){
  const pl=planNow();if(!pl)return;const r=PV.stage.getBoundingClientRect();if(!r.width)return;
  PV.z=Math.min(r.width/pl.w,r.height/pl.h)*.96;PV.z0=PV.z;PV.tx=(r.width-pl.w*PV.z)/2;PV.ty=(r.height-pl.h*PV.z)/2;applyWorld();
}
function onResize(){
  if(!PV.el.isConnected)return;
  if(PV.fitFor&&!PV.z0)fit2D();
  if(PV.G){const r=PV.stage.getBoundingClientRect();PV.G.R.setSize(r.width,r.height,false);PV.G.cam.aspect=r.width/r.height;PV.G.cam.updateProjectionMatrix();dirty3();}
}
function zoomBy(a){
  if(a==='fit'){if(PV.mode==='2d')fit2D();else{resetOrbit();dirty3();}return;}
  if(a==='wall'){PV.wbar.hidden=!PV.wbar.hidden;if(!PV.wbar.hidden)drawWbar();return;}
  const s=a==='in'?1.3:1/1.3;
  if(PV.mode==='2d'){const r=PV.stage.getBoundingClientRect();pinch2D(s,r.left+r.width/2,r.top+r.height/2,0,0);}
  else{PV.th.dist=clamp(PV.th.dist/s,15,500);dirty3();}
}
function pinch2D(s,mx,my,dx,dy){
  const r=PV.stage.getBoundingClientRect(),px=mx-r.left,py=my-r.top,nz=clamp(PV.z*s,(PV.z0||1)*.3,(PV.z0||1)*10),k=nz/PV.z;
  PV.tx=px-(px-PV.tx)*k+dx;PV.ty=py-(py-PV.ty)*k+dy;PV.z=nz;applyWorld();
}
async function setMode(m){
  if(m===PV.mode)return;
  if(m==='3d'){const ok=await ensureThree();if(!ok)return;}
  PV.mode=m;V.sel=V.sel;render();
  if(m==='3d'){requestAnimationFrame(()=>{onResize();const pl=planNow();if(pl&&imgOf(pl))build3D();});}
}

/* 제스처 */
function bindGestures(el){
  const Pm=new Map();let last=null,t0=0,moved=0;
  const snap=()=>{if(Pm.size<2)return null;const [a,b]=[...Pm.values()];return {d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};};
  el.addEventListener('pointerdown',e=>{
    if(e.target.closest('.mk,.insp,.zoom,.wbar,.bigadd'))return;
    try{el.setPointerCapture(e.pointerId);}catch(_){}
    Pm.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,sh:e.shiftKey});
    if(Pm.size===1){moved=0;t0=now();}last=snap();
  });
  el.addEventListener('pointermove',e=>{
    const p=Pm.get(e.pointerId);if(!p)return;
    const ox=p.x,oy=p.y;p.x=e.clientX;p.y=e.clientY;
    if(Pm.size===1){const dx=p.x-ox,dy=p.y-oy;moved+=Math.abs(dx)+Math.abs(dy);
      if(PV.mode==='2d'){PV.tx+=dx;PV.ty+=dy;applyWorld();}
      else orbit(dx,dy,p.b===2||p.sh);}
    else if(Pm.size===2){const c=snap();moved=99;
      if(last){if(PV.mode==='2d')pinch2D(c.d/last.d,c.mx,c.my,c.mx-last.mx,c.my-last.my);
        else{PV.th.dist=clamp(PV.th.dist*last.d/c.d,15,500);pan3(c.mx-last.mx,c.my-last.my);dirty3();}}
      last=c;}
  });
  const up=e=>{
    if(!Pm.has(e.pointerId))return;
    if(Pm.size===1&&moved<8&&now()-t0<600&&e.type==='pointerup')tap(e.clientX,e.clientY);
    Pm.delete(e.pointerId);last=snap();
  };
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('wheel',e=>{e.preventDefault();const s=Math.exp(-e.deltaY*.0015);
    if(PV.mode==='2d')pinch2D(s,e.clientX,e.clientY,0,0);else{PV.th.dist=clamp(PV.th.dist/s,15,500);dirty3();}},{passive:false});
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
function tap(cx,cy){
  if(V.armed){const pos=screenToPlan(cx,cy,true);if(pos){placeAt(V.armed,pos);if(V.armed.t==='person')V.armed=null;render();}return;}
  if(V.sel){V.sel=null;render();}
}

/* 좌표 변환 */
function screenToPlan(cx,cy,strict){
  const pl=planNow();if(!pl)return null;
  let x,y;
  if(PV.mode==='2d'){const r=PV.world.getBoundingClientRect();x=(cx-r.left)/r.width;y=(cy-r.top)/r.height;}
  else{const g=ray(cx,cy);if(!g)return null;x=g.x/100+.5;y=g.z/(100*pl.h/pl.w)+.5;}
  if(strict&&(x<0||x>1||y<0||y>1))return null;
  return {x:clamp(x,0,1),y:clamp(y,0,1)};
}

/* 배치 */
function placeAt(item,pos){
  const pl=planNow();if(!pl)return;
  if(item.t==='person'){
    let m=S.marks.find(m=>m.plan===pl.id&&m.day===V.day&&m.type==='person'&&m.ref===item.id);
    if(m){m.x=pos.x;m.y=pos.y;}else m={id:uid(),plan:pl.id,day:V.day,type:'person',ref:item.id,x:pos.x,y:pos.y,rot:0};
    touch(m);const i=S.marks.findIndex(x=>x.id===m.id);if(i<0)S.marks.push(m);V.sel=m.id;
  }else{
    const n=S.marks.filter(m=>m.plan===pl.id&&m.day===V.day&&m.type!=='person').length+1;
    const m=touch({id:uid(),plan:pl.id,day:V.day,type:item.id,ref:null,x:pos.x,y:pos.y,rot:0,label:'C'+n});
    S.marks.push(m);V.sel=m.id;
  }
  save();
}
function removeMark(id){S.marks=S.marks.filter(m=>m.id!==id);S.del[id]=now();if(V.sel===id)V.sel=null;save();render();}

/* 마커 드래그 */
function markDown(e){
  const el=e.target.closest('.mk');if(!el||!PV.stage.contains(el))return;
  const m=byId(S.marks,el.dataset.id);if(!m)return;
  e.preventDefault();e.stopPropagation();
  const sx=e.clientX,sy=e.clientY;let moved=false;
  drag={id:m.id};
  const mv=ev=>{
    if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;
    moved=true;const pos=screenToPlan(ev.clientX,ev.clientY);if(!pos)return;
    m.x=pos.x;m.y=pos.y;V.sel=m.id;renderMarks();
  };
  const up=()=>{
    removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
    drag=null;
    if(moved){touch(m);save();}else V.sel=V.sel===m.id?V.sel:m.id;
    V.sel=m.id;render();
  };
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
}

/* 마커 · 형상 그리기 */
function renderMarks(){
  const pl=planNow();if(!pl)return;
  const ms=marksNow().slice().sort((a,b)=>(a.id===V.sel)-(b.id===V.sel));
  PV.svg.setAttribute('viewBox',`0 0 ${pl.w} ${pl.h}`);
  PV.svg.innerHTML=ms.filter(m=>m.type!=='person').map(m=>shapeSVG(m,pl,false)).join('');
  const host=PV.mode==='2d'?PV.m2:PV.m3;
  PV.m2.innerHTML='';PV.m3.innerHTML='';
  host.innerHTML=ms.map(m=>markHTML(m)).join('');
  if(PV.mode==='3d'){shapes3D(ms,pl);project3D();dirty3();}
}

/* 인스펙터 */
function renderInsp(){
  const m=V.sel&&byId(S.marks,V.sel),pl=planNow();
  if(!m||!pl||m.plan!==pl.id||m.day!==V.day){PV.insp.hidden=true;return;}
  if(document.activeElement&&PV.insp.contains(document.activeElement)&&drag)return;
  PV.insp.hidden=false;
  const per=P(m.ref);
  if(m.type==='person'){
    PV.insp.innerHTML=`<div class="r">${avHTML(per)}<div class="grow"><div class="nm">${esc(per&&per.name)}</div><div class="sub">${esc(per&&per.role)}</div></div>${per&&per.phone?`<a class="call" href="tel:${esc(per.phone)}">${ic('phone')}</a>`:''}<button class="ib" data-i="editp">${ic('edit',20)}</button><button class="ib red" data-i="del">${ic('trash',20)}</button><button class="ib" data-i="close">${ic('x',20)}</button></div>`;
    return;
  }
  const T=CAMS[m.type],val=(k,d)=>m[k]==null?d:m[k];
  const ops=S.people.slice().sort(sortKo).map(p=>`<span class="av sm ${m.ref===p.id?'on':''}" style="--c:${hue(p.role||p.name)}" data-op="${p.id}">${esc(ini(p.name))}</span>`).join('');
  PV.insp.innerHTML=`
  <div class="r"><div class="types">${Object.keys(CAMS).map(k=>`<button style="--c:${CAMS[k].c}" class="${m.type===k?'on':''}" data-t="${k}" aria-label="${CAMS[k].n}">${ic(k,22)}</button>`).join('')}</div>
    <input class="lb" value="${esc(m.label||'')}" maxlength="6" data-lb><span class="grow"></span>
    <button class="ib" data-i="dup">${ic('copy',20)}</button><button class="ib red" data-i="del">${ic('trash',20)}</button><button class="ib" data-i="close">${ic('x',20)}</button></div>
  <div class="r"><div class="ops">${ops||''}</div>${per&&per.phone?`<a class="call" style="width:40px;height:40px" href="tel:${esc(per.phone)}">${ic('phone',20)}</a>`:''}</div>
  <div class="r"><label class="sl">${ic('rot',18)}<input type="range" min="0" max="359" value="${m.rot||0}" data-s="rot"></label><label class="sl">${ic('fov',18)}<input type="range" min="10" max="140" value="${val('fov',T.fov)}" data-s="fov"></label></div>
  <div class="r"><label class="sl">${ic('dist',18)}<input type="range" min="5" max="70" value="${Math.round(val('rng',T.rng)*100)}" data-s="rng"></label>${T.len?`<label class="sl">${ic('len',18)}<input type="range" min="5" max="60" value="${Math.round(val('len',T.len)*100)}" data-s="len"></label>`:'<span class="sl"></span>'}</div>`;
}
function inspClick(e){
  const m=byId(S.marks,V.sel);if(!m)return;
  const i=e.target.closest('[data-i]'),t=e.target.closest('[data-t]'),op=e.target.closest('[data-op]');
  if(i){const a=i.dataset.i;
    if(a==='close'){V.sel=null;render();}
    else if(a==='del')removeMark(m.id);
    else if(a==='editp'){editPerson(m.ref);}
    else if(a==='dup'){const c={...m,id:uid(),x:clamp(m.x+.03,0,1),y:clamp(m.y+.03,0,1)};touch(c);S.marks.push(c);V.sel=c.id;save();render();}}
  if(t){m.type=t.dataset.t;delete m.fov;delete m.rng;delete m.len;touch(m);save();render();}
  if(op){m.ref=m.ref===op.dataset.op?null:op.dataset.op;touch(m);save();render();}
}
function inspInput(e){
  const m=byId(S.marks,V.sel);if(!m)return;
  if(e.target.dataset.lb!==undefined){m.label=e.target.value;renderMarks();return;}
  const s=e.target.dataset.s;if(!s)return;
  const v=Number(e.target.value);
  m[s]=s==='rot'||s==='fov'?v:v/100;renderMarks();
}

/* 팔레트 */
function renderPal(){
  const pl=planNow();if(!pl)return;
  const placed=new Set(S.marks.filter(m=>m.plan===pl.id&&m.day===V.day&&m.type==='person').map(m=>m.ref));
  let ppl=S.people.filter(p=>(p.days||[1,2,3]).includes(V.day));if(!ppl.length)ppl=S.people;
  ppl=ppl.slice().sort(sortKo);
  const on=(t,id)=>V.armed&&V.armed.t===t&&V.armed.id===id?'on':'';
  PV.pal.innerHTML=`<div class="scroll-x">${Object.keys(CAMS).map(k=>`<div class="pi ${on('cam',k)}" data-p="cam" data-id="${k}" style="--c:${CAMS[k].c}"><span class="tk">${ic(k,24)}</span>${CAMS[k].n}</div>`).join('')}</div>
  <div class="scroll-x">${ppl.map(p=>`<div class="pi ${on('person',p.id)} ${placed.has(p.id)?'done':''}" data-p="person" data-id="${p.id}">${avHTML(p)}${esc(short(p.name))}</div>`).join('')}<div class="pi" data-p="newp" style="--c:var(--faint)"><span class="tk" style="background:var(--card2);color:var(--soft)">${ic('plus',22)}</span>&nbsp;</div></div>`;
}
function palDown(e){
  const it=e.target.closest('[data-p]');if(!it)return;
  const item={t:it.dataset.p,id:it.dataset.id};
  if(item.t==='newp'){editPerson();return;}
  const sx=e.clientX,sy=e.clientY;let ghost=null;
  const mv=ev=>{
    if(!ghost&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>10){ghost=it.cloneNode(true);ghost.classList.add('ghost');document.body.append(ghost);}
    if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';}
  };
  const end=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',cancel);};
  const cancel=()=>{end();if(ghost)ghost.remove();};
  const up=ev=>{
    end();
    if(ghost){ghost.remove();dropItem(item,ev.clientX,ev.clientY);return;}
    V.armed=V.armed&&V.armed.t===item.t&&V.armed.id===item.id?null:item;
    render();
  };
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',cancel);
}
function dropItem(item,cx,cy){
  const r=PV.stage.getBoundingClientRect();
  if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)return;
  if(item.t==='person'){
    const hit=document.elementsFromPoint(cx,cy).find(n=>n.classList&&n.classList.contains('mk'));
    const cm=hit&&byId(S.marks,hit.dataset.id);
    if(cm&&cm.type!=='person'){cm.ref=item.id;touch(cm);V.sel=cm.id;save();render();return;}
  }
  const pos=screenToPlan(cx,cy,true);if(!pos)return;
  placeAt(item,pos);V.armed=item.t==='person'?null:V.armed;render();
}

/* 도면 추가 · 편집 */
function addPlan(){
  pickImage(async({data,w,h})=>{
    const pl={id:uid(),name:'도면 '+(S.plans.length+1),w,h,iv:now(),ws:0,wh:5,wn:25,inv:false};
    await putImg(pl,data);V.plan=pl.id;saveUI();put('plans',pl);
  });
}
function editPlan(){
  const pl=planNow();if(!pl)return;
  const m=modal(`<h3>${ic('plan')}<button class="ib" data-x>${ic('x')}</button></h3>
    <input class="in" value="${esc(pl.name)}" data-n>
    <div class="btns"><button class="btn ghostb" data-img>${ic('image')}</button>${V.day>1?`<button class="btn ghostb" data-cp>${ic('copy')}${V.day-1}→${V.day}</button>`:''}<button class="btn del" data-del>${ic('trash')}</button></div>
    <div class="btns"><button class="btn" data-ok>${ic('check')}저장</button></div>`);
  $('[data-ok]',m.box).onclick=()=>{pl.name=$('[data-n]',m.box).value.trim()||pl.name;m.close();put('plans',pl);};
  $('[data-del]',m.box).onclick=()=>{m.close();drop('plans',pl.id);};
  $('[data-img]',m.box).onclick=()=>{m.close();pickImage(async({data,w,h})=>{pl.w=w;pl.h=h;pl.iv=now();await putImg(pl,data);put('plans',pl);});};
  const cp=$('[data-cp]',m.box);
  if(cp)cp.onclick=()=>{
    for(const x of S.marks.filter(x=>x.plan===pl.id&&x.day===V.day)){S.del[x.id]=now();}
    S.marks=S.marks.filter(x=>!(x.plan===pl.id&&x.day===V.day));
    for(const x of S.marks.filter(x=>x.plan===pl.id&&x.day===V.day-1).map(x=>({...x}))){x.id=uid();x.day=V.day;touch(x);S.marks.push(x);}
    m.close();V.sel=null;save();render();
  };
}

/* ═══ 3D (벽 분석 + three.js) ═══ */
const wallKey=pl=>[pl.ws||0,pl.wh||5,pl.wn==null?25:pl.wn,pl.inv?1:0].join(',');
const WALLC={};
function analyze(pl,img){
  const key=ikey(pl)+'|'+(pl.ws||0)+'|'+(pl.inv?1:0)+'|'+(pl.wn==null?25:pl.wn);
  if(WALLC[key])return WALLC[key];
  const SW=Math.min(1200,pl.w),SH=Math.max(1,Math.round(SW*pl.h/pl.w));
  const c=document.createElement('canvas');c.width=SW;c.height=SH;
  const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,SW,SH);x.drawImage(img,0,0,SW,SH);
  const px=x.getImageData(0,0,SW,SH).data;
  const gw=Math.min(240,SW),gh=Math.max(1,Math.round(gw*SH/SW)),bx=SW/gw,by=SH/gh;
  const L=new Uint8Array(gw*gh),hist=new Array(256).fill(0);
  for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
    let best=pl.inv?0:255;
    const x0=Math.floor(gx*bx),x1=Math.min(SW,Math.floor((gx+1)*bx)),y0=Math.floor(gy*by),y1=Math.min(SH,Math.floor((gy+1)*by));
    for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*SW+xx)*4,v=(px[i]*299+px[i+1]*587+px[i+2]*114)/1000;best=pl.inv?Math.max(best,v):Math.min(best,v);}
    const v=Math.round(best);L[gy*gw+gx]=v;hist[v]++;
  }
  /* 오츠 임계값 */
  const tot=gw*gh;let sum=0;for(let i=0;i<256;i++)sum+=i*hist[i];
  let sB=0,wB=0,mx=-1,t0=128;
  for(let i=0;i<256;i++){wB+=hist[i];if(!wB)continue;const wF=tot-wB;if(!wF)break;sB+=i*hist[i];const mB=sB/wB,mF=(sum-sB)/wF,v=wB*wF*(mB-mF)*(mB-mF);if(v>mx){mx=v;t0=i;}}
  const th=clamp(t0+(pl.ws||0),4,250),wall=new Uint8Array(tot);
  for(let i=0;i<tot;i++)wall[i]=(pl.inv?L[i]>th:L[i]<th)?1:0;
  /* 작은 덩어리(글자·치수선) 제거 */
  const noise=pl.wn==null?25:pl.wn;
  if(noise>0){
    const seen=new Uint8Array(tot),st=new Int32Array(tot);
    for(let s=0;s<tot;s++){
      if(!wall[s]||seen[s])continue;
      let sp=0,n=0;st[sp++]=s;seen[s]=1;const comp=[];
      while(sp){const i=st[--sp];comp.push(i);n++;const cx=i%gw,cy=(i/gw)|0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=gw||ny>=gh)continue;const j=ny*gw+nx;if(wall[j]&&!seen[j]){seen[j]=1;st[sp++]=j;}}}
      if(n<noise)for(const i of comp)wall[i]=0;
    }
  }
  /* 가로 줄 → 세로로 합쳐 직사각형 */
  const rects=[];let prev=new Map();
  for(let y=0;y<gh;y++){
    const cur=new Map();let xx=0;
    while(xx<gw){
      if(!wall[y*gw+xx]){xx++;continue;}
      const x0=xx;while(xx<gw&&wall[y*gw+xx])xx++;
      const k=x0+':'+(xx-x0),p=prev.get(k);
      if(p){p.h++;cur.set(k,p);}else{const r={x:x0,y,w:xx-x0,h:1};rects.push(r);cur.set(k,r);}
    }
    prev=cur;
  }
  return WALLC[key]={gw,gh,rects};
}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s);});}
async function ensureThree(){
  if(window.THREE)return true;
  try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');return !!window.THREE;}catch(e){console.warn(e);return false;}
}
function initGL(){
  const T=THREE,R=new T.WebGLRenderer({canvas:PV.gl,antialias:true,alpha:true});
  R.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.5,3000);
  scene.add(new T.AmbientLight(0xffffff,.8));const dl=new T.DirectionalLight(0xffffff,.7);dl.position.set(-40,90,50);scene.add(dl);
  const world=new T.Group(),shapes=new T.Group();scene.add(world);scene.add(shapes);
  PV.G={R,scene,cam,world,shapes};
  onResize();
}
function disposeGroup(g){for(const c of [...g.children]){g.remove(c);if(c.geometry)c.geometry.dispose();if(c.material){if(c.material.map)c.material.map.dispose();c.material.dispose();}}}
function build3D(){
  const pl=planNow();if(!pl||!window.THREE)return;
  if(!PV.G)initGL();
  const data=imgOf(pl);if(!data)return;
  const k=ikey(pl);
  loadImg(data).then(img=>{
    if(planNow()!==pl)return;
    const T=THREE,G=PV.G,W=100,D=100*pl.h/pl.w;
    disposeGroup(G.world);
    const tex=new T.TextureLoader().load(data,()=>dirty3());
    tex.anisotropy=8;
    const fg=new T.PlaneGeometry(W,D);fg.rotateX(-Math.PI/2);
    G.world.add(new T.Mesh(fg,new T.MeshBasicMaterial({map:tex})));
    const an=analyze(pl,img),wh=pl.wh||5;
    if(an.rects.length){
      const bg=new T.BoxGeometry(1,1,1);bg.translate(.5,.5,.5);
      const im=new T.InstancedMesh(bg,new T.MeshLambertMaterial({color:0x5b6577}),an.rects.length),mt=new T.Matrix4(),cw=W/an.gw,cd=D/an.gh;
      an.rects.forEach((r,i)=>{mt.makeScale(r.w*cw,wh,r.h*cd);mt.setPosition(r.x*cw-W/2,0,r.y*cd-D/2);im.setMatrixAt(i,mt);});
      im.instanceMatrix.needsUpdate=true;G.world.add(im);
    }
    PV.buildFor=k+'|'+wallKey(pl);
    if(PV.orbitFor!==k){PV.orbitFor=k;resetOrbit();}
    shapes3D(marksNow(),pl);project3D();dirty3();
  });
}
function resetOrbit(){const pl=planNow();if(!pl)return;const D=100*pl.h/pl.w;Object.assign(PV.th,{theta:.3,phi:.95,dist:Math.max(100,D)*1.3,tx:0,tz:0});}
function ribbon(x1,z1,x2,z2,w,col,y,op){
  const T=THREE,dx=x2-x1,dz=z2-z1,l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute([x1+nx,y,z1+nz,x1-nx,y,z1-nz,x2-nx,y,z2-nz,x2+nx,y,z2+nz],3));g.setIndex([0,1,2,0,2,3]);
  return new T.Mesh(g,new T.MeshBasicMaterial({color:col,transparent:true,opacity:op,side:T.DoubleSide,depthWrite:false}));
}
function shapes3D(ms,pl){
  if(!PV.G||!window.THREE)return;
  const T=THREE,G=PV.G,W=100,D=100*pl.h/pl.w;disposeGroup(G.shapes);
  const wx=px=>(px/pl.w-.5)*W,wz=py=>(py/pl.h-.5)*D;
  for(const m of ms){
    if(m.type==='person')continue;
    const g=geo(m,pl),col=new T.Color(CAMS[m.type].c),pos=[wx(g.pts[0][0]),.15,wz(g.pts[0][1])],idx=[];
    for(let i=1;i<g.pts.length;i++)pos.push(wx(g.pts[i][0]),.15,wz(g.pts[i][1]));
    for(let i=1;i<g.pts.length-1;i++)idx.push(0,i,i+1);
    const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(pos,3));geom.setIndex(idx);
    G.shapes.add(new T.Mesh(geom,new T.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false})));
    if(g.arm)G.shapes.add(ribbon(wx(g.arm[0]),wz(g.arm[1]),wx(g.arm[2]),wz(g.arm[3]),1.4,col,.25,1));
    if(g.rail){G.shapes.add(ribbon(wx(g.rail[0]),wz(g.rail[1]),wx(g.rail[2]),wz(g.rail[3]),2,col,.2,.55));G.shapes.add(ribbon(wx(g.rail[0]),wz(g.rail[1]),wx(g.rail[2]),wz(g.rail[3]),.5,col,.25,1));}
  }
}
let raf3=0;
function dirty3(){if(raf3||!PV.G)return;raf3=requestAnimationFrame(()=>{raf3=0;draw3();});}
function updCam(){
  const t=PV.th,c=PV.G.cam;
  c.position.set(t.tx+t.dist*Math.sin(t.phi)*Math.sin(t.theta),t.dist*Math.cos(t.phi),t.tz+t.dist*Math.sin(t.phi)*Math.cos(t.theta));
  c.lookAt(t.tx,0,t.tz);c.updateMatrixWorld();
}
function draw3(){if(!PV.G||PV.mode!=='3d')return;updCam();PV.G.R.render(PV.G.scene,PV.G.cam);project3D();}
function project3D(){
  if(!PV.G||PV.mode!=='3d')return;
  const pl=planNow();if(!pl)return;
  const T=THREE,r=PV.stage.getBoundingClientRect(),D=100*pl.h/pl.w,v=new T.Vector3();
  PV.G.cam.updateMatrixWorld();
  for(const el of $$('.mk',PV.m3)){
    const m=byId(S.marks,el.dataset.id);if(!m)continue;
    v.set((m.x-.5)*100,.5,(m.y-.5)*D).project(PV.G.cam);
    el.style.left=((v.x*.5+.5)*r.width)+'px';el.style.top=((-v.y*.5+.5)*r.height)+'px';el.style.display=v.z>1?'none':'';
  }
}
function ray(cx,cy){
  if(!PV.G||!window.THREE)return null;
  const T=THREE,r=PV.gl.getBoundingClientRect(),c=PV.G.cam;c.updateMatrixWorld();
  const v=new T.Vector3(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1,.5).unproject(c);
  const o=c.position,d=v.sub(o).normalize();if(Math.abs(d.y)<1e-5)return null;
  const t=-o.y/d.y;if(t<0)return null;return {x:o.x+d.x*t,z:o.z+d.z*t};
}
function orbit(dx,dy,pan){
  if(pan){pan3(dx,dy);dirty3();return;}
  PV.th.theta-=dx*.006;PV.th.phi=clamp(PV.th.phi-dy*.006,.12,1.45);dirty3();
}
function pan3(dx,dy){
  const t=PV.th,k=t.dist*.0016;
  t.tx-=(dx*Math.cos(t.theta)+dy*Math.sin(t.theta))*k;t.tz-=(-dx*Math.sin(t.theta)+dy*Math.cos(t.theta))*k;
}
/* 벽 설정 막대 */
function drawWbar(){
  const pl=planNow();if(!pl)return;
  PV.wbar.innerHTML=`<span>민감도</span><input type="range" min="-70" max="70" value="${pl.ws||0}" data-w="ws"><span>높이</span><input type="range" min="1" max="16" step=".5" value="${pl.wh||5}" data-w="wh"><span>잡음</span><input type="range" min="0" max="120" value="${pl.wn==null?25:pl.wn}" data-w="wn"><label class="tg"><input type="checkbox" data-w="inv" ${pl.inv?'checked':''}>반전</label>`;
}
let wT=0;
function wallInput(e){
  const pl=planNow(),k=e.target.dataset.w;if(!pl||!k)return;
  pl[k]=k==='inv'?e.target.checked:Number(e.target.value);touch(pl);
  clearTimeout(wT);wT=setTimeout(()=>{PV.buildFor='';build3D();},60);
}

/* ═══ 목록 뷰 ═══ */
function vPeople(){
  const roles=[...new Set(S.people.map(p=>p.role).filter(Boolean))];
  let list=S.people.slice().sort(sortKo);
  if(V.roleF)list=list.filter(p=>p.role===V.roleF);
  if(V.dayOnly)list=list.filter(p=>(p.days||[1,2,3]).includes(V.day));
  const placed=new Set(S.marks.filter(m=>m.day===V.day&&m.ref).map(m=>m.ref));
  const head=`<div class="scroll-x" style="padding-top:2px;padding-bottom:8px"><button class="chip ${V.dayOnly?'on':''}" data-a="dayOnly">${ic('time',16)}${V.day}일</button><button class="chip ${!V.roleF?'on':''}" data-a="role" data-v="">${ic('people',16)}${S.people.length}</button>${roles.map(r=>`<button class="chip ${V.roleF===r?'on':''}" data-a="role" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
  const cards=list.map(p=>`<div class="card" data-a="editPerson" data-id="${p.id}">${avHTML(p)}
    <div class="grow"><div class="nm">${esc(p.name)}</div><div class="sub">${esc(p.role||'')}${placed.has(p.id)?' · ':''}${placed.has(p.id)?'<span style="color:var(--c-plan)">●</span>':''}</div>
    ${(p.wear||[]).length?`<div class="wear">${p.wear.map(w=>`<span>${esc(w)}</span>`).join('')}</div>`:''}</div>
    <div class="pips">${[1,2,3].map(n=>`<i class="${(p.days||[]).includes(n)?'on':''}"></i>`).join('')}</div>
    ${p.phone?`<a class="call" href="tel:${esc(p.phone)}" aria-label="전화">${ic('phone')}</a>`:''}</div>`).join('');
  return head+(list.length?`<div class="list">${cards}</div>`:`<div class="empty" style="height:60%"><button data-a="addPerson">${ic('plus',48)}</button></div>`)+
    `<div class="fab"><button class="sec" data-a="paste" aria-label="붙여넣기">${ic('paste',22)}</button><button data-a="addPerson" aria-label="추가">${ic('plus',28)}</button></div>`;
}
function vGear(){
  const cats=[...new Set([...S.presets.cats,...S.gear.map(g=>g.cat)])].filter(c=>S.gear.some(g=>(g.cat||'')===c));
  const none=S.gear.filter(g=>!g.cat);
  let groups=cats.filter(c=>!V.catF||c===V.catF).map(c=>[c,S.gear.filter(g=>g.cat===c)]);
  if(none.length&&!V.catF)groups.push(['',none]);
  const card=g=>{const p=P(g.owner);return `<div class="card" data-a="editGear" data-id="${g.id}"><button class="st ${g.status||'ok'}" data-a="cycle" data-id="${g.id}" aria-label="상태">${ic(STAT[g.status||'ok'].i,24)}</button>
    <div class="grow"><div class="nm">${esc(g.name)}</div>${g.note?`<div class="sub">${esc(g.note)}</div>`:''}</div>
    <span class="qty">×${g.qty==null?1:g.qty}</span>${p?avHTML(p,'sm'):''}</div>`;};
  const head=`<div class="scroll-x" style="padding-top:2px;padding-bottom:8px"><button class="chip ${!V.catF?'on':''}" data-a="cat" data-v="">${ic('gear',16)}${S.gear.length}</button>${cats.map(c=>`<button class="chip ${V.catF===c?'on':''}" data-a="cat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
  const body=groups.map(([c,l])=>`<div class="gh">${esc(c||'—')}<small>${l.filter(g=>(g.status||'ok')==='ok').length}/${l.length}</small></div>${l.map(card).join('')}`).join('');
  return head+(S.gear.length?`<div class="list">${body}</div>`:`<div class="empty" style="height:60%"><button data-a="addGear">${ic('plus',48)}</button></div>`)+
    `<div class="fab"><button data-a="addGear" aria-label="추가">${ic('plus',28)}</button></div>`;
}
function vTime(){
  const list=S.sessions.filter(s=>s.day===V.day).sort((a,b)=>String(a.start).localeCompare(String(b.start)));
  const d=new Date(),hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),live=todayN()===V.day;
  const rows=list.map(s=>{
    const cls=live?(hm>=s.start&&hm<s.end?'now':hm>=s.end?'past':''):'';
    const crew=(s.crew||[]).map(P).filter(Boolean);
    return `<div class="tl ${cls}"><div class="t">${esc(s.start)}<small>${esc(s.end)}</small></div><div class="bar"></div>
      <button class="card" data-a="editSession" data-id="${s.id}"><div class="nm">${esc(s.title)}</div>${s.place?`<div class="sub">${ic('pin',14)} ${esc(s.place)}</div>`:''}
      ${crew.length?`<div class="faces">${crew.map(p=>avHTML(p,'sm')).join('')}</div>`:''}</button></div>`;}).join('');
  return `<div class="list" style="padding-top:4px">${rows||`<div class="empty" style="height:50vh"><button data-a="addSession">${ic('plus',48)}</button></div>`}</div>
    <div class="fab"><button data-a="addSession" aria-label="추가">${ic('plus',28)}</button></div>`;
}
function sheetCard(p){
  const day=V.day,mine=S.marks.filter(m=>m.day===day&&m.ref===p.id);
  const plans=[...new Set(mine.map(m=>m.plan))].map(id=>byId(S.plans,id)).filter(Boolean);
  const gear=S.gear.filter(g=>g.owner===p.id);
  const ses=S.sessions.filter(s=>s.day===day&&(s.crew||[]).includes(p.id)).sort((a,b)=>String(a.start).localeCompare(String(b.start)));
  return `<section class="sc">
    <div class="sc-head">${avHTML(p,'lg')}<div class="grow"><div class="nm" style="font-size:24px">${esc(p.name)}</div><div class="sub">${esc(p.role||'')} · ${day}일</div></div>${p.phone?`<a class="call" href="tel:${esc(p.phone)}">${ic('phone')}</a>`:''}</div>
    ${(p.wear||[]).length?`<div class="wear" style="margin:0">${p.wear.map(w=>`<span>${esc(w)}</span>`).join('')}</div>`:''}
    ${ses.length?`<div><h4>${ic('time',14)}</h4>${ses.map(s=>`<div class="row" style="padding:5px 0"><b style="font-variant-numeric:tabular-nums;color:var(--c-time)">${esc(s.start)}–${esc(s.end)}</b><span class="nm" style="font-size:15px">${esc(s.title)}</span></div>`).join('')}</div>`:''}
    ${plans.map(pl=>`<div><h4>${ic('plan',14)} ${esc(pl.name)}</h4>${mini(pl,day,p.id)}</div>`).join('')}
    ${gear.length?`<div><h4>${ic('gear',14)}</h4><div class="chips">${gear.map(g=>`<span class="chip sm">${esc(g.name)} ×${g.qty==null?1:g.qty}</span>`).join('')}</div></div>`:''}
  </section>`;
}
function vSheet(){
  const ppl=S.people.slice().sort(sortKo);
  if(!ppl.length)return `<div class="empty"><button data-a="addPerson">${ic('plus',48)}</button></div>`;
  const head=`<div class="scroll-x noprint" style="padding-top:2px;padding-bottom:8px"><button class="chip ${V.sheetP==='all'?'on':''}" data-a="sheetP" data-v="all">${ic('people',16)}</button>${ppl.map(p=>`<button class="chip ${V.sheetP===p.id?'on':''}" data-a="sheetP" data-v="${p.id}">${esc(p.name)}</button>`).join('')}</div>`;
  const sel=V.sheetP==='all'?ppl.filter(p=>(p.days||[1,2,3]).includes(V.day)):[P(V.sheetP)].filter(Boolean);
  return head+`<div class="pad">${sel.map(sheetCard).join('')}</div><div class="fab"><button data-a="print" aria-label="인쇄">${ic('print',26)}</button></div>`;
}
const VIEWS={people:vPeople,gear:vGear,time:vTime,sheet:vSheet};

/* 설정 */
function settings(){
  const m=modal(`<h3>${ic('cog')}<button class="ib" data-x>${ic('x')}</button></h3>
    <label class="fld"><span>DAY 1</span><input class="in" type="date" value="${esc(S.cfg.date1||'')}" data-d></label>
    <div class="btns"><button class="btn ghostb" data-ex>${ic('dl')}</button><button class="btn ghostb" data-im>${ic('ul')}</button><button class="btn ghostb" data-sync>${ic('rot')}</button></div>
    <div class="btns"><button class="btn" data-ok>${ic('check')}저장</button></div>`);
  $('[data-ok]',m.box).onclick=()=>{S.cfg.date1=$('[data-d]',m.box).value;S.cfg.u=now();const t=todayN();if(t)V.day=t;m.close();save();render();};
  $('[data-ex]',m.box).onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='isaiah61-backup.json';a.click();};
  $('[data-im]',m.box).onclick=()=>{const f=document.createElement('input');f.type='file';f.accept='.json';f.onchange=async()=>{try{const j=JSON.parse(await f.files[0].text());if(mergeIn(j)||true){m.close();save();render();}}catch(e){console.warn(e);}};f.click();};
  $('[data-sync]',m.box).onclick=()=>{m.close();pull();};
}

/* ═══ 렌더 · 이벤트 ═══ */
const A={
  editPerson:d=>editPerson(d.id),addPerson:()=>editPerson(),paste:pastePeople,
  editGear:d=>editGear(d.id),addGear:()=>editGear(),
  editSession:d=>editSession(d.id),addSession:()=>editSession(),
  cycle:d=>{const g=byId(S.gear,d.id);g.status={ok:'check',check:'miss',miss:'ok'}[g.status||'ok'];put('gear',g);},
  role:d=>{V.roleF=d.v;saveUI();render();},cat:d=>{V.catF=d.v;saveUI();render();},
  dayOnly:()=>{V.dayOnly=!V.dayOnly;saveUI();render();},
  sheetP:d=>{V.sheetP=d.v;saveUI();render();},print:()=>print()
};
function render(){
  if(drag){pendR=true;return;}
  const tab=TABS.find(t=>t.k===V.tab)||TABS[0],col=`var(${tab.c})`;
  const dn=$('#days'),today=todayN();
  dn.style.setProperty('--tc',col);
  dn.innerHTML=[1,2,3].map(n=>{const dt=dayDate(n);return `<button class="${V.day===n?'on':''} ${today===n?'today':''}" data-day="${n}">${n}<small>${dt?(dt.getMonth()+1)+'/'+dt.getDate():'DAY'}</small></button>`;}).join('');
  $('#tabs').innerHTML=TABS.map(t=>`<button class="${t.k===V.tab?'on':''}" data-tab="${t.k}" style="--tc:var(${t.c})">${ic(t.i,26)}${t.n}</button>`).join('');
  const main=$('#main');main.style.setProperty('--tc',col);
  if(V.tab==='plan'){
    main.className='fill';
    if(main.firstChild!==PV.el){main.replaceChildren(PV.el);requestAnimationFrame(()=>{onResize();if(PV.mode==='2d')fit2D();});}
    updatePV();
  }else{
    const st=main.scrollTop;main.className='';main.innerHTML=VIEWS[V.tab]();main.scrollTop=st;
  }
}
function boot(){
  buildPV();
  $('#days').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(b){V.day=Number(b.dataset.day);V.sel=null;saveUI();render();}});
  $('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){V.tab=b.dataset.tab;V.sel=null;V.armed=null;saveUI();render();}});
  $('#main').addEventListener('click',e=>{
    if(V.tab==='plan')return;
    if(e.target.closest('a'))return;
    const el=e.target.closest('[data-a]');if(el&&A[el.dataset.a]){e.stopPropagation();A[el.dataset.a](el.dataset,e);}
  });
  $('#syncBtn').addEventListener('click',settings);
  addEventListener('keydown',e=>{if(e.key==='Escape'&&V.tab==='plan'&&(V.sel||V.armed)){V.sel=null;V.armed=null;render();}
    if((e.key==='Delete'||e.key==='Backspace')&&V.sel&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))removeMark(V.sel);});
  addEventListener('resize',()=>onResize());
  render();
  initSync();
  window.__i61={S:()=>S,V,PV,render,putImg,put,uid,saveUI};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
