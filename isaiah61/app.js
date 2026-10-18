(()=>{
'use strict';
/* ═══ 유틸 ═══ */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9);
const now=()=>Date.now();
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const byId=(a,id)=>a.find(x=>x.id===id);
const short=n=>String(n||'').length>4?String(n).slice(0,4):String(n||'');
const ini=n=>{n=String(n||'?').trim();return /[가-힣]/.test(n)&&n.length>=3?n.slice(-2):n.slice(0,2);};

/* ═══ 아이콘 ═══ */
const IC={
  call:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  sched:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  crew:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14c2.5 0 4.5 1.9 4.5 5"/>',
  gear:'<path d="M3 8l9-5 9 5v9l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/>',
  cams:'<rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11l5-2.500v8L16 14"/>',
  plot:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  moon:'<path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500z"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.500 1.500M17.500 17.500L19 19M19 5l-1.500 1.500M6.500 17.500L5 19"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>', redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
  cog:'<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.5"/><circle cx="8" cy="17" r="2.5"/>',
  check:'<path d="M5 12.500l4.500 4.500L19 7.500"/>', dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', ul:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.800"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', rot:'<path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5"/>',
  fov:'<path d="M12 20L4 6M12 20l8-14"/><path d="M4 6a12 12 0 0 1 16 0"/>', dist:'<path d="M4 12h16M4 8v8M20 8v8"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', wand:'<path d="M5 19L16 8"/><path d="M14 4l2 2M18 8l2 2M17 2v3M20 5h-3"/>'
};
const ic=(n,s=20)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24">${IC[n]||''}</svg>`;

/* ═══ 상수 ═══ */
const CATS=['카메라','렌즈','짐벌','트라이포드·리그','모니터','스위칭','음향','통신','조명','배터리','전원','케이블','기타'];
const RIGS=['트라이포드','짐벌','핸드헬드','지미집','다나돌리','기타'];
const RIGC={트라이포드:'#2563eb',짐벌:'#8b5cf6',핸드헬드:'#f97316',지미집:'#e11d48',다나돌리:'#059669',기타:'#64748b'};
const RIGF={트라이포드:40,짐벌:65,핸드헬드:70,지미집:45,다나돌리:45,기타:50};
const FILTERS=[['핸드헬드','핸드헬드'],['지미집','지미집'],['짐벌','짐벌'],['트라이포드','트라이포드'],['다나돌리','다나돌리']];
const SHOTS=['','와이드','미디엄','클로즈업','군중','인서트'];
/* 하루 3파트: 오전(~11:59) · 오후(12:00~17:59) · 저녁(18:00~). 일정은 시작 시간으로 자동 분류하고,
   카메라·배치도는 part가 '' 이면 3파트 공통, 값이 있으면 그 파트 전용 */
const PARTS=['오전','오후','저녁'],PART0={오전:'09:00',오후:'13:00',저녁:'19:00'};
const partOfTime=t=>!t?'':(t<'12:00'?'오전':t<'18:00'?'오후':'저녁');
const overlap=(a,b)=>!a||!b||a===b;
const inPart=(p,part)=>!part||!p||p===part;
const KINDS=['콜','셋업','리허설','본행사','식사','철수'];
const STAT={ok:'준비',check:'점검',miss:'부족'};
const TABS=[{k:'call',n:'콜시트',i:'call'},{k:'sched',n:'일정',i:'sched'},{k:'crew',n:'크루',i:'crew'},{k:'teams',n:'팀',i:'mic'},{k:'gear',n:'장비',i:'gear'},{k:'cams',n:'카메라',i:'cams'},{k:'plot',n:'플랏',i:'plot'}];
const DAYN=[1,2,3];

/* ═══ 데이터 ═══ */
const KEY='isaiah61.doc.v1',UIK='isaiah61.doc.ui';
const COLS=['crew','gear','sched','cams','plans','pins','days','teams','tmem'];
const fresh=()=>({schema:2,proj:{title:'ISAIAH 61',sub:'Solidoegloria',date1:'2027-01-26',u:0},crew:[],gear:[],sched:[],cams:[],plans:[],pins:[],days:[],teams:[],tmem:[],del:{}});
let S=null;
try{S=JSON.parse(localStorage.getItem(KEY));}catch(e){}
if(!S||S.schema!==2)S=fresh();
for(const c of COLS)S[c]=S[c]||[];S.del=S.del||{};S.proj=S.proj||fresh().proj;
if(!S.proj.date1){S.proj.date1='2027-01-26';S.proj.u=now();}
let V={tab:'call',day:1,part:'',plan:null,lastCat:'카메라',cs3:false};
try{Object.assign(V,JSON.parse(localStorage.getItem(UIK))||{});}catch(e){}
V.sel=null;V.armed=null;V.filter='';
const saveUI=()=>{try{localStorage.setItem(UIK,JSON.stringify({tab:V.tab,day:V.day,part:V.part,plan:V.plan,lastCat:V.lastCat,cs3:V.cs3}));}catch(e){}};
const dayRec=n=>{let d=S.days.find(x=>x.n===n);if(!d){d={id:'day'+n,n,loc:'',general:'',weather:'',safety:'',notes:'',u:0};S.days.push(d);}return d;};
const crewOf=id=>byId(S.crew,id);
const rigsOf=c=>c&&c.rigs&&c.rigs.length?c.rigs:(c&&c.rig?[c.rig]:[]);
const rig0=c=>rigsOf(c)[0]||'기타';
/* 배치도 마커 가운데 글자: 포지션 영어 이름의 첫 글자(대문자) — Tripod / Gimbal / Handheld / Jimmy Jib / Dana Dolly / Etc */
const RIGL={트라이포드:'T',짐벌:'G',핸드헬드:'H',지미집:'J',다나돌리:'D',기타:'E'};
const rigInit=c=>{const l=rigsOf(c).map(r=>RIGL[r]||'?').join('').slice(0,3);return l||'?';};
const rigTxt=c=>rigsOf(c).join('·')||'-';
const gearNames=c=>((c&&c.gear)||[]).map(id=>(byId(S.gear,id)||{}).name).filter(Boolean);
const gearUse=g=>DAYN.map(d=>{const l=S.cams.filter(c=>c.day===d&&(c.gear||[]).includes(g.id)).sort((a,b)=>(a.no||0)-(b.no||0));return l.length?`${dayLabel(d)} ${l.map(c=>'C'+c.no+(c.part?'·'+c.part:'')).join(',')}`:'';}).filter(Boolean).join(' · ');
const dayDate=n=>{if(!S.proj.date1)return null;const d=new Date(S.proj.date1+'T00:00:00');if(isNaN(d))return null;d.setDate(d.getDate()+n-1);return d;};
const WD=['일','월','화','수','목','금','토'];
const dayLabel=n=>{const d=dayDate(n);return d?`${d.getMonth()+1}/${d.getDate()}(${WD[d.getDay()]})`:`DAY ${n}`;};
const dateStr=n=>{const d=dayDate(n);return d?d.toLocaleDateString('ko-KR',{year:'numeric',month:'numeric',day:'numeric',weekday:'short'}):'';};
const todayN=()=>{const d=S.proj.date1&&new Date(S.proj.date1+'T00:00:00');if(!d||isNaN(d))return 0;const t=new Date();t.setHours(0,0,0,0);const n=Math.round((t-d)/864e5)+1;return n>=1&&n<=3?n:0;};
/* 용어 통일: 삼각대 → 트라이포드 (이미 저장된 데이터·동기화로 들어온 예전 데이터도 같이 바꿈) */
function unifyTerms(){
  for(const c of S.cams){let ch=false;if(c.rig==='삼각대'){c.rig='트라이포드';ch=true;}if(c.rigs&&c.rigs.includes('삼각대')){c.rigs=c.rigs.map(r=>r==='삼각대'?'트라이포드':r);ch=true;}if(ch)c.u=now();}
  for(const g of S.gear)if(g.cat==='삼각대·리그'){g.cat='트라이포드·리그';g.u=now();}
}
unifyTerms();
if(todayN())V.day=todayN();
const working=n=>S.crew.filter(c=>(c.days||DAYN).includes(n));
/* 참여일 체크가 모든 곳의 기준: 그날 체크 안 한 인원은 담당·배치·목록·텍스트 어디에도 나오지 않는다(데이터는 남겨서 다시 체크하면 복원) */
const attends=(id,n)=>{const c=crewOf(id);return !!c&&(c.days||DAYN).includes(n);};
const opOf=c=>c&&c.op&&attends(c.op,c.day)?crewOf(c.op):null;
const ownerOf=g=>{const c=crewOf(g.owner);return c&&(c.days||DAYN).length?c:null;};
const pinOk=p=>p.kind!=='crew'||attends(p.ref,p.day);
/* 한 사람은 한 번만: 카메라 담당으로 지정된 사람은 카메라(CAM)로만 나오고, 크루 칩·크루 핀에는 나오지 않는다 */
const opSet=(day,part)=>new Set(S.cams.filter(c=>c.day===day&&inPart(c.part,part)).map(c=>(opOf(c)||{}).id).filter(Boolean));
const camsFor=(day,part)=>S.cams.filter(c=>c.day===day&&inPart(c.part,part)).sort((a,b)=>(a.no||0)-(b.no||0));
const pinKey=p=>p.of?'o:'+p.of:(p.kind==='area'?'o:'+p.id:p.kind+':'+p.ref);
/* 그 파트에서 실제로 보이는 핀: 파트 전용(덮어쓰기) 우선, 없으면 공통. hide=true 는 "이 파트에선 빼기" */
function pinsFor(day,part,planId){
  const all=S.pins.filter(p=>p.plan===planId&&p.day===day&&pinOk(p)&&(p.kind!=='cam'||(()=>{const c=byId(S.cams,p.ref);return !!c&&inPart(c.part,part);})()));
  const ops=opSet(day,part);
  for(let i=all.length-1;i>=0;i--)if(all[i].kind==='crew'&&ops.has(all[i].ref))all.splice(i,1);
  const out=[],seen=new Set();
  if(part){
    for(const p of all)if(p.part===part){seen.add(pinKey(p));if(!p.hide)out.push(p);}
    for(const p of all)if(!p.part&&!p.hide&&!seen.has(pinKey(p)))out.push(p);
  }else{
    for(const p of all)if(!p.part&&!p.hide){seen.add(pinKey(p));out.push(p);}
    for(const p of all)if(p.part&&!p.hide&&!seen.has(pinKey(p))){seen.add(pinKey(p));out.push(p);}
  }
  return out;
}

/* ═══ 저장 · 동기화 ═══ */
const SB={url:'https://mgvqhrdhshpuamihfvnp.supabase.co',
  anon:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnFocmRoc2hwdWFtaWhmdm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTE4NjQsImV4cCI6MjEwNDE4Nzg2NH0.fjDJuG-47YHU63lydUSZGAGg3FQ-DLGLp9ufnJ4SN30',
  table:'carescript',row:'isaiah61-doc'};
let DB=null,pushT=0,drag=null,pendR=false;
const setSt=s=>{const d=$('#dot');if(d)d.className='dot '+s;};
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
/* 실행 취소 이력: 저장 시점마다 전체 스냅샷(도면 이미지는 별도라 작음) */
const H={u:[],r:[],c:''};
const snap=()=>JSON.stringify(S);
function histPush(){const j=snap();if(j===H.c)return;if(H.c){H.u.push(H.c);if(H.u.length>100)H.u.shift();}H.r=[];H.c=j;}
function save(){histPush();persist();clearTimeout(pushT);setSt(DB?'wait':'');pushT=setTimeout(push,700);}
const touch=it=>{it.u=now();return it;};
function mergeIn(rem){
  if(!rem||rem.schema!==2)return false;
  const before=JSON.stringify(S);
  const del={...(rem.del||{})};for(const k in S.del)del[k]=Math.max(del[k]||0,S.del[k]);
  for(const c of COLS){const m=new Map();for(const it of [...(S[c]||[]),...(rem[c]||[])]){const o=m.get(it.id);if(!o||(it.u||0)>(o.u||0))m.set(it.id,it);}
    S[c]=[...m.values()].filter(it=>!(del[it.id]>=(it.u||0)));}
  const cut=now()-30*864e5;for(const k in del)if(del[k]<cut)delete del[k];
  S.del=del;if(((rem.proj||{}).u||0)>(S.proj.u||0))S.proj=rem.proj;
  unifyTerms();
  const ch=JSON.stringify(S)!==before;if(ch){H.u=[];H.r=[];H.c=snap();}
  return ch;
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
  if(/[?&]solo/.test(location.search)||!(window.supabase&&window.supabase.createClient)){setSt('');return;}
  DB=window.supabase.createClient(SB.url,SB.anon,{auth:{persistSession:false}});
  setSt('wait');
  pull().then(()=>{push();DB.channel('i61doc').on('postgres_changes',{event:'*',schema:'public',table:SB.table,filter:'id=eq.'+SB.row},()=>pull()).subscribe();});
  addEventListener('online',push);
}

/* 스냅샷 복원: 지워진 건 삭제 표시, 되살린/바뀐 건 새 시각을 줘서 동기화에서도 이기게 한다 */
function restore(j){
  const T=JSON.parse(j),strip=o=>JSON.stringify({...o,u:0});
  for(const c of COLS){
    const cur=new Map(S[c].map(x=>[x.id,x])),out=[];
    for(const id of cur.keys())if(!T[c].some(x=>x.id===id))S.del[id]=now();
    for(const it of T[c]){const o=cur.get(it.id);if(o&&strip(o)===strip(it)){out.push(o);continue;}it.u=now();delete S.del[it.id];out.push(it);}
    S[c]=out;
  }
  if(strip(S.proj)!==strip(T.proj))S.proj={...T.proj,u:now()};
}
function undoRedo(redo){
  if($('.ov'))return;
  const ae=document.activeElement;if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))ae.blur();   // 입력 중이던 내용을 먼저 확정
  const from=redo?H.r:H.u,to=redo?H.u:H.r;
  if(!from.length){toast(redo?'다시 실행할 게 없어요':'취소할 게 없어요');return;}
  to.push(H.c);restore(from.pop());H.c=snap();
  V.sel=null;V.armed=null;persist();clearTimeout(pushT);setSt(DB?'wait':'');pushT=setTimeout(push,700);
  render();toast(redo?'다시 실행':'실행 취소');
}

/* CRUD */
function add(col,o){const it=touch({...o,id:uid()});S[col].push(it);save();return it;}
function remove(col,id){
  S[col]=S[col].filter(x=>x.id!==id);S.del[id]=now();
  const kill=f=>{for(const p of S.pins.filter(f))S.del[p.id]=now();S.pins=S.pins.filter(p=>!f(p));};
  if(col==='crew'){kill(p=>p.kind==='crew'&&p.ref===id);for(const c of S.cams)if(c.op===id){c.op='';touch(c);}for(const g of S.gear)if(g.owner===id){g.owner='';touch(g);}}
  if(col==='cams')kill(p=>p.kind==='cam'&&p.ref===id);
  if(col==='gear')for(const c of S.cams)if((c.gear||[]).includes(id)){c.gear=c.gear.filter(x=>x!==id);touch(c);}
  if(col==='plans')kill(p=>p.plan===id);
  if(col==='teams'){for(const m of teamMem(id))S.del[m.id]=now();S.tmem=S.tmem.filter(m=>m.team!==id);}
  save();
}

