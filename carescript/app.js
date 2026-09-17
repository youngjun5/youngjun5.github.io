/* ============================================================
   케어스크립트 (CARE SCRIPT) — 현장 스크립터 전용 앱
   ============================================================ */
'use strict';

/* ---------- 유틸 ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const uid = ()=> Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const now = ()=> new Date().toISOString();
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = ()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const hhmm = ()=>{const d=new Date();return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;};
function toast(msg,kind=''){
  const el=document.createElement('div'); el.className='tst '+kind; el.textContent=msg;
  $('#toast').appendChild(el); setTimeout(()=>{el.style.opacity='0';el.style.transition='opacity .3s';setTimeout(()=>el.remove(),300);},1900);
}

/* ---------- 프리셋 (멀티셀렉트 고정 항목) ---------- */
const DEFAULT_PRESETS = {
  weather:['맑음','구름조금','흐림','비','소나기','눈','안개','바람','야간','실내'],
  camera :['FX3','FX6','FX30','A7S III','A7 IV','C70','R5','BMPCC 6K','Venice','Alexa Mini'],
  fps    :['23.976','24','25','29.97','30','50','59.94','60','120'],
  shutter:['1/48','1/50','1/60','1/100','1/120','1/250'],
  iso    :['320','400','640','800','1250','2500','3200','6400','12800'],
  wb     :['3200K','4300K','5600K','6500K','AWB'],
  codec  :['XAVC S-I','XAVC HS','ProRes 422','ProRes RAW','BRAW','H.264','S-Log3','C-Log3'],
  reso   :['4K DCI','4K UHD','6K','FHD','2.35:1','16:9','9:16'],
  lens   :['14mm','16mm','20mm','24mm','28mm','35mm','50mm','85mm','105mm','135mm','16-35mm','24-70mm','70-200mm','마크로 100mm','시네렌즈 세트'],
  light  :['자연광','반사판','아푸투레 600D','아푸투레 300X','스카이패널 S60','LED 패널','HMI','실등(프랙티컬)','중국등','소프트박스','디퓨전','실크','네가필','ND 필터'],
  sound  :['동시녹음','룸톤 수음','후시 필요','후시 완료','붐마이크','핀마이크 A','핀마이크 B','현장음만','노이즈 있음','대사 없음'],
  flags  :['OK','KEEP','NG','애드립','대본 수정','밑줄 필요','후시 필요','재촬영 필요','소음(항공기)','소음(차량)','조명 교체','렌즈 교체','배터리 교체','데이터 백업 완료','컷 추가','컷 삭제']
};
const FIELD_LABEL = {
  weather:'날씨', camera:'카메라 바디', fps:'프레임', shutter:'셔터', iso:'ISO', wb:'화이트밸런스',
  codec:'코덱/감마', reso:'해상도·비율', lens:'렌즈(교체 포함)', light:'조명', sound:'사운드', flags:'특이사항'
};

/* ---------- 저장소 ---------- */
const LS = 'carescript.db.v1';
function blankDB(){
  return { folders:[], projects:[], sheets:[], presets:JSON.parse(JSON.stringify(DEFAULT_PRESETS)), device:uid() };
}
function load(){
  try{
    const d = JSON.parse(localStorage.getItem(LS));
    if(!d || !d.projects) return null;
    d.presets = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PRESETS)), d.presets||{});
    d.folders ||= []; d.sheets ||= []; d.device ||= uid();
    return d;
  }catch(e){ return null; }
}
let DB = load() || blankDB();
let saveTimer=null;
function save(push=true){
  try{ localStorage.setItem(LS, JSON.stringify(DB)); }
  catch(e){ toast('⚠️ 저장 실패: 저장 공간 부족','warn'); console.error(e); }
  if(push){ clearTimeout(saveTimer); saveTimer=setTimeout(()=>Sync.push(),600); }
}
const alive = a => a.filter(x=>!x.deleted);
const getProject = id => DB.projects.find(p=>p.id===id);
const getSheet   = id => DB.sheets.find(s=>s.id===id);
const sheetsOf   = pid => alive(DB.sheets).filter(s=>s.projectId===pid);
function touch(o){ o.updatedAt = now(); }

/* ---------- 동기화 ----------
   백엔드 2종:
     'hub' = 현장 LAN 서버(server.py). 인터넷 없이 같은 와이파이의 맥·아이패드끼리.
     'sb'  = Supabase 실시간. 인터넷만 되면 어디서든. (케어센터 웹 버전 기본)
   앱이 켜질 때 같은 주소에 LAN 서버가 있는지 먼저 확인하고, 없으면 Supabase로 붙는다. */
const SB = {
  url  : 'https://mgvqhrdhshpuamihfvnp.supabase.co',
  anon : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnFocmRoc2hwdWFtaWhmdm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTE4NjQsImV4cCI6MjEwNDE4Nzg2NH0.fjDJuG-47YHU63lydUSZGAGg3FQ-DLGLp9ufnJ4SN30',
  table: 'carescript',
  row  : 'default'
};
const Sync = {
  backend:'off', hub:'', state:'off', rev:0, es:null, db:null, busy:false, again:false, ch:null,
  readOk:null, needSetup:false,

  async connect(){
    if(localStorage.getItem('carescript.solo')==='1'){ this.backend='off'; this.state='off'; paintSync(); return; }
    const saved = localStorage.getItem('carescript.hub');
    if(saved !== null) this.hub = saved.replace(/\/$/,'');
    else this.hub = (location.protocol.startsWith('http') && await this.probe(location.origin)) ? location.origin : '';

    if(this.es){ this.es.close(); this.es=null; }
    if(this.ch){ try{ this.db.removeChannel(this.ch); }catch(_){} this.ch=null; }

    if(this.hub){ this.backend='hub'; this.connectHub(); }
    else if(window.supabase && window.supabase.createClient && location.protocol.startsWith('http')){
      this.backend='sb'; this.connectSB();
    } else { this.backend='off'; this.state='off'; paintSync(); }
  },
  async probe(origin){
    try{
      const c=new AbortController(); const t=setTimeout(()=>c.abort(),1500);
      const r=await fetch(origin+'/api/state',{signal:c.signal,cache:'no-store'});
      clearTimeout(t); return r.ok;
    }catch(_){ return false; }
  },
  setHub(u){
    this.hub=(u||'').replace(/\/$/,'');
    localStorage.setItem('carescript.hub', this.hub);
    localStorage.removeItem('carescript.solo');
    this.connect();
  },
  useAuto(){ localStorage.removeItem('carescript.hub'); localStorage.removeItem('carescript.solo'); this.connect(); },

  /* ===== 현장 LAN 서버 ===== */
  connectHub(){
    this.pull(true);
    try{
      this.es = new EventSource(this.hub+'/api/events');
      this.es.onopen = ()=>{ this.state='on'; paintSync(); };
      this.es.onerror= ()=>{ this.state='err'; paintSync(); };
      this.es.onmessage = e=>{
        const d = JSON.parse(e.data||'{}');
        if(d.rev && d.rev!==this.rev && d.from!==DB.device) this.pull();
      };
    }catch(e){ this.state='err'; paintSync(); }
  },
  async pull(first){
    if(this.backend!=='hub' || !this.hub) return;
    try{
      const r = await fetch(this.hub+'/api/state',{cache:'no-store'});
      const d = await r.json();
      this.rev=d.rev; this.state='on';
      if(d.db && mergeIn(d.db)){ save(false); if(!isEditing()) render(); toast('🔄 현장 동기화됨'); }
      else if(first) save(false);
      paintSync();
    }catch(e){ this.state='err'; paintSync(); }
  },

  /* ===== Supabase 실시간 ===== */
  connectSB(){
    try{
      this.db = this.db || window.supabase.createClient(SB.url, SB.anon, {auth:{persistSession:false}, realtime:{params:{eventsPerSecond:4}}});
      this.state='err'; paintSync();
      this.sbPull(true);
      this.ch = this.db.channel('carescript-'+SB.row)
        .on('postgres_changes', {event:'*', schema:'public', table:SB.table, filter:'id=eq.'+SB.row}, ()=>this.sbPull())
        .subscribe(st=>{ this.state = (st==='SUBSCRIBED' && this.readOk!==false) ? 'on' : 'err'; paintSync(); });
    }catch(e){ console.warn('[carescript] supabase', e); this.state='err'; paintSync(); }
  },
  async sbPull(first){
    if(this.backend!=='sb') return;
    try{
      const {data,error} = await this.db.from(SB.table).select('content,rev').eq('id',SB.row).maybeSingle();
      if(error) throw error;
      if(data){
        if((data.rev||0) <= this.rev && !first) return;
        this.rev = data.rev||0;
        if(data.content && mergeIn(data.content)){ save(false); if(!isEditing()) render(); if(!first) toast('🔄 동기화됨'); }
      }
      this.readOk=true; this.needSetup=false; this.state='on'; paintSync();
    }catch(e){
      console.warn('[carescript] pull', e.message||e);
      this.readOk=false; this.state='err';
      if(/PGRST205|schema cache|does not exist|relation/i.test(e.message||'')) this.needSetup=true;
      paintSync();
    }
  },

  /* ===== 공통 푸시 ===== */
  push(){
    if(this.backend==='hub') return this.pushHub();
    if(this.backend==='sb')  return this.pushSB();
  },
  async pushHub(){
    if(!this.hub || this.busy) return;
    this.busy=true;
    try{
      const r = await fetch(this.hub+'/api/state',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({from:DB.device, db:{folders:DB.folders,projects:DB.projects,sheets:DB.sheets}})});
      const d = await r.json();
      this.rev=d.rev; this.state='on';
      if(d.db && mergeIn(d.db)){ save(false); if(!isEditing()) render(); }
      paintSync();
    }catch(e){ this.state='err'; paintSync(); }
    this.busy=false;
  },
  async pushSB(){
    if(this.busy){ this.again=true; return; }
    this.busy=true;
    try{
      const cur = await this.db.from(SB.table).select('content,rev').eq('id',SB.row).maybeSingle();
      if(cur.error) throw cur.error;
      // 남의 변경을 먼저 흡수한 뒤 올린다 (덮어쓰기 방지)
      if(cur.data && cur.data.content && mergeIn(cur.data.content)){ save(false); if(!isEditing()) render(); }
      const rev = ((cur.data && cur.data.rev) || 0) + 1;
      const up = await this.db.from(SB.table).upsert({
        id:SB.row, rev, updated_at:new Date().toISOString(),
        content:{folders:DB.folders, projects:DB.projects, sheets:DB.sheets}
      });
      if(up.error) throw up.error;
      this.rev=rev; this.state='on';
    }catch(e){
      console.warn('[carescript] push', e.message||e);
      this.state='err';
      if(/relation|does not exist|schema cache/i.test(e.message||'')) toast('서버 테이블이 아직 없습니다 (설정 참고)','warn');
    }
    this.busy=false; paintSync();
    if(this.again){ this.again=false; setTimeout(()=>this.pushSB(),500); }
  }
};
function mergeIn(remote){
  let changed=false;
  for(const k of ['folders','projects','sheets']){
    const mine = DB[k], map = new Map(mine.map(x=>[x.id,x]));
    for(const r of (remote[k]||[])){
      const m = map.get(r.id);
      if(!m){ mine.push(r); changed=true; }
      else if((r.updatedAt||'') > (m.updatedAt||'')){ Object.assign(m,r); changed=true; }
    }
  }
  return changed;
}
function isEditing(){ const a=document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }
function paintSync(){
  const d=$('#syncdot'); if(!d) return;
  d.className='syncdot '+(Sync.state==='on'?'on':Sync.state==='err'?'err':'off');
  const where = Sync.backend==='hub' ? ('현장 서버 '+Sync.hub) : Sync.backend==='sb' ? '케어센터 서버' : '';
  d.title = where ? ((Sync.state==='on'?'연결됨 · ':'연결 끊김 · ')+where) : '단독 모드 (이 기기에만 저장)';
}

