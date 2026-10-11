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
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>', redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  print:'<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  check:'<path d="M5 12.500l4.500 4.500L19 7.500"/>', dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', ul:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.800"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', rot:'<path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5"/>',
  fov:'<path d="M12 20L4 6M12 20l8-14"/><path d="M4 6a12 12 0 0 1 16 0"/>', dist:'<path d="M4 12h16M4 8v8M20 8v8"/>',
  fit:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', wand:'<path d="M5 19L16 8"/><path d="M14 4l2 2M18 8l2 2M17 2v3M20 5h-3"/>'
};
const ic=(n,s=20)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24">${IC[n]||''}</svg>`;

/* ═══ 상수 ═══ */
const DEPTS=['연출·제작','카메라','스위칭·영상','음향','조명','무대·스테이지','그래픽·CG','기타'];
const POS={'연출·제작':['프로듀서','디렉터','조연출(AD)','스크립터','제작부'],'카메라':['카메라 오퍼레이터','짐벌 오퍼레이터','지미집 오퍼레이터','핸드헬드','다나돌리 오퍼레이터','카메라 어시'],
  '스위칭·영상':['TD','스위처','셰이더(CCU)','레코더','송출'],'음향':['FOH 엔지니어','모니터 엔지니어','마이크 담당'],'조명':['조명 디렉터','조명 오퍼레이터'],
  '무대·스테이지':['스테이지 매니저','스테이지 크루'],'그래픽·CG':['CG 오퍼레이터','텔레프롬프터'],'기타':['운전','케이터링','스태프']};
const CATS=['카메라','렌즈','짐벌','삼각대·리그','모니터','스위칭','음향','통신','조명','전원','케이블','기타'];
const RIGS=['삼각대','짐벌','핸드헬드','지미집','다나돌리','기타'];
const RIGC={삼각대:'#2563eb',짐벌:'#8b5cf6',핸드헬드:'#f97316',지미집:'#e11d48',다나돌리:'#059669',기타:'#64748b'};
const RIGF={삼각대:40,짐벌:65,핸드헬드:70,지미집:45,다나돌리:45,기타:50};
const FILTERS=[['핸드헬드','핸드헬드'],['지미집','지미집'],['짐벌','짐벌'],['삼각대','트라이포드'],['다나돌리','다나돌리']];
const SHOTS=['','와이드','미디엄','클로즈업','군중','인서트'];
const KINDS=['콜','셋업','리허설','본행사','식사','철수'];
const STAT={ok:'준비',check:'점검',miss:'부족'};
const TABS=[{k:'call',n:'콜시트',i:'call'},{k:'sched',n:'일정',i:'sched'},{k:'crew',n:'크루',i:'crew'},{k:'gear',n:'장비',i:'gear'},{k:'cams',n:'카메라',i:'cams'},{k:'plot',n:'플랏',i:'plot'}];
const DAYN=[1,2,3];