/* ═══ 이미지(도면 원본) ═══ */
const idb=(()=>{let p;const open=()=>p||(p=new Promise((res,rej)=>{const r=indexedDB.open('isaiah61doc',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));
  const tx=(m,f)=>open().then(d=>new Promise((res,rej)=>{const t=d.transaction('img',m);const rq=f(t.objectStore('img'));t.oncomplete=()=>res(rq&&rq.result);t.onerror=()=>rej(t.error);}));
  return {get:k=>tx('readonly',s=>s.get(k)).catch(()=>null),set:(k,v)=>tx('readwrite',s=>s.put(v,k)).catch(()=>{})};})();
const IMG={},PEND={};
const ikey=pl=>pl.id+'@'+pl.iv;
function imgOf(pl){
  if(pl.gen==='hall')return genHall(pl);
  if(pl.src)return pl.src;
  return imgK(ikey(pl));
}
function imgK(k){
  if(IMG[k])return IMG[k];
  if(!PEND[k]){PEND[k]=(async()=>{
    let d=await idb.get(k);
    if(!d&&DB){try{const r=await DB.from(SB.table).select('content').eq('id',SB.row+'-img-'+k).maybeSingle();d=r.data&&r.data.content&&r.data.content.d;if(d)idb.set(k,d);}catch(e){}}
    if(d){IMG[k]=d;render();}else setTimeout(()=>{delete PEND[k];},4000);
  })();}
  return null;
}
const putImg=(pl,data)=>putK(ikey(pl),data);
async function putK(k,data){
  IMG[k]=data;await idb.set(k,data);
  if(DB){try{await DB.from(SB.table).upsert({id:SB.row+'-img-'+k,content:{d:data},rev:1,updated_at:new Date().toISOString()});}catch(e){console.warn(e);}}
}
const loadImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});
async function shrink(file,M=2200){
  const url=URL.createObjectURL(file);
  try{
    const im=await loadImg(url),s=Math.min(1,M/Math.max(im.naturalWidth,im.naturalHeight));
    const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);
    const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
    return {data:c.toDataURL('image/jpeg',.88),w:c.width,h:c.height};
  }finally{URL.revokeObjectURL(url);}
}
function pickImage(cb,M){const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=async()=>{if(f.files[0]){try{cb(await shrink(f.files[0],M));}catch(e){console.warn(e);}}};f.click();}

/* ═══ 야간 모드 ═══ */
const THEME_KEY='isaiah61.theme',mq=matchMedia('(prefers-color-scheme: dark)');
const effDark=()=>{const t=document.documentElement.dataset.theme;return t==='dark'||(t!=='light'&&mq.matches);};
function applyTheme(t){
  const h=document.documentElement;if(t)h.dataset.theme=t;else delete h.dataset.theme;
  try{if(t)localStorage.setItem(THEME_KEY,t);else localStorage.removeItem(THEME_KEY);}catch(e){}
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=effDark()?'#07080a':'#f3f4f6';
}
mq.addEventListener&&mq.addEventListener('change',()=>{applyTheme(document.documentElement.dataset.theme||'');render();});

/* ═══ 모달 · 토스트 ═══ */