/* ============================================================
   1) 어미 반복 검사 — "~해서, ~일어나서" 같은 반복 잡기
   ============================================================ */
const CONNECT_ENDINGS = [
  '자마자','면서도','는데도','으니까','니까','아서','어서','여서','해서','라서','도록','려고','면서',
  '는데','은데','지만','다가','거나','든지','든가','고서','더니','는지','길래','으며','으면',
  '서','고','며','면','니','데'
];
/* 어미로 오인하기 쉬운 단어 (접속부사·명사) */
const CONN_STOP = new Set(['그리고','하지만','그래서','그러니까','그런데','그러면서','그러다가','왜냐하면',
  '언니','오빠','엄마','아빠','어머니','아버지','할머니','할아버지','가운데','어디','여기','거기','저기',
  '우리','아니','정말','진짜','너무','라면','화면','장면','측면','반면','이며','당신','미안','괜찮']);
const FINAL_SYLL = '다요죠까네지야아어군냐래걸나대';
const norm = s => String(s||'').replace(/[^가-힣a-zA-Z0-9]/g,'');

/* 어절 끝에서 연결어미 찾기 → {key:마지막 음절, len:매칭 길이} */
function connEndingOf(w){
  if(w.length<2 || CONN_STOP.has(w)) return null;
  for(const e of CONNECT_ENDINGS){
    if(w.length >= e.length+1 && w.endsWith(e)) return {key:w[w.length-1], len:e.length};
  }
  return null;
}
function splitClauses(text){
  const out=[]; let start=0;
  for(let i=0;i<=text.length;i++){
    const c = text[i];
    if(i===text.length || ',.!?…\n、'.includes(c)){
      let end=i;
      while(end>start && /\s/.test(text[end-1])) end--;
      let s=start; while(s<end && /\s/.test(text[s])) s++;
      if(end-s>=2) out.push({s, e:end, t:text.slice(s,end), term:(i===text.length || '.!?…\n'.includes(c))});
      start=i+1;
    }
  }
  return out;
}
/* 어미 반복 검사 ON/OFF (사전 오류 점검용 — 현장에서 끌 수 있음) */
let ENDCHK = localStorage.getItem('carescript.endchk') !== '0';