/* ═══ 데이터 ═══ */
const KEY='isaiah61.doc.v1',UIK='isaiah61.doc.ui';
const COLS=['crew','gear','sched','cams','plans','pins','days'];
const fresh=()=>({schema:2,proj:{title:'ISAIAH 61',sub:'Solidoegloria',date1:'',u:0},crew:[],gear:[],sched:[],cams:[],plans:[],pins:[],days:[],del:{}});
let S=null;
try{S=JSON.parse(localStorage.getItem(KEY));}catch(e){}
if(!S||S.schema!==2)S=fresh();
for(const c of COLS)S[c]=S[c]||[];S.del=S.del||{};S.proj=S.proj||fresh().proj;
let V={tab:'call',day:1,plan:null,lastCat:'카메라'};
try{Object.assign(V,JSON.parse(localStorage.getItem(UIK))||{});}catch(e){}
V.sel=null;V.armed=null;V.filter='';
const saveUI=()=>{try{localStorage.setItem(UIK,JSON.stringify({tab:V.tab,day:V.day,plan:V.plan,lastCat:V.lastCat}));}catch(e){}};
const dayRec=n=>{let d=S.days.find(x=>x.n===n);if(!d){d={id:'day'+n,n,loc:'',general:'',weather:'',safety:'',notes:'',u:0};S.days.push(d);}return d;};
const crewOf=id=>byId(S.crew,id);
const dayDate=n=>{if(!S.proj.date1)return null;const d=new Date(S.proj.date1+'T00:00:00');if(isNaN(d))return null;d.setDate(d.getDate()+n-1);return d;};
const dateStr=n=>{const d=dayDate(n);return d?d.toLocaleDateString('ko-KR',{year:'numeric',month:'numeric',day:'numeric',weekday:'short'}):'';};
const todayN=()=>{const d=S.proj.date1&&new Date(S.proj.date1+'T00:00:00');if(!d||isNaN(d))return 0;const t=new Date();t.setHours(0,0,0,0);const n=Math.round((t-d)/864e5)+1;return n>=1&&n<=3?n:0;};
if(todayN())V.day=todayN();
const working=n=>S.crew.filter(c=>(c.days||DAYN).includes(n));

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
function add(col,o){const it=touch({id:uid(),...o});S[col].push(it);save();return it;}
function remove(col,id){
  S[col]=S[col].filter(x=>x.id!==id);S.del[id]=now();
  const kill=f=>{for(const p of S.pins.filter(f))S.del[p.id]=now();S.pins=S.pins.filter(p=>!f(p));};
  if(col==='crew'){kill(p=>p.kind==='crew'&&p.ref===id);for(const c of S.cams)if(c.op===id){c.op='';touch(c);}for(const g of S.gear)if(g.owner===id){g.owner='';touch(g);}}
  if(col==='cams')kill(p=>p.kind==='cam'&&p.ref===id);
  if(col==='plans')kill(p=>p.plan===id);
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
  const k=ikey(pl);
  if(IMG[k])return IMG[k];
  if(!PEND[k]){PEND[k]=(async()=>{
    let d=await idb.get(k);
    if(!d&&DB){try{const r=await DB.from(SB.table).select('content').eq('id',SB.row+'-img-'+k).maybeSingle();d=r.data&&r.data.content&&r.data.content.d;if(d)idb.set(k,d);}catch(e){}}
    if(d){IMG[k]=d;render();}else setTimeout(()=>{delete PEND[k];},4000);
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
function pickImage(cb){const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=async()=>{if(f.files[0]){try{cb(await shrink(f.files[0]));}catch(e){console.warn(e);}}};f.click();}

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
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1500);}
async function copyText(t){
  try{await navigator.clipboard.writeText(t);}catch(_){const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove();}
  toast('복사됨');
}

/* ═══ 표 도우미 ═══ */
const inp=(c,it,k,o={})=>`<input data-c="${c}" data-id="${it.id}" data-k="${k}" type="${o.t||'text'}" value="${esc(it[k]==null?'':it[k])}"${o.ph?` placeholder="${esc(o.ph)}"`:''}${o.list?` list="${o.list}"`:''}${o.re?' data-re="1"':''}${o.t==='tel'?' inputmode="tel"':''}${o.t==='number'?' inputmode="numeric" min="0"':''}>`;
const sel=(c,it,k,opts,o={})=>`<select data-c="${c}" data-id="${it.id}" data-k="${k}"${o.re?' data-re="1"':''}>${opts.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}"${String(it[k]==null?'':it[k])===String(v)?' selected':''}>${esc(l)}</option>`;}).join('')}</select>`;
const xb=(c,id)=>`<td class="x noprint"><button data-del="${c}" data-id="${id}" aria-label="삭제">${ic('x',16)}</button></td>`;
const byStart=(a,b)=>(String(a.start||'99:99')).localeCompare(String(b.start||'99:99'));
const crewOpts=n=>[['','—'],...working(n).map(c=>[c.id,`${c.name||'(이름 없음)'}${c.pos?' · '+c.pos:''}`])];
const dd=(c,it)=>`<td><div class="dd">${DAYN.map(n=>`<button data-tg="${c}" data-id="${it.id}" data-d="${n}" class="${(it.days||[]).includes(n)?'on':''}">${n}</button>`).join('')}</div></td>`;

/* ═══ 콜시트 ═══ */
function vCall(){
  const n=V.day,d=dayRec(n),ses=S.sched.filter(s=>s.day===n).sort(byStart),crew=working(n);
  const kf=(k,l,t,cls)=>`<label${cls?` class="${cls}"`:''}><span>${l}</span><input data-c="days" data-id="${d.id}" data-k="${k}" type="${t||'text'}" value="${esc(d[k])}"></label>`;
  const keys=S.crew.filter(c=>c.dept==='연출·제작'&&(c.days||DAYN).includes(n)&&c.phone).slice(0,6);
  const grp=DEPTS.map(dep=>({dep,list:crew.filter(c=>c.dept===dep)})).filter(g=>g.list.length);
  return `<div class="doc">
  <div class="dh"><div><h1>CALL SHEET</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>DAY ${n} / 3</b>${esc(dateStr(n))}</div></div>
  <div class="kv">${kf('loc','장소')}${kf('general','집합 (General Call)','time')}${kf('weather','날씨')}${kf('safety','안전 · 주차 · 병원','text','wide')}</div>
  ${keys.length?`<div class="sec">주요 연락처</div><div class="tw"><table class="t" style="min-width:420px"><tbody>${keys.map(c=>`<tr><td class="ro"><b>${esc(c.pos)}</b></td><td class="ro">${esc(c.name)}</td><td class="ro"><a href="tel:${esc(c.phone)}" style="color:inherit">${esc(c.phone)}</a></td></tr>`).join('')}</tbody></table></div>`:''}
  <div class="sec">일정</div>
  ${ses.length?`<div class="tw"><table class="t"><thead><tr><th>시간</th><th>구분</th><th>항목</th><th>장소</th><th>담당</th><th>비고</th></tr></thead><tbody>${ses.map(s=>`<tr><td class="ro" style="white-space:nowrap;font-variant-numeric:tabular-nums">${esc(s.start)}${s.end?'–'+esc(s.end):''}</td><td class="ro">${esc(s.kind)}</td><td class="ro"><b>${esc(s.title)}</b></td><td class="ro">${esc(s.place)}</td><td class="ro">${esc(s.who)}</td><td class="ro">${esc(s.note)}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">일정 탭에서 입력</div>`}
  <div class="sec">크루 콜 · ${crew.length}명</div>
  ${grp.length?`<div class="tw"><table class="t"><thead><tr><th>포지션</th><th>이름</th><th>연락처</th><th>콜</th><th>착용장비</th><th>비고</th></tr></thead><tbody>${grp.map(g=>`<tr class="grp"><td colspan="6">${esc(g.dep)}</td></tr>`+g.list.map(c=>`<tr><td class="ro">${esc(c.pos)}</td><td class="ro"><b>${esc(c.name)}</b></td><td class="ro">${c.phone?`<a href="tel:${esc(c.phone)}" style="color:inherit">${esc(c.phone)}</a>`:''}</td><td class="ro" style="white-space:nowrap;font-variant-numeric:tabular-nums">${esc(c.call||d.general)}</td><td class="ro">${esc(c.wear)}</td><td class="ro">${esc(c.note)}</td></tr>`).join('')).join('')}</tbody></table></div>`:`<div class="empty">크루 탭에서 입력</div>`}
  ${miniPlots(n)}
  <div class="sec">공지</div><div class="kv"><label class="wide"><textarea rows="4" data-c="days" data-id="${d.id}" data-k="notes">${esc(d.notes)}</textarea></label></div>
  </div>`;
}
function miniPlots(n){
  const out=S.plans.map(pl=>{
    const ps=S.pins.filter(p=>p.plan===pl.id&&p.day===n);if(!ps.length)return '';
    const data=imgOf(pl);
    return `<div class="sec">카메라 플랏 · ${esc(pl.name)}</div><div class="mini" style="aspect-ratio:${pl.w}/${pl.h}">${data?`<img src="${data}" style="position:absolute;inset:0;width:100%;height:100%">`:''}<svg viewBox="0 0 ${pl.w} ${pl.h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">${ps.filter(p=>p.kind==='area').map(p=>areaSVG(p,pl)).join('')}${ps.filter(p=>p.kind==='cam').map(p=>coneSVG(p,pl)).join('')}</svg><div class="marks">${ps.map(p=>markHTML(p)).join('')}</div></div>`;
  }).join('');
  return out;
}

/* ═══ 일정 ═══ */
function vSched(){
  const n=V.day,list=S.sched.filter(s=>s.day===n).sort(byStart),live=todayN()===n,t=new Date(),hm=String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
  const rows=list.map(s=>`<tr class="${live&&s.start<=hm&&hm<s.end?'now':''}"><td style="width:92px">${inp('sched',s,'start',{t:'time',re:1})}</td><td style="width:92px">${inp('sched',s,'end',{t:'time'})}</td><td style="width:92px">${sel('sched',s,'kind',KINDS)}</td><td style="min-width:180px">${inp('sched',s,'title',{ph:'항목'})}</td><td style="min-width:100px">${inp('sched',s,'place',{ph:'장소'})}</td><td style="min-width:140px">${inp('sched',s,'who',{ph:'담당'})}</td><td style="min-width:140px">${inp('sched',s,'note',{ph:'비고'})}</td>${xb('sched',s.id)}</tr>`).join('');
  return `<div class="doc"><div class="dh"><div><h1>RUN OF SHOW</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>DAY ${n} / 3</b>${esc(dateStr(n))}</div></div>
  <div class="tw"><table class="t" style="min-width:820px"><thead><tr><th>시작</th><th>끝</th><th>구분</th><th>항목</th><th>장소</th><th>담당</th><th>비고</th><th class="noprint"></th></tr></thead><tbody>${rows||`<tr><td colspan="8" class="empty">행 추가로 시작</td></tr>`}</tbody></table></div>
  <div class="addrow noprint"><button class="ib" data-add="sched">${ic('plus',16)}행 추가</button></div></div>`;
}

/* ═══ 크루 ═══ */
function vCrew(){
  const groups=DEPTS.map(dep=>({dep,list:S.crew.filter(c=>c.dept===dep)}));
  const other=S.crew.filter(c=>!DEPTS.includes(c.dept));if(other.length)groups.push({dep:'기타',list:other});
  const dl=DEPTS.map((dep,i)=>`<datalist id="pos${i}">${(POS[dep]||[]).map(p=>`<option value="${esc(p)}">`).join('')}</datalist>`).join('');
  const body=groups.filter(g=>g.list.length).map(g=>`<tr class="grp"><td colspan="10"><div class="gc">${esc(g.dep)} · ${g.list.length}</div></td></tr>`+g.list.map(c=>{const di=Math.max(0,DEPTS.indexOf(c.dept));return `<tr><td style="width:96px">${sel('crew',c,'dept',DEPTS,{re:1})}</td><td style="min-width:140px">${inp('crew',c,'pos',{list:'pos'+di,ph:'포지션'})}</td><td style="min-width:90px">${inp('crew',c,'name',{ph:'이름'})}</td><td style="min-width:120px">${inp('crew',c,'phone',{t:'tel',ph:'010-'})}</td><td style="width:92px">${inp('crew',c,'call',{t:'time'})}</td>${dd('crew',c)}<td style="min-width:130px">${inp('crew',c,'wear',{ph:'무전기 CH1…'})}</td><td style="min-width:120px">${inp('crew',c,'note',{ph:'비고'})}</td>${xb('crew',c.id)}</tr>`;}).join('')).join('');
  return `<div class="doc">${dl}<div class="dh"><div><h1>CREW LIST</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>${S.crew.length}명</b>${DAYN.map(n=>`DAY${n} ${working(n).length}`).join(' · ')}</div></div>
  <div class="tw"><table class="t" style="min-width:960px"><thead><tr><th>부서</th><th>포지션</th><th>이름</th><th>연락처</th><th>콜</th><th>근무일</th><th>착용장비</th><th>비고</th><th class="noprint"></th></tr></thead><tbody>${body||`<tr><td colspan="9" class="empty">부서를 눌러 추가</td></tr>`}</tbody></table></div>
  <div class="addrow noprint">${DEPTS.map(dep=>`<button class="ib" data-add="crew" data-dept="${esc(dep)}">${ic('plus',14)}${esc(dep)}</button>`).join('')}</div></div>`;
}

/* ═══ 장비 ═══ */
function vGear(){
  const cats=[...new Set([...CATS,...S.gear.map(g=>g.cat)])].filter(c=>S.gear.some(g=>g.cat===c));
  const body=cats.map(cat=>{const l=S.gear.filter(g=>g.cat===cat);return `<tr class="grp"><td colspan="8"><div class="gc">${esc(cat)} · ${l.length}종 · 준비 ${l.filter(g=>(g.status||'ok')==='ok').length}/${l.length}</div></td></tr>`+l.map(g=>`<tr><td style="width:110px">${sel('gear',g,'cat',[...new Set([...CATS,g.cat])],{re:1})}</td><td style="min-width:180px">${inp('gear',g,'name',{ph:'품목'})}</td><td style="width:70px" class="num">${inp('gear',g,'qty',{t:'number'})}</td><td style="min-width:130px">${sel('gear',g,'owner',[['','—'],...S.crew.map(c=>[c.id,c.name||'(이름 없음)'])])}</td><td style="width:84px"><span class="${g.status||'ok'}">${sel('gear',g,'status',Object.entries(STAT),{re:1})}</span></td><td style="min-width:140px">${inp('gear',g,'note',{ph:'비고'})}</td>${xb('gear',g.id)}</tr>`).join('');}).join('');
  const total=S.gear.reduce((a,g)=>a+(Number(g.qty)||0),0);
  return `<div class="doc"><div class="dh"><div><h1>EQUIPMENT LIST</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>${S.gear.length}종 · ${total}개</b>부족 ${S.gear.filter(g=>g.status==='miss').length} · 점검 ${S.gear.filter(g=>g.status==='check').length}</div></div>
  <div class="tw"><table class="t" style="min-width:760px"><thead><tr><th>분류</th><th>품목</th><th>수량</th><th>담당</th><th>상태</th><th>비고</th><th class="noprint"></th></tr></thead><tbody>${body||`<tr><td colspan="7" class="empty">분류를 눌러 추가</td></tr>`}</tbody></table></div>
  <div class="addrow noprint">${CATS.map(c=>`<button class="ib" data-add="gear" data-cat="${esc(c)}">${ic('plus',14)}${esc(c)}</button>`).join('')}</div></div>`;
}

/* ═══ 카메라 리스트 ═══ */
function vCams(){
  const n=V.day,list=S.cams.filter(c=>c.day===n).sort((a,b)=>(a.no||0)-(b.no||0));
  const pinned=new Set(S.pins.filter(p=>p.kind==='cam'&&p.day===n).map(p=>p.ref));
  const rows=list.map(c=>`<tr><td style="width:64px" class="num">${inp('cams',c,'no',{t:'number',re:1})}</td><td style="width:104px">${sel('cams',c,'rig',RIGS)}</td><td style="min-width:150px">${inp('cams',c,'pos',{ph:'위치'})}</td><td style="min-width:110px">${inp('cams',c,'lens',{ph:'렌즈'})}</td><td style="min-width:150px">${sel('cams',c,'op',crewOpts(n))}</td><td style="width:100px">${sel('cams',c,'shot',SHOTS.map(s=>[s,s||'—']))}</td><td style="min-width:140px">${inp('cams',c,'note',{ph:'비고'})}</td><td class="pin">${pinned.has(c.id)?'●':''}</td>${xb('cams',c.id)}</tr>`).join('');
  return `<div class="doc"><div class="dh"><div><h1>CAMERA LIST</h1><div style="color:var(--soft);font-weight:600">${esc(S.proj.title)} · ${esc(S.proj.sub)}</div></div><div class="r"><b>DAY ${n} / 3</b>${list.length}대</div></div>
  <div class="tw"><table class="t" style="min-width:860px"><thead><tr><th>CAM</th><th>리그</th><th>위치</th><th>렌즈</th><th>담당</th><th>샷</th><th>비고</th><th>도면</th><th class="noprint"></th></tr></thead><tbody>${rows||`<tr><td colspan="9" class="empty">행 추가로 시작</td></tr>`}</tbody></table></div>
  <div class="addrow noprint"><button class="ib" data-add="cams">${ic('plus',16)}카메라 추가</button>${n>1?`<button class="ib" data-copyday="cams">${ic('copy',16)}${n-1}일 → ${n}일 복사</button>`:''}</div></div>`;
}

/* ═══ 플랏 ═══ */
/* 행사장 기본 도면: KINTEX 제2전시장 9홀 (9A+9B) — 도면 표기 치수 기준 99m × 132m, 높이 15m (kintex.com 시설 안내) */
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
const RIGH={삼각대:1.6,짐벌:1.5,핸드헬드:1.5,지미집:3.5,다나돌리:.9,기타:1.5};
const PV={el:null,z:1,tx:0,ty:0,z0:0,fitFor:'',mode:'2d',G:null,buildFor:'',orbitFor:'',th:{theta:.35,phi:.85,dist:190,tx:0,tz:0}};
const planNow=()=>{let p=byId(S.plans,V.plan);if(!p){p=S.plans[0]||null;V.plan=p&&p.id;}return p;};
const pinsNow=()=>{const pl=planNow();return pl?S.pins.filter(p=>p.plan===pl.id&&p.day===V.day):[];};
const dimOf=p=>p.kind==='area'?false:(!!V.filter&&!(p.kind==='cam'&&(byId(S.cams,p.ref)||{}).rig===V.filter));
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
  const cam=byId(S.cams,p.ref),rig=cam?cam.rig:'기타',a=(p.rot||0)*Math.PI/180,f=(p.fov==null?RIGF[rig]:p.fov)*Math.PI/360,R=(p.rng==null?.22:p.rng)*pl.w,px=p.x*pl.w,py=p.y*pl.h,pts=[[px,py]];
  for(let k=0;k<=12;k++){const g=a-f+2*f*k/12;pts.push([px+Math.sin(g)*R,py-Math.cos(g)*R]);}
  return pts;
}
function coneSVG(p,pl,dim){const cam=byId(S.cams,p.ref),c=RIGC[cam?cam.rig:'기타'];return `<polygon opacity="${dim?.1:1}" points="${coneGeo(p,pl).map(q=>q.join(',')).join(' ')}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;}
function areaSVG(p,pl){
  const [fw,fh]=mPerFrac(pl),a=(p.rot||0)*Math.PI/180,w=(p.w||10)/2,d=(p.d||10)/2,col=ACOL[p.col||0],pts=[[-w,-d],[w,-d],[w,d],[-w,d]].map(([cx,cy])=>{const rx=cx*Math.cos(a)-cy*Math.sin(a),ry=cx*Math.sin(a)+cy*Math.cos(a);return [p.x*pl.w+rx/fw*pl.w,p.y*pl.h+ry/fh*pl.h].join(',');}).join(' ');
  return `<polygon points="${pts}" fill="${col}" fill-opacity=".3" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
}
function markHTML(p,o={}){
  const sel=p.id===V.sel?'sel':'',st=`left:${p.x*100}%;top:${p.y*100}%`;
  if(p.kind==='area')return `<div class="mk area ${sel}" data-id="${p.id}" style="${st}"><span class="pill big"><i style="background:${ACOL[p.col||0]}"></i>${esc(p.name||'구역')}</span></div>`;
  if(p.kind==='cam'){const c=byId(S.cams,p.ref);if(!c)return '';const op=crewOf(c.op);
    return `<div class="mk cam ${sel} ${o.dim?'dim':''}" data-id="${p.id}" style="${st}"><span class="tk" style="--c:${RIGC[c.rig]||RIGC.기타}">${esc(c.no)}</span>${op?`<span class="pill">${esc(short(op.name))}</span>`:''}</div>`;}
  const c=crewOf(p.ref);if(!c)return '';
  return `<div class="mk crew ${sel} ${o.dim?'dim':''}" data-id="${p.id}" style="${st}"><span class="tk" style="--c:#475569">${esc(ini(c.name))}</span><span class="pill">${esc(short(c.pos||c.name))}</span></div>`;
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
    const fl=e.target.closest('[data-f]');if(fl){V.filter=fl.dataset.f;V.sel=null;V.armed=null;render();return;}
    const tr=e.target.closest('[data-tray]');if(tr){trayTap(tr.dataset.tray,tr.dataset.id);return;}
  });
  bindGestures(PV.stage);
  PV.stage.addEventListener('pointerdown',markDown);
  PV.insp.addEventListener('click',inspClick);
  PV.insp.addEventListener('input',e=>{const p=byId(S.pins,V.sel);if(!p)return;const s=e.target.dataset.s;if(!s)return;const v=Number(e.target.value);p[s]=(s==='rot'||s==='fov'||s==='w'||s==='d'||s==='h')?v:v/100;renderMarks();});
  PV.insp.addEventListener('input',e=>{if(e.target.dataset.nm===undefined)return;const p=byId(S.pins,V.sel);if(p){p.name=e.target.value;renderMarks();}});
  PV.insp.addEventListener('change',()=>{const p=byId(S.pins,V.sel);if(p){touch(p);save();}});
  new ResizeObserver(()=>{if(!PV.el.isConnected)return;if(PV.fitFor&&!PV.z0)fit();resize3D();}).observe(PV.stage);
}
function updatePV(){
  const pl=planNow(),m3=PV.mode==='3d';
  $('[data-plans]',PV.el).innerHTML=S.plans.map(p=>`<button class="chip ${pl&&p.id===pl.id?'on':''}" data-pl="${p.id}">${esc(p.name)}</button>`).join('')+`<button class="chip dash" data-pa="add">${ic('plus',14)}도면</button>`;
  $$('.seg button',PV.el).forEach(b=>b.classList.toggle('on',b.dataset.m===PV.mode));
  const fb=$('[data-filter]',PV.el);fb.hidden=!pl;
  if(pl){const cnt=r=>S.pins.filter(p=>p.plan===pl.id&&p.day===V.day&&p.kind==='cam'&&(byId(S.cams,p.ref)||{}).rig===r).length,tot=S.pins.filter(p=>p.plan===pl.id&&p.day===V.day&&p.kind!=='area').length;
    fb.innerHTML=`<button class="chip ${!V.filter?'on':''}" data-f="">전체 ${tot}</button>`+FILTERS.map(([r,l])=>`<button class="chip ${V.filter===r?'on':''}" data-f="${r}"><span style="width:9px;height:9px;border-radius:3px;background:${RIGC[r]}"></span>${l} ${cnt(r)}</button>`).join('');}
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
  if(it.t==='area'){const d=AREA_PRE[it.id];const q=add('pins',{plan:pl.id,day:V.day,kind:'area',ref:'a'+uid(),x:pos.x,y:pos.y,rot:0,name:d.n,w:d.w,d:d.d,h:d.h,col:d.c});V.sel=q.id;save();return;}
  let p=S.pins.find(x=>x.plan===pl.id&&x.day===V.day&&x.kind===it.t&&x.ref===it.id);
  if(p){p.x=pos.x;p.y=pos.y;touch(p);}else p=add('pins',{plan:pl.id,day:V.day,kind:it.t,ref:it.id,x:pos.x,y:pos.y,rot:0});
  V.sel=p.id;save();
}
function trayTap(t,id){
  const pl=planNow(),p=pl&&S.pins.find(x=>x.plan===pl.id&&x.day===V.day&&x.kind===t&&x.ref===id);
  if(p){V.sel=p.id;V.armed=null;render();return;}
  V.armed=V.armed&&V.armed.t===t&&V.armed.id===id?null:{t,id};render();
}
function renderTray(){
  const pl=planNow();if(!pl)return;
  const placed=new Set(S.pins.filter(p=>p.plan===pl.id&&p.day===V.day).map(p=>p.kind+p.ref));
  const cams=S.cams.filter(c=>c.day===V.day).sort((a,b)=>(a.no||0)-(b.no||0)),crew=working(V.day);
  const on=(t,id)=>V.armed&&V.armed.t===t&&V.armed.id===id?'on':'';
  PV.tray.innerHTML=`<div class="row"><span class="lbl">CAM</span><div class="scx">${Object.entries(AREA_PRE).map(([k,v])=>`<button class="chip ${on('area',k)}" data-tray="area" data-id="${k}"><span style="width:9px;height:9px;border-radius:3px;background:${ACOL[v.c]}"></span>+ ${v.n}</button>`).join('')}${cams.map(c=>`<button class="chip ${on('cam',c.id)} ${placed.has('cam'+c.id)?'done':''}" data-tray="cam" data-id="${c.id}"><span style="width:9px;height:9px;border-radius:3px;background:${RIGC[c.rig]||RIGC.기타}"></span>${esc(c.no)} ${esc(c.rig)}</button>`).join('')}</div></div>
  <div class="row"><span class="lbl">CREW</span><div class="scx">${crew.map(c=>`<button class="chip ${on('crew',c.id)} ${placed.has('crew'+c.id)?'done':''}" data-tray="crew" data-id="${c.id}">${esc(c.name||'?')}</button>`).join('')||'<span style="color:var(--faint)">크루 탭에서 추가</span>'}</div></div>`;
}
function renderMarks(){
  const pl=planNow();if(!pl)return;
  const ps=pinsNow().slice().sort((a,b)=>(a.id===V.sel)-(b.id===V.sel)),m3=PV.mode==='3d';
  PV.svg.setAttribute('viewBox',`0 0 ${pl.w} ${pl.h}`);
  PV.svg.innerHTML=ps.filter(p=>p.kind==='area').map(p=>areaSVG(p,pl)).join('')+ps.filter(p=>p.kind==='cam').map(p=>coneSVG(p,pl,dimOf(p))).join('');
  const html=ps.map(p=>markHTML(p,{dim:dimOf(p)})).join('');
  if(m3){PV.marks.innerHTML='';PV.m3.innerHTML=html;shapes3D(ps,pl);project3D();dirty3();}
  else{PV.m3.innerHTML='';PV.marks.innerHTML=html;}
}
function renderInsp(){
  const p=V.sel&&byId(S.pins,V.sel),pl=planNow();
  if(!p||!pl||p.plan!==pl.id||p.day!==V.day){PV.insp.hidden=true;return;}
  PV.insp.hidden=false;
  const close=`<button class="ib red" data-i="del" aria-label="도면에서 빼기">${ic('trash',16)}</button><button class="ib" data-i="close">${ic('x',16)}</button>`,loc=`<div style="color:var(--soft);font-size:12px;font-weight:600">${esc(where(p))}</div>`;
  if(p.kind==='area'){PV.insp.innerHTML=`<div class="r"><input class="in" style="height:38px;flex:1;min-width:0" value="${esc(p.name||'')}" data-nm placeholder="이름"><button class="ib" data-i="dup" aria-label="복제">${ic('copy',16)}</button>${close}</div>
    <div class="r">${ACOL.map((c,i)=>`<button class="sw ${(p.col||0)===i?'on':''}" data-col="${i}" style="background:${c}" aria-label="색"></button>`).join('')}<span style="margin-left:auto;color:var(--soft);font-size:12px;font-weight:600">${p.w||10}×${p.d||10}m · 높이 ${p.h==null?3:p.h}m</span></div>
    <div class="r"><label class="sl">가로<input type="range" min="1" max="80" value="${p.w||10}" data-s="w"></label><label class="sl">세로<input type="range" min="1" max="60" value="${p.d||10}" data-s="d"></label></div>
    <div class="r"><label class="sl">높이<input type="range" min="0" max="15" step=".5" value="${p.h==null?3:p.h}" data-s="h"></label><label class="sl">${ic('rot',16)}<input type="range" min="0" max="359" value="${p.rot||0}" data-s="rot"></label></div>${loc}`;return;}
  if(p.kind==='crew'){const c=crewOf(p.ref)||{};PV.insp.innerHTML=`<div class="r"><div style="flex:1;min-width:0"><b>${esc(c.name)}</b> <span style="color:var(--soft)">${esc(c.pos)}</span>${loc}</div>${c.phone?`<a class="ib" href="tel:${esc(c.phone)}">${esc(c.phone)}</a>`:''}${close}</div>`;return;}
  const c=byId(S.cams,p.ref)||{},op=crewOf(c.op),rig=c.rig||'기타';
  PV.insp.innerHTML=`<div class="r"><div style="flex:1;min-width:0"><b>CAM ${esc(c.no)}</b> <span style="color:var(--soft)">${esc(rig)}${c.shot?' · '+esc(c.shot):''}${op?' · '+esc(op.name):''}</span>${loc}</div>${close}</div>
  <div class="r"><label class="sl">${ic('rot',16)}<input type="range" min="0" max="359" value="${p.rot||0}" data-s="rot"></label><label class="sl">${ic('fov',16)}<input type="range" min="10" max="140" value="${p.fov==null?RIGF[rig]:p.fov}" data-s="fov"></label><label class="sl">${ic('dist',16)}<input type="range" min="5" max="70" value="${Math.round((p.rng==null?.22:p.rng)*100)}" data-s="rng"></label></div>`;
}
function inspClick(e){
  const sw=e.target.closest('[data-col]');if(sw){const p=byId(S.pins,V.sel);if(p){p.col=Number(sw.dataset.col);touch(p);save();render();}return;}
  const i=e.target.closest('[data-i]');if(!i)return;
  if(i.dataset.i==='dup'){const p=byId(S.pins,V.sel);if(p){const q=add('pins',{...p,id:undefined,ref:'a'+uid(),x:clamp(p.x+.02,0,1),y:clamp(p.y+.02,0,1)});V.sel=q.id;save();render();}return;}
  if(i.dataset.i==='close'){V.sel=null;render();}
  if(i.dataset.i==='del'){const p=byId(S.pins,V.sel);if(p){S.pins=S.pins.filter(x=>x.id!==p.id);S.del[p.id]=now();V.sel=null;save();render();}}
}
function markDown(e){
  const el=e.target.closest('.mk');if(!el||!PV.stage.contains(el))return;
  const p=byId(S.pins,el.dataset.id);if(!p)return;
  e.preventDefault();e.stopPropagation();
  const sx=e.clientX,sy=e.clientY;let moved=false;drag={id:p.id};
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<5)return;moved=true;const pos=stagePos(ev.clientX,ev.clientY);if(!pos)return;p.x=pos.x;p.y=pos.y;V.sel=p.id;renderMarks();};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);drag=null;if(moved){touch(p);save();}V.sel=p.id;render();};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
}

/* ═══ 3D (three.js · 실측 미터 단위) ═══ */
const loadScript=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.append(s);});
async function ensureThree(){if(window.THREE)return true;try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');return !!window.THREE;}catch(e){console.warn(e);return false;}}
function initGL(){
  const T=THREE,R=new T.WebGLRenderer({canvas:PV.gl,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const scene=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.5,4000);
  scene.add(new T.AmbientLight(0xffffff,.85));const dl=new T.DirectionalLight(0xffffff,.6);dl.position.set(-60,120,80);scene.add(dl);
  PV.G={R,scene,cam,world:new T.Group(),shapes:new T.Group()};scene.add(PV.G.world);scene.add(PV.G.shapes);
  resize3D();
}
function resize3D(){if(!PV.G||PV.mode!=='3d')return;const r=PV.stage.getBoundingClientRect();if(!r.width)return;PV.G.R.setSize(r.width,r.height,false);PV.G.cam.aspect=r.width/r.height;PV.G.cam.updateProjectionMatrix();dirty3();}
function disposeGroup(g){for(const c of [...g.children]){g.remove(c);if(c.geometry)c.geometry.dispose();if(c.material){if(c.material.map)c.material.map.dispose();c.material.dispose();}}}
function resetOrbit(){const pl=planNow();if(!pl)return;const r=realOf(pl);Object.assign(PV.th,{theta:.35,phi:.85,dist:Math.max(r.w,r.h)*1.45,tx:0,tz:0});}
function build3D(){
  const pl=planNow();if(!pl||!window.THREE)return;
  if(!PV.G)initGL();
  const data=imgOf(pl);if(!data)return;
  const T=THREE,G=PV.G,r=realOf(pl),[fw,fh]=mPerFrac(pl);
  disposeGroup(G.world);
  const tex=new T.TextureLoader().load(data,()=>dirty3());tex.anisotropy=8;
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
  PV.buildFor=ikey(pl)+(pl.real?'r':'');
  if(PV.orbitFor!==PV.buildFor){PV.orbitFor=PV.buildFor;resetOrbit();}
  shapes3D(pinsNow(),pl);project3D();dirty3();
}
function shapes3D(ps,pl){
  if(!PV.G||!window.THREE)return;
  const T=THREE,G=PV.G,[fw]=mPerFrac(pl);disposeGroup(G.shapes);
  for(const p of ps){
    const [mx,mz]=toM(pl,p.x,p.y),a=(p.rot||0)*Math.PI/180,op=dimOf(p)?.12:1;
    const mat=(col,o)=>new T.MeshLambertMaterial({color:col,transparent:true,opacity:(o==null?1:o)*op});
    const put=(g,col,o,y,rotY)=>{const m=new T.Mesh(g,mat(col,o));m.position.set(mx,y||0,mz);if(rotY)m.rotation.y=rotY;G.shapes.add(m);};
    if(p.kind==='area'){const h=Math.max(.1,p.h==null?3:p.h),g=new T.BoxGeometry(p.w||10,h,p.d||10);g.translate(0,h/2,0);put(g,new T.Color(ACOL[p.col||0]),.85,0,-a);continue;}
    if(p.kind==='crew'){const g=new T.CylinderGeometry(.28,.28,1.4,12);g.translate(0,.7,0);put(g,0x475569);const s=new T.SphereGeometry(.26,12,10);s.translate(0,1.65,0);put(s,0x475569);continue;}
    const cam=byId(S.cams,p.ref);if(!cam)continue;
    const rig=cam.rig||'기타',col=new T.Color(RIGC[rig]),h=RIGH[rig]||1.5;
    const pg=new T.CylinderGeometry(.08,.08,h,8);pg.translate(0,h/2,0);put(pg,col);
    put(new T.BoxGeometry(.6,.45,.8),col,1,h,-a);
    const f=(p.fov==null?RIGF[rig]:p.fov)*Math.PI/360,R=(p.rng==null?.22:p.rng)*fw,pos=[mx,.12,mz],idx=[];
    for(let k=0;k<=12;k++){const g=a-f+2*f*k/12;pos.push(mx+Math.sin(g)*R,.12,mz-Math.cos(g)*R);}
    for(let i=1;i<=12;i++)idx.push(0,i,i+1);
    const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(pos,3));geom.setIndex(idx);
    G.shapes.add(new T.Mesh(geom,new T.MeshBasicMaterial({color:col,transparent:true,opacity:.28*op,side:T.DoubleSide,depthWrite:false})));
  }
}
let raf3=0;
function dirty3(){if(raf3||!PV.G)return;raf3=requestAnimationFrame(()=>{raf3=0;draw3();});}
function updCam(){const t=PV.th,c=PV.G.cam;c.position.set(t.tx+t.dist*Math.sin(t.phi)*Math.sin(t.theta),t.dist*Math.cos(t.phi),t.tz+t.dist*Math.sin(t.phi)*Math.cos(t.theta));c.lookAt(t.tx,0,t.tz);c.updateMatrixWorld();}
function draw3(){if(!PV.G||PV.mode!=='3d')return;updCam();PV.G.R.render(PV.G.scene,PV.G.cam);project3D();}
function project3D(){
  if(!PV.G||PV.mode!=='3d')return;const pl=planNow();if(!pl)return;
  const T=THREE,r=PV.stage.getBoundingClientRect(),v=new T.Vector3();PV.G.cam.updateMatrixWorld();
  for(const el of $$('.mk',PV.m3)){
    const p=byId(S.pins,el.dataset.id);if(!p)continue;
    const cam=p.kind==='cam'&&byId(S.cams,p.ref),top=p.kind==='area'?(p.h==null?3:p.h)+.8:p.kind==='crew'?2.3:(RIGH[(cam&&cam.rig)||'기타']||1.5)+.9,[mx,mz]=toM(pl,p.x,p.y);
    v.set(mx,top,mz).project(PV.G.cam);
    el.style.left=((v.x*.5+.5)*r.width)+'px';el.style.top=((-v.y*.5+.5)*r.height)+'px';el.style.display=v.z>1?'none':'';
  }
}
function ray(cx,cy){
  if(!PV.G||!window.THREE)return null;
  const T=THREE,r=PV.gl.getBoundingClientRect(),c=PV.G.cam;c.updateMatrixWorld();
  const v=new T.Vector3(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1,.5).unproject(c),o=c.position,d=v.sub(o).normalize();
  if(Math.abs(d.y)<1e-5)return null;const t=-o.y/d.y;if(t<0)return null;return {x:o.x+d.x*t,z:o.z+d.z*t};
}
function orbit(dx,dy,pan){if(pan){pan3(dx,dy);dirty3();return;}PV.th.theta-=dx*.006;PV.th.phi=clamp(PV.th.phi-dy*.006,.12,1.5);dirty3();}
function pan3(dx,dy){const t=PV.th,k=t.dist*.0016;t.tx-=(dx*Math.cos(t.theta)+dy*Math.sin(t.theta))*k;t.tz-=(-dx*Math.sin(t.theta)+dy*Math.cos(t.theta))*k;}

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
      if(x.kind==='cam'){const src=byId(prev,x.ref),tgt=src&&cur.find(c=>c.no===src.no);if(!tgt)continue;x.ref=tgt.id;}
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
  if(tab==='call'){const d=dayRec(n);head(`CALL SHEET  DAY ${n}/3  ${dateStr(n)}`);
    L.push(`장소: ${d.loc||'-'}   집합: ${d.general||'-'}   날씨: ${d.weather||'-'}`);if(d.safety)L.push('안전·주차·병원: '+d.safety);
    const ses=S.sched.filter(s=>s.day===n).sort(byStart);if(ses.length){L.push('','[일정]');for(const s of ses)L.push(`${s.start||'--:--'}${s.end?'~'+s.end:''}  [${s.kind}] ${s.title}${s.place?' @'+s.place:''}${s.who?' / '+s.who:''}${s.note?' ('+s.note+')':''}`);}
    L.push('','[크루 콜]');for(const dep of DEPTS){const l=working(n).filter(c=>c.dept===dep);if(!l.length)continue;L.push(`- ${dep}`);for(const c of l)L.push(`  ${c.call||d.general||'--:--'}  ${c.pos||'-'}  ${c.name}  ${c.phone||''}${c.wear?'  ['+c.wear+']':''}${c.note?' ('+c.note+')':''}`);}
    for(const pl of S.plans){const ps=S.pins.filter(p=>p.plan===pl.id&&p.day===n);if(!ps.length)continue;L.push('',`[카메라 플랏 · ${pl.name}] (${pl.real?'미터 기준':'도면 화면 기준'})`);if(pl.real)L.push(`  기준: 도면 좌상단 0m · 가로 ${pl.real.w}m × 세로 ${pl.real.h}m · 높이 ${pl.real.H}m`);for(const p of ps){if(p.kind==='cam'){const c=byId(S.cams,p.ref);if(c)L.push(`  CAM ${c.no} ${c.rig}${c.shot?' · '+c.shot:''}  ${crewOf(c.op)?crewOf(c.op).name:'담당 미정'}  ${where(p)}`);}else if(p.kind==='area')L.push(`  [구역] ${p.name||'구역'} ${p.w||10}×${p.d||10}m 높이 ${p.h==null?3:p.h}m  ${where(p)}`);else{const c=crewOf(p.ref);if(c)L.push(`  ${c.name} (${c.pos||'-'})  ${where(p)}`);}}}
    if(d.notes)L.push('','[공지]',d.notes);}
  if(tab==='sched'){head(`RUN OF SHOW  DAY ${n}/3  ${dateStr(n)}`);for(const s of S.sched.filter(s=>s.day===n).sort(byStart))L.push([s.start,s.end,s.kind,s.title,s.place,s.who,s.note].join('\t'));}
  if(tab==='crew'){head('CREW LIST');for(const dep of DEPTS){const l=S.crew.filter(c=>c.dept===dep);if(!l.length)continue;L.push(`[${dep}]`);for(const c of l)L.push([c.pos,c.name,c.phone,c.call,(c.days||[]).join('/')+'일',c.wear,c.note].join('\t'));}}
  if(tab==='gear'){head('EQUIPMENT LIST');for(const cat of [...new Set([...CATS,...S.gear.map(g=>g.cat)])]){const l=S.gear.filter(g=>g.cat===cat);if(!l.length)continue;L.push(`[${cat}]`);for(const g of l)L.push([g.name,'×'+(g.qty==null?1:g.qty),STAT[g.status||'ok'],(crewOf(g.owner)||{}).name||'',g.note].join('\t'));}}
  if(tab==='cams'){head(`CAMERA LIST  DAY ${n}/3`);for(const c of S.cams.filter(c=>c.day===n).sort((a,b)=>(a.no||0)-(b.no||0)))L.push([`CAM ${c.no}`,c.rig,c.pos,c.lens,(crewOf(c.op)||{}).name||'',c.shot,c.note].join('\t'));}
  if(tab==='plot'){head(`CAMERA PLOT  DAY ${n}/3 (도면 화면 기준)`);for(const p of pinsNow()){if(p.kind==='cam'){const c=byId(S.cams,p.ref);if(c)L.push(`CAM ${c.no}\t${c.rig}\t${(crewOf(c.op)||{}).name||''}\t${where(p)}`);}else if(p.kind==='area')L.push(`구역\t${p.name||'구역'}\t${p.w||10}×${p.d||10}m\t높이 ${p.h==null?3:p.h}m\t${where(p)}`);else{const c=crewOf(p.ref);if(c)L.push(`${c.name}\t${c.pos||''}\t${where(p)}`);}}}
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
  const P=[['연출·제작','프로듀서','김도윤','07:00'],['연출·제작','디렉터','한서진','07:00'],['연출·제작','조연출(AD)','서민아','07:00'],
    ['카메라','카메라 오퍼레이터','이서준','07:30'],['카메라','카메라 오퍼레이터','박민재','07:30'],['카메라','짐벌 오퍼레이터','최유진','07:30'],['카메라','지미집 오퍼레이터','정하린','07:00'],['카메라','핸드헬드','한지우','07:30',[1,3]],['카메라','다나돌리 오퍼레이터','오세린','07:00',[2,3]],
    ['스위칭·영상','TD','강태오','07:00'],['스위칭·영상','셰이더(CCU)','윤서아','07:30'],['스위칭·영상','레코더','장도현','07:30'],['음향','FOH 엔지니어','임도현','06:30'],['그래픽·CG','CG 오퍼레이터','송지안','08:00'],['무대·스테이지','스테이지 매니저','문가온','07:00']];
  const crew={};
  P.forEach((p,i)=>{crew[p[2]]=A('crew',{id:'demo-c'+i,dept:p[0],pos:p[1],name:p[2],phone:'010-0000-'+String(1000+i),email:'',call:p[3],days:p[4]||[1,2,3],wear:i%2?'무전기 CH1 · 인컴':'무전기 CH1 · 이어피스',note:''});});
  const G=[['카메라','FX6',3,'ok','이서준'],['카메라','A7S III',2,'ok','박민재'],['렌즈','24-70mm f2.8',3,'ok'],['렌즈','70-200mm f2.8',2,'ok'],['짐벌','RS3 Pro',2,'check','최유진'],['삼각대·리그','삼각대 (판 헤드)',4,'ok'],['삼각대·리그','지미집 6m',1,'ok','정하린'],['삼각대·리그','다나돌리 세트',1,'check','오세린'],
    ['모니터','17" 모니터',2,'ok','윤서아'],['스위칭','ATEM Mini Extreme',1,'ok','강태오'],['음향','무선 마이크 세트',8,'miss','임도현'],['통신','인컴 벨트팩',12,'ok','서민아'],['통신','무전기',14,'ok'],['전원','배터리 V-마운트',16,'miss'],['케이블','SDI 50m',6,'ok'],['케이블','SDI 25m',8,'ok']];
  G.forEach((g,i)=>A('gear',{id:'demo-g'+i,cat:g[0],name:g[1],qty:g[2],status:g[3],owner:g[4]?crew[g[4]].id:'',note:''}));
  const SC=[['06:30','08:00','셋업','로드인 · 카메라/케이블 셋업','메인홀','전 부서',''],['08:00','09:30','리허설','런스루 · 카메라 블로킹','메인홀','카메라·스위칭','콜 용어 확인'],['10:00','11:30','본행사','오프닝 워십','메인홀','전 부서','와이드 → 인도자 클로즈업'],['11:30','13:00','식사','점심 · 배터리 교체','로비','',''],['13:00','14:30','본행사','말씀 1','메인홀','전 부서','70% 미디엄·클로즈'],['19:00','21:00','본행사','저녁 집회','메인홀','전 부서',''],['21:00','22:30','철수','장비 철수','메인홀','카메라·스테이지','']];
  for(const d of DAYN)SC.forEach((s,i)=>A('sched',{id:`demo-s${d}${i}`,day:d,start:s[0],end:s[1],kind:s[2],title:d===1?s[3]:s[3].replace('오프닝 워십','세션 '+d).replace('말씀 1','말씀 '+d),place:s[4],who:s[5],note:s[6]}));
  const CM=[[1,'삼각대','후방 중앙 (FOH)','24-70','이서준','와이드',49.5,100,0],[2,'삼각대','무대 좌측 전방','70-200','박민재','미디엄',75,28,305],[3,'짐벌','객석 통로','24-70','최유진','인서트',40,65,5],[4,'지미집','무대 우측 전방','24-70','정하린','와이드',20,26,62]];
  const ex={1:[[5,'핸드헬드','무대 앞 이동','24-70','한지우','군중',45,30,0]],2:[[5,'다나돌리','무대 앞 레일','24-70','오세린','클로즈업',49.5,24,0]],3:[[5,'핸드헬드','무대 앞 이동','24-70','한지우','군중',40,30,0],[6,'다나돌리','무대 앞 레일','24-70','오세린','클로즈업',58,24,0]]};
  const K=(xm,ym)=>fromM(KINTEX,xm-49.5,ym-66);
  for(const d of DAYN){
    const [sx,sy]=K(49.5,9),[fx,fy]=K(49.5,103);A('pins',{id:'demo-stage'+d,plan:'kintex9',day:d,kind:'area',ref:'demo-a'+d+'0',x:sx,y:sy,rot:0,name:'무대',w:24,d:10,h:1.2,col:0});A('pins',{id:'demo-foh'+d,plan:'kintex9',day:d,kind:'area',ref:'demo-a'+d+'1',x:fx,y:fy,rot:0,name:'FOH',w:8,d:3,h:1.5,col:6});
    [...CM,...ex[d]].forEach(c=>{
      const cam=A('cams',{id:`demo-m${d}${c[0]}`,day:d,no:c[0],rig:c[1],pos:c[2],lens:c[3],op:crew[c[4]].id,shot:c[5],note:''}),[fx,fy]=K(c[6],c[7]);
      A('pins',{id:'demo-p'+cam.id,plan:'kintex9',day:d,kind:'cam',ref:cam.id,x:fx,y:fy,rot:c[8]});
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
const VIEWS={call:vCall,sched:vSched,crew:vCrew,gear:vGear,cams:vCams};
function render(){
  if(drag){pendR=true;return;}
  const tab=TABS.find(t=>t.k===V.tab)||TABS[0],showDays=!['crew','gear'].includes(V.tab),today=todayN();
  $('#bar').innerHTML=(showDays?`<div class="days">${DAYN.map(n=>{const d=dayDate(n);return `<button data-day="${n}" class="${V.day===n?'on':''}">DAY ${n}<small>${d?(d.getMonth()+1)+'/'+d.getDate()+(today===n?' · 오늘':''):'&nbsp;'}</small></button>`;}).join('')}</div>`:`<b style="font-size:15px">${tab.n}</b>`)+
    `<span class="sp"></span><button class="ib" data-bar="undo" aria-label="실행 취소"${H.u.length?'':' disabled'}>${ic('undo',16)}</button><button class="ib" data-bar="redo" aria-label="다시 실행"${H.r.length?'':' disabled'}>${ic('redo',16)}</button><button class="ib" data-bar="copy" aria-label="텍스트 복사">${ic('copy',16)}복사</button><button class="ib" data-bar="print" aria-label="인쇄">${ic('print',16)}</button><button class="ib" data-bar="cog" aria-label="설정">${ic('cog',16)}</button>`;
  $('#tabs').innerHTML=TABS.map(t=>`<button class="${t.k===V.tab?'on':''}" data-tab="${t.k}">${ic(t.i,22)}${t.n}</button>`).join('');
  const main=$('#main');
  if(V.tab==='plot'){
    main.className='fill';
    if(main.firstChild!==PV.el){main.replaceChildren(PV.el);requestAnimationFrame(()=>fit());}
    updatePV();
  }else{
    const st=main.scrollTop,ae=document.activeElement,keep=ae&&ae.dataset&&ae.dataset.id&&{id:ae.dataset.id,k:ae.dataset.k};
    main.className='';main.innerHTML=VIEWS[V.tab]();main.scrollTop=st;
    if(V.focus){const el=$(`[data-id="${V.focus}"][data-k="${V.focusK||'name'}"]`,main);if(el)el.focus();V.focus=null;}
  }
}
function addRow(col,b){
  let it;
  if(col==='crew')it=add('crew',{dept:b.dataset.dept,pos:'',name:'',phone:'',email:'',call:'',days:[1,2,3],wear:'',note:''});
  if(col==='gear'){V.lastCat=b.dataset.cat;it=add('gear',{cat:b.dataset.cat,name:'',qty:1,owner:'',status:'ok',note:''});}
  if(col==='sched')it=add('sched',{day:V.day,start:'',end:'',kind:'본행사',title:'',place:'',who:'',note:''});
  if(col==='cams'){const no=Math.max(0,...S.cams.filter(c=>c.day===V.day).map(c=>c.no||0))+1;it=add('cams',{day:V.day,no,rig:'삼각대',pos:'',lens:'',op:'',shot:'',note:''});}
  V.focus=it.id;V.focusK=col==='crew'?'name':col==='sched'?'title':col==='cams'?'pos':'name';render();
}
function boot(){
  buildPV();
  if(ensureKintex())persist();
  DAYN.forEach(dayRec);H.c=snap();
  const main=$('#main');
  $('#bar').addEventListener('click',e=>{
    const d=e.target.closest('[data-day]');if(d){V.day=Number(d.dataset.day);V.sel=null;V.armed=null;saveUI();render();return;}
    const b=e.target.closest('[data-bar]');if(!b)return;
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
    const ad=e.target.closest('[data-add]');if(ad){addRow(ad.dataset.add,ad);return;}
    const dl=e.target.closest('[data-del]');
    if(dl){
      if(!dl.classList.contains('arm')){dl.classList.add('arm');dl.textContent='삭제';setTimeout(()=>{if(dl.isConnected){dl.classList.remove('arm');dl.innerHTML=ic('x',16);}},2200);return;}
      remove(dl.dataset.del,dl.dataset.id);render();return;
    }
    const tg=e.target.closest('[data-tg]');
    if(tg){const it=byId(S[tg.dataset.tg],tg.dataset.id),n=Number(tg.dataset.d);it.days=(it.days||[]).includes(n)?it.days.filter(x=>x!==n):[...(it.days||[]),n].sort();touch(it);save();render();return;}
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
  render();initSync();
  window.__i61={S:()=>S,V,render,putImg,PV};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