function modal(inner){
  const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="box">${inner}</div>`;document.body.append(o);
  const kd=e=>{if(e.key==='Escape')close();};
  const close=()=>{o.remove();document.removeEventListener('keydown',kd);};
  document.addEventListener('keydown',kd);
  o.addEventListener('pointerdown',e=>{if(e.target===o)close();});
  $$('[data-x]',o).forEach(b=>b.onclick=close);
  return {o,box:o.firstElementChild,close};
}
function toast(t,ms){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),ms||1500);}
async function copyText(t){
  try{await navigator.clipboard.writeText(t);}catch(_){const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove();}
  toast('복사됨');
}

/* ═══ 표 도우미 ═══ */
const inp=(c,it,k,o={})=>`<input data-c="${c}" data-id="${it.id}" data-k="${k}" type="${o.t||'text'}" value="${esc(it[k]==null?'':it[k])}"${o.ph?` placeholder="${esc(o.ph)}"`:''}${o.list?` list="${o.list}"`:''}${o.re?' data-re="1"':''}${o.t==='tel'?' inputmode="tel"':''}${o.t==='number'?' inputmode="numeric" min="0"':''}>`;
const sel=(c,it,k,opts,o={})=>`<select data-c="${c}" data-id="${it.id}" data-k="${k}"${o.re?' data-re="1"':''}>${opts.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}"${String(it[k]==null?'':it[k])===String(v)?' selected':''}>${esc(l)}</option>`;}).join('')}</select>`;
const xb=(c,id)=>`<td class="x noprint"><button data-del="${c}" data-id="${id}" aria-label="삭제">${ic('x',16)}</button></td>`;
const byStart=(a,b)=>(String(a.start||'99:99')).localeCompare(String(b.start||'99:99'));
const crewOpts=n=>[['','—'],...working(n).map(c=>[c.id,c.name||'(이름 없음)'])];

/* ═══ 콜시트 ═══ */
function vCall(){
  const n=V.day,d=dayRec(n),ses=S.sched.filter(s=>s.day===n&&(!V.part||partOfTime(s.start)===V.part)).sort(byStart),crew=working(n),cams=camsFor(n,V.part),absent=S.crew.filter(c=>!crew.includes(c));
  return `<div class="doc">
  <div class="dh"><div><h1>CALL SHEET</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)} · ${VENUE}</div></div><div class="r"><b>DAY ${n} / 3${V.part?' · '+V.part:''}</b>${esc(dateStr(n))}</div></div>
  <div class="clock"><b id="clk">${clockText()}</b></div>
  <div class="cnts"><div class="cn"><span>총원</span><b>${S.crew.length}</b></div><div class="cn ok"><span>현재원</span><b>${crew.length}</b></div><div class="cn ${absent.length?'bad':''}"><span>불참</span><b>${absent.length}</b>${absent.length?`<small>${esc(absent.slice(0,6).map(c=>c.name||'이름 없음').join(', '))}${absent.length>6?' 외 '+(absent.length-6)+'명':''}</small>`:''}</div></div>
  <div class="sec">일정</div>
  ${ses.length?`<div class="tw"><table class="t t-ro"><thead><tr><th>시간</th><th>구분</th><th>항목</th><th>팀</th><th>장소</th><th>담당</th><th>비고</th></tr></thead><tbody>${ses.map(s=>`<tr><td class="ro" data-l="시간" style="white-space:nowrap;font-variant-numeric:tabular-nums">${esc(s.start)}${s.end?'–'+esc(s.end):''}</td><td class="ro" data-l="구분">${esc(s.kind)}</td><td class="ro" data-l="항목"><b>${esc(s.title)}</b></td><td class="ro" data-l="팀">${esc((byId(S.teams,s.team)||{}).name||'')}</td><td class="ro" data-l="장소">${esc(s.place)}</td><td class="ro" data-l="담당">${esc(s.who)}</td><td class="ro" data-l="비고">${esc(s.note)}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">일정 탭에서 입력</div>`}
  <div class="sec">카메라 · ${cams.length}대</div>
  ${cams.length?`<div class="tw"><table class="t t-ro"><thead><tr><th>CAM</th>${V.part?'':'<th>파트</th>'}<th>담당</th><th>포지션</th><th>장비</th><th>샷</th><th>비고</th></tr></thead><tbody>${cams.map(c=>`<tr><td class="ro" data-l="CAM"><b>${esc(c.no)}</b></td>${V.part?'':`<td class="ro" data-l="파트">${esc(c.part||'공통')}</td>`}<td class="ro" data-l="담당">${esc((opOf(c)||{}).name||'')}</td><td class="ro" data-l="포지션">${esc(rigTxt(c))}</td><td class="ro" data-l="장비">${esc(gearNames(c).join(', '))}</td><td class="ro" data-l="샷">${esc(c.shot)}</td><td class="ro" data-l="비고">${esc(c.note)}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">카메라 탭에서 입력</div>`}
  ${miniPlots(n)}
  <div class="sec">공지</div><div class="kv"><label class="wide"><textarea rows="4" data-c="days" data-id="${d.id}" data-k="notes">${esc(d.notes)}</textarea></label></div>
  </div>`;
}
function miniPlots(n){
  return S.plans.map(pl=>{
    const ps=[...pinsFor(n,V.part,pl.id),...tmPins(pl)];
    const data=imgOf(pl);
    const mini=`<div class="mini ${V.cs3?'printonly':''}" style="aspect-ratio:${pl.w}/${pl.h}">${data?`<img src="${data}" style="position:absolute;inset:0;width:100%;height:100%">`:''}<svg viewBox="0 0 ${pl.w} ${pl.h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">${ps.filter(p=>p.kind==='area').map(p=>areaSVG(p,pl)).join('')}${ps.filter(p=>p.kind==='cam').map(p=>coneSVG(p,pl)).join('')}</svg><div class="marks">${ps.map(p=>markHTML(p)).join('')}</div></div>`;
    const v3=V.cs3?`<div class="cv3 noprint" data-plan="${pl.id}"><canvas class="gl"></canvas><div class="marks m3"></div><div class="zoom"><button data-cvz="in">+</button><button data-cvz="out">−</button><button data-cvz="fit" aria-label="맞춤">${ic('fit',18)}</button></div></div>`:'';
    const t=stageTeam(),ms=t?teamMem(t.id):[],voc=ms.filter(m=>propOf(m.part||'')==='mic'),band=ms.filter(m=>propOf(m.part||'')!=='mic');
    const body=ms.length?`${teamChips(t,teamSes(n))}<div class="prow">${voc.length?`<div class="side">${voc.map(luCard).join('')}</div>`:''}<div class="pmid">${v3}${mini}</div>${band.length?`<div class="side">${band.map(luCard).join('')}</div>`:''}</div>`:v3+mini;
    return `<div class="sec">카메라 플랏 · ${esc(pl.name)}${t&&ms.length?` · 무대 ${esc(t.name||'팀')} ${ms.length}명`:''}<span class="sp"></span><div class="seg noprint"><button data-cs3="0" class="${V.cs3?'':'on'}">2D</button><button data-cs3="1" class="${V.cs3?'on':''}">3D</button></div></div>${body}`;
  }).join('');
}

/* ═══ 일정 ═══ */
function vSched(){
  const n=V.day,all=S.sched.filter(s=>s.day===n).sort(byStart),live=todayN()===n,t=new Date(),hm=String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
  const row=s=>`<tr class="${live&&s.start<=hm&&hm<s.end?'now':''}"><td style="width:92px">${inp('sched',s,'start',{t:'time',re:1})}</td><td style="width:92px">${inp('sched',s,'end',{t:'time'})}</td><td style="width:92px">${sel('sched',s,'kind',KINDS)}</td><td style="min-width:180px">${inp('sched',s,'title',{ph:'항목'})}</td><td style="min-width:120px">${sel('sched',s,'team',[['','—'],...S.teams.map(t=>[t.id,t.name||'(이름 없음)'])],{re:1})}</td><td style="min-width:100px">${inp('sched',s,'place',{ph:'장소'})}</td><td style="min-width:140px">${inp('sched',s,'who',{ph:'담당'})}</td><td style="min-width:140px">${inp('sched',s,'note',{ph:'비고'})}</td>${xb('sched',s.id)}</tr>`;
  let rows='';
  if(V.part)rows=all.filter(s=>partOfTime(s.start)===V.part).map(row).join('');
  else rows=[...PARTS,''].map(g=>{const l=all.filter(s=>partOfTime(s.start)===g);return l.length?`<tr class="grp"><td colspan="9"><div class="gc">${g||'시간 미정'} · ${l.length}</div></td></tr>`+l.map(row).join(''):'';}).join('');
  return `<div class="doc"><div class="dh"><div><h1>RUN OF SHOW</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>DAY ${n} / 3${V.part?' · '+V.part:''}</b>${esc(dateStr(n))}</div></div>
  ${teamStrip()}
  <div class="tw"><table class="t t-sched" style="min-width:940px"><thead><tr><th>시작</th><th>끝</th><th>구분</th><th>항목</th><th>팀</th><th>장소</th><th>담당</th><th>비고</th><th class="noprint"></th></tr></thead><tbody>${rows||`<tr><td colspan="9" class="empty">행 추가로 시작</td></tr>`}</tbody></table></div>
  <div class="addrow noprint"><button class="ib" data-add="sched">${ic('plus',16)}행 추가</button></div></div>`;
}

/* ═══ 크루 ═══ */
function vCrew(){
  const rows=S.crew.map((c,i)=>`<tr><td class="idx">${i+1}</td><td style="min-width:120px">${inp('crew',c,'name',{ph:'이름'})}</td><td style="min-width:130px">${inp('crew',c,'phone',{t:'tel',ph:'010-'})}</td><td style="min-width:170px">${inp('crew',c,'wear',{ph:'장비'})}</td>${DAYN.map(n=>{const on=(c.days||[]).includes(n);return `<td class="ck" data-l="${dayLabel(n)}"><button class="cb ${on?'on':''}" data-tg="crew" data-id="${c.id}" data-d="${n}" aria-label="${dayLabel(n)}">${on?'✓':''}</button></td>`;}).join('')}<td style="min-width:140px">${inp('crew',c,'note',{ph:'비고'})}</td>${xb('crew',c.id)}</tr>`).join('');
  return `<div class="doc"><div class="dh"><div><h1>CREW LIST</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>${S.crew.length}명</b>${DAYN.map(n=>`${dayLabel(n)} ${working(n).length}명`).join(' · ')}</div></div>
  <div class="tw"><table class="t t-crew" style="min-width:780px"><thead><tr><th>#</th><th>이름</th><th>번호</th><th>장비</th>${DAYN.map(n=>`<th class="ck">${dayLabel(n)}</th>`).join('')}<th>비고</th><th class="noprint"></th></tr></thead><tbody>${rows||`<tr><td colspan="9" class="empty">크루 추가로 시작</td></tr>`}</tbody></table></div>
  <div class="addrow noprint"><button class="ib" data-add="crew">${ic('plus',16)}크루 추가</button></div></div>`;
}

/* ═══ 팀 (무대에 올라가는 팀 · 파트별 인원 · 사진) ═══
   큐시트(일정) 세션마다 팀을 고르면, 콜시트·일정 위에 그 팀 라인업이 색 띠와 함께 뜨고 플랏 무대 위에 인원이 올라간다 */
const MCOL=[['화이트','#f1f5f9'],['블루','#2563eb'],['그린','#16a34a'],['옐로','#facc15'],['오렌지','#f97316'],['레드','#dc2626'],['퍼플','#7c3aed'],['핑크','#ec4899'],['브라운','#92400e'],['그레이','#64748b'],['블랙','#111827']];
const mcol=m=>(MCOL[m.col]||MCOL[0])[1];
const fgOf=h=>{const n=parseInt(h.slice(1),16);return ((n>>16)*299+(n>>8&255)*587+(n&255)*114)/1000>150?'#111':'#fff';};
const teamMem=id=>S.tmem.filter(m=>m.team===id);
const photoOf=m=>m.iv?imgK('tm-'+m.id+'@'+m.iv):null;
const hhmm=()=>{const t=new Date();return String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');};
const teamSes=n=>S.sched.filter(s=>s.day===n&&byId(S.teams,s.team)&&(!V.part||partOfTime(s.start)===V.part)).sort(byStart);
/* 지금 무대 팀: 직접 고른 팀 > 오늘이면 진행 중(없으면 다음) 세션의 팀 > 그날 첫 세션의 팀 */
function stageTeam(){
  if(V.team==='-')return null;
  const f=V.team&&byId(S.teams,V.team);if(f)return f;
  const l=teamSes(V.day);if(!l.length)return null;let s=l[0];
  if(todayN()===V.day){const hm=hhmm();s=l.find(x=>x.start<=hm&&hm<(x.end||'99'))||l.find(x=>x.start>hm)||l[l.length-1];}
  return byId(S.teams,s.team);
}
const luCard=m=>{const c=mcol(m),ph=photoOf(m);return `<div class="lu"><div class="ph">${ph?`<img src="${ph}" alt="">`:esc(ini(m.name))}</div><div class="cap" style="background:${c};color:${fgOf(c)}"><small>${esc(partCode(m.part))}</small><b>${esc(m.name||'')}</b></div></div>`;};
const teamChips=(t,l)=>l.length>1||V.team?`<div class="tsel noprint">${V.team?`<button class="chip dash" data-st="">자동</button>`:''}${l.map(s=>`<button class="chip ${s.team===t.id?'on':''}" data-st="${s.team}">${esc(s.start||'')} ${esc(byId(S.teams,s.team).name||'팀')}</button>`).join('')}</div>`:'';
function teamStrip(){
  const t=stageTeam(),l=teamSes(V.day);if(!t)return '';
  const ms=teamMem(t.id);
  return `<div class="sec">무대 · ${esc(t.name||'팀')} · ${ms.length}명</div>${teamChips(t,l)}${ms.length?`<div class="lineup">${ms.map(luCard).join('')}</div>`:'<div class="empty">팀 탭에서 인원 추가</div>'}`;
}
function vTeams(){
  const card=t=>{const ms=teamMem(t.id),used=S.sched.filter(s=>s.team===t.id).sort((a,b)=>a.day-b.day||byStart(a,b)).map(s=>`DAY ${s.day} ${s.start||''} ${s.title||''}`.trim());
    const rows=ms.map(m=>{const c=mcol(m),ph=photoOf(m);return `<tr><td class="pc" data-l="사진"><button class="phb" data-tp="${m.id}" aria-label="사진 넣기">${ph?`<img src="${ph}" alt="">`:ic('image',20)}</button></td><td style="width:110px"><select data-c="tmem" data-id="${m.id}" data-k="col" data-re="1" style="background:${c};color:${fgOf(c)};font-weight:700">${MCOL.map((x,i)=>`<option value="${i}"${String(m.col)===String(i)?' selected':''}>${x[0]}</option>`).join('')}</select></td><td style="min-width:150px">${inp('tmem',m,'part',{ph:'파트 (보컬, EG1, 드럼…)'})}</td><td style="min-width:150px">${inp('tmem',m,'name',{ph:'이름'})}</td>${xb('tmem',m.id)}</tr>`;}).join('');
    return `<div class="tcard"><div class="tth"><input class="in" data-c="teams" data-id="${t.id}" data-k="name" value="${esc(t.name||'')}" placeholder="팀 이름 (예: 1부 찬양팀)"><span class="tn">${ms.length}명</span><button class="ib red noprint" data-del="teams" data-id="${t.id}" aria-label="팀 삭제">${ic('x',16)}</button></div>
    <div class="tw"><table class="t t-tm"><thead><tr><th>사진</th><th>색</th><th>파트</th><th>이름</th><th class="noprint"></th></tr></thead><tbody>${rows||`<tr><td colspan="5" class="empty">인원 추가로 시작</td></tr>`}</tbody></table></div>
    <div class="addrow noprint"><button class="ib" data-add="tmem" data-team="${t.id}">${ic('plus',16)}인원 추가</button><span class="sp" style="flex:1"></span><button class="ib on" data-mk="${t.id}">${ic('check',16)}${t.done?'무대에 다시 배치':'팀 생성'}</button></div>
    ${used.length?`<div class="tuse">큐시트 · ${esc(used.join(' / '))}</div>`:''}</div>`;};
  return `<div class="doc"><div class="dh"><div><h1>TEAMS</h1><div style="color:var(--soft);font-weight:600">무대 팀 · 파트별 인원</div></div><div class="r"><b>${S.teams.length}팀</b>${S.tmem.length}명</div></div>
  ${S.teams.map(card).join('')||'<div class="empty">새 팀으로 시작 · 일정 탭에서 세션마다 팀을 고르면 콜시트와 플랏 무대에 뜹니다</div>'}
  <div class="addrow noprint"><button class="ib" data-add="teams">${ic('plus',16)}새 팀</button></div></div>`;
}
/* 무대 구역('무대' 이름의 구역) 위에 인원을 줄 맞춰 올린다. 무대가 없으면 도면 위쪽 가운데. all=false 면 위치 없는 인원만 */
function autoPlace(t,pl,all){
  const ms=teamMem(t.id);if(!ms.length)return;
  const st=S.pins.filter(p=>p.plan===pl.id&&p.kind==='area'&&/무대|stage/i.test(p.name||'')).sort((a,b)=>(b.day===V.day)-(a.day===V.day))[0];
  const cols=Math.min(8,ms.length>4?Math.ceil(ms.length/2):ms.length),rows=Math.ceil(ms.length/cols);
  ms.forEach((m,i)=>{
    if(!all&&m.at&&m.at[pl.id])return;
    const r=Math.floor(i/cols),c=i%cols,n=r===rows-1?ms.length-r*cols:cols;let x,y;
    if(st){const [fw,fh]=mPerFrac(pl),w=(st.w||10)*.85,d=(st.d||8)*.8,a=(st.rot||0)*Math.PI/180,lx=-w/2+w*(c+.5)/n,ly=rows>1?-d/2+d*(r+.5)/rows:0;
      x=st.x+(lx*Math.cos(a)-ly*Math.sin(a))/fw;y=st.y+(lx*Math.sin(a)+ly*Math.cos(a))/fh;}
    else{x=.3+.4*(c+.5)/n;y=.12+.05*r;}
    m.at={...(m.at||{}),[pl.id]:{x:clamp(x,0,1),y:clamp(y,0,1)}};touch(m);
  });
}
/* 플랏에 올라가는 팀 인원(저장되는 핀이 아니라 인원 데이터의 위치로 그리는 표시용 핀) */
function tmPins(pl){
  const t=stageTeam();if(!t||!pl)return [];
  const ms=teamMem(t.id);if(ms.some(m=>!(m.at&&m.at[pl.id]))){autoPlace(t,pl,false);persist();}
  return ms.map(m=>({id:'tm-'+m.id,kind:'tm',plan:pl.id,m,x:m.at[pl.id].x,y:m.at[pl.id].y}));
}

/* ═══ 장비 ═══ */
function vGear(){
  const cats=[...new Set([...CATS,...S.gear.map(g=>g.cat)])].filter(c=>S.gear.some(g=>g.cat===c));
  const body=cats.map(cat=>{const l=S.gear.filter(g=>g.cat===cat);return `<tr class="grp"><td colspan="8"><div class="gc">${esc(cat)} · ${l.length}종 · 준비 ${l.filter(g=>(g.status||'ok')==='ok').length}/${l.length}</div></td></tr>`+l.map(g=>`<tr><td style="width:110px">${sel('gear',g,'cat',[...new Set([...CATS,g.cat])],{re:1})}</td><td style="min-width:180px">${inp('gear',g,'name',{ph:'품목'})}</td><td style="width:70px" class="num">${inp('gear',g,'qty',{t:'number'})}</td><td style="min-width:130px">${sel('gear',g,'owner',[['','—'],...S.crew.filter(c=>(c.days||DAYN).length).map(c=>[c.id,c.name||'(이름 없음)'])])}</td><td style="width:84px"><span class="${g.status||'ok'}">${sel('gear',g,'status',Object.entries(STAT),{re:1})}</span></td><td class="ro" data-l="카메라 배정" style="min-width:150px;font-size:12px;color:var(--soft)">${esc(gearUse(g))}</td><td style="min-width:140px">${inp('gear',g,'note',{ph:'비고'})}</td>${xb('gear',g.id)}</tr>`).join('');}).join('');
  const total=S.gear.reduce((a,g)=>a+(Number(g.qty)||0),0);
  return `<div class="doc"><div class="dh"><div><h1>EQUIPMENT LIST</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>${S.gear.length}종 · ${total}개</b>부족 ${S.gear.filter(g=>g.status==='miss').length} · 점검 ${S.gear.filter(g=>g.status==='check').length}</div></div>
  <div class="tw"><table class="t t-gear" style="min-width:900px"><thead><tr><th>분류</th><th>품목</th><th>수량</th><th>담당</th><th>상태</th><th>카메라 배정</th><th>비고</th><th class="noprint"></th></tr></thead><tbody>${body||`<tr><td colspan="8" class="empty">분류를 눌러 추가</td></tr>`}</tbody></table></div>
  <div class="addrow noprint">${CATS.map(c=>`<button class="ib" data-add="gear" data-cat="${esc(c)}">${ic('plus',14)}${esc(c)}</button>`).join('')}</div></div>`;
}

/* ═══ 카메라 리스트 ═══ */
const msel=(kind,c,names)=>`<button class="msel" data-ms="${kind}" data-id="${c.id}">${names.length?names.map(x=>`<span class="mc">${esc(x)}</span>`).join(''):'<span class="ph">선택</span>'}</button>`;
function vCams(){
  const n=V.day,list=camsFor(n,V.part);
  const rows=list.map(c=>`<tr><td style="width:64px" class="num">${inp('cams',c,'no',{t:'number',re:1})}</td><td style="width:92px">${sel('cams',c,'part',[['','공통'],...PARTS],{re:1})}</td><td style="min-width:150px">${sel('cams',c,'op',crewOpts(n))}</td><td style="min-width:150px">${msel('rigs',c,rigsOf(c))}</td><td style="min-width:220px">${msel('gear',c,gearNames(c))}</td><td style="width:100px">${sel('cams',c,'shot',SHOTS.map(s=>[s,s||'—']))}</td><td style="min-width:130px">${inp('cams',c,'note',{ph:'비고'})}</td>${xb('cams',c.id)}</tr>`).join('');
  return `<div class="doc"><div class="dh"><div><h1>CAMERA LIST</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>${dayLabel(n)} · DAY ${n} / 3${V.part?' · '+V.part:''}</b>${list.length}명</div></div>
  <div class="tw"><table class="t t-cams" style="min-width:840px"><thead><tr><th>CAM</th><th>파트</th><th>담당</th><th>포지션</th><th>장비</th><th>샷</th><th>비고</th><th class="noprint"></th></tr></thead><tbody>${rows||`<tr><td colspan="8" class="empty">카메라 추가로 시작</td></tr>`}</tbody></table></div>
  <div class="addrow noprint"><button class="ib" data-add="cams">${ic('plus',16)}카메라 추가</button>${V.part&&PARTS.indexOf(V.part)>0?`<button class="ib" data-copypart="cams">${ic('copy',16)}${PARTS[PARTS.indexOf(V.part)-1]} → ${V.part} 복사</button>`:''}${n>1?`<button class="ib" data-copyday="cams">${ic('copy',16)}${n-1}일 → ${n}일 복사</button>`:''}</div></div>`;
}
/* 멀티 선택 창: 포지션(핸드헬드·지미집·짐벌…) / 장비(장비 탭에 등록된 것) */
function pickMulti(kind,c){
  if(!c)return;
  const sel=new Set(kind==='rigs'?rigsOf(c):(c.gear||[]).filter(id=>byId(S.gear,id)));
  const body=()=>{
    if(kind==='rigs')return RIGS.map(r=>`<button class="pk ${sel.has(r)?'on':''}" data-v="${esc(r)}"><span class="bx">${sel.has(r)?'✓':''}</span><span style="width:10px;height:10px;border-radius:3px;background:${RIGC[r]}"></span><b>${esc(r)}</b></button>`).join('');
    if(!S.gear.length)return `<div class="empty">장비 탭에서 먼저 장비를 등록하세요</div>`;
    const cats=[...new Set(S.gear.map(g=>g.cat))];
    return cats.map(cat=>`<div class="pgrp">${esc(cat||'—')}</div>`+S.gear.filter(g=>g.cat===cat).map(g=>{
      const used=S.cams.filter(x=>x.day===c.day&&x.id!==c.id&&overlap(x.part,c.part)&&(x.gear||[]).includes(g.id)).length,q=g.qty==null?1:g.qty,warn=used>=q;
      return `<button class="pk ${sel.has(g.id)?'on':''} ${warn?'warn':''}" data-v="${g.id}"><span class="bx">${sel.has(g.id)?'✓':''}</span><b>${esc(g.name||'(이름 없음)')}</b><span class="sub">${used}/${q} 사용${warn?' · 소진':''}</span></button>`;}).join('')).join('');
  };
  const m=modal(`<h3>${kind==='rigs'?'포지션':'장비'} · CAM ${esc(c.no)} ${esc((opOf(c)||{}).name||'')}<button class="ib" data-x>${ic('x',16)}</button></h3><div class="pks" style="display:flex;flex-direction:column;gap:6px"></div><div class="btns"><button class="btn" data-ok>${ic('check',18)}완료</button></div>`);
  const box=$('.pks',m.box),draw=()=>{box.innerHTML=body();};draw();
  box.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;const v=b.dataset.v;sel.has(v)?sel.delete(v):sel.add(v);draw();});
  $('[data-ok]',m.box).onclick=()=>{const arr=[...sel];if(kind==='rigs'){c.rigs=arr;c.rig=arr[0]||'';}else c.gear=arr;touch(c);save();m.close();render();};
}

/* ═══ 플랏 ═══ */
/* 행사장 기본 도면: KINTEX 제2전시장 9홀 (9A+9B) — 도면 표기 치수 기준 99m × 132m, 높이 15m (kintex.com 시설 안내) */
/* 현재 시각(시:분:초) — 1초마다 해당 글자만 갱신(화면 전체를 다시 그리지 않음) */
const clockText=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;};
/* 행사장은 바뀌지 않으므로 고정 문구 */
const VENUE='KINTEX 제2전시장 9홀';
const KINTEX={id:'kintex9',name:'KINTEX 9홀',gen:'hall',w:1110,h:1440,iv:2,
  real:{w:99,h:132,H:15,box:[60/1110,60/1440,1050/1110,1380/1440],zones:[['9B',0,66],['9A',66,132]],pillar:[48.9,66,2.3]}};
const ACOL=['#f59e0b','#2563eb','#16a34a','#dc2626','#7c3aed','#0891b2','#64748b'];
const AREA_PRE={stage:{n:'무대',w:18,d:8,h:1.2,c:0},booth:{n:'부스',w:3,d:3,h:2.5,c:1},zone:{n:'구역',w:10,d:10,h:3,c:2}};
const GEN={};
function genHall(pl){
  const k=ikey(pl);if(GEN[k])return GEN[k];
  const c=document.createElement('canvas');c.width=pl.w;c.height=pl.h;const x=c.getContext('2d'),r=pl.real,P=10,M=60,W=r.w*P,H=r.h*P;
  x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.fillStyle='#f3f5f8';x.fillRect(M,M,W,H);
  x.strokeStyle='#d3d9e1';x.lineWidth=1;
  for(let i=1;i<r.w/10;i++){x.beginPath();x.moveTo(M+i*10*P,M);x.lineTo(M+i*10*P,M+H);x.stroke();}
  for(let j=1;j<r.h/10;j++){x.beginPath();x.moveTo(M,M+j*10*P);x.lineTo(M+W,M+j*10*P);x.stroke();}
  x.fillStyle='#c2c9d3';x.font='bold 130px sans-serif';x.textAlign='center';x.fillText('9B',M+W/2,M+33*P+44);x.fillText('9A',M+W/2,M+99*P+44);
  x.setLineDash([16,10]);x.strokeStyle='#7b8794';x.lineWidth=2.5;x.beginPath();x.moveTo(M,M+66*P);x.lineTo(M+W,M+66*P);x.stroke();x.setLineDash([]);
  x.strokeStyle='#1f2937';x.lineWidth=7;x.strokeRect(M,M,W,H);
  const [px,pz,dia]=r.pillar;x.fillStyle='#6b7280';x.beginPath();x.arc(M+px*P,M+pz*P,dia/2*P,0,7);x.fill();
  x.fillStyle='#6b7280';x.font='20px sans-serif';x.fillText('기둥 Ø'+dia+'m',M+px*P,M+pz*P-24);
  x.fillStyle='#8b95a3';x.font='16px sans-serif';
  for(let i=0;i<=r.w/10;i++)x.fillText(i*10,M+i*10*P,M-14);
  x.textAlign='right';for(let j=0;j<=r.h/10;j++)x.fillText(j*10,M-12,M+j*10*P+6);
  x.textAlign='center';x.fillStyle='#1f2937';x.font='bold 24px sans-serif';x.strokeStyle='#1f2937';x.lineWidth=2;
  const yb=M+H+34;x.beginPath();x.moveTo(M,yb);x.lineTo(M+W,yb);x.moveTo(M,yb-8);x.lineTo(M,yb+8);x.moveTo(M+W,yb-8);x.lineTo(M+W,yb+8);x.stroke();x.fillText('99m',M+W/2,yb-10);
  for(const [a,b] of [[0,66],[66,132]]){x.save();x.translate(M+W+34,M+(a+b)/2*P);x.rotate(Math.PI/2);x.fillText('66m',0,-10);x.restore();x.beginPath();x.moveTo(M+W+34,M+a*P);x.lineTo(M+W+34,M+b*P);x.moveTo(M+W+26,M+a*P);x.lineTo(M+W+42,M+a*P);x.moveTo(M+W+26,M+b*P);x.lineTo(M+W+42,M+b*P);x.stroke();}
  return GEN[k]=c.toDataURL('image/png');
}
const RIGH={트라이포드:1.6,짐벌:1.5,핸드헬드:1.5,지미집:3.5,다나돌리:.9,기타:1.5};
const PV={el:null,z:1,tx:0,ty:0,z0:0,fitFor:'',mode:'2d',G:null,buildFor:'',orbitFor:'',th:{theta:.35,phi:.85,dist:190,tx:0,tz:0}};
const planNow=()=>{let p=byId(S.plans,V.plan);if(!p){p=S.plans[0]||null;V.plan=p&&p.id;}return p;};
const pinsNow=()=>{const pl=planNow();return pl?[...pinsFor(V.day,V.part,pl.id),...tmPins(pl)]:[];};
function ownPin(p){
  if(!V.part||p.part===V.part)return p;
  return add('pins',{...p,part:V.part,of:p.of||(p.kind==='area'?p.id:undefined)});
}
function delPin(p){
  if(V.part&&!p.part)add('pins',{...p,part:V.part,hide:true,of:p.of||(p.kind==='area'?p.id:undefined)});
  else{S.pins=S.pins.filter(x=>x.id!==p.id);S.del[p.id]=now();}
}
const dimOf=p=>p.kind==='area'?false:(!!V.filter&&!(p.kind==='cam'&&rigsOf(byId(S.cams,p.ref)).includes(V.filter)));
/* 이미지 좌표(0~1) ↔ 미터(홀 중심 기준). 실측 정보가 없는 도면은 가로 100m로 가정 */
const realOf=pl=>pl.real||{w:100,h:100*pl.h/pl.w,H:0,box:[0,0,1,1],zones:[]};
const toM=(pl,x,y)=>{const r=realOf(pl),b=r.box;return [((x-b[0])/(b[2]-b[0])-.5)*r.w,((y-b[1])/(b[3]-b[1])-.5)*r.h];};
const fromM=(pl,mx,mz)=>{const r=realOf(pl),b=r.box;return [b[0]+(mx/r.w+.5)*(b[2]-b[0]),b[1]+(mz/r.h+.5)*(b[3]-b[1])];};
const mPerFrac=pl=>{const r=realOf(pl),b=r.box;return [r.w/(b[2]-b[0]),r.h/(b[3]-b[1])];};
const where=p=>{const pl=byId(S.plans,p.plan),r=pl&&pl.real;if(!r)return zone(p);const [mx,mz]=toM(pl,p.x,p.y),xm=mx+r.w/2,ym=mz+r.h/2,z=(r.zones||[]).find(z=>ym>=z[1]&&ym<z[2]);return `${z?z[0]+' ':''}가로 ${Math.round(xm)}m · 세로 ${Math.round(ym)}m`;};
function ensureKintex(){
  const ex=byId(S.plans,'kintex9');
  if(ex){if(ex.src||ex.iv<KINTEX.iv){Object.assign(ex,KINTEX);delete ex.src;touch(ex);return true;}return false;}
  if(S.del['kintex9'])return false;S.plans.unshift(touch({...KINTEX}));return true;
}

function coneGeo(p,pl){
  const cam=byId(S.cams,p.ref),rig=rig0(cam),a=(p.rot||0)*Math.PI/180,f=(p.fov==null?RIGF[rig]:p.fov)*Math.PI/360,R=(p.rng==null?.22:p.rng)*pl.w,px=p.x*pl.w,py=p.y*pl.h,pts=[[px,py]];
  for(let k=0;k<=12;k++){const g=a-f+2*f*k/12;pts.push([px+Math.sin(g)*R,py-Math.cos(g)*R]);}
  return pts;
}
function coneSVG(p,pl,dim){const cam=byId(S.cams,p.ref),c=RIGC[rig0(cam)];return `<polygon opacity="${dim?.1:1}" points="${coneGeo(p,pl).map(q=>q.join(',')).join(' ')}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;}
function areaSVG(p,pl){
  const [fw,fh]=mPerFrac(pl),a=(p.rot||0)*Math.PI/180,w=(p.w||10)/2,d=(p.d||10)/2,col=ACOL[p.col||0],pts=[[-w,-d],[w,-d],[w,d],[-w,d]].map(([cx,cy])=>{const rx=cx*Math.cos(a)-cy*Math.sin(a),ry=cx*Math.sin(a)+cy*Math.cos(a);return [p.x*pl.w+rx/fw*pl.w,p.y*pl.h+ry/fh*pl.h].join(',');}).join(' ');
  return `<polygon points="${pts}" fill="${col}" fill-opacity=".3" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
}
function markHTML(p,o={}){
  const sel=p.id===V.sel?'sel':'',st=`left:${p.x*100}%;top:${p.y*100}%`;
  if(p.kind==='area')return `<div class="mk area ${sel}" data-id="${p.id}" style="${st}"><span class="pill big"><i style="background:${ACOL[p.col||0]}"></i>${esc(p.name||'구역')}</span></div>`;
  if(p.kind==='cam'){const c=byId(S.cams,p.ref);if(!c)return '';const op=opOf(c);
    return `<div class="mk cam ${sel} ${o.dim?'dim':''}" data-id="${p.id}" style="${st}"><span class="tk" style="--c:${RIGC[rig0(c)]||RIGC.기타};font-size:${rigInit(c).length>2?11:rigInit(c).length>1?13:16}px">${esc(rigInit(c))}</span><span class="pill">${esc(c.no)}${op?' '+esc(short(op.name)):''}</span></div>`;}
  if(p.kind==='tm'&&o.m3){const m=p.m;return `<div class="mk tm m3l ${o.dim?'dim':''}" data-id="${p.id}" data-tm="${m.id}" style="${st}"><span class="pill"><i style="background:${mcol(m)}"></i>${m.part?esc(partCode(m.part))+' · ':''}${esc(m.name)}</span></div>`;}
  if(p.kind==='tm'){const m=p.m,c=mcol(m),ph=photoOf(m);return `<div class="mk tm ${o.dim?'dim':''}" data-id="${p.id}" data-tm="${m.id}" style="${st}"><span class="tk" style="--c:${c};color:${fgOf(c)}">${ph?`<img src="${ph}" alt="">`:esc(ini(m.name))}</span><span class="pill">${m.part?esc(partCode(m.part))+' · ':''}${esc(m.name)}</span></div>`;}
  const c=crewOf(p.ref);if(!c)return '';
  return `<div class="mk crew ${sel} ${o.dim?'dim':''}" data-id="${p.id}" style="${st}"><span class="tk" style="--c:#475569">${esc(ini(c.name))}</span><span class="pill">${esc(short(c.name))}</span></div>`;
}
function buildPV(){
  const el=document.createElement('section');el.className='pv';
  el.innerHTML=`<div class="pbar"><div class="scx" data-plans></div><div class="seg"><button data-m="2d">2D</button><button data-m="3d">3D</button></div><button class="ib" data-pa="edit" aria-label="도면 편집">${ic('edit',18)}</button></div>
  <div class="fbar scx" data-filter></div>
  <div class="stage"><div class="world"><img draggable="false" alt=""><svg preserveAspectRatio="none"></svg><div class="marks"></div></div>
    <canvas class="gl" hidden></canvas><div class="marks m3" hidden></div>
    <div class="zoom"><button data-z="in">+</button><button data-z="out">−</button><button data-z="fit" aria-label="맞춤">${ic('fit',18)}</button></div>
    <button class="bigadd" data-pa="add">${ic('image',40)}도면 올리기</button><div class="insp" hidden></div></div>
  <div class="tray"></div>`;
  PV.el=el;PV.stage=$('.stage',el);PV.world=$('.world',el);PV.img=$('.world img',el);PV.svg=$('.world>svg',el);PV.marks=$('.world .marks',el);PV.m3=$('.m3',el);PV.gl=$('.gl',el);PV.insp=$('.insp',el);PV.tray=$('.tray',el);
  el.addEventListener('click',e=>{
    const pl=e.target.closest('[data-pl]');if(pl){V.plan=pl.dataset.pl;V.sel=null;saveUI();render();return;}
    const pa=e.target.closest('[data-pa]');if(pa){if(pa.dataset.pa==='add')addPlanMenu();else editPlan();return;}
    const mo=e.target.closest('[data-m]');if(mo){setMode(mo.dataset.m);return;}
    const z=e.target.closest('[data-z]');if(z){zoomBy(z.dataset.z);return;}
    const tm=e.target.closest('[data-team]');if(tm){const t=stageTeam();V.team=tm.dataset.team?(t&&t.id===tm.dataset.team?'-':tm.dataset.team):null;render();return;}
    const fl=e.target.closest('[data-f]');if(fl){V.filter=fl.dataset.f;V.sel=null;V.armed=null;render();return;}
  });
  bindGestures(PV.stage);
  PV.stage.addEventListener('pointerdown',markDown);
  PV.tray.addEventListener('pointerdown',trayDown);
  PV.insp.addEventListener('click',inspClick);
  PV.insp.addEventListener('input',e=>{let p=byId(S.pins,V.sel);if(!p)return;const s=e.target.dataset.s;if(s&&V.part&&!p.part){p=ownPin(p);V.sel=p.id;}if(!s)return;const v=Number(e.target.value);p[s]=(s==='rot'||s==='fov'||s==='w'||s==='d'||s==='h')?v:v/100;renderMarks();});
  PV.insp.addEventListener('input',e=>{if(e.target.dataset.nm===undefined)return;let p=byId(S.pins,V.sel);if(!p)return;if(V.part&&!p.part){p=ownPin(p);V.sel=p.id;}p.name=e.target.value;renderMarks();});
  PV.insp.addEventListener('change',()=>{const p=byId(S.pins,V.sel);if(p){touch(p);save();}});
  new ResizeObserver(()=>{if(!PV.el.isConnected)return;if(PV.fitFor&&!PV.z0)fit();resize3D();}).observe(PV.stage);
}
function updatePV(){
  const pl=planNow(),m3=PV.mode==='3d';
  $('[data-plans]',PV.el).innerHTML=S.plans.map(p=>`<button class="chip ${pl&&p.id===pl.id?'on':''}" data-pl="${p.id}">${esc(p.name)}</button>`).join('')+`<button class="chip dash" data-pa="add">${ic('plus',14)}도면</button>`;
  $$('.seg button',PV.el).forEach(b=>b.classList.toggle('on',b.dataset.m===PV.mode));
  const fb=$('[data-filter]',PV.el);fb.hidden=!pl;
  if(pl){const eff=pinsFor(V.day,V.part,pl.id),cnt=r=>eff.filter(p=>p.kind==='cam'&&rigsOf(byId(S.cams,p.ref)).includes(r)).length,tot=eff.filter(p=>p.kind!=='area').length;
    fb.innerHTML=`<button class="chip ${!V.filter?'on':''}" data-f="">전체 ${tot}</button>`+FILTERS.map(([r,l])=>`<button class="chip ${V.filter===r?'on':''}" data-f="${r}"><span style="width:9px;height:9px;border-radius:3px;background:${RIGC[r]}"></span>${l} ${cnt(r)}</button>`).join('')+
      (S.teams.length?S.teams.map(t=>`<button class="chip ${(stageTeam()||{}).id===t.id?'on':''}" data-team="${t.id}">${ic('mic',14)}${esc(t.name||'팀')}</button>`).join('')+(V.team?`<button class="chip dash" data-team="">자동</button>`:''):'');}
  $('[data-pa="edit"]',PV.el).hidden=!pl;$('.bigadd',PV.el).hidden=!!pl;PV.tray.hidden=!pl;PV.stage.classList.toggle('armed',!!V.armed);
  PV.world.hidden=!pl||m3;PV.gl.hidden=!pl||!m3;PV.m3.hidden=!pl||!m3;
  if(!pl){PV.insp.hidden=true;return;}
  const data=imgOf(pl),k=ikey(pl);
  PV.world.style.width=pl.w+'px';PV.world.style.height=pl.h+'px';
  if(data&&PV.img.dataset.k!==k){PV.img.src=data;PV.img.dataset.k=k;}
  if(PV.fitFor!==k){PV.fitFor=k;fit();}
  if(m3&&data&&PV.buildFor!==k+(pl.real?'r':''))build3D();
  renderMarks();renderInsp();renderTray();
}
function applyWorld(){PV.world.style.transform=`translate(${PV.tx}px,${PV.ty}px) scale(${PV.z})`;PV.world.style.setProperty('--inv',1/PV.z);}
function fit(){const pl=planNow();if(!pl)return;const r=PV.stage.getBoundingClientRect();if(!r.width)return;PV.z=Math.min(r.width/pl.w,r.height/pl.h)*.96;PV.z0=PV.z;PV.tx=(r.width-pl.w*PV.z)/2;PV.ty=(r.height-pl.h*PV.z)/2;applyWorld();}
function zoomAt(s,mx,my,dx,dy){const r=PV.stage.getBoundingClientRect(),px=mx-r.left,py=my-r.top,nz=clamp(PV.z*s,(PV.z0||1)*.3,(PV.z0||1)*10),k=nz/PV.z;PV.tx=px-(px-PV.tx)*k+dx;PV.ty=py-(py-PV.ty)*k+dy;PV.z=nz;applyWorld();}
function zoomBy(a){
  if(PV.mode==='3d'){if(a==='fit')resetOrbit();else PV.th.dist=clamp(PV.th.dist/(a==='in'?1.3:1/1.3),10,600);dirty3();return;}
  if(a==='fit'){fit();return;}const r=PV.stage.getBoundingClientRect();zoomAt(a==='in'?1.3:1/1.3,r.left+r.width/2,r.top+r.height/2,0,0);
}
async function setMode(m){
  if(m===PV.mode)return;
  if(m==='3d'&&!(await ensureThree())){toast('3D를 불러오지 못했어요 · 인터넷 확인');return;}
  PV.mode=m;V.sel=V.sel;render();
  if(m==='3d')requestAnimationFrame(()=>resize3D());
}
function bindGestures(el){
  const Pm=new Map();let last=null,t0=0,moved=0;
  const snap=()=>{if(Pm.size<2)return null;const [a,b]=[...Pm.values()];return {d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};};
  el.addEventListener('pointerdown',e=>{if(e.target.closest('.mk,.insp,.zoom,.bigadd'))return;try{el.setPointerCapture(e.pointerId);}catch(_){}Pm.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,sh:e.shiftKey});if(Pm.size===1){moved=0;t0=now();}last=snap();});
  el.addEventListener('pointermove',e=>{const p=Pm.get(e.pointerId);if(!p)return;const ox=p.x,oy=p.y;p.x=e.clientX;p.y=e.clientY;
    if(Pm.size===1){const dx=p.x-ox,dy=p.y-oy;moved+=Math.abs(dx)+Math.abs(dy);
      if(PV.mode==='3d')orbit(dx,dy,p.b===2||p.sh);else{PV.tx+=dx;PV.ty+=dy;applyWorld();}}
    else if(Pm.size===2){const c=snap();moved=99;
      if(last){if(PV.mode==='3d'){PV.th.dist=clamp(PV.th.dist*last.d/c.d,10,600);pan3(c.mx-last.mx,c.my-last.my);dirty3();}else zoomAt(c.d/last.d,c.mx,c.my,c.mx-last.mx,c.my-last.my);}
      last=c;}});
  const up=e=>{if(!Pm.has(e.pointerId))return;if(Pm.size===1&&moved<8&&now()-t0<600&&e.type==='pointerup')tapStage(e.clientX,e.clientY);Pm.delete(e.pointerId);last=snap();};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('wheel',e=>{e.preventDefault();const s=Math.exp(-e.deltaY*.0015);if(PV.mode==='3d'){PV.th.dist=clamp(PV.th.dist/s,10,600);dirty3();}else zoomAt(s,e.clientX,e.clientY,0,0);},{passive:false});
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
function stagePos(cx,cy,strict){
  const pl=planNow();if(!pl)return null;let x,y;
  if(PV.mode==='3d'){const g=ray(cx,cy);if(!g)return null;[x,y]=fromM(pl,g.x,g.z);}
  else{const r=PV.world.getBoundingClientRect();x=(cx-r.left)/r.width;y=(cy-r.top)/r.height;}
  if(strict&&(x<0||x>1||y<0||y>1))return null;
  return {x:clamp(x,0,1),y:clamp(y,0,1)};
}
function tapStage(cx,cy){
  if(V.armed){const pos=stagePos(cx,cy,true);if(pos){place(V.armed,pos);V.armed=null;render();}return;}
  if(V.sel){V.sel=null;render();}
}
function place(it,pos){
  const pl=planNow();if(!pl)return;
  if(it.t==='area'){const d=AREA_PRE[it.id];const q=add('pins',{plan:pl.id,day:V.day,part:V.part,kind:'area',ref:'a'+uid(),x:pos.x,y:pos.y,rot:0,name:d.n,w:d.w,d:d.d,h:d.h,col:d.c});V.sel=q.id;save();return;}
  let p=pinsFor(V.day,V.part,pl.id).find(x=>x.kind===it.t&&x.ref===it.id);
  if(p){p=ownPin(p);p.x=pos.x;p.y=pos.y;touch(p);}else p=add('pins',{plan:pl.id,day:V.day,part:it.t==='cam'?((byId(S.cams,it.id)||{}).part||''):V.part,kind:it.t,ref:it.id,x:pos.x,y:pos.y,rot:0});
  V.sel=p.id;save();
}
function trayTap(t,id){
  const pl=planNow(),p=pl&&pinsFor(V.day,V.part,pl.id).find(x=>x.kind===t&&x.ref===id);
  if(p){V.sel=p.id;V.armed=null;render();return;}
  V.armed=V.armed&&V.armed.t===t&&V.armed.id===id?null:{t,id};render();
}
function renderTray(){
  const pl=planNow();if(!pl)return;
  const placed=new Set(pinsFor(V.day,V.part,pl.id).map(p=>p.kind+p.ref));
  const cams=camsFor(V.day,V.part),ops=opSet(V.day,V.part),crew=working(V.day).filter(c=>!ops.has(c.id));
  const on=(t,id)=>V.armed&&V.armed.t===t&&V.armed.id===id?'on':'';
  /* 사람 한 칩 = 이름 + (카메라 탭에서 정한 포지션 글자). 끌어서 도면에 놓으면 그 포지션으로 바로 올라간다 */
  const chip=(t,id,name,bd,col)=>`<button class="chip ${on(t,id)} ${placed.has(t+id)?'done':''}" data-tray="${t}" data-id="${id}">${bd?`<span class="bd" style="background:${col}">${esc(bd)}</span>`:''}${esc(name)}</button>`;
  const people=cams.map(c=>chip('cam',c.id,(opOf(c)||{}).name||'CAM '+c.no,rigInit(c),RIGC[rig0(c)]||RIGC.기타)).join('')+crew.map(c=>chip('crew',c.id,c.name||'?','','')).join('');
  PV.tray.innerHTML=`<div class="row"><div class="scx">${Object.entries(AREA_PRE).map(([k,v])=>`<button class="chip ${on('area',k)}" data-tray="area" data-id="${k}"><span style="width:9px;height:9px;border-radius:3px;background:${ACOL[v.c]}"></span>+ ${v.n}</button>`).join('')}</div></div>
  <div class="row"><div class="scx">${people||'<span style="color:var(--faint)">카메라 탭에서 인원을 등록하세요</span>'}</div></div>`;
}
/* 하단 칩: 끌어서 도면에 놓기(권장) 또는 눌러서 선택한 뒤 도면 누르기 */
function trayDown(e){
  const b=e.target.closest('[data-tray]');if(!b)return;
  const item={t:b.dataset.tray,id:b.dataset.id},sx=e.clientX,sy=e.clientY;let ghost=null;
  const mv=ev=>{
    if(!ghost&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>10){ghost=b.cloneNode(true);ghost.classList.add('ghost');document.body.append(ghost);}
    if(ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';}
  };
  const end=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',cancel);};
  const cancel=()=>{end();if(ghost)ghost.remove();};
  const up=ev=>{
    end();
    if(ghost){
      ghost.remove();const r=PV.stage.getBoundingClientRect();
      if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom){const pos=stagePos(ev.clientX,ev.clientY,true);if(pos){place(item,pos);V.armed=null;render();}}
      return;
    }
    trayTap(item.t,item.id);
  };
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',cancel);
}
function renderMarks(){
  const pl=planNow();if(!pl)return;
  const ps=pinsNow().slice().sort((a,b)=>(a.id===V.sel)-(b.id===V.sel)),m3=PV.mode==='3d';
  PV.svg.setAttribute('viewBox',`0 0 ${pl.w} ${pl.h}`);
  PV.svg.innerHTML=ps.filter(p=>p.kind==='area').map(p=>areaSVG(p,pl)).join('')+ps.filter(p=>p.kind==='cam').map(p=>coneSVG(p,pl,dimOf(p))).join('');
  const html=ps.map(p=>markHTML(p,{dim:dimOf(p),m3})).join('');
  if(m3){PV.marks.innerHTML='';PV.m3.innerHTML=html;shapes3D(ps,pl);project3D();dirty3();}
  else{PV.m3.innerHTML='';PV.marks.innerHTML=html;}
}
function renderInsp(){
  const p=V.sel&&byId(S.pins,V.sel),pl=planNow();
  if(!p||!pl||p.plan!==pl.id||p.day!==V.day||!pinOk(p)||!pinsNow().includes(p)){PV.insp.hidden=true;return;}
  PV.insp.hidden=false;
  const close=`<button class="ib red" data-i="del" aria-label="도면에서 빼기">${ic('trash',16)}</button><button class="ib" data-i="close">${ic('x',16)}</button>`,loc=`<div style="color:var(--soft);font-size:12px;font-weight:600">${esc(where(p))}${p.part?' · '+p.part+' 전용':(V.part?' · 공통':'')}</div>`;
  if(p.kind==='area'){PV.insp.innerHTML=`<div class="r"><input class="in" style="height:38px;flex:1;min-width:0" value="${esc(p.name||'')}" data-nm placeholder="이름"><button class="ib" data-i="dup" aria-label="복제">${ic('copy',16)}</button>${close}</div>
    <div class="r">${ACOL.map((c,i)=>`<button class="sw ${(p.col||0)===i?'on':''}" data-col="${i}" style="background:${c}" aria-label="색"></button>`).join('')}<span style="margin-left:auto;color:var(--soft);font-size:12px;font-weight:600">${p.w||10}×${p.d||10}m · 높이 ${p.h==null?3:p.h}m</span></div>
    <div class="r"><label class="sl">가로<input type="range" min="1" max="80" value="${p.w||10}" data-s="w"></label><label class="sl">세로<input type="range" min="1" max="60" value="${p.d||10}" data-s="d"></label></div>
    <div class="r"><label class="sl">높이<input type="range" min="0" max="15" step=".5" value="${p.h==null?3:p.h}" data-s="h"></label><label class="sl">${ic('rot',16)}<input type="range" min="0" max="359" value="${p.rot||0}" data-s="rot"></label></div>${loc}`;return;}
  if(p.kind==='crew'){const c=crewOf(p.ref)||{};PV.insp.innerHTML=`<div class="r"><div style="flex:1;min-width:0"><b>${esc(c.name)}</b>${loc}</div>${c.phone?`<a class="ib" href="tel:${esc(c.phone)}">${esc(c.phone)}</a>`:''}${close}</div>`;return;}
  const c=byId(S.cams,p.ref)||{},op=opOf(c),rig=rig0(c),eq=gearNames(c);
  PV.insp.innerHTML=`<div class="r"><div style="flex:1;min-width:0"><b>CAM ${esc(c.no)}</b> <span style="color:var(--soft)">${esc(rigTxt(c))}${c.shot?' · '+esc(c.shot):''}${op?' · '+esc(op.name):''}</span>${loc}</div>${close}</div>
  ${eq.length?`<div class="eq">${eq.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
  <div class="r"><label class="sl">${ic('rot',16)}<input type="range" min="0" max="359" value="${p.rot||0}" data-s="rot"></label><label class="sl">${ic('fov',16)}<input type="range" min="10" max="140" value="${p.fov==null?RIGF[rig]:p.fov}" data-s="fov"></label><label class="sl">${ic('dist',16)}<input type="range" min="5" max="70" value="${Math.round((p.rng==null?.22:p.rng)*100)}" data-s="rng"></label></div>`;
}
function inspClick(e){
  const sw=e.target.closest('[data-col]');if(sw){let p=byId(S.pins,V.sel);if(p){p=ownPin(p);V.sel=p.id;p.col=Number(sw.dataset.col);touch(p);save();render();}return;}
  const i=e.target.closest('[data-i]');if(!i)return;
  if(i.dataset.i==='dup'){const p=byId(S.pins,V.sel);if(p){const q=add('pins',{...p,of:undefined,hide:undefined,part:V.part||p.part||'',ref:'a'+uid(),x:clamp(p.x+.02,0,1),y:clamp(p.y+.02,0,1)});V.sel=q.id;save();render();}return;}
  if(i.dataset.i==='close'){V.sel=null;render();}
  if(i.dataset.i==='del'){const p=byId(S.pins,V.sel);if(p){delPin(p);V.sel=null;save();render();}}
}
function markDown(e){
  const el=e.target.closest('.mk');if(!el||!PV.stage.contains(el))return;
  if(el.dataset.tm){tmDrag(e,el);return;}
  let p=byId(S.pins,el.dataset.id);if(!p)return;
  e.preventDefault();e.stopPropagation();
  const sx=e.clientX,sy=e.clientY;let moved=false;drag={id:p.id};
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;if(!moved){p=ownPin(p);drag={id:p.id};}moved=true;const pos=stagePos(ev.clientX,ev.clientY);if(!pos)return;p.x=pos.x;p.y=pos.y;V.sel=p.id;renderMarks();};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);drag=null;if(moved){touch(p);save();}V.sel=p.id;render();};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
}
function tmDrag(e,el){
  const m=byId(S.tmem,el.dataset.tm),pl=planNow();if(!m||!pl)return;
  e.preventDefault();e.stopPropagation();drag={id:el.dataset.id};let moved=false;
  const mv=ev=>{const pos=stagePos(ev.clientX,ev.clientY);if(!pos)return;moved=true;m.at={...(m.at||{}),[pl.id]:pos};renderMarks();};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);drag=null;if(moved){touch(m);save();}render();};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
}