/** 한 대사의 어미 반복 분석 → {marks:[{s,e}], warns:[문자열]} */
function analyzeEnding(text){
  const marks=[], warns=[];
  if(!ENDCHK || !text || text.length<6) return {marks,warns};

  /* 1) 연결어미 — 어절 단위 ("~해서, ~일어나서" 처럼 문장 중간) */
  const found=[]; const re=/[가-힣]+/g; let m;
  while((m=re.exec(text))){
    const w=m[0], e=connEndingOf(w);
    if(e) found.push({key:e.key, s:m.index+w.length-e.len, e:m.index+w.length});
  }
  const byKey={};
  found.forEach((f,i)=>{ (byKey[f.key] ||= []).push(i); });
  for(const [k,idx] of Object.entries(byKey)){
    if(idx.length>=2){
      idx.forEach(i=>marks.push({s:found[i].s, e:found[i].e}));
      const adj = idx.some((v,j)=> j>0 && idx[j]-idx[j-1]===1);
      warns.push(`'${k}' 어미 ${idx.length}회 반복${adj?' (연속)':''}`);
    }
  }

  /* 2) 종결어미 — 문장 단위 ("~먹었어. ~먹었어.") */
  const fin = splitClauses(text).filter(c=>c.term && c.t.length>=3)
              .map(c=>({c, k:c.t.replace(/["\'”’」』\)\]]+$/,'').slice(-1)}))
              .filter(x=>FINAL_SYLL.includes(x.k));
  for(let i=1;i<fin.length;i++){
    if(fin[i].k===fin[i-1].k){
      [fin[i],fin[i-1]].forEach(x=>marks.push({s:x.c.e-1, e:x.c.e}));
      warns.push(`종결어미 '${fin[i].k}' 연속`);
    }
  }
  return {marks, warns:[...new Set(warns)]};
}

/** 마크를 입힌 안전 HTML */
function markedHTML(text, marks){
  if(!marks.length) return esc(text);
  const ms=[...marks].sort((a,b)=>a.s-b.s);
  let out='', p=0;
  for(const m of ms){
    if(m.s<p) continue;
    out += esc(text.slice(p,m.s)) + '<span class="rep">'+esc(text.slice(m.s,m.e))+'</span>';
    p=m.e;
  }
  return out + esc(text.slice(p));
}

/* ============================================================
   2) 음성인식 매칭 — 친 대사 자동 밑줄 + 대본 대조
   ============================================================ */
function bigrams(s){ const b=[]; for(let i=0;i<s.length-1;i++) b.push(s.slice(i,i+2)); return b.length?b:[s]; }
function dice(a,b){
  if(!a||!b) return 0;
  if(a===b) return 1;
  const A=bigrams(a), B=bigrams(b), m=new Map();
  A.forEach(x=>m.set(x,(m.get(x)||0)+1));
  let hit=0; B.forEach(x=>{ const c=m.get(x); if(c>0){ hit++; m.set(x,c-1);} });
  return 2*hit/(A.length+B.length);
}
/** 인식문장 → 가장 비슷한 대사 찾기 */
function matchLine(spoken, lines, cursor){
  const sp = norm(spoken); if(sp.length<2) return null;
  let best=null;
  lines.forEach((l,i)=>{
    if(l.type!=='d') return;
    const tx = norm(l.text); if(tx.length<2) return;
    let sc = dice(sp,tx);
    // 부분 인식 보정: 인식이 짧으면 대사 앞부분과 비교
    if(sp.length < tx.length*0.7) sc = Math.max(sc, dice(sp, tx.slice(0,sp.length+2))*0.96);
    if(tx.includes(sp) && sp.length>=4) sc = Math.max(sc, 0.82);
    // 진행 순서 가중치 (현재 커서 근처 우선)
    if(cursor>=0){ const d=Math.abs(i-cursor); sc += d<=3 ? 0.06 : d<=8 ? 0.02 : -0.03; }
    if(!l.done) sc += 0.05;
    if(!best || sc>best.sc) best={i, sc, line:l};
  });
  return best;
}

/* ============================================================
   3) 대본 파싱 — 붙여넣기/파일 → 캐릭터+대사 라인
   ============================================================ */
function parseScript(raw){
  const src = String(raw||'').replace(/\r/g,'').split('\n');
  const out=[]; let pendingWho=null;
  const push=(type,who,text)=>{ text=text.trim(); if(text) out.push({id:uid(),type,who:who||'',text,done:false,post:false,dev:null,note:''}); };
  for(let i=0;i<src.length;i++){
    const raw1=src[i], line=raw1.trim();
    if(!line){ pendingWho=null; continue; }
    let m = line.match(/^([^:：\n]{1,14})\s*[:：]\s*(.+)$/);
    if(m && !/^https?$/i.test(m[1])){ push('d', m[1].trim(), m[2]); pendingWho=null; continue; }
    if(/^(S#|s#|씬|SCENE|scene|#)\s*\d/.test(line)){ push('a','씬', line); pendingWho=null; continue; }
    if(/^[\(（\[【].*[\)）\]】]$/.test(line)){
      if(pendingWho) push('a', pendingWho, line); else push('a','지문', line);
      continue;
    }
    // 시나리오 형식: 짧은 줄(이름) + 다음 줄(대사)
    const next = (src[i+1]||'').trim();
    const looksName = line.length<=12 && !/[.?!,]$/.test(line) && !/\s{2,}/.test(line) && next;
    const indented = /^\s{2,}|^\t/.test(raw1);
    if(looksName && !indented && /^[가-힣A-Za-z0-9 ()]+$/.test(line)){
      pendingWho = line.replace(/\(.*?\)/g,'').trim();
      continue;
    }
    if(pendingWho){ push('d', pendingWho, line); if(!next) pendingWho=null; continue; }
    push('a','지문', line);
  }
  return out;
}

/* ============================================================
   4) 라우팅 & 렌더
   ============================================================ */
let R = { v:'home', folder:'all', pid:null, sid:null, tab:'script',
          fopen:false, filters:{date:[],scene:[],cut:[],flags:[]}, editing:null, q:'' };

function go(patch){ Object.assign(R,patch); render(); window.scrollTo(0,0); }

function render(){
  const app=$('#app');
  app.innerHTML = R.v==='home' ? viewHome() : R.v==='project' ? viewProject() : viewSheet();
  paintSync();
  if(R.v==='sheet' && R.tab==='script') Voice.paint();
  if(R.editing){ const ta=$(`textarea[data-line="${R.editing}"]`); if(ta){ ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length); autoGrow(ta);} }
}
function autoGrow(ta){ ta.style.height='auto'; ta.style.height=(ta.scrollHeight+4)+'px'; }

/* ---------- 공통 조각 ---------- */
function chips(field, sel, opts, cls=''){
  const list = opts || DB.presets[field] || [];
  return `<div class="chips">${
    list.map(v=>`<button class="chip ${cls} ${sel.includes(v)?'on':''}" data-act="chip" data-f="${esc(field)}" data-v="${esc(v)}">${esc(v)}</button>`).join('')
  }<button class="chip add" data-act="addpreset" data-f="${esc(field)}">＋</button></div>`;
}
function topbar(title, sub, left, right){
  return `<div class="topbar">
    ${left||''}
    <div><h1>${esc(title)}</h1>${sub?`<div class="sub">${esc(sub)}</div>`:''}</div>
    <div class="spacer"></div>
    <div id="syncdot" class="syncdot"></div>
    ${right||''}
  </div>`;
}
const backBtn = act => `<button class="iconbtn" data-act="${act}">‹</button>`;

/* ---------- 홈 ---------- */
function viewHome(){
  const fs = alive(DB.folders);
  const ps = alive(DB.projects).filter(p=> R.folder==='all' ? true : R.folder==='none' ? !p.folderId : p.folderId===R.folder)
                               .sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  return topbar('케어스크립트','현장 스크립터 · CARE SCRIPT',
    `<div class="brand"><div class="dot">CS</div></div>`,
    `<button class="iconbtn" data-act="settings">⚙︎</button>`)
  + `<div class="content">
      <div class="folderbar">
        <button class="fchip ${R.folder==='all'?'on':''}" data-act="folder" data-v="all">전체 ${alive(DB.projects).length}</button>
        ${fs.map(f=>`<button class="fchip ${R.folder===f.id?'on':''}" data-act="folder" data-v="${f.id}">📁 ${esc(f.name)}</button>`).join('')}
        <button class="fchip ${R.folder==='none'?'on':''}" data-act="folder" data-v="none">미분류</button>
        <button class="fchip" data-act="newfolder">＋ 폴더</button>
      </div>
      ${ps.length? `<div class="plist">${ps.map(p=>{
        const sh=sheetsOf(p.id), lines=sh.reduce((n,s)=>n+(s.lines||[]).filter(l=>l.type==='d').length,0);
        const post=sh.reduce((n,s)=>n+(s.lines||[]).filter(l=>l.post).length,0);
        return `<div class="pcard" data-act="openproject" data-v="${p.id}">
          <div class="bar" style="background:${p.color||'var(--ac)'}"></div>
          <button class="kebab" data-act="projmenu" data-v="${p.id}">⋯</button>
          <h4>${esc(p.name)}</h4>
          <div class="meta">${esc(p.dir||'')}${p.dir?' · ':''}${sh.length}회차</div>
          <div class="cnt"><span>🎬 ${sh.length}</span><span>💬 ${lines}</span>${post?`<span style="color:var(--post)">🎙 ${post}</span>`:''}</div>
        </div>`;}).join('')}</div>`
      : `<div class="empty"><div class="big">🎬</div><div>아직 프로젝트가 없어요<br>오른쪽 아래 ＋ 로 작품을 만드세요</div>
          <button class="btn" data-act="demo" style="margin-top:18px">🧪 샘플 프로젝트로 사용법 보기</button></div>`}
    </div>
    <button class="fab" data-act="newproject">＋</button>`;
}

/* ---------- 프로젝트(회차 목록 + 멀티셀렉트 필터) ---------- */
function uniqSorted(arr){ return [...new Set(arr.filter(Boolean))].sort(); }
function viewProject(){
  const p=getProject(R.pid); if(!p) return (R.v='home', viewHome());
  let sh = sheetsOf(p.id);
  const F=R.filters;
  const opts = {
    date : uniqSorted(sh.map(s=>s.date)).reverse(),
    scene: uniqSorted(sh.map(s=>s.scene)),
    cut  : uniqSorted(sh.map(s=>s.cut)),
    flags: uniqSorted(sh.flatMap(s=>s.flags||[]))
  };
  const hit = s =>
    (!F.date.length  || F.date.includes(s.date)) &&
    (!F.scene.length || F.scene.includes(s.scene)) &&
    (!F.cut.length   || F.cut.includes(s.cut)) &&
    (!F.flags.length || (s.flags||[]).some(f=>F.flags.includes(f))) &&
    (!R.q || (s.scene+' '+s.cut+' '+(s.lines||[]).map(l=>l.text).join(' ')+' '+(s.notes||'')).includes(R.q));
  const shown = sh.filter(hit).sort((a,b)=> (b.date||'').localeCompare(a.date||'') || (a.scene||'').localeCompare(b.scene||'',undefined,{numeric:true}) || (a.cut||'').localeCompare(b.cut||'',undefined,{numeric:true}));
  const nF = F.date.length+F.scene.length+F.cut.length+F.flags.length;

  return topbar(p.name, `${sh.length}개 기록`, backBtn('home'), `<button class="iconbtn" data-act="projmenu" data-v="${p.id}">⋯</button>`)
  + `<div class="content">
    <div class="filterbox">
      <div class="hd">
        <b>🔎 분류 · 멀티셀렉트</b>
        ${nF?`<span class="pill" style="color:var(--ac);border-color:var(--ac)">${nF}개 적용</span>`:''}
        <div class="spacer"></div>
        ${nF?`<button class="btn sm" data-act="clearfilter">초기화</button>`:''}
        <button class="btn sm" data-act="togglefilter">${R.fopen?'접기 ▲':'펼치기 ▼'}</button>
      </div>
      ${R.fopen?`<div class="body">
        <input placeholder="대사·특이사항 내용 검색" value="${esc(R.q)}" data-act="search">
        ${['date','scene','cut','flags'].map(k=>{
          const lb={date:'날짜',scene:'씬',cut:'컷',flags:'특이사항'}[k];
          if(!opts[k].length) return '';
          return `<div class="grp"><span>${lb}</span><div class="chips">${
            opts[k].map(v=>`<button class="chip mini ${F[k].includes(v)?'on':''}" data-act="filter" data-f="${k}" data-v="${esc(v)}">${esc(k==='scene'?'S#'+v:k==='cut'?'C#'+v:v)}</button>`).join('')
          }</div></div>`;
        }).join('')}
      </div>`:''}
    </div>
    ${shown.length? `<div class="slist">${shown.map(sheetCard).join('')}</div>`
      : `<div class="empty"><div class="big">📋</div><div>${sh.length?'조건에 맞는 기록이 없어요':'＋ 로 첫 촬영 기록을 만드세요'}</div></div>`}
  </div>
  <button class="fab" data-act="newsheet">＋</button>`;
}
function sheetCard(s){
  const L=s.lines||[], d=L.filter(l=>l.type==='d');
  const done=d.filter(l=>l.done).length, post=L.filter(l=>l.post).length, dev=L.filter(l=>l.dev).length;
  const warn=d.reduce((n,l)=>n+(analyzeEnding(l.text).warns.length?1:0),0);
  return `<div class="scard" data-act="opensheet" data-v="${s.id}">
    <div class="sc"><b>${esc(s.scene||'–')}</b><i>S#</i><b style="margin-top:4px">${esc(s.cut||'–')}</b><i>C#</i></div>
    <div class="mid">
      <div class="t">${esc(s.title || (s.lines||[]).find(l=>l.type==='d')?.text || '제목 없음')}</div>
      <div class="d">
        <span>📅 ${esc(s.date||'-')}</span>
        ${s.start||s.end?`<span>⏱ ${esc(s.start||'')}~${esc(s.end||'')}</span>`:''}
        ${(s.weather||[]).length?`<span>☁︎ ${esc(s.weather.join(','))}${s.temp?' '+esc(s.temp)+'°':''}</span>`:''}
        ${(s.lens||[]).length?`<span>🔍 ${esc(s.lens.join(','))}</span>`:''}
      </div>
      <div class="tags">
        ${d.length?`<span class="pill ${done===d.length?'ok':''}">대사 ${done}/${d.length}</span>`:''}
        ${post?`<span class="pill post">후시 ${post}</span>`:''}
        ${dev?`<span class="pill warn">대본불일치 ${dev}</span>`:''}
        ${warn?`<span class="pill warn">어미반복 ${warn}</span>`:''}
        ${(s.flags||[]).slice(0,4).map(f=>`<span class="pill">${esc(f)}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- 시트 상세 ---------- */
function viewSheet(){
  const s=getSheet(R.sid); if(!s) return (R.v='home', viewHome());
  const p=getProject(s.projectId);
  return topbar(`S#${s.scene||'–'}  C#${s.cut||'–'}`, `${p?p.name+' · ':''}${s.date||''}`,
      backBtn('backproject'), `<button class="iconbtn" data-act="sheetmenu">⋯</button>`)
    + `<div class="content" id="sheetbody">
        <div class="tabs">
          <button class="${R.tab==='info'?'on':''}" data-act="tab" data-v="info">📋 촬영정보</button>
          <button class="${R.tab==='script'?'on':''}" data-act="tab" data-v="script">💬 대본 · 음성체크</button>
        </div>
        ${R.tab==='info'? sheetInfo(s) : sheetScript(s)}
      </div>
      ${R.tab==='script'? micPanel() : ''}`;
}

function sheetInfo(s){
  const f=(k,lb,type='text',ph='')=>`<label class="f"><span>${lb}</span><input type="${type}" data-act="inp" data-k="${k}" value="${esc(s[k]||'')}" placeholder="${ph}"></label>`;
  return `
  <div class="fieldset"><h4>기본 정보</h4>
    <div class="grid2" style="margin-bottom:10px">${f('date','날짜','date')}${f('temp','기온(℃)','number','예: 18')}</div>
    <div class="grid2" style="margin-bottom:10px">${f('start','촬영 시작','time')}${f('end','촬영 종료','time')}</div>
    <div class="grid3" style="margin-bottom:10px">${f('scene','씬 S#','text','12')}${f('cut','컷 C#','text','3')}${f('take','테이크','text','2')}</div>
    ${f('title','컷 제목 / 내용','text','예: 준호 방에서 전화 받는 컷')}
    <div class="row" style="margin-top:10px;gap:8px">
      <button class="btn sm" data-act="stamp" data-k="start">시작 ⏱ 지금</button>
      <button class="btn sm" data-act="stamp" data-k="end">종료 ⏱ 지금</button>
    </div>
  </div>

  <div class="fieldset"><h4>날씨</h4>${chips('weather', s.weather||[], null, 'mini')}</div>

  <div class="fieldset"><h4>카메라 세팅</h4>
    ${['camera','fps','shutter','iso','wb','codec','reso'].map(k=>
      `<div class="sub"><span class="lb">${FIELD_LABEL[k]}</span>${chips(k, s[k]||[], null, 'mini')}</div>`).join('')}
  </div>

  <div class="fieldset"><h4>렌즈 (교체 포함)</h4>${chips('lens', s.lens||[], null, 'mini')}</div>
  <div class="fieldset"><h4>조명</h4>${chips('light', s.light||[], null, 'mini')}</div>

  <div class="fieldset"><h4>사운드 (룸톤 · 후시)</h4>
    ${chips('sound', s.sound||[], null, 'mini')}
    <div class="sub" style="margin-top:12px"><span class="lb">후시 표시된 대사</span>
      <div class="chips">${
        (s.lines||[]).filter(l=>l.post).map(l=>`<span class="chip mini ro">🎙 ${esc(l.who||'')} ${esc(l.text.slice(0,14))}…</span>`).join('') || '<span style="color:var(--tx3);font-size:13px">없음 — 대본 탭에서 🎙 버튼으로 표시</span>'
      }</div>
    </div>
  </div>

  <div class="fieldset"><h4>대본 파일</h4>
    <div class="sub">${f('scriptName','파일 이름 / 버전','text','예: 3고_0917.fdx')}</div>
    <div class="sub"><label class="f"><span>링크 (드라이브·노션·로컬 경로)</span>
      <input data-act="inp" data-k="scriptUrl" value="${esc(s.scriptUrl||'')}" placeholder="https:// 또는 /Users/…"></label></div>
    <div class="row" style="gap:8px;flex-wrap:wrap">
      ${s.scriptUrl?`<button class="btn sm" data-act="openlink">↗ 대본 열기</button>`:''}
      <button class="btn sm" data-act="importfile">📄 파일에서 대본 불러오기</button>
      <button class="btn sm" data-act="paste">📋 대본 붙여넣기</button>
    </div>
  </div>

  <div class="fieldset"><h4>특이사항</h4>
    ${chips('flags', s.flags||[], null, 'mini')}
    <div class="sub" style="margin-top:12px"><label class="f"><span>메모 (자유 기입)</span>
      <textarea data-act="inp" data-k="notes" rows="5" placeholder="현장 변수, 배우 애드립, 감독 노트 등">${esc(s.notes||'')}</textarea></label></div>
  </div>

  <div style="display:flex;gap:10px;margin-top:6px">
    <button class="btn" data-act="dupsheet" style="flex:1;justify-content:center">⧉ 이 설정으로 다음 컷</button>
    <button class="btn dan" data-act="delsheet">삭제</button>
  </div>`;
}

function sheetScript(s){
  const L=s.lines||[], d=L.filter(l=>l.type==='d');
  const done=d.filter(l=>l.done).length, post=L.filter(l=>l.post).length, dev=L.filter(l=>l.dev).length;
  let warn=0; d.forEach(l=>{ if(analyzeEnding(l.text).warns.length) warn++; });
  return `
  <div class="stat">
    <div class="s"><b>${d.length}</b><i>총 대사</i></div>
    <div class="s"><b style="color:var(--ok)">${done}</b><i>친 대사</i></div>
    <div class="s"><b style="color:var(--post)">${post}</b><i>후시</i></div>
    <div class="s"><b style="color:var(--ac2)">${dev}</b><i>대본불일치</i></div>
    <div class="s" data-act="endchk"><b style="color:${ENDCHK?'var(--warn)':'var(--tx3)'}">${ENDCHK?warn:'–'}</b><i>어미반복</i></div>
  </div>
  <div class="scripthead">
    ${s.scriptName?`<span class="pill">📄 ${esc(s.scriptName)}</span>`:''}
    ${s.scriptUrl?`<button class="btn sm" data-act="openlink">↗ 대본 열기</button>`:''}
    <button class="btn sm ${ENDCHK?'pri':''}" data-act="endchk" title="같은 문장 안에서 같은 어미가 반복되면 글자 위에 빨간 점으로 표시">⚠️ 어미검사 ${ENDCHK?'ON':'OFF'}</button>
    <div class="spacer"></div>
    <button class="btn sm" data-act="paste">📋 붙여넣기</button>
    <button class="btn sm" data-act="importfile">📄 파일</button>
    <button class="btn sm" data-act="addline">＋ 대사</button>
  </div>
  <div class="lines" id="lines">${L.length? L.map((l,i)=>lineHTML(l,i)).join('') :
    `<div class="empty"><div class="big">💬</div><div>대본을 붙여넣거나 파일에서 불러오세요</div></div>`}</div>
  <div style="height:120px"></div>`;
}

function lineHTML(l,i){
  const a = l.type==='d' ? analyzeEnding(l.text) : {marks:[],warns:[]};
  const editing = R.editing===l.id;
  return `<div class="ln ${l.type==='a'?'dir':''} ${l.done?'done':''} ${l.dev?'dev':''}" data-id="${l.id}" data-i="${i}">
    <div class="who" data-act="editwho" data-v="${l.id}">${esc(l.who|| (l.type==='a'?'지문':'?'))}</div>
    <div class="body">
      ${editing
        ? `<textarea data-line="${l.id}" data-act="linetext">${esc(l.text)}</textarea>
           <div class="row" style="margin-top:6px;gap:6px"><button class="btn sm pri" data-act="linedone">확인</button><button class="btn sm dan" data-act="delline" data-v="${l.id}">삭제</button></div>`
        : `<div class="tx" data-act="editline" data-v="${l.id}">${markedHTML(l.text, a.marks)}</div>`}
      ${a.warns.length?`<div class="warnrow">⚠️ ${a.warns.map(w=>esc(w)).join(' · ')}<button class="btn sm" data-act="fixhint" data-v="${l.id}">고치기 도움</button></div>`:''}
      ${l.dev?`<div class="devrow">🎤 실제 친 대사: “${esc(l.dev.spoken)}” <b>(일치율 ${Math.round(l.dev.score*100)}%)</b>
        <button class="btn sm" data-act="applydev" data-v="${l.id}" style="margin-left:6px">대본에 반영</button>
        <button class="btn sm" data-act="cleardev" data-v="${l.id}">무시</button></div>`:''}
      ${l.note?`<div class="note">📝 ${esc(l.note)}</div>`:''}
    </div>
    <div class="acts">
      ${l.type==='d'?`<button class="${l.done?'on':''}" data-act="toggledone" data-v="${l.id}" title="친 대사">${l.done?'✓':'○'}</button>
      <button class="${l.post?'on p':''}" data-act="togglepost" data-v="${l.id}" title="후시녹음">🎙</button>`:''}
      <button data-act="linenote" data-v="${l.id}" title="메모">📝</button>
    </div>
  </div>`;
}

function micPanel(){
  return `<div class="mic">
    <div class="r1">
      <button class="btnmic ${Voice.on?'on':''}" id="micbtn" data-act="mic">🎙</button>
      <div class="live">
        <div class="lb">음성인식 ${Voice.on?'· 듣는 중':'· 꺼짐'}</div>
        <div class="tx ${Voice.interim?'i':''}" id="miclive">${esc(Voice.interim || Voice.last || '버튼을 눌러 시작 — 배우가 친 대사에 자동으로 밑줄이 그어집니다')}</div>
      </div>
      <button class="iconbtn" data-act="micinfo">?</button>
    </div>
    <div class="r2"><span>정확도 임계값</span>
      <input type="range" min="40" max="95" value="${Voice.thr*100}" data-act="thr" style="width:120px;padding:0">
      <span id="thrv">${Math.round(Voice.thr*100)}%</span>
      <div class="spacer"></div>
      <button class="btn sm" data-act="resetdone">밑줄 전체 해제</button>
    </div>
  </div>`;
}

/* ============================================================
   5) 음성인식 엔진
   ============================================================ */
const Voice = {
  rec:null, on:false, interim:'', last:'', cursor:-1,
  thr: parseFloat(localStorage.getItem('carescript.thr')||'0.62'),
  toggle(){ this.on ? this.stop() : this.start(); },
  start(){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ toast('이 브라우저는 음성인식을 지원하지 않아요 (Safari·Chrome 권장)','warn'); return; }
    try{
      const rec = new SR();
      rec.lang='ko-KR'; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=3;
      rec.onresult = e=>{
        for(let i=e.resultIndex;i<e.results.length;i++){
          const r=e.results[i];
          if(r.isFinal){
            const alts=[...r].map(a=>a.transcript.trim()).filter(Boolean);
            this.interim=''; this.last=alts[0]||'';
            this.apply(alts);
          } else { this.interim = r[0].transcript; }
        }
        this.paint();
      };
      rec.onerror = e=>{
        if(e.error==='not-allowed'){ toast('마이크 권한이 필요해요','warn'); this.stop(); }
        else if(e.error==='no-speech'){ /* 무시 */ }
      };
      rec.onend = ()=>{ if(this.on){ try{ this.rec.start(); }catch(_){} } };
      rec.start();
      this.rec=rec; this.on=true; this.interim='';
      toast('🎙 음성인식 시작 — 대사를 치면 자동으로 밑줄');
    }catch(err){ console.error(err); toast('음성인식 시작 실패','warn'); }
    this.paint();
  },
  stop(){ this.on=false; this.interim=''; try{ this.rec && this.rec.stop(); }catch(_){} this.paint(); toast('음성인식 중지'); },
  apply(alts){
    const s=getSheet(R.sid); if(!s) return;
    let best=null, spoken='';
    for(const a of alts){
      const m = matchLine(a, s.lines||[], this.cursor);
      if(m && (!best || m.sc>best.sc)){ best=m; spoken=a; }
    }
    if(!best || best.sc < this.thr*0.6){ toast('❓ 매칭 안 됨: “'+(alts[0]||'').slice(0,18)+'”'); return; }
    const l = best.line;
    l.done = true;
    if(best.sc >= this.thr){ l.dev=null; }
    else { l.dev = { spoken, score:best.sc }; }
    this.cursor = best.i;
    touch(s); save();
    refreshLines();
    const el = $(`.ln[data-id="${l.id}"]`);
    if(el){ el.scrollIntoView({block:'center',behavior:'smooth'}); el.animate([{background:'rgba(255,176,46,.25)'},{background:'transparent'}],{duration:900}); }
  },
  paint(){
    const b=$('#micbtn'); if(b) b.className='btnmic '+(this.on?'on':'');
    const t=$('#miclive');
    if(t){
      t.textContent = this.interim || this.last || '버튼을 눌러 시작 — 배우가 친 대사에 자동으로 밑줄이 그어집니다';
      t.className = 'tx '+(this.interim?'i':'');
    }
    const lb=$('.mic .live .lb'); if(lb) lb.textContent = '음성인식 '+(this.on?'· 듣는 중':'· 꺼짐');
  }
};
function refreshLines(){
  const c=$('#lines'); if(!c) return;
  const s=getSheet(R.sid); if(!s) return;
  c.innerHTML = (s.lines||[]).map((l,i)=>lineHTML(l,i)).join('');
  // 상단 통계 갱신
  const body=$('#sheetbody'); if(body){
    const tmp=document.createElement('div'); tmp.innerHTML=sheetScript(s);
    const oldS=$('.stat'), newS=tmp.querySelector('.stat');
    if(oldS&&newS) oldS.innerHTML=newS.innerHTML;
  }
}

/* ============================================================
   6) 모달
   ============================================================ */
function closeModal(){ $('#modal-root').innerHTML=''; }
function modal(html){
  $('#modal-root').innerHTML = `<div class="mask" data-act="maskclose"><div class="modal" data-stop="1"><div class="grab"></div>${html}</div></div>`;
}
function ask({title,desc,fields,ok='저장'}){
  return new Promise(res=>{
    modal(`<h3>${esc(title)}</h3>${desc?`<div class="desc">${desc}</div>`:''}
      <div class="fields">${fields.map(f=>{
        if(f.type==='select') return `<label class="f"><span>${esc(f.label)}</span><select data-fk="${f.k}">${f.opts.map(o=>`<option value="${esc(o.v)}" ${o.v===f.value?'selected':''}>${esc(o.t)}</option>`).join('')}</select></label>`;
        if(f.type==='textarea') return `<label class="f"><span>${esc(f.label)}</span><textarea data-fk="${f.k}" rows="${f.rows||8}" placeholder="${esc(f.ph||'')}">${esc(f.value||'')}</textarea></label>`;
        return `<label class="f"><span>${esc(f.label)}</span><input type="${f.type||'text'}" data-fk="${f.k}" value="${esc(f.value||'')}" placeholder="${esc(f.ph||'')}"></label>`;
      }).join('')}</div>
      <div class="foot"><button class="btn" data-mod="cancel">취소</button><button class="btn pri" data-mod="ok">${esc(ok)}</button></div>`);
    const root=$('#modal-root');
    root.onclick=e=>{
      const b=e.target.closest('[data-mod]');
      if(e.target.classList.contains('mask')){ closeModal(); res(null); return; }
      if(!b) return;
      if(b.dataset.mod==='cancel'){ closeModal(); res(null); return; }
      const o={}; $$('[data-fk]',root).forEach(el=>o[el.dataset.fk]=el.value.trim());
      closeModal(); res(o);
    };
    setTimeout(()=>{ const f=$('[data-fk]',root); f&&f.focus(); },50);
  });
}
function confirmBox(title,desc,okText='삭제'){
  return new Promise(res=>{
    modal(`<h3>${esc(title)}</h3><div class="desc">${esc(desc||'')}</div>
      <div class="foot"><button class="btn" data-mod="cancel">취소</button><button class="btn dan" data-mod="ok">${esc(okText)}</button></div>`);
    $('#modal-root').onclick=e=>{
      const b=e.target.closest('[data-mod]');
      if(e.target.classList.contains('mask')){ closeModal(); res(false); return; }
      if(!b) return; closeModal(); res(b.dataset.mod==='ok');
    };
  });
}
function menu(title, items){
  modal(`<h3>${esc(title)}</h3><div class="fields" style="margin-top:14px">${
    items.map((it,i)=>`<button class="btn ${it.dan?'dan':''}" data-mi="${i}" style="justify-content:flex-start;padding:14px">${it.label}</button>`).join('')
  }</div>`);
  $('#modal-root').onclick=e=>{
    if(e.target.classList.contains('mask')) return closeModal();
    const b=e.target.closest('[data-mi]'); if(!b) return;
    closeModal(); items[+b.dataset.mi].run();
  };
}

/* 어미 대체 도움말 */
const SUGGEST = {
  '서':['~하고 나서','~한 뒤','~했더니','~하는 바람에','(끊어서 두 문장으로)'],
  '고':['~하며','~한 다음','~하고 나서','(끊어서 두 문장으로)'],
  '며':['~하면서','~하고','(끊어서 두 문장으로)'],
  '는데':['~하지만','~인데도','~한데 말이야','(끊어서 두 문장으로)'],
  '니까':['~해서','~하는 탓에','~하니'],
  '지만':['~인데','~하나','~라도'],
  '면서':['~하며','~하는 동시에','~하다가'],
  '다':['~더라','~야','~거든','~지'],
  '요':['~죠','~네요','~어요 (앞 문장을 반말로)'],
  '죠':['~네요','~잖아요','~어요']
};
function fixHint(lineId){
  const s=getSheet(R.sid), l=(s.lines||[]).find(x=>x.id===lineId); if(!l) return;
  const a=analyzeEnding(l.text);
  const keys=[...new Set(a.warns.map(w=>(w.match(/'([^']+)'/)||[])[1]).filter(Boolean))];
  modal(`<h3>어미 반복 다듬기</h3>
    <div class="desc">같은 어미가 반복되면 문장이 늘어지고 맥락이 흐려집니다.</div>
    <div class="card" style="margin-bottom:14px"><div style="font-size:15px;line-height:1.7">${markedHTML(l.text,a.marks)}</div></div>
    ${keys.map(k=>`<div class="sec"><h3>'${esc(k)}' 대신</h3><div class="chips">${
      (SUGGEST[k]||['(끊어서 두 문장으로)','어순 바꾸기','다른 연결어미 사용']).map(v=>`<span class="chip ro">${esc(v)}</span>`).join('')
    }</div></div>`).join('')}
    <div class="foot"><button class="btn pri" data-mod="ok" style="flex:1">닫기</button></div>`);
  $('#modal-root').onclick=e=>{ if(e.target.closest('[data-mod]')||e.target.classList.contains('mask')) closeModal(); };
}

/* ============================================================
   7) 액션 (이벤트 위임)
   ============================================================ */
const MULTI = ['weather','camera','fps','shutter','iso','wb','codec','reso','lens','light','sound','flags'];

function newSheetFrom(base){
  const p=getProject(R.pid);
  const s = {
    id:uid(), projectId:R.pid, createdAt:now(), updatedAt:now(), deleted:false,
    date: base?.date || today(), start: base? '' : hhmm(), end:'',
    scene: base?.scene||'', cut: base? String((parseInt(base.cut,10)||0)+1) : '', take:'', title:'', temp: base?.temp||'',
    scriptUrl: base?.scriptUrl||'', scriptName: base?.scriptName||'', notes:'', lines:[]
  };
  MULTI.forEach(k=> s[k] = base ? [...(base[k]||[])] : []);
  if(base) s.flags=[];
  DB.sheets.push(s); save();
  return s;
}

document.addEventListener('click', async e=>{
  const t = e.target.closest('[data-act]'); if(!t) return;
  const act=t.dataset.act, v=t.dataset.v, f=t.dataset.f;
  const s = R.sid ? getSheet(R.sid) : null;

  switch(act){
    /* --- 네비 --- */
    case 'home': go({v:'home',sid:null,pid:null}); break;
    case 'backproject': Voice.on&&Voice.stop(); go({v:'project',sid:null,editing:null}); break;
    case 'openproject': go({v:'project',pid:v,filters:{date:[],scene:[],cut:[],flags:[]},q:''}); break;
    case 'opensheet': go({v:'sheet',sid:v,tab:'script',editing:null}); Voice.cursor=-1; break;
    case 'tab': go({tab:v,editing:null}); break;
    case 'folder': go({folder:v}); break;
    case 'maskclose': if(e.target.classList.contains('mask')) closeModal(); break;

    /* --- 폴더/프로젝트 --- */
    case 'newfolder': {
      const r = await ask({title:'새 폴더', fields:[{k:'name',label:'폴더 이름',ph:'예: 2026 장편'}]});
      if(r?.name){ DB.folders.push({id:uid(),name:r.name,createdAt:now(),updatedAt:now()}); save(); render(); }
      break; }
    case 'newproject': {
      const r = await ask({title:'새 프로젝트', desc:'작품 하나가 프로젝트 1개입니다.', fields:[
        {k:'name',label:'작품 제목',ph:'예: 아임파인'},
        {k:'dir',label:'감독 / 팀',ph:'선택'},
        {k:'folderId',label:'폴더',type:'select',value:(R.folder!=='all'&&R.folder!=='none')?R.folder:'',
          opts:[{v:'',t:'미분류'},...alive(DB.folders).map(x=>({v:x.id,t:x.name}))]}
      ], ok:'만들기'});
      if(r?.name){
        const colors=['#ffb02e','#60a5fa','#4ade80','#f87171','#c084fc','#22d3ee'];
        DB.projects.push({id:uid(),name:r.name,dir:r.dir,folderId:r.folderId||null,
          color:colors[DB.projects.length%colors.length],createdAt:now(),updatedAt:now(),deleted:false});
        save(); render();
      }
      break; }
    case 'projmenu': {
      e.stopPropagation();
      const p=getProject(v); if(!p) break;
      menu(p.name,[
        {label:'✏️ 이름·감독 수정', run:async()=>{
          const r=await ask({title:'프로젝트 수정',fields:[{k:'name',label:'작품 제목',value:p.name},{k:'dir',label:'감독 / 팀',value:p.dir||''}]});
          if(r?.name){ p.name=r.name; p.dir=r.dir; touch(p); save(); render(); }}},
        {label:'📁 폴더 이동', run:async()=>{
          const r=await ask({title:'폴더 이동',fields:[{k:'folderId',label:'폴더',type:'select',value:p.folderId||'',
            opts:[{v:'',t:'미분류'},...alive(DB.folders).map(x=>({v:x.id,t:x.name}))]}]});
          if(r){ p.folderId=r.folderId||null; touch(p); save(); render(); }}},
        {label:'⬇︎ CSV 내보내기', run:()=>exportCSV(p)},
        {label:'🗑 프로젝트 삭제', dan:true, run:async()=>{
          if(await confirmBox('프로젝트 삭제?', `"${p.name}" 과 기록 ${sheetsOf(p.id).length}개가 사라집니다.`)){
            p.deleted=true; touch(p); sheetsOf(p.id).forEach(x=>{x.deleted=true;touch(x);}); save(); go({v:'home',pid:null}); }}}
      ]);
      break; }

    /* --- 필터 --- */
    case 'togglefilter': go({fopen:!R.fopen}); break;
    case 'clearfilter': go({filters:{date:[],scene:[],cut:[],flags:[]},q:''}); break;
    case 'filter': {
      const arr=R.filters[f]; const i=arr.indexOf(v);
      i<0 ? arr.push(v) : arr.splice(i,1); render(); break; }

    /* --- 시트 --- */
    case 'newsheet': { const ns=newSheetFrom(null); go({v:'sheet',sid:ns.id,tab:'info'}); break; }
    case 'dupsheet': { const ns=newSheetFrom(s); go({v:'sheet',sid:ns.id,tab:'info'}); toast('세팅 복제됨 — 컷 번호 자동 +1'); break; }
    case 'delsheet': if(await confirmBox('이 기록 삭제?','되돌릴 수 없습니다.')){ s.deleted=true; touch(s); save(); go({v:'project',sid:null}); } break;
    case 'sheetmenu': menu(`S#${s.scene||'–'} C#${s.cut||'–'}`,[
        {label:'⧉ 이 설정으로 다음 컷', run:()=>{ const ns=newSheetFrom(s); go({v:'sheet',sid:ns.id,tab:'info'}); }},
        {label:'⬇︎ 이 기록 CSV', run:()=>exportCSV(getProject(s.projectId), s.id)},
        {label:'🔄 밑줄 전체 해제', run:()=>{ (s.lines||[]).forEach(l=>{l.done=false;l.dev=null;}); touch(s); save(); render(); }},
        {label:'🗑 삭제', dan:true, run:async()=>{ if(await confirmBox('이 기록 삭제?','되돌릴 수 없습니다.')){ s.deleted=true; touch(s); save(); go({v:'project',sid:null}); }}}
      ]); break;
    case 'stamp': s[t.dataset.k]=hhmm(); touch(s); save(); render(); break;
    case 'openlink': { const u=s.scriptUrl; if(!u) break;
      window.open(/^https?:/.test(u)?u:('file://'+u),'_blank'); break; }

    /* --- 멀티셀렉트 --- */
    case 'chip': {
      const arr = s[f] ||= [];
      const i=arr.indexOf(v); i<0?arr.push(v):arr.splice(i,1);
      touch(s); save(); t.classList.toggle('on'); break; }
    case 'addpreset': {
      const r = await ask({title:FIELD_LABEL[f]+' 항목 추가', desc:'추가한 항목은 모든 기록에서 계속 쓸 수 있어요.', fields:[{k:'v',label:'항목 이름'}]});
      if(r?.v){ (DB.presets[f] ||= []).push(r.v); (s[f] ||= []).push(r.v); touch(s); save(); render(); }
      break; }

    /* --- 대본 라인 --- */
    case 'addline': {
      const r=await ask({title:'대사 추가',fields:[{k:'who',label:'인물',ph:'예: 준호'},{k:'text',label:'대사',type:'textarea',rows:4}]});
      if(r?.text){ (s.lines ||= []).push({id:uid(),type:r.who?'d':'a',who:r.who||'지문',text:r.text,done:false,post:false,dev:null,note:''}); touch(s); save(); render(); }
      break; }
    case 'editline': go({editing:v}); break;
    case 'linedone': go({editing:null}); break;
    case 'delline': if(await confirmBox('이 줄 삭제?','')){ s.lines=s.lines.filter(l=>l.id!==v); touch(s); save(); go({editing:null}); } break;
    case 'editwho': {
      const l=(s.lines||[]).find(x=>x.id===v); if(!l) break;
      const r=await ask({title:'인물 이름',fields:[{k:'who',label:'인물',value:l.who}]});
      if(r){ l.who=r.who; l.type = (!r.who||r.who==='지문'||r.who==='씬')?'a':'d'; touch(s); save(); render(); }
      break; }
    case 'toggledone': { const l=s.lines.find(x=>x.id===v); l.done=!l.done; if(!l.done) l.dev=null; touch(s); save(); refreshLines(); break; }
    case 'togglepost': { const l=s.lines.find(x=>x.id===v); l.post=!l.post;
      if(l.post && !(s.sound||[]).includes('후시 필요')) (s.sound ||= []).push('후시 필요');
      touch(s); save(); refreshLines(); break; }
    case 'linenote': { const l=s.lines.find(x=>x.id===v);
      const r=await ask({title:'대사 메모',fields:[{k:'note',label:'메모',value:l.note||'',ph:'예: 애드립, 톤 다운 요청'}]});
      if(r){ l.note=r.note; touch(s); save(); refreshLines(); } break; }
    case 'applydev': { const l=s.lines.find(x=>x.id===v); l.text=l.dev.spoken; l.dev=null;
      if(!(s.flags||[]).includes('대본 수정')) (s.flags ||= []).push('대본 수정');
      touch(s); save(); refreshLines(); toast('대본에 반영됨 · 특이사항에 "대본 수정" 추가'); break; }
    case 'cleardev': { const l=s.lines.find(x=>x.id===v); l.dev=null; touch(s); save(); refreshLines(); break; }
    case 'fixhint': fixHint(v); break;
    case 'endchk': ENDCHK=!ENDCHK; localStorage.setItem('carescript.endchk', ENDCHK?'1':'0');
      render(); toast(ENDCHK?'⚠️ 어미 반복 검사 켜짐':'어미 반복 검사 꺼짐'); break;
    case 'resetdone': (s.lines||[]).forEach(l=>{l.done=false;l.dev=null;}); Voice.cursor=-1; touch(s); save(); refreshLines(); break;

    /* --- 대본 가져오기 --- */
    case 'paste': {
      const r=await ask({title:'대본 붙여넣기', desc:'“이름: 대사” 또는 시나리오 형식(이름 줄 + 대사 줄)을 자동 인식합니다.',
        fields:[{k:'raw',label:'대본 원문',type:'textarea',rows:12,ph:'준호: 어제 내가 작업을 해서, 오늘 일어나서 피곤해\n미영: 그러게 말이야'}], ok:'불러오기'});
      if(r?.raw){
        const parsed=parseScript(r.raw);
        if(!parsed.length){ toast('인식된 대사가 없어요','warn'); break; }
        if((s.lines||[]).length && !(await confirmBox('기존 대본 교체?',`현재 ${s.lines.length}줄이 있습니다.`,'교체'))) break;
        s.lines=parsed; touch(s); save(); go({tab:'script',editing:null}); toast(`${parsed.length}줄 불러옴`,'ok');
      }
      break; }
    case 'importfile': {
      const inp=document.createElement('input'); inp.type='file'; inp.accept='.txt,.md,.fdx,.fountain,.csv,text/plain';
      inp.onchange=async()=>{
        const file=inp.files[0]; if(!file) return;
        let txt=await file.text();
        if(/\.fdx$/i.test(file.name)){
          try{ const doc=new DOMParser().parseFromString(txt,'text/xml');
            txt=[...doc.querySelectorAll('Paragraph')].map(p=>{
              const ty=p.getAttribute('Type')||''; const tx=[...p.querySelectorAll('Text')].map(x=>x.textContent).join('');
              if(!tx.trim()) return '';
              return ty==='Character' ? tx.trim() : ty==='Dialogue' ? '  '+tx.trim() : tx.trim();
            }).join('\n');
          }catch(_){}
        }
        const parsed=parseScript(txt);
        s.scriptName=file.name;
        if(parsed.length){ s.lines=parsed; toast(`${file.name} · ${parsed.length}줄 불러옴`,'ok'); }
        touch(s); save(); go({tab:'script'});
      };
      inp.click(); break; }

    /* --- 음성 --- */
    case 'mic': Voice.toggle(); break;
    case 'micinfo': modal(`<h3>🎙 음성인식 사용법</h3>
      <div class="desc">현장에서 아이패드를 배우 쪽에 두고 켜 두세요.</div>
      <div class="card" style="line-height:1.8;font-size:14px">
        1. 대본을 먼저 불러옵니다.<br>
        2. 마이크 버튼 ON → 배우가 대사를 치면 <b>일치하는 줄에 자동 밑줄</b>.<br>
        3. 대본과 다르게 쳤으면 <b style="color:var(--ac2)">대본불일치</b>로 표시되고 실제 친 말이 함께 남습니다.<br>
        4. 🎙 버튼으로 <b style="color:var(--post)">후시 필요</b> 표시 → 사운드 항목에 자동 반영.<br>
        5. 빨간 물결 밑줄은 <b style="color:var(--warn)">같은 어미 반복</b> 경고입니다.<br><br>
        <span style="color:var(--tx3)">※ Safari·Chrome에서 동작. 첫 실행 시 마이크 권한 허용이 필요합니다.</span>
      </div>
      <div class="foot"><button class="btn pri" data-mod="ok" style="flex:1">확인</button></div>`);
      $('#modal-root').onclick=ev=>{ if(ev.target.closest('[data-mod]')||ev.target.classList.contains('mask')) closeModal(); };
      break;

    /* --- 샘플 --- */
    case 'demo': {
      const f={id:uid(),name:'샘플',createdAt:now(),updatedAt:now()};
      const p={id:uid(),name:'샘플 작품 — 사용법 데모',dir:'케어센터',folderId:f.id,color:'#ffb02e',createdAt:now(),updatedAt:now(),deleted:false};
      const raw=`S# 12. 준호의 방 / 밤
준호: 어제 내가 작업을 해서, 오늘 일어나서 피곤해
(전화벨이 울린다)
미영: 왜 이렇게 목소리가 안 좋아? 무슨 일 있어?
준호: 비가 오고 바람이 불고 천둥까지 쳤어
미영: 밥은 먹었어. 약도 챙겨 먹었어.
준호: 걱정 마. 금방 갈게.`;
      const sh={id:uid(),projectId:p.id,createdAt:now(),updatedAt:now(),deleted:false,date:today(),start:'09:30',end:'',
        scene:'12',cut:'3',take:'2',title:'준호 방에서 전화 받는 컷',temp:'18',weather:['흐림'],camera:['FX3'],fps:['24'],
        shutter:['1/48'],iso:['800'],wb:['5600K'],codec:['S-Log3'],reso:['4K DCI'],lens:['35mm','85mm'],
        light:['아푸투레 300X','디퓨전'],sound:['동시녹음','룸톤 수음'],flags:['OK','애드립'],
        scriptUrl:'',scriptName:'3고_샘플.fdx',notes:'배우 애드립 있었음 — 후시 검토',lines:parseScript(raw)};
      sh.lines[5].post=true;
      DB.folders.push(f); DB.projects.push(p); DB.sheets.push(sh);
      save(); go({v:'sheet',sid:sh.id,tab:'script'});
      toast('샘플 생성 — 빨간 점이 어미 반복 표시입니다','ok');
      break; }

    /* --- 설정 --- */
    case 'settings': openSettings(); break;
  }
});

/* 입력 처리 (리렌더 없이 저장) */
document.addEventListener('input', e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const act=t.dataset.act;
  if(act==='inp'){ const s=getSheet(R.sid); if(!s) return; s[t.dataset.k]=t.value; touch(s); save(); }
  else if(act==='linetext'){
    const s=getSheet(R.sid); const l=s.lines.find(x=>x.id===t.dataset.line);
    if(l){ l.text=t.value; touch(s); save(); autoGrow(t); }
  }
  else if(act==='search'){ R.q=t.value; clearTimeout(window.__st); window.__st=setTimeout(()=>{ const c=$('.slist')||$('.empty'); render(); const i=$('[data-act="search"]'); i&&(i.focus(),i.setSelectionRange(i.value.length,i.value.length)); },350); }
  else if(act==='thr'){ Voice.thr=t.value/100; localStorage.setItem('carescript.thr',Voice.thr); const v=$('#thrv'); v&&(v.textContent=t.value+'%'); }
});

/* ============================================================
   8) 설정 · 내보내기 · 시작
   ============================================================ */
function download(name, text, type='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function exportCSV(p, onlySheet){
  const rows=[['날짜','시작','종료','씬','컷','테이크','제목','날씨','기온','카메라','FPS','셔터','ISO','WB','코덱','해상도','렌즈','조명','사운드','특이사항','인물','대사','친대사','후시','대본불일치(실제발화)','어미반복','메모']];
  sheetsOf(p.id).filter(s=>!onlySheet||s.id===onlySheet).forEach(s=>{
    const base=[s.date,s.start,s.end,s.scene,s.cut,s.take,s.title,(s.weather||[]).join('/'),s.temp,
      (s.camera||[]).join('/'),(s.fps||[]).join('/'),(s.shutter||[]).join('/'),(s.iso||[]).join('/'),(s.wb||[]).join('/'),
      (s.codec||[]).join('/'),(s.reso||[]).join('/'),(s.lens||[]).join('/'),(s.light||[]).join('/'),(s.sound||[]).join('/'),(s.flags||[]).join('/')];
    const L=(s.lines||[]);
    if(!L.length) rows.push([...base,'','','','','','',s.notes||'']);
    L.forEach(l=>rows.push([...base, l.who, l.text, l.done?'O':'', l.post?'후시':'',
      l.dev?`${l.dev.spoken} (${Math.round(l.dev.score*100)}%)`:'', analyzeEnding(l.text).warns.join(' / '), l.note||'']));
  });
  const csv='﻿'+rows.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  download(`${p.name}_케어스크립트.csv`, csv, 'text/csv;charset=utf-8');
  toast('CSV 내보냄','ok');
}
function openSettings(){
  const theme=document.documentElement.dataset.theme;
  modal(`<h3>설정</h3>
    <div class="fields">
      ${Sync.needSetup?`<div class="card" style="padding:12px;border-color:var(--warn)">
        <div style="color:var(--warn);font-weight:800;font-size:14px;margin-bottom:6px">⚠️ 서버 준비가 아직 안 됐어요</div>
        <div style="font-size:13px;line-height:1.7;color:var(--tx2)">
          케어센터 공유용 테이블이 아직 없습니다. Supabase 대시보드 → <b>SQL Editor</b> 에서
          <b>supabase-설정.sql</b> 파일 내용을 한 번만 실행하면 바로 연결됩니다.<br>
          <span style="color:var(--tx3)">그 전까지는 이 기기에만 저장되고, 기록이 사라지지는 않습니다.</span>
        </div>
      </div>`:''}
      <div class="card" style="padding:12px">
        <div style="font-size:12px;color:var(--tx3);font-weight:700;margin-bottom:6px">현재 연결</div>
        <div style="font-size:15px;font-weight:700;color:${Sync.state==='on'?'var(--ok)':'var(--warn)'}">
          ${Sync.backend==='hub'?'📡 현장 서버 (LAN)':Sync.backend==='sb'?'☁︎ 케어센터 서버':'💾 이 기기에만 저장'}
          <span style="font-weight:500;color:var(--tx3);font-size:12px">${Sync.backend==='off'?'':Sync.state==='on'?' · 연결됨':' · 연결 안 됨'}</span>
        </div>
        ${Sync.backend==='hub'?`<div style="font-size:12px;color:var(--tx3);margin-top:4px">${esc(Sync.hub)}</div>`:''}
      </div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn" data-x="auto">🔄 자동 감지</button>
        <button class="btn" data-x="sb">☁︎ 케어센터 서버로</button>
        <button class="btn" data-x="theme">${theme==='dark'?'☀︎ 밝은 화면':'☾ 어두운 화면'}</button>
      </div>
      <label class="f"><span>현장 LAN 서버 직접 지정 (인터넷 없는 현장용)</span>
        <input id="hubin" value="${esc(Sync.hub)}" placeholder="http://맥이름.local:7788"></label>
      <div style="font-size:12px;color:var(--tx3);margin-top:-6px">
        맥 1대에서 <b>실행하기.command</b> 를 켜면 터미널에 주소가 뜹니다. 같은 와이파이면 인터넷 없이도 공유됩니다.
      </div>
      <div class="row" style="gap:8px">
        <button class="btn" data-x="hubsave">이 주소로 연결</button>
        <button class="btn" data-x="huboff">공유 끄기</button>
      </div>
      <div style="height:1px;background:var(--line);margin:6px 0"></div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn" data-x="backup">⬇︎ 전체 백업(JSON)</button>
        <button class="btn" data-x="restore">⬆︎ 백업 복원</button>
      </div>
      <div style="font-size:12px;color:var(--tx3)">프로젝트 ${alive(DB.projects).length} · 기록 ${alive(DB.sheets).length} · 기기ID ${DB.device.slice(0,5)}</div>
    </div>
    <div class="foot"><button class="btn pri" data-mod="ok" style="flex:1">닫기</button></div>`);
  $('#modal-root').onclick=async e=>{
    if(e.target.classList.contains('mask')||e.target.closest('[data-mod]')) return closeModal();
    const b=e.target.closest('[data-x]'); if(!b) return;
    switch(b.dataset.x){
      case 'hubsave': Sync.setHub($('#hubin').value.trim()); closeModal(); toast('연결 시도 중…'); break;
      case 'huboff': localStorage.setItem('carescript.solo','1'); Sync.backend='off'; Sync.state='off';
        if(Sync.ch){try{Sync.db.removeChannel(Sync.ch);}catch(_){}Sync.ch=null;}
        if(Sync.es){Sync.es.close();Sync.es=null;} paintSync(); closeModal(); toast('공유 끔 — 이 기기에만 저장'); break;
      case 'auto': Sync.useAuto(); closeModal(); toast('연결 방식 자동 감지 중…'); break;
      case 'sb': Sync.setHub(''); closeModal(); toast('케어센터 서버로 연결 중…'); break;
      case 'theme': { const n=document.documentElement.dataset.theme==='dark'?'light':'dark';
        document.documentElement.dataset.theme=n; localStorage.setItem('carescript.theme',n); closeModal(); break; }
      case 'backup': download(`케어스크립트_백업_${today()}.json`, JSON.stringify(DB,null,1), 'application/json'); break;
      case 'restore': {
        const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
        inp.onchange=async()=>{ try{
            const d=JSON.parse(await inp.files[0].text());
            if(!d.projects) throw 0;
            mergeIn(d); DB.presets=Object.assign(DB.presets,d.presets||{}); save(); closeModal(); render(); toast('복원 완료','ok');
          }catch(_){ toast('복원 실패: 파일 형식 오류','warn'); } };
        inp.click(); break; }
    }
  };
}

/* ---------- 시작 ---------- */
document.documentElement.dataset.theme = localStorage.getItem('carescript.theme') || 'dark';
render();
Sync.connect();
setInterval(()=>{ if(Sync.state!=='on' && Sync.backend!=='off') Sync.connect(); }, 20000);
window.addEventListener('beforeunload', ()=>save(false));
console.log('%c케어스크립트 ready','color:#ffb02e;font-weight:bold');