/* ═══ 3D (three.js · 실측 미터 단위) ═══
   X = 3D 화면 하나(플랏 탭의 PV, 콜시트의 보기 전용 뷰어). 같은 코드로 여러 화면에서 쓴다. */
const loadScript=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s);});
async function ensureThree(){if(window.THREE)return true;try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');return !!window.THREE;}catch(e){console.warn(e);return false;}}
const planOf=X=>X.plan||planNow();
const pinsOf=X=>X.pins?X.pins():pinsNow();
function initGL(X=PV){
  const T=THREE,R=new T.WebGLRenderer({canvas:X.gl,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.5,4000);
  scene.add(new T.AmbientLight(0xffffff,.85));const dl=new T.DirectionalLight(0xffffff,.6);dl.position.set(-60,120,80);scene.add(dl);
  X.G={R,scene,cam,world:new T.Group(),shapes:new T.Group()};scene.add(X.G.world);scene.add(X.G.shapes);
  resize3D(X);
}
function resize3D(X=PV){if(!X.G||X.mode!=='3d')return;const r=X.stage.getBoundingClientRect();if(!r.width)return;X.G.R.setSize(r.width,r.height,false);X.G.cam.aspect=r.width/r.height;X.G.cam.updateProjectionMatrix();dirty3(X);}
function disposeGroup(g){for(const c of [...g.children]){g.remove(c);if(c.geometry)c.geometry.dispose();if(c.material){if(c.material.map)c.material.map.dispose();c.material.dispose();}}}
function resetOrbit(X=PV){const pl=planOf(X);if(!pl)return;const r=realOf(pl);Object.assign(X.th,{theta:.35,phi:.85,dist:Math.max(r.w,r.h)*1.45,tx:0,tz:0});}
function build3D(X=PV){
  const pl=planOf(X);if(!pl||!window.THREE)return;
  if(!X.G)initGL(X);
  const data=imgOf(pl);if(!data)return;
  const T=THREE,G=X.G,r=realOf(pl),[fw,fh]=mPerFrac(pl);
  disposeGroup(G.world);
  const tex=new T.TextureLoader().load(data,()=>dirty3(X));tex.anisotropy=8;
  const fg=new T.PlaneGeometry(fw,fh);fg.rotateX(-Math.PI/2);fg.translate((.5-(r.box[0]+r.box[2])/2)*fw,0,(.5-(r.box[1]+r.box[3])/2)*fh);
  G.world.add(new T.Mesh(fg,new T.MeshBasicMaterial({map:tex})));
  if(pl.real){
    const H=r.H||15,w=r.w,d=r.h,t=.5,wallMat=new T.MeshLambertMaterial({color:0x94a3b8,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false});
    [[w,t,0,-d/2],[w,t,0,d/2],[t,d,-w/2,0],[t,d,w/2,0]].forEach(([ww,dd,x,z])=>{const g=new T.BoxGeometry(ww,H,dd);g.translate(x,H/2,z);G.world.add(new T.Mesh(g,wallMat));});
    const eg=new T.EdgesGeometry(new T.BoxGeometry(w,H,d));eg.translate(0,H/2,0);G.world.add(new T.LineSegments(eg,new T.LineBasicMaterial({color:0x475569})));
    if(r.pillar){const [px,pz,dia]=r.pillar,cg=new T.CylinderGeometry(dia/2,dia/2,H,20);cg.translate(px-w/2,H/2,pz-d/2);G.world.add(new T.Mesh(cg,new T.MeshLambertMaterial({color:0x6b7280})));}
    for(const z of (r.zones||[]))if(z[1]>0){const lg=new T.BufferGeometry();lg.setAttribute('position',new T.Float32BufferAttribute([-w/2,.1,z[1]-d/2,w/2,.1,z[1]-d/2],3));G.world.add(new T.Line(lg,new T.LineBasicMaterial({color:0xdc2626})));}
  }
  const span=Math.ceil(Math.max(r.w,r.h)*1.4/10)*10,gh=new T.GridHelper(span,span/10,0x64748b,0x94a3b8);gh.position.y=.06;gh.material.transparent=true;gh.material.opacity=.3;G.world.add(gh);
  X.buildFor=ikey(pl)+(pl.real?'r':'');
  if(X.orbitFor!==X.buildFor){X.orbitFor=X.buildFor;resetOrbit(X);}
  shapes3D(pinsOf(X),pl,X);project3D(X);dirty3(X);
}
function shapes3D(ps,pl,X=PV){
  if(!X.G||!window.THREE)return;
  const T=THREE,G=X.G,[fw]=mPerFrac(pl);disposeGroup(G.shapes);
  for(const p of ps){
    const [mx,mz]=toM(pl,p.x,p.y),a=(p.rot||0)*Math.PI/180,op=(!X.nodim&&dimOf(p))?.12:1;
    const mat=(col,o)=>new T.MeshLambertMaterial({color:col,transparent:true,opacity:(o==null?1:o)*op});
    const put=(g,col,o,y,rotY)=>{const m=new T.Mesh(g,mat(col,o));m.position.set(mx,y||0,mz);if(rotY)m.rotation.y=rotY;G.shapes.add(m);};
    if(p.kind==='area'){const h=Math.max(.1,p.h==null?3:p.h),g=new T.BoxGeometry(p.w||10,h,p.d||10);g.translate(0,h/2,0);put(g,new T.Color(ACOL[p.col||0]),.85,0,-a);continue;}
    if(p.kind==='tm'){const g=member3D(p,pl,ps,op);g.scale.setScalar(figScale(X));G.shapes.add(g);continue;}
    if(p.kind==='crew'){const col=0x475569,g=new T.CylinderGeometry(.28,.28,1.4,12);g.translate(0,.7,0);put(g,col);const s=new T.SphereGeometry(.26,12,10);s.translate(0,1.65,0);put(s,col);continue;}
    const cam=byId(S.cams,p.ref);if(!cam)continue;
    const rig=rig0(cam),col=new T.Color(RIGC[rig]),h=RIGH[rig]||1.5;
    const pg=new T.CylinderGeometry(.08,.08,h,8);pg.translate(0,h/2,0);put(pg,col);
    put(new T.BoxGeometry(.6,.45,.8),col,1,h,-a);
    const f=(p.fov==null?RIGF[rig]:p.fov)*Math.PI/360,R=(p.rng==null?.22:p.rng)*fw,pos=[mx,.12,mz],idx=[];
    for(let k=0;k<=12;k++){const g=a-f+2*f*k/12;pos.push(mx+Math.sin(g)*R,.12,mz-Math.cos(g)*R);}
    for(let i=1;i<=12;i++)idx.push(0,i,i+1);
    const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(pos,3));geom.setIndex(idx);
    G.shapes.add(new T.Mesh(geom,new T.MeshBasicMaterial({color:col,transparent:true,opacity:.28*op,side:T.DoubleSide,depthWrite:false})));
  }
}
/* 무대 위 높이: 인원이 서 있는 구역(무대 등)의 높이와 방향. 구역 밖이면 바닥(0) */
function floorAt(ps,pl,mx,mz){
  let out={h:0,a:0};
  for(const q of ps){if(q.kind!=='area')continue;const [cx,cz]=toM(pl,q.x,q.y),a=(q.rot||0)*Math.PI/180,dx=mx-cx,dz=mz-cz,lx=dx*Math.cos(a)+dz*Math.sin(a),lz=-dx*Math.sin(a)+dz*Math.cos(a),h=q.h==null?3:q.h;
    if(Math.abs(lx)<=(q.w||10)/2&&Math.abs(lz)<=(q.d||10)/2&&h>=out.h)out={h,a};}
  return out;
}
/* 파트 이름으로 소품 고르기: 보컬→마이크 스탠드, 드럼→드럼 세트, 건반→키보드, 기타·베이스→기타 */
const propOf=t=>({D:'drum',PERC:'drum',K:'keys',B:'gtr','A.G':'gtr','E.G':'gtr',V:'mic',WL:'mic'})[partKey(String(t||'').trim())]||'';
/* 화면 표기용 파트 영어 약자: D 드럼 · B 베이스 · K 건반 · A.G 어쿠스틱 · E.G 일렉 · V 보컬 (번호는 유지: EG1 → E.G1) */
const partKey=t=>/드럼|drum|^D\d*$/i.test(t)?'D':/퍼커션|perc|카혼|cajon/i.test(t)?'PERC':/베이스|bass|^B\d*$/i.test(t)?'B':/건반|키보드|keys?\b|^K\d*$|piano|피아노|신스|synth|오르간|organ/i.test(t)?'K'
  :/어쿠스틱|통기타|acoustic|^A\.?G/i.test(t)?'A.G':/일렉|electric|^E\.?G|기타|guitar|gtr/i.test(t)?'E.G':/^WL$|인도|worship ?leader/i.test(t)?'WL':/보컬|vocal|싱어|sing|BGV|코러스|찬양|^V\d*$/i.test(t)?'V':'';
const partCode=t=>{t=String(t||'').trim();const k=partKey(t);return k?(k==='WL'?k:k+((t.match(/\d+/)||[''])[0])):t;};
/* 팀 인원 3D: 그 사람 색의 사람 모양 + 파트 소품. 무대 높이 위에 서고, 무대 앞쪽(+z)을 본다 */
/* 3D 사람 모형 크기 배율: 화면을 멀리 볼수록 크게(홀 전체 화면에서도 무대 인원이 보이게), 가까이 보면 1.4배까지 줄어든다.
   목표: 사람 키가 화면에서 약 64px(홀 전체를 봐도 또렷하게). 시야각 38° 기준, 최대 14배 */
const figScale=X=>{const h=X.stage.getBoundingClientRect().height||400;return clamp(64*X.th.dist*2*Math.tan(19*Math.PI/180)/(h*1.76),1.4,14);};
function member3D(p,pl,ps,op){
  const T=THREE,[mx,mz]=toM(pl,p.x,p.y),fl=floorAt(ps,pl,mx,mz),g=new T.Group(),col=new T.Color(mcol(p.m)),D=0x334155,GOLD=0xd4a017;
  const A=(geo,c,x,y,z,rx,rz)=>{const m=new T.Mesh(geo,new T.MeshLambertMaterial({color:c,transparent:op<1,opacity:op}));m.position.set(x,y,z);if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;g.add(m);};
  const k=propOf(p.m.part||''),sit=k==='drum',hip=sit?.5:.88,pants=col.clone().multiplyScalar(.4),SKIN=0xe8bf9a,reach=k&&k!=='drum'?-.7:k==='drum'?-1:0;
  for(const sx of [-.11,.11]){
    if(sit){A(new T.CylinderGeometry(.08,.08,.42,10),pants,sx,hip,.2,Math.PI/2);A(new T.CylinderGeometry(.07,.07,.48,10),pants,sx,.24,.42);}
    else A(new T.CylinderGeometry(.08,.07,.88,10),pants,sx,.44,0);
    A(new T.BoxGeometry(.12,.08,.24),0x111827,sx,.04,sit?.48:.06);
  }
  if(sit)A(new T.CylinderGeometry(.2,.2,.46,14),D,0,.23,-.02);
  A(new T.BoxGeometry(.46,.62,.26),col,0,hip+.33,0);
  for(const sx of [-.3,.3])A(new T.CylinderGeometry(.06,.055,.6,10),col,sx,hip+.34,reach?.16:0,reach);
  A(new T.CylinderGeometry(.06,.06,.1,8),SKIN,0,hip+.69,0);A(new T.SphereGeometry(.14,16,12),SKIN,0,hip+.86,0);
  A(new T.SphereGeometry(.145,16,8,0,Math.PI*2,0,Math.PI/2),0x1f2937,0,hip+.88,-.01);
  if(k==='mic'){A(new T.CylinderGeometry(.18,.18,.03,12),D,0,.015,.5);A(new T.CylinderGeometry(.015,.015,1.5,6),D,0,.75,.5);A(new T.CylinderGeometry(.04,.03,.18,8),D,0,1.5,.42,1.1);}
  if(k==='drum'){A(new T.CylinderGeometry(.28,.28,.4,16),col,0,.3,.75,Math.PI/2);A(new T.CylinderGeometry(.17,.17,.14,14),D,.38,.6,.45);A(new T.CylinderGeometry(.14,.14,.16,14),D,-.12,.8,.55);A(new T.CylinderGeometry(.2,.2,.45,14),D,-.5,.42,.4);
    A(new T.CylinderGeometry(.24,.24,.015,18),GOLD,.6,1.15,.6);A(new T.CylinderGeometry(.26,.26,.015,18),GOLD,-.55,1.25,.75);A(new T.CylinderGeometry(.18,.18,.015,16),GOLD,.55,.95,.15);}
  if(k==='keys'){A(new T.BoxGeometry(1.3,.08,.35),D,0,.95,.5);A(new T.BoxGeometry(1.2,.01,.2),0xf8fafc,0,1,.55);A(new T.BoxGeometry(.05,.9,.3),D,-.55,.45,.5);A(new T.BoxGeometry(.05,.9,.3),D,.55,.45,.5);}
  if(k==='gtr'){A(new T.BoxGeometry(.38,.46,.1),col.clone().multiplyScalar(.6),.05,.95,.3,0,.6);A(new T.BoxGeometry(.75,.06,.04),D,-.38,1.2,.3,0,.6);}
  g.position.set(mx,fl.h,mz);g.rotation.y=-fl.a;g.userData.fig=1;
  return g;
}
function dirty3(X=PV){if(X.raf||!X.G)return;X.raf=requestAnimationFrame(()=>{X.raf=0;draw3(X);});}
function updCam(X=PV){const t=X.th,c=X.G.cam;c.position.set(t.tx+t.dist*Math.sin(t.phi)*Math.sin(t.theta),t.dist*Math.cos(t.phi),t.tz+t.dist*Math.sin(t.phi)*Math.cos(t.theta));c.lookAt(t.tx,0,t.tz);c.updateMatrixWorld();}
function draw3(X=PV){if(!X.G||X.mode!=='3d')return;const f=figScale(X);for(const o of X.G.shapes.children)if(o.userData.fig)o.scale.setScalar(f);updCam(X);X.G.R.render(X.G.scene,X.G.cam);project3D(X);}
function project3D(X=PV){
  if(!X.G||X.mode!=='3d')return;const pl=planOf(X);if(!pl)return;
  const T=THREE,r=X.stage.getBoundingClientRect(),v=new T.Vector3(),ps=pinsOf(X);X.G.cam.updateMatrixWorld();
  for(const el of $$('.mk',X.m3)){
    const p=byId(ps,el.dataset.id);if(!p)continue;
    const [mx,mz]=toM(pl,p.x,p.y),cam=p.kind==='cam'&&byId(S.cams,p.ref),top=p.kind==='area'?(p.h==null?3:p.h)+.8:p.kind==='crew'?2.3:p.kind==='tm'?floorAt(ps,pl,mx,mz).h+2.05*figScale(X):(RIGH[rig0(cam)]||1.5)+.9;
    v.set(mx,top,mz).project(X.G.cam);
    el.style.left=((v.x*.5+.5)*r.width)+'px';el.style.top=((-v.y*.5+.5)*r.height)+'px';el.style.display=v.z>1?'none':'';
  }
}
function ray(cx,cy){
  if(!PV.G||!window.THREE)return null;
  const T=THREE,r=PV.gl.getBoundingClientRect(),c=PV.G.cam;c.updateMatrixWorld();
  const v=new T.Vector3(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1,.5).unproject(c),o=c.position,d=v.sub(o).normalize();
  if(Math.abs(d.y)<1e-5)return null;const t=-o.y/d.y;if(t<0)return null;return {x:o.x+d.x*t,z:o.z+d.z*t};
}
function orbit(dx,dy,pan,X=PV){if(pan){pan3(dx,dy,X);dirty3(X);return;}X.th.theta-=dx*.006;X.th.phi=clamp(X.th.phi-dy*.006,.12,1.5);dirty3(X);}
function pan3(dx,dy,X=PV){const t=X.th,k=t.dist*.0016;t.tx-=(dx*Math.cos(t.theta)+dy*Math.sin(t.theta))*k;t.tz-=(-dx*Math.sin(t.theta)+dy*Math.cos(t.theta))*k;}

/* 콜시트용 보기 전용 3D: 돌리고(드래그) 확대(휠/두 손가락)만 가능 */
const CVS=[];let cvTok=0;
function disposeCV(){cvTok++;for(const X of CVS){try{if(X.ro)X.ro.disconnect();if(X.raf)cancelAnimationFrame(X.raf);if(X.G){X.G.R.dispose();if(X.G.R.forceContextLoss)X.G.R.forceContextLoss();}}catch(e){}}CVS.length=0;}
function bindOrbit(X){
  const el=X.stage,Pm=new Map();let last=null;
  const snap=()=>{if(Pm.size<2)return null;const [a,b]=[...Pm.values()];return {d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};};
  el.addEventListener('pointerdown',e=>{if(e.target.closest('.zoom'))return;try{el.setPointerCapture(e.pointerId);}catch(_){}Pm.set(e.pointerId,{x:e.clientX,y:e.clientY,b:e.button,sh:e.shiftKey});last=snap();});
  el.addEventListener('pointermove',e=>{const p=Pm.get(e.pointerId);if(!p)return;const ox=p.x,oy=p.y;p.x=e.clientX;p.y=e.clientY;
    if(Pm.size===1)orbit(p.x-ox,p.y-oy,p.b===2||p.sh,X);
    else if(Pm.size===2){const c=snap();if(last){X.th.dist=clamp(X.th.dist*last.d/c.d,10,600);pan3(c.mx-last.mx,c.my-last.my,X);dirty3(X);}last=c;}});
  const up=e=>{Pm.delete(e.pointerId);last=snap();};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('wheel',e=>{e.preventDefault();X.th.dist=clamp(X.th.dist/Math.exp(-e.deltaY*.0015),10,600);dirty3(X);},{passive:false});
  el.addEventListener('contextmenu',e=>e.preventDefault());
}
async function mountCV(){
  const tok=cvTok,els=$$('.cv3',$('#main'));if(!els.length)return;
  if(!(await ensureThree())){els.forEach(e=>{e.innerHTML='<div class="empty">3D를 불러오지 못했어요 · 인터넷 확인</div>';});return;}
  if(tok!==cvTok)return;
  for(const el of els){
    const pl=byId(S.plans,el.dataset.plan);if(!pl||!el.isConnected)continue;
    const X={mode:'3d',stage:el,gl:$('canvas',el),m3:$('.m3',el),G:null,th:{theta:.35,phi:.85,dist:190,tx:0,tz:0},buildFor:'',orbitFor:'',plan:pl,nodim:true,pins:()=>[...pinsFor(V.day,V.part,pl.id),...tmPins(pl)]};
    CVS.push(X);
    X.m3.innerHTML=X.pins().map(p=>markHTML(p,{m3:true})).join('');
    bindOrbit(X);build3D(X);
    X.ro=new ResizeObserver(()=>resize3D(X));X.ro.observe(el);
  }
}

/* ═══ 도면 추가 · 편집 ═══ */
function addPlan(){pickImage(async({data,w,h})=>{const pl={id:uid(),name:'도면 '+(S.plans.length+1),w,h,iv:now()};await putImg(pl,data);V.plan=pl.id;saveUI();add('plans',pl);render();});}
function addPlanMenu(){
  if(S.plans.some(p=>p.id==='kintex9')){addPlan();return;}
  const m=modal(`<h3>도면 추가<button class="ib" data-x>${ic('x',16)}</button></h3><div class="btns"><button class="btn" data-up>${ic('image',18)}이미지 올리기</button><button class="btn g" data-kx>KINTEX 9홀</button></div>`);
  $('[data-up]',m.box).onclick=()=>{m.close();addPlan();};
  $('[data-kx]',m.box).onclick=()=>{m.close();delete S.del['kintex9'];ensureKintex();V.plan='kintex9';saveUI();save();render();};
}
function editPlan(){
  const pl=planNow();if(!pl)return;
  const m=modal(`<h3>${esc(pl.name)}<button class="ib" data-x>${ic('x',16)}</button></h3><input class="in" value="${esc(pl.name)}" data-n>
    <div class="btns">${pl.src?'':`<button class="btn g" data-img>${ic('image',18)}교체</button>`}${V.day>1?`<button class="btn g" data-cp>${ic('copy',18)}${V.day-1}일 → ${V.day}일</button>`:''}<button class="btn d" data-del>${ic('trash',18)}</button></div><div class="btns"><button class="btn" data-ok>${ic('check',18)}저장</button></div>`);
  $('[data-ok]',m.box).onclick=()=>{pl.name=$('[data-n]',m.box).value.trim()||pl.name;touch(pl);save();m.close();render();};
  $('[data-del]',m.box).onclick=()=>{m.close();remove('plans',pl.id);V.plan=null;render();};
  const im=$('[data-img]',m.box);if(im)im.onclick=()=>{m.close();pickImage(async({data,w,h})=>{pl.w=w;pl.h=h;pl.iv=now();await putImg(pl,data);touch(pl);save();render();});};
  const cp=$('[data-cp]',m.box);
  if(cp)cp.onclick=()=>{
    for(const x of S.pins.filter(x=>x.plan===pl.id&&x.day===V.day))S.del[x.id]=now();
    S.pins=S.pins.filter(x=>!(x.plan===pl.id&&x.day===V.day));
    const prev=S.cams.filter(c=>c.day===V.day-1),cur=S.cams.filter(c=>c.day===V.day);
    for(const x of S.pins.filter(x=>x.plan===pl.id&&x.day===V.day-1).map(x=>({...x}))){
      if(x.kind==='cam'){const src=byId(prev,x.ref),tgt=src&&cur.find(c=>c.no===src.no&&(c.part||'')===(src.part||''));if(!tgt)continue;x.ref=tgt.id;}
      else if(x.kind==='crew'&&!working(V.day).some(c=>c.id===x.ref))continue;
      x.id=uid();x.day=V.day;touch(x);S.pins.push(x);
    }
    m.close();V.sel=null;save();render();
  };
}

/* ═══ 텍스트 내보내기 ═══ */
const zone=p=>(p.y<.34?'상단':p.y<.67?'중단':'하단')+'-'+(p.x<.34?'좌':p.x<.67?'중앙':'우');
function textOf(tab){
  const n=V.day,L=[],head=t=>{L.push(`${S.proj.title} · ${S.proj.sub} — ${t}`);};
  if(tab==='call'){const d=dayRec(n);head(`CALL SHEET  DAY ${n}/3${V.part?' '+V.part:''}  ${dateStr(n)}`);
    {const wk=working(n),ab=S.crew.filter(c=>!wk.includes(c));L.push(`장소: ${VENUE}`);L.push(`총원 ${S.crew.length} · 현재원 ${wk.length} · 불참 ${ab.length}${ab.length?' ('+ab.map(c=>c.name||'이름 없음').join(', ')+')':''}`);}
    const ses=S.sched.filter(s=>s.day===n&&(!V.part||partOfTime(s.start)===V.part)).sort(byStart);if(ses.length){L.push('','[일정]');for(const s of ses){const t=byId(S.teams,s.team);L.push(`${s.start||'--:--'}${s.end?'~'+s.end:''}  [${s.kind}] ${s.title}${t?' <'+(t.name||'팀')+'>':''}${s.place?' @'+s.place:''}${s.who?' / '+s.who:''}${s.note?' ('+s.note+')':''}`);if(t)L.push('    '+teamMem(t.id).map(m=>`${m.part?m.part+' ':''}${m.name}`).join(' · '));}}
    L.push('','[카메라]');for(const c of camsFor(n,V.part))L.push(`  CAM ${c.no}${c.part&&!V.part?' ('+c.part+')':''}  ${(opOf(c)||{}).name||'담당 미정'}  ${rigTxt(c)}${gearNames(c).length?'  ['+gearNames(c).join(', ')+']':''}${c.shot?'  '+c.shot:''}${c.note?' ('+c.note+')':''}`);
    for(const pl of S.plans){const ps=pinsFor(n,V.part,pl.id);if(!ps.length)continue;L.push('',`[카메라 플랏 · ${pl.name}] (${pl.real?'미터 기준':'도면 화면 기준'})`);if(pl.real)L.push(`  기준: 도면 좌상단 0m · 가로 ${pl.real.w}m × 세로 ${pl.real.h}m · 높이 ${pl.real.H}m`);for(const p of ps){if(p.kind==='cam'){const c=byId(S.cams,p.ref);if(c)L.push(`  CAM ${c.no} ${rigTxt(c)}${c.shot?' · '+c.shot:''}  ${opOf(c)?opOf(c).name:'담당 미정'}${gearNames(c).length?'  ['+gearNames(c).join(', ')+']':''}  ${where(p)}`);}else if(p.kind==='area')L.push(`  [구역] ${p.name||'구역'} ${p.w||10}×${p.d||10}m 높이 ${p.h==null?3:p.h}m  ${where(p)}`);else{const c=crewOf(p.ref);if(c)L.push(`  ${c.name}  ${where(p)}`);}}}
    if(d.notes)L.push('','[공지]',d.notes);}
  if(tab==='sched'){head(`RUN OF SHOW  DAY ${n}/3${V.part?' '+V.part:''}  ${dateStr(n)}`);for(const s of S.sched.filter(s=>s.day===n&&(!V.part||partOfTime(s.start)===V.part)).sort(byStart))L.push([s.start,s.end,s.kind,s.title,s.place,s.who,s.note].join('\t'));}
  if(tab==='crew'){head('CREW LIST');L.push(['#','이름','번호','장비',DAYN.map(dayLabel).join(' '),'비고'].join('\t'));S.crew.forEach((c,i)=>L.push([i+1,c.name,c.phone,c.wear,DAYN.map(n=>(c.days||[]).includes(n)?'O':'-').join(' '),c.note].join('\t')));}
  if(tab==='teams'){head('TEAMS');for(const t of S.teams){L.push('',`[${t.name||'팀'}]`);for(const m of teamMem(t.id))L.push([MCOL[m.col]?MCOL[m.col][0]:'',m.part,m.name].join('\t'));}}
  if(tab==='gear'){head('EQUIPMENT LIST');for(const cat of [...new Set([...CATS,...S.gear.map(g=>g.cat)])]){const l=S.gear.filter(g=>g.cat===cat);if(!l.length)continue;L.push(`[${cat}]`);for(const g of l)L.push([g.name,'×'+(g.qty==null?1:g.qty),STAT[g.status||'ok'],(ownerOf(g)||{}).name||'',g.note].join('\t'));}}
  if(tab==='cams'){head(`CAMERA LIST  DAY ${n}/3${V.part?' '+V.part:''}`);for(const c of camsFor(n,V.part))L.push([`CAM ${c.no}`,c.part||'공통',(opOf(c)||{}).name||'',rigTxt(c),gearNames(c).join(' + '),c.shot,c.note].join('\t'));}
  if(tab==='plot'){head(`CAMERA PLOT  DAY ${n}/3${V.part?' '+V.part:''} (도면 화면 기준)`);for(const p of pinsNow()){if(p.kind==='cam'){const c=byId(S.cams,p.ref);if(c)L.push(`CAM ${c.no}\t${rigTxt(c)}\t${(opOf(c)||{}).name||''}\t${gearNames(c).join(' + ')}\t${where(p)}`);}else if(p.kind==='area')L.push(`구역\t${p.name||'구역'}\t${p.w||10}×${p.d||10}m\t높이 ${p.h==null?3:p.h}m\t${where(p)}`);else{const c=crewOf(p.ref);if(c)L.push(`${c.name}\t${where(p)}`);}}}
  return L.join('\n');
}

/* ═══ 설정 · 예시 ═══ */
function settings(){
  const hasDemo=S.crew.some(c=>String(c.id).startsWith('demo-'));
  const m=modal(`<h3>설정<button class="ib" data-x>${ic('x',16)}</button></h3>
    <label class="fld"><span>프로젝트</span><input class="in" value="${esc(S.proj.title)}" data-t></label>
    <label class="fld"><span>부제</span><input class="in" value="${esc(S.proj.sub)}" data-s></label>
    <label class="fld"><span>DAY 1 날짜</span><input class="in" type="date" value="${esc(S.proj.date1||'')}" data-d></label>
    <div class="btns"><button class="btn g" data-ex>${ic('dl',18)}백업</button><button class="btn g" data-im>${ic('ul',18)}복원</button><button class="btn g" data-sync>${ic('rot',18)}동기화</button></div>
    <div class="btns"><button class="btn g" data-demo>${ic('wand',18)}예시 불러오기</button>${hasDemo?`<button class="btn d" data-undemo>${ic('trash',18)}예시 삭제</button>`:''}</div>
    <div class="btns"><button class="btn" data-ok>${ic('check',18)}저장</button></div>`);
  $('[data-ok]',m.box).onclick=()=>{S.proj.title=$('[data-t]',m.box).value.trim()||'ISAIAH 61';S.proj.sub=$('[data-s]',m.box).value.trim();S.proj.date1=$('[data-d]',m.box).value;S.proj.u=now();const t=todayN();if(t)V.day=t;m.close();save();render();};
  $('[data-ex]',m.box).onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='isaiah61-backup.json';a.click();};
  $('[data-im]',m.box).onclick=()=>{const f=document.createElement('input');f.type='file';f.accept='.json';f.onchange=async()=>{try{mergeIn(JSON.parse(await f.files[0].text()));m.close();save();render();}catch(e){console.warn(e);}};f.click();};
  $('[data-sync]',m.box).onclick=()=>{m.close();pull();};
  $('[data-demo]',m.box).onclick=()=>{m.close();loadDemo();};
  const ud=$('[data-undemo]',m.box);if(ud)ud.onclick=()=>{m.close();removeDemo();};
}
async function loadDemo(){
  if(S.crew.some(c=>String(c.id).startsWith('demo-')))return;
  ensureKintex();
  const A=(col,o)=>{const it=touch({...o});S[col].push(it);return it;};
  const P=[['김도윤','무전기 · 인컴'],['한서진','무전기 · 인컴'],['서민아','무전기 · 인컴'],['이서준','FX6 · 트라이포드'],['박민재','A7S III · 트라이포드'],['최유진','RS3 Pro 짐벌'],['정하린','지미집 6m'],['한지우','FX6 · 핸드헬드 리그',[1,3]],['오세린','다나돌리 세트',[2,3]],['강태오','무전기 · 인컴'],['윤서아','무전기 · CCU'],['장도현','레코더'],['임도현','무전기 · 무선 마이크'],['송지안','노트북 · CG'],['문가온','무전기 · 인컴']];
  const crew={};
  P.forEach((p,i)=>{crew[p[0]]=A('crew',{id:'demo-c'+i,name:p[0],phone:'010-0000-'+String(1000+i),wear:p[1],days:p[2]||[1,2,3],note:''});});
  const G=[['카메라','FX6',3,'ok','이서준'],['카메라','A7S III',2,'ok','박민재'],['렌즈','24-70mm f2.8',3,'ok'],['렌즈','70-200mm f2.8',2,'ok'],['짐벌','RS3 Pro',2,'check','최유진'],['트라이포드·리그','트라이포드 (판 헤드)',4,'ok'],['트라이포드·리그','지미집 6m',1,'ok','정하린'],['트라이포드·리그','다나돌리 세트',1,'check','오세린'],
    ['모니터','17" 모니터',2,'ok','윤서아'],['스위칭','ATEM Mini Extreme',1,'ok','강태오'],['음향','무선 마이크 세트',8,'miss','임도현'],['통신','인컴 벨트팩',12,'ok','서민아'],['통신','무전기',14,'ok'],['배터리','V-마운트 배터리',16,'miss'],['케이블','SDI 50m',6,'ok'],['케이블','SDI 25m',8,'ok']];
  G.forEach((g,i)=>A('gear',{id:'demo-g'+i,cat:g[0],name:g[1],qty:g[2],status:g[3],owner:g[4]?crew[g[4]].id:'',note:''}));
  const SC=[['06:30','08:00','셋업','로드인 · 카메라/케이블 셋업','메인홀','전 부서',''],['08:00','09:30','리허설','런스루 · 카메라 블로킹','메인홀','카메라·스위칭','콜 용어 확인'],['10:00','11:30','본행사','오프닝 워십','메인홀','전 부서','와이드 → 인도자 클로즈업'],['11:30','13:00','식사','점심 · 배터리 교체','로비','',''],['13:00','14:30','본행사','말씀 1','메인홀','전 부서','70% 미디엄·클로즈'],['19:00','21:00','본행사','저녁 집회','메인홀','전 부서',''],['21:00','22:30','철수','장비 철수','메인홀','카메라·스테이지','']];
  for(const d of DAYN)SC.forEach((s,i)=>A('sched',{id:`demo-s${d}${i}`,day:d,start:s[0],end:s[1],kind:s[2],title:d===1?s[3]:s[3].replace('오프닝 워십','세션 '+d).replace('말씀 1','말씀 '+d),place:s[4],who:s[5],note:s[6]}));
  const CM=[[1,'트라이포드','후방 중앙 (FOH)','','이서준','와이드',49.5,100,0,['demo-g0','demo-g2','demo-g5']],[2,'트라이포드','무대 좌측 전방','','박민재','미디엄',75,28,305,['demo-g1','demo-g3','demo-g5']],[3,'짐벌','객석 통로','','최유진','인서트',40,65,5,['demo-g0','demo-g2','demo-g4']],[4,'지미집','무대 우측 전방','','정하린','와이드',20,26,62,['demo-g1','demo-g2','demo-g6']]];
  const ex={1:[[5,'핸드헬드','무대 앞 이동','','한지우','군중',45,30,0,['demo-g0','demo-g2']],[6,'핸드헬드','객석 통로','','박민재','군중',58,48,0,['demo-g1','demo-g2'],'저녁']],2:[[5,'다나돌리','무대 앞 레일','','오세린','클로즈업',49.5,24,0,['demo-g1','demo-g2','demo-g7']]],3:[[5,['핸드헬드','짐벌'],'무대 앞 이동','','한지우','군중',40,30,0,['demo-g0','demo-g2','demo-g4']],[6,'다나돌리','무대 앞 레일','','오세린','클로즈업',58,24,0,['demo-g1','demo-g2','demo-g7']]]};
  const K=(xm,ym)=>fromM(KINTEX,xm-49.5,ym-66);
  for(const d of DAYN){
    const [sx,sy]=K(49.5,9),[fx,fy]=K(49.5,103);A('pins',{id:'demo-stage'+d,plan:'kintex9',day:d,kind:'area',ref:'demo-a'+d+'0',x:sx,y:sy,rot:0,name:'무대',w:24,d:10,h:1.2,col:0});A('pins',{id:'demo-foh'+d,plan:'kintex9',day:d,kind:'area',ref:'demo-a'+d+'1',x:fx,y:fy,rot:0,name:'FOH',w:8,d:3,h:1.5,col:6});
    [...CM,...ex[d]].forEach(c=>{
      const cam=A('cams',{id:`demo-m${d}${c[0]}`,day:d,part:c[10]||'',no:c[0],rigs:[].concat(c[1]),rig:[].concat(c[1])[0],gear:c[9]||[],pos:c[2],op:crew[c[4]].id,shot:c[5],note:''}),[fx,fy]=K(c[6],c[7]);
      A('pins',{id:'demo-p'+cam.id,plan:'kintex9',day:d,part:c[10]||'',kind:'cam',ref:cam.id,x:fx,y:fy,rot:c[8]});
    });
  }
  [['강태오',60,114],['한서진',38,114],['윤서아',49.5,114],['김도윤',27,114],['임도현',49.5,106]].forEach(([nm,xm,ym],i)=>{const [fx,fy]=K(xm,ym);for(const d of DAYN)A('pins',{id:`demo-q${d}${i}`,plan:'kintex9',day:d,kind:'crew',ref:crew[nm].id,x:fx,y:fy,rot:0});});
  V.plan='kintex9';V.tab='call';V.day=1;saveUI();save();render();
}
function removeDemo(){
  const isD=it=>String(it.id).startsWith('demo-');
  for(const c of COLS){for(const it of S[c])if(isD(it)||it.plan==='demo-plan')S.del[it.id]=now();S[c]=S[c].filter(it=>!(isD(it)||it.plan==='demo-plan'));}
  if(V.plan==='demo-plan')V.plan=null;V.sel=null;save();render();
}

/* ═══ 렌더 · 이벤트 ═══ */
const VIEWS={call:vCall,sched:vSched,crew:vCrew,teams:vTeams,gear:vGear,cams:vCams};
function render(){
  if(drag){pendR=true;return;}
  const tab=TABS.find(t=>t.k===V.tab)||TABS[0],showDays=!['crew','gear','teams'].includes(V.tab),today=todayN();
  $('#bar').innerHTML=(showDays?`<div class="days">${DAYN.map(n=>{const d=dayDate(n);return `<button data-day="${n}" class="${V.day===n?'on':''}">DAY ${n}<small>${d?dayLabel(n)+(today===n?' · 오늘':''):'&nbsp;'}</small></button>`;}).join('')}</div>${['call','sched','cams','plot'].includes(V.tab)?`<div class="days parts">${[['','전체'],...PARTS.map(p=>[p,p])].map(([v,l])=>`<button data-part="${v}" class="${V.part===v?'on':''}">${l}</button>`).join('')}</div>`:''}`:`<b style="font-size:15px">${tab.n}</b>`)+
    `<span class="sp"></span><button class="ib" data-bar="theme" aria-label="${effDark()?'밝게':'어둡게'}">${ic(effDark()?'sun':'moon',16)}</button><button class="ib" data-bar="undo" aria-label="실행 취소"${H.u.length?'':' disabled'}>${ic('undo',16)}</button><button class="ib" data-bar="redo" aria-label="다시 실행"${H.r.length?'':' disabled'}>${ic('redo',16)}</button><button class="ib" data-bar="copy" aria-label="텍스트 복사">${ic('copy',16)}<span class="tx">복사</span></button><button class="ib" data-bar="print" aria-label="인쇄">${ic('print',16)}</button><button class="ib" data-bar="cog" aria-label="설정">${ic('cog',16)}</button>`;
  $('#tabs').innerHTML=TABS.map(t=>`<button class="${t.k===V.tab?'on':''}" data-tab="${t.k}">${ic(t.i,22)}${t.n}</button>`).join('');
  const main=$('#main');
  disposeCV();
  if(V.tab==='plot'){
    main.className='fill';
    if(main.firstChild!==PV.el){main.replaceChildren(PV.el);requestAnimationFrame(()=>fit());}
    updatePV();
  }else{
    const st=main.scrollTop,ae=document.activeElement,keep=ae&&ae.dataset&&ae.dataset.id&&{id:ae.dataset.id,k:ae.dataset.k};
    main.className='';main.innerHTML=VIEWS[V.tab]();main.scrollTop=st;
    if(V.tab==='call'&&V.cs3)mountCV();
    if(V.focus){const el=$(`[data-id="${V.focus}"][data-k="${V.focusK||'name'}"]`,main);if(el)el.focus();V.focus=null;}
  }
}
function addRow(col,b){
  let it;
  if(col==='crew')it=add('crew',{name:'',phone:'',wear:'',days:[1,2,3],note:''});
  if(col==='teams')it=add('teams',{name:'',done:false});
  if(col==='tmem')it=add('tmem',{team:b.dataset.team,col:teamMem(b.dataset.team).length%MCOL.length,part:'',name:''});
  if(col==='gear'){V.lastCat=b.dataset.cat;it=add('gear',{cat:b.dataset.cat,name:'',qty:1,owner:'',status:'ok',note:''});}
  if(col==='sched')it=add('sched',{day:V.day,start:V.part?PART0[V.part]:'',end:'',kind:'본행사',title:'',place:'',who:'',note:''});
  if(col==='cams'){const no=Math.max(0,...S.cams.filter(c=>c.day===V.day).map(c=>c.no||0))+1;it=add('cams',{day:V.day,part:V.part,no,rigs:['트라이포드'],rig:'트라이포드',gear:[],pos:'',op:'',shot:'',note:''});}
  V.focus=it.id;V.focusK=col==='tmem'?'part':col==='crew'||col==='teams'?'name':col==='sched'?'title':col==='cams'?'op':'name';render();
}
function boot(){
  buildPV();
  applyTheme(document.documentElement.dataset.theme||'');
  if(ensureKintex())persist();
  DAYN.forEach(dayRec);H.c=snap();
  const main=$('#main');
  $('#bar').addEventListener('click',e=>{
    const d=e.target.closest('[data-day]');if(d){V.day=Number(d.dataset.day);V.sel=null;V.armed=null;saveUI();render();return;}
    const pt=e.target.closest('[data-part]');if(pt){V.part=pt.dataset.part;V.sel=null;V.armed=null;saveUI();render();return;}
    const b=e.target.closest('[data-bar]');if(!b)return;
    if(b.dataset.bar==='theme'){applyTheme(effDark()?'light':'dark');render();return;}
    if(b.dataset.bar==='undo')undoRedo(false);
    if(b.dataset.bar==='redo')undoRedo(true);
    if(b.dataset.bar==='copy')copyText(textOf(V.tab));
    if(b.dataset.bar==='print')print();
    if(b.dataset.bar==='cog')settings();
  });
  $('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){V.tab=b.dataset.tab;V.sel=null;V.armed=null;saveUI();render();}});
  $('#syncBtn').addEventListener('click',settings);
  main.addEventListener('click',e=>{
    if(V.tab==='plot')return;
    const c3=e.target.closest('[data-cs3]');if(c3){V.cs3=c3.dataset.cs3==='1';saveUI();render();return;}
    const cz=e.target.closest('[data-cvz]');
    if(cz){const X=CVS.find(x=>x.stage===cz.closest('.cv3'));if(X){if(cz.dataset.cvz==='fit')resetOrbit(X);else X.th.dist=clamp(X.th.dist/(cz.dataset.cvz==='in'?1.3:1/1.3),10,600);dirty3(X);}return;}
    const st=e.target.closest('[data-st]');if(st){V.team=st.dataset.st||null;render();return;}
    const tp=e.target.closest('[data-tp]');if(tp){const m=byId(S.tmem,tp.dataset.tp);if(m)pickImage(async({data})=>{const iv=now();await putK('tm-'+m.id+'@'+iv,data);m.iv=iv;touch(m);save();render();},400);return;}
    const mk=e.target.closest('[data-mk]');
    if(mk){const t=byId(S.teams,mk.dataset.mk);if(!t)return;const ms=teamMem(t.id);if(!ms.length){toast('인원을 먼저 추가하세요');return;}
      const pl=planNow();t.done=true;touch(t);V.team=t.id;if(pl)autoPlace(t,pl,true);save();
      if(!pl){render();toast('팀 생성 · 플랏에 도면을 올리면 무대에 배치돼요',2400);return;}
      V.tab='plot';saveUI();render();toast(`${t.name||'팀'} · 무대에 ${ms.length}명 배치 — 끌어서 위치 조정`,2600);return;}
    const ms=e.target.closest('[data-ms]');if(ms){pickMulti(ms.dataset.ms,byId(S.cams,ms.dataset.id));return;}
    const ad=e.target.closest('[data-add]');if(ad){addRow(ad.dataset.add,ad);return;}
    const dl=e.target.closest('[data-del]');
    if(dl){
      if(!dl.classList.contains('arm')){dl.classList.add('arm');dl.textContent='삭제';setTimeout(()=>{if(dl.isConnected){dl.classList.remove('arm');dl.innerHTML=ic('x',16);}},2200);return;}
      remove(dl.dataset.del,dl.dataset.id);render();return;
    }
    const tg=e.target.closest('[data-tg]');
    if(tg){const it=byId(S[tg.dataset.tg],tg.dataset.id),n=Number(tg.dataset.d);const was=(it.days||[]).includes(n);it.days=was?it.days.filter(x=>x!==n):[...(it.days||[]),n].sort();touch(it);save();render();
      if(tg.dataset.tg==='crew'){const nc=S.cams.filter(c=>c.day===n&&c.op===it.id).length,np=S.pins.filter(p=>p.day===n&&p.kind==='crew'&&p.ref===it.id).length;
        if(nc||np)toast(`${it.name||'이름 없음'} · ${dayLabel(n)} ${was?'제외':'다시 포함'} — 카메라 담당 ${nc} · 배치도 ${np} ${was?'숨김':'복원'}`,2600);}
      return;}
    const cp2=e.target.closest('[data-copypart]');
    if(cp2&&V.part){
      const prev=PARTS[PARTS.indexOf(V.part)-1],src=S.cams.filter(c=>c.day===V.day&&c.part===prev);
      if(!src.length){toast(`${prev} 전용 카메라가 없어요 (공통은 이미 함께 보여요)`,2400);return;}
      for(const c of src){const nc={...c,id:uid(),part:V.part};touch(nc);S.cams.push(nc);
        for(const p of S.pins.filter(p=>p.kind==='cam'&&p.ref===c.id&&(p.part===prev||!p.part))){const np={...p,id:uid(),ref:nc.id,part:V.part,of:undefined};touch(np);S.pins.push(np);}}
      save();render();toast(`${prev} → ${V.part} 카메라 ${src.length}대 복사`);return;
    }
    const cd=e.target.closest('[data-copyday]');
    if(cd&&V.day>1){
      for(const c of S.cams.filter(c=>c.day===V.day)){S.del[c.id]=now();}
      S.cams=S.cams.filter(c=>c.day!==V.day);
      for(const c of S.cams.filter(c=>c.day===V.day-1).map(c=>({...c}))){c.id=uid();c.day=V.day;if(c.op&&!working(V.day).some(w=>w.id===c.op))c.op='';touch(c);S.cams.push(c);}
      save();render();
    }
  });
  main.addEventListener('change',e=>{
    const t=e.target,c=t.dataset.c;if(!c)return;
    const it=byId(S[c],t.dataset.id);if(!it)return;
    let v=t.value;if(t.type==='number')v=Number(v)||0;
    it[t.dataset.k]=v;touch(it);save();
    if(t.dataset.re)render();
  });
  addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if((e.metaKey||e.ctrlKey)&&k==='z'){e.preventDefault();undoRedo(e.shiftKey);return;}
    if(e.ctrlKey&&k==='y'){e.preventDefault();undoRedo(true);return;}
    if(e.key==='Escape'&&V.tab==='plot'&&(V.sel||V.armed)){V.sel=null;V.armed=null;render();}});
  addEventListener('resize',()=>{if(V.tab==='plot')fit();});
  setInterval(()=>{const e=document.getElementById('clk');if(e)e.textContent=clockText();},1000);
  render();initSync();
  window.__i61={S:()=>S,V,render,putImg,PV};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
