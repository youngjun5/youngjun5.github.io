/* ============================================================
   케어스크립트 (CARE SCRIPT) — 현장 스크립터 전용 앱
   ============================================================ */
'use strict';
const BUILD = '260917.1742';

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

/* ---------- 항목 목록 ----------
   칩으로 고르는 항목은 기본값을 주지 않는다. 작성자가 ＋ 로 직접 추가한 것만 쌓인다.
   단, 스크립트 용지에 인쇄되어 있는 항목(M D E N / S O L / Tracking·Fix·Pan /
   F.I·W.I·O.L·Cut->cut·W.O·F.O)은 양식 자체의 고정값이라 그대로 쓴다. */
const MULTI = ['weather','film','lens','filter','exp','light','sound','flags'];
const FIELD_LABEL = {
  weather:'날씨', film:'Film', lens:'Lens', filter:'Filter', exp:'Exp',
  light:'조명', sound:'사운드', flags:'특이사항'
};
const FIXED = {
  camPos:['Tracking','Fix','Pan']
};
const emptyPresets = ()=> Object.fromEntries(MULTI.map(k=>[k,[]]));

/* ---------- 저장소 ---------- */
const LS = 'carescript.db.v1';
function blankDB(){
  return { folders:[], projects:[], sheets:[], presets:emptyPresets(), presetsV:2, device:uid() };
}
function load(){
  try{
    const d = JSON.parse(localStorage.getItem(LS));
    if(!d || !d.projects) return null;
    d.presets = Object.assign(emptyPresets(), d.presets||{});
    d.folders ||= []; d.sheets ||= []; d.device ||= uid();
    return d;
  }catch(e){ return null; }
}
let DB = load() || blankDB();
let saveTimer=null;
function save(push=true){
  try{ localStorage.setItem(LS, JSON.stringify(DB)); }
  catch(e){ toast('저장 실패: 저장 공간 부족','warn'); console.error(e); }
  if(push){ clearTimeout(saveTimer); saveTimer=setTimeout(()=>Sync.push(),600); }
}
const alive = a => a.filter(x=>!x.deleted);
const getProject = id => DB.projects.find(p=>p.id===id);
const getSheet   = id => DB.sheets.find(s=>s.id===id);
const sheetsOf   = pid => alive(DB.sheets).filter(s=>s.projectId===pid);
function touch(o){ o.updatedAt = now(); }

/* 예전 버전의 "임의 기본 항목" 제거 — 실제 기록에 쓰인 값만 남긴다 */
if(DB.presetsV !== 2){
  const used = Object.fromEntries(MULTI.map(k=>[k,new Set()]));
  DB.sheets.forEach(s=>{
    if(s.camera && s.camera.length) s.film = [...new Set([...(s.film||[]), ...s.camera])];
    ['fps','shutter','iso','wb','codec','reso'].forEach(k=>{
      if(s[k] && s[k].length) s.exp = [...new Set([...(s.exp||[]), ...s[k]])];
    });
    MULTI.forEach(k=>(s[k]||[]).forEach(v=>used[k].add(v)));
  });
  DB.presets = Object.fromEntries(MULTI.map(k=>[k,[...used[k]]]));
  DB.presetsV = 2;
  try{ localStorage.setItem(LS, JSON.stringify(DB)); }catch(e){}
}

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
      if(d.db && mergeIn(d.db)){ save(false); if(!isEditing()) render(); toast('현장 동기화됨'); }
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
        if(data.content && mergeIn(data.content)){ save(false); if(!isEditing()) render(); if(!first) toast('동기화됨'); }
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
  const out=[]; let pendingWho=null, whoUsed=false, prevBlank=true;
  const push=(type,who,text,attach)=>{ text=text.trim(); if(text) out.push({id:uid(),type,who:who||'',text,done:false,post:false,dev:null,note:'',attach:attach||null}); };
  const nextFilled = i => { for(let k=i+1;k<src.length;k++){ const t=src[k].trim(); if(t) return t; } return ''; };

  for(let i=0;i<src.length;i++){
    const raw1=src[i], line=raw1.trim();
    // 빈 줄: 아직 대사를 못 받은 인물 이름은 살려둔다 (PDF·OCR은 줄 간격이 제멋대로)
    if(!line){ if(whoUsed) pendingWho=null; prevBlank=true; continue; }

    // "이름: 대사"
    let m = line.match(/^([^:：\n]{1,14})\s*[:：]\s*(.+)$/);
    if(m && !/^https?$/i.test(m[1])){ push('d', m[1].trim(), m[2]); pendingWho=null; whoUsed=false; prevBlank=false; continue; }

    // 씬 헤딩 (OCR이 S를 5/$로 잘못 읽는 경우까지)
    if(/^([Ss5$]\s*#|씬|SCENE|scene|#)\s*\d/.test(line)){ push('a','씬', line); pendingWho=null; whoUsed=false; prevBlank=false; continue; }

    // 괄호 지문 — 대사에 딸린 것이면 그 대사에 붙인다
    if(/^[\(（\[【].*[\)）\]】]$/.test(line)){
      const attach = (pendingWho && !whoUsed) ? 'down'          // 인물 이름 바로 뒤 → 다음 대사 앞에 붙음
                   : (!prevBlank && out.length && out[out.length-1].type==='d') ? 'up'  // 대사 바로 뒤 → 그 대사에 붙음
                   : null;
      push('a', pendingWho && !whoUsed ? pendingWho : '지문', line, attach);
      prevBlank=false; continue;
    }

    // 시나리오 형식: 짧은 줄(인물 이름) + 뒤따르는 대사
    const nxt = nextFilled(i);
    const indented = /^\s{2,}|^\t/.test(raw1);
    const looksName = line.length<=12 && !/[.?!,]$/.test(line) && !/\s{2,}/.test(line) && nxt
                      && /^[가-힣A-Za-z0-9 ()·\/]+$/.test(line);
    if(looksName && !indented && !(pendingWho && !whoUsed)){
      pendingWho = line.replace(/\(.*?\)/g,'').trim();
      whoUsed = false; prevBlank=false;
      continue;
    }

    if(pendingWho){ push('d', pendingWho, line); whoUsed=true; prevBlank=false; continue; }
    push('a','지문', line); prevBlank=false;
  }
  return out;
}

/* ============================================================
   3-B) 문서 불러오기 — PDF / 워드 / 한글(HWPX) / 페이지스 / 이미지(OCR)
   ============================================================ */
const CDN = {
  pdf    : 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfwork: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  /* 한글(CJK) PDF는 CMap 파일이 있어야 글자를 읽습니다 */
  cmap   : 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
  zip    : 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  ocr    : 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js'
};
const ACCEPT = '.txt,.md,.fountain,.fdx,.csv,.rtf,.pdf,.docx,.doc,.hwpx,.hwp,.pages,.png,.jpg,.jpeg,.heic,.webp,.gif,.tiff,.bmp,text/plain,application/pdf,image/*';

const _loaded = {};
function loadLib(url){
  if(_loaded[url]) return _loaded[url];
  return _loaded[url] = new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=url; s.onload=res;
    s.onerror=()=>{ delete _loaded[url]; rej(new Error('NETWORK')); };
    document.head.appendChild(s);
  });
}
/* 진행 상황 모달 */
function busyBox(title){
  modal(`<h3>${esc(title)}</h3><div class="desc" id="busymsg">준비 중…</div>
    <div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden;margin:8px 0 4px">
      <div id="busybar" style="height:100%;width:0;background:var(--ac);transition:width .3s"></div>
    </div>`);
  $('#modal-root').onclick=null;
  return {
    set(msg, pct){ const m=$('#busymsg'); if(m) m.textContent=msg;
      const b=$('#busybar'); if(b && pct!=null) b.style.width=Math.max(2,Math.min(100,pct*100))+'%'; },
    close(){ closeModal(); }
  };
}
const dec = b => new TextDecoder('utf-8').decode(b);
function xmlText(xml, tagRe, breakRe){
  // 태그 제거 + 문단 단위 줄바꿈
  // 원본 XML 자체의 들여쓰기/줄바꿈을 먼저 없애야 문단마다 빈 줄이 끼지 않는다
  let s = xml.replace(/[\r\n]+\s*/g, '');
  s = s.replace(breakRe, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(m,d)=>String.fromCharCode(+d));
  return s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}

/* --- PDF --- */
let _pdfReady = null;
async function pdfLib(){
  if(_pdfReady) return _pdfReady;
  return _pdfReady = (async()=>{
    await loadLib(CDN.pdf);
    const lib = window.pdfjsLib;
    // 교차출처 워커는 직접 못 띄우므로 blob 으로 감싸서 로드
    try{
      lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(
        new Blob([`importScripts(${JSON.stringify(CDN.pdfwork)});`], {type:'application/javascript'}));
    }catch(_){ lib.GlobalWorkerOptions.workerSrc = CDN.pdfwork; }
    return lib;
  })();
}
async function pdfToText(buf, ui){
  const lib = await pdfLib();
  const doc = await lib.getDocument({
    data:buf, cMapUrl:CDN.cmap, cMapPacked:true,
    disableFontFace:true, useSystemFonts:false, isEvalSupported:false
  }).promise;
  const pages=[];
  for(let p=1;p<=doc.numPages;p++){
    ui && ui.set(`PDF 읽는 중… ${p}/${doc.numPages}쪽`, p/doc.numPages);
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const rows=[];
    for(const it of tc.items){
      if(!it.str || !it.str.trim()) continue;
      const x=it.transform[4], y=it.transform[5];
      let row = rows.find(r=>Math.abs(r.y-y)<4);
      if(!row){ row={y, items:[]}; rows.push(row); }
      row.items.push({x, s:it.str});
    }
    rows.sort((a,b)=>b.y-a.y);
    const lines=[]; let prevY=null;
    for(const r of rows){
      r.items.sort((a,b)=>a.x-b.x);
      let t='';
      r.items.forEach((it,i)=>{
        if(i && it.x - (r.items[i-1].x) > 12 && !/\s$/.test(t)) t+=' ';
        t+=it.s;
      });
      t=t.replace(/\s+/g,' ')
         .replace(/\s+([,.?!…·:;%)\]}」』>])/g,'$1')    // 문장부호 앞 공백 제거
         .replace(/([(\[{「『<])\s+/g,'$1')
         .trim();
      if(!t) continue;
      if(prevY!==null && (prevY-r.y) > 22) lines.push('');   // 문단 사이 빈 줄
      lines.push(t); prevY=r.y;
    }
    pages.push(lines.join('\n'));
  }
  const out = pages.join('\n\n').trim();
  if(out.replace(/\s/g,'').length < 20) throw new Error('SCANNED');   // 텍스트 없는 스캔본
  return out;
}

/* --- 이미지 OCR --- */
async function imageToText(file, ui){
  ui && ui.set('글자 인식 엔진 준비 중… (처음 한 번만 조금 걸려요)', 0.05);
  await loadLib(CDN.ocr);
  const r = await window.Tesseract.recognize(file, 'kor+eng', {
    logger: m => { if(m.status==='recognizing text') ui && ui.set(`글자 인식 중… ${Math.round(m.progress*100)}%`, 0.3+m.progress*0.7); }
  });
  return (r.data.text||'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}

/* --- 문서 파일 → 텍스트 --- */
async function fileToText(file, ui){
  const name=file.name||'', ext=(name.split('.').pop()||'').toLowerCase();
  const isImg = /^(png|jpg|jpeg|heic|heif|webp|gif|tiff|tif|bmp)$/.test(ext) || (file.type||'').startsWith('image/');

  if(/^(txt|md|markdown|fountain|csv)$/.test(ext)) return await file.text();
  if(ext==='rtf'){
    const t = await file.text();
    return t.replace(/\\'([0-9a-f]{2})/gi,'').replace(/\{\\[^}]*\}/g,'').replace(/\\[a-z]+\d* ?/gi,'')
            .replace(/[{}]/g,'').replace(/\n{3,}/g,'\n\n').trim();
  }
  if(ext==='fdx'){
    const t=await file.text();
    try{
      const doc=new DOMParser().parseFromString(t,'text/xml');
      return [...doc.querySelectorAll('Paragraph')].map(p=>{
        const ty=p.getAttribute('Type')||'';
        const tx=[...p.querySelectorAll('Text')].map(x=>x.textContent).join('');
        if(!tx.trim()) return '';
        return ty==='Character' ? tx.trim() : ty==='Dialogue' ? tx.trim() : tx.trim();
      }).join('\n');
    }catch(_){ return t; }
  }
  if(ext==='pdf'){
    ui && ui.set('PDF 여는 중…', 0.1);
    try{ return await pdfToText(await file.arrayBuffer(), ui); }
    catch(e){
      if(e.message==='SCANNED'){
        ui && ui.set('글자층이 없는 스캔 PDF — 이미지로 인식합니다', 0.2);
        return await pdfScanToText(await file.arrayBuffer(), ui);
      }
      throw e;
    }
  }
  if(isImg){ return await imageToText(file, ui); }

  if(ext==='docx' || ext==='hwpx' || ext==='pages' || ext==='key' || ext==='numbers'){
    ui && ui.set('문서 여는 중…', 0.15);
    await loadLib(CDN.zip);
    const zip = await window.JSZip.loadAsync(await file.arrayBuffer());

    if(ext==='docx'){
      const f = zip.file('word/document.xml');
      if(!f) throw new Error('BADDOC');
      return xmlText(await f.async('string'), null, /<\/w:p>|<w:br\s*\/?>/g);
    }
    if(ext==='hwpx'){
      const names = Object.keys(zip.files).filter(n=>/Contents\/section\d+\.xml$/i.test(n)).sort();
      if(!names.length) throw new Error('BADDOC');
      const parts=[];
      for(const n of names) parts.push(xmlText(await zip.file(n).async('string'), null, /<\/hp:p>|<hp:lineBreak\s*\/?>/g));
      return parts.join('\n\n');
    }
    // Pages / Keynote / Numbers → 번들 안의 미리보기 PDF 사용
    const prev = Object.keys(zip.files).find(n=>/(^|\/)(QuickLook\/)?[Pp]review\.pdf$/.test(n));
    if(prev){
      ui && ui.set('페이지스 문서 읽는 중…', 0.3);
      return await pdfToText(await zip.file(prev).async('arraybuffer'), ui);
    }
    throw new Error('PAGES_NOPREVIEW');
  }

  if(ext==='hwp') throw new Error('HWP_OLD');
  if(ext==='doc') throw new Error('DOC_OLD');

  // 알 수 없는 형식 — 텍스트로 시도
  const t = await file.text();
  if(/[\x00-\x08\x0e-\x1f]/.test(t.slice(0,400))) throw new Error('UNKNOWN');
  return t;
}

/* 스캔 PDF → 페이지를 그림으로 렌더 후 OCR */
async function pdfScanToText(buf, ui){
  const lib = await pdfLib(); await loadLib(CDN.ocr);
  const doc = await lib.getDocument({data:buf, cMapUrl:CDN.cmap, cMapPacked:true}).promise;
  const max=Math.min(doc.numPages, 20), out=[];
  for(let p=1;p<=max;p++){
    ui && ui.set(`스캔 ${p}/${max}쪽 글자 인식 중…`, p/max);
    const page=await doc.getPage(p);
    const vp=page.getViewport({scale:2});
    const cv=document.createElement('canvas'); cv.width=vp.width; cv.height=vp.height;
    await page.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise;
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));
    const r=await window.Tesseract.recognize(blob,'kor+eng');
    out.push((r.data.text||'').trim());
  }
  if(doc.numPages>max) out.push(`\n(※ ${max}쪽까지만 인식했습니다)`);
  return out.join('\n\n');
}

const IMPORT_ERR = {
  NETWORK: ['인터넷 연결이 필요해요','PDF·워드·한글·이미지를 여는 도구를 내려받아야 합니다. 와이파이에 연결한 뒤 다시 시도하거나, 대본을 복사해서 <b>붙여넣기</b>로 넣어주세요.'],
  HWP_OLD: ['구형 한글 파일(.hwp)은 열 수 없어요','한글에서 <b>파일 → 다른 이름으로 저장</b> → 형식을 <b>HWPX</b> 또는 <b>PDF</b>로 저장한 뒤 그 파일을 올려주세요.'],
  DOC_OLD: ['구형 워드 파일(.doc)은 열 수 없어요','워드에서 <b>.docx</b> 또는 <b>PDF</b>로 저장한 뒤 올려주세요.'],
  PAGES_NOPREVIEW: ['이 페이지스 문서는 미리보기가 없어요','페이지스에서 <b>파일 → 보내기 → PDF</b> 로 내보낸 뒤 그 PDF를 올려주세요.'],
  BADDOC: ['문서를 읽지 못했어요','파일이 손상되었거나 지원하지 않는 형태입니다. PDF로 저장해서 올려보세요.'],
  UNKNOWN: ['지원하지 않는 형식이에요','PDF · 워드(.docx) · 한글(.hwpx) · 페이지스 · 이미지 · 텍스트 파일을 올릴 수 있습니다.'],
  SCANNED: ['글자를 찾지 못했어요','스캔본이라면 이미지로 저장해서 올리면 글자 인식을 시도합니다.']
};
function importError(code, detail){
  const [t,d] = IMPORT_ERR[code] || ['불러오지 못했어요', esc(detail||'알 수 없는 오류')];
  modal(`<h3>${esc(t)}</h3><div class="desc" style="line-height:1.8">${d}</div>
    <div class="foot"><button class="btn pri" data-mod="ok" style="flex:1">확인</button></div>`);
  $('#modal-root').onclick=e=>{ if(e.target.closest('[data-mod]')||e.target.classList.contains('mask')) closeModal(); };
}

/* 파일 선택 → 텍스트 추출 → 대본 반영 */
async function importDocument(file){
  const s = getSheet(R.sid); if(!s) return;
  const ui = busyBox(`${file.name}`);
  let text='';
  try{
    text = await fileToText(file, ui);
  }catch(e){
    ui.close();
    importError(e.message, e.message);
    console.warn('[carescript] import', e);
    return;
  }
  ui.close();
  if(!text || !text.trim()){ importError('SCANNED'); return; }

  const parsed = parseScript(text);
  const dCnt = parsed.filter(l=>l.type==='d').length;
  const who = [...new Set(parsed.filter(l=>l.type==='d').map(l=>l.who))].filter(Boolean);
  if(!parsed.length){ importError('UNKNOWN'); return; }

  modal(`<h3>이렇게 읽었어요</h3>
    <div class="desc">${esc(file.name)}</div>
    <div class="stat" style="margin-bottom:12px">
      <div class="s"><b>${dCnt}</b><i>대사</i></div>
      <div class="s"><b>${parsed.length-dCnt}</b><i>지문</i></div>
      <div class="s"><b>${who.length}</b><i>인물</i></div>
    </div>
    ${who.length?`<div class="sec"><h3>인식된 인물</h3><div class="chips">${who.slice(0,14).map(w=>`<span class="chip ro mini">${esc(w)}</span>`).join('')}</div></div>`:''}
    <div class="card" style="max-height:34vh;overflow-y:auto;font-size:13.5px;line-height:1.75">
      ${parsed.slice(0,40).map(l=>l.type==='d'
        ? `<div><b style="color:var(--ac)">${esc(l.who)}</b> ${esc(l.text.slice(0,60))}</div>`
        : `<div style="color:var(--tx3);font-style:italic">${esc(l.text.slice(0,60))}</div>`).join('')}
      ${parsed.length>40?`<div style="color:var(--tx3);margin-top:6px">… 외 ${parsed.length-40}줄</div>`:''}
    </div>
    <div style="font-size:12px;color:var(--tx3);margin-top:10px">인물이 잘못 잡혔으면 불러온 뒤 대사 왼쪽 이름을 눌러 고칠 수 있어요.</div>
    <div class="foot"><button class="btn" data-mod="cancel">취소</button><button class="btn pri" data-mod="ok">대본으로 넣기</button></div>`);
  $('#modal-root').onclick=async e=>{
    if(e.target.classList.contains('mask')) return closeModal();
    const b=e.target.closest('[data-mod]'); if(!b) return;
    if(b.dataset.mod==='cancel') return closeModal();
    closeModal();
    if((s.lines||[]).length && !(await confirmBox('기존 대본 교체?',`현재 ${s.lines.length}줄이 있습니다.`,'교체'))) return;
    s.lines=parsed; s.scriptName=file.name; touch(s); save();
    go({tab:'script', editing:null, page:0});
    toast(`${parsed.length}줄 불러옴`,'ok');
  };
}

/* ============================================================
   4) 라우팅 & 렌더
   ============================================================ */
let R = { v:'home', folder:'all', pid:null, sid:null, tab:'script',
          fopen:false, filters:{date:[],scene:[],cut:[],flags:[]}, editing:null, q:'', page:0 };

function go(patch){ Object.assign(R,patch); render(); }

/* 같은 화면 안에서 다시 그릴 때는 스크롤 위치를 유지한다
   (페이지 넘김 · 항목 토글 때 맨 위로 튕기지 않도록) */
let _lastView = '';
function render(){
  const app=$('#app');
  const key = R.v+':'+(R.sid||'')+':'+(R.pid||'');
  const prev = $('.content');
  const keep = (prev && _lastView===key) ? prev.scrollTop : 0;
  app.innerHTML = R.v==='home' ? viewHome() : R.v==='project' ? viewProject() : viewSheet();
  _lastView = key;
  const cur = $('.content'); if(cur && keep) cur.scrollTop = keep;
  paintSync();
  if(R.v==='sheet'){ Voice.paint(); $$('.paper textarea').forEach(autoGrow); }
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
// 홈 화면(앱의 최상위)에서 누르는 "뒤로" — 앱 안에는 더 갈 곳이 없으니
// 스튜디오 허브(다른 앱들 모아놓은 곳)로 나가는 실제 링크.
// 홈스크린에 케어스크립트를 단독 앱으로 설치해서 바로 여기로 들어온 경우,
// 브라우저 히스토리 자체가 없어서 "잘못 들어왔을 때 다른 앱으로" 갈 방법이
// 이거 말곤 없었음 — 그래서 앱을 통째로 꺼야 했던 것.
const hubBtn = `<a class="iconbtn" href="../" title="전체 앱 목록으로">‹</a>`;

/* ---------- 홈 ---------- */
function viewHome(){
  const fs = alive(DB.folders);
  const ps = alive(DB.projects).filter(p=> R.folder==='all' ? true : R.folder==='none' ? !p.folderId : p.folderId===R.folder)
                               .sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  return topbar('케어스크립트','현장 스크립터 · CARE SCRIPT',
    `${hubBtn}<div class="brand"><div class="dot">CS</div></div>`,
    `<button class="iconbtn" data-act="theme">◐</button><button class="iconbtn" data-act="settings">⚙︎</button>`)
  + `<div class="content">
      <div class="folderbar">
        <button class="fchip ${R.folder==='all'?'on':''}" data-act="folder" data-v="all">전체 ${alive(DB.projects).length}</button>
        ${fs.map(f=>`<button class="fchip ${R.folder===f.id?'on':''}" data-act="folder" data-v="${f.id}">${esc(f.name)}</button>`).join('')}
        <button class="fchip ${R.folder==='none'?'on':''}" data-act="folder" data-v="none">미분류</button>
        <button class="fchip" data-act="newfolder">＋ 폴더</button>
      </div>
      ${ps.length? `<div class="plist">${ps.map(p=>{
        const sh=sheetsOf(p.id), lines=sh.reduce((n,s)=>n+(s.lines||[]).filter(l=>l.type==='d').length,0);
        const post=sh.reduce((n,s)=>n+(s.lines||[]).filter(l=>l.post).length,0);
        return `<div class="pcard" data-act="openproject" data-v="${p.id}">
          <button class="kebab" data-act="projmenu" data-v="${p.id}">⋯</button>
          <h4>${esc(p.name)}</h4>
          <div class="meta">${esc(p.dir||'')}${p.dir?' · ':''}용지 ${sh.length}장</div>
          <div class="cnt"><span>대사 ${lines}</span>${post?`<span>후시 ${post}</span>`:''}</div>
        </div>`;}).join('')}</div>`
      : `<div class="empty"><div class="big">＋</div><div>아직 프로젝트가 없어요<br>오른쪽 아래 ＋ 로 작품을 만드세요</div>
          <button class="btn" data-act="demo" style="margin-top:18px">샘플 용지로 사용법 보기</button></div>`}
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

  return topbar(p.name, `${sh.length}개 기록`, backBtn('home'), `<button class="iconbtn" data-act="theme">◐</button><button class="iconbtn" data-act="projmenu" data-v="${p.id}">⋯</button>`)
  + `<div class="content">
    <div class="filterbox">
      <div class="hd">
        <b>분류 · 멀티셀렉트</b>
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
      : `<div class="empty"><div class="big">＋</div><div>${sh.length?'조건에 맞는 기록이 없어요':'＋ 로 첫 촬영 기록을 만드세요'}</div></div>`}
  </div>
  <button class="fab" data-act="newsheet">＋</button>`;
}
function sheetCard(s){
  const L=s.lines||[], d=L.filter(l=>l.type==='d');
  const done=d.filter(l=>l.done).length, post=L.filter(l=>l.post).length, dev=L.filter(l=>l.dev).length;
  let warn=0; if(ENDCHK) d.forEach(l=>{ if(analyzeEnding(l.text).warns.length) warn++; });
  const PAGES = pagesOf(L);
  const pi = Math.max(0, Math.min(R.page||0, PAGES.length-1));
  const PG = PAGES[pi];
  return `<div class="scard" data-act="opensheet" data-v="${s.id}">
    <div class="sc"><b>${esc(s.scene||'–')}</b><i>S#</i><b style="margin-top:3px">${esc(s.cut||'–')}</b><i>C#</i></div>
    <div class="mid">
      <div class="t">${esc(s.cutDesc || s.title || (s.lines||[]).find(l=>l.type==='d')?.text || '내용 없음')}</div>
      <div class="d">
        <span>${esc(s.date||'-')}</span>
        ${s.start||s.end?`<span>${esc(s.start||'')}~${esc(s.end||'')}</span>`:''}
        ${s.location?`<span>${esc(s.location)}</span>`:''}
        ${(s.weather||[]).length?`<span>${esc(s.weather.join('·'))}${s.temp?' '+esc(s.temp)+'℃':''}</span>`:''}
        ${(s.lens||[]).length?`<span>${esc(s.lens.join('·'))}</span>`:''}
      </div>
      <div class="tags">
        ${d.length?`<span class="pill ${done===d.length?'solid':''}">대사 ${done}/${d.length}</span>`:''}
        ${post?`<span class="pill dash">후시 ${post}</span>`:''}
        ${dev?`<span class="pill dash">불일치 ${dev}</span>`:''}
        ${warn?`<span class="pill mark">어미 ${warn}</span>`:''}
        ${(s.flags||[]).slice(0,3).map(f=>`<span class="pill">${esc(f)}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- 스크립트 용지 ----------
   실제 현장 스크립트 용지 양식 그대로. 칸 구성은 인쇄본과 동일하게 두고,
   칩으로 고르는 항목만 작성자가 ＋ 로 채운다. */

const dparts = d => { const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d||''); return m?{y:m[1].slice(2),m:m[2],d:m[3]}:{y:'',m:'',d:''}; };

function sin(s,k,ph,type='text',cls=''){
  return `<input class="${cls}" type="${type}" data-act="inp" data-k="${k}" value="${esc(s[k]||'')}" placeholder="${esc(ph||'')}">`;
}
function sta(s,k,ph,rows=3){
  return `<textarea data-act="inp" data-k="${k}" rows="${rows}" placeholder="${esc(ph||'')}">${esc(s[k]||'')}</textarea>`;
}
/* 작성자가 채우는 칩 — 칩마다 우측 상단 − 로 바로 삭제 */
function chipsU(field, sel, mode){
  const list = DB.presets[field] || [];
  const items = list.map(v=>
    `<button class="chip mini hasdel ${sel.includes(v)?'on':''}" data-act="chip" data-f="${esc(field)}" data-v="${esc(v)}">${esc(v)}<span class="minus" data-act="delpreset" data-f="${esc(field)}" data-v="${esc(v)}" title="이 항목 삭제">−</span></button>`
  ).join('');
  const tools = `<button class="chip mini add" data-act="addpreset" data-f="${esc(field)}" title="항목 추가">＋</button>`;
  if(mode==='row') return `<div class="chiprow"><div class="chips scroll">${items}</div><div class="chiptools">${tools}</div></div>`;
  return `<div class="chips">${items}${tools}</div>`;
}

/* 용지에 인쇄된 고정 항목 */
function chipsF(field, sel, cls='mini'){
  return `<div class="chips">${
    (FIXED[field]||[]).map(v=>`<button class="chip ${cls} ${sel.includes(v)?'on':''}" data-act="chip" data-f="${esc(field)}" data-v="${esc(v)}">${esc(v.replace(' 2',''))}</button>`).join('')
  }</div>`;
}

function viewSheet(){
  const s=getSheet(R.sid); if(!s) return (R.v='home', viewHome());
  const p=getProject(s.projectId) || {};
  const dp=dparts(s.date);
  const L=s.lines||[], d=L.filter(l=>l.type==='d');
  const done=d.filter(l=>l.done).length, post=L.filter(l=>l.post).length, dev=L.filter(l=>l.dev).length;
  let warn=0; if(ENDCHK) d.forEach(l=>{ if(analyzeEnding(l.text).warns.length) warn++; });
  const PAGES = pagesOf(L);
  const pi = Math.max(0, Math.min(R.page||0, PAGES.length-1));
  const PG = PAGES[pi];

  return topbar(`S#${s.scene||'–'}  C#${s.cut||'–'}`, `${p.name||''}${s.date?' · '+s.date:''}`,
      backBtn('backproject'), `<button class="iconbtn" data-act="theme">◐</button><button class="iconbtn" data-act="sheetmenu">⋯</button>`)
  + `<div class="content">
    <div class="paper">

      <div class="pgno">PAGE NO. <input data-act="inp" data-k="pageNo" value="${esc(s.pageNo||'')}"></div>

      <div class="ttl">&lt;&nbsp;<input class="wtitle" data-act="pinp" data-k="name" value="${esc(p.name||'')}" placeholder="작품명">&nbsp;&gt;
        <b>스크립트 용지 / SCRIP PAPER</b></div>

      <div class="credits">
        <label>감독 /<input data-act="pinp" data-k="dir" value="${esc(p.dir||'')}"></label>
        <label>스크립터 /<input data-act="pinp" data-k="scripter" value="${esc(p.scripter||'')}"></label>
      </div>

      <div class="dateline">
        <span>20</span><input class="w2" data-act="dpart" data-k="y" value="${dp.y}" inputmode="numeric" maxlength="2"><span>년</span>
        <input class="w2" data-act="dpart" data-k="m" value="${dp.m}" inputmode="numeric" maxlength="2"><span>월</span>
        <input class="w2" data-act="dpart" data-k="d" value="${dp.d}" inputmode="numeric" maxlength="2"><span>일</span>
        <label>촬영시작 :<input type="time" data-act="inp" data-k="start" value="${esc(s.start||'')}"><button class="nowbtn" data-act="stamp" data-k="start">지금</button></label>
        <label>끝 :<input type="time" data-act="inp" data-k="end" value="${esc(s.end||'')}"><button class="nowbtn" data-act="stamp" data-k="end">지금</button></label>
        <label class="grow">촬영장소 :<input data-act="inp" data-k="location" value="${esc(s.location||'')}"></label>
      </div>

      <!-- 1행: S# / C# / 컷 설명 / 날씨·광선 / MDEN·SOL -->
      <div class="grid r1">
        <div class="cell sc"><span class="lb">S#</span><input class="big" data-act="inp" data-k="scene" value="${esc(s.scene||'')}"></div>
        <div class="cell sc"><span class="lb">C#</span><input class="big" data-act="inp" data-k="cut" value="${esc(s.cut||'')}"></div>
        <div class="cell desc">${sta(s,'cutDesc','컷 설명',2)}</div>
        <div class="cell wx">
          <span class="lb">날씨 / 광선</span>
          <div class="wxrow">${chipsU('weather', s.weather||[], 'row')}
            <div class="tmp"><input type="number" data-act="inp" data-k="temp" value="${esc(s.temp||'')}" placeholder="–"><span>℃</span></div>
          </div>
          <span class="lb">조명</span>
          ${chipsU('light', s.light||[], 'row')}
        </div>
      </div>

      <!-- 2행: Film / Lens / Filter / Exp / Roll -->
      <div class="grid r2">
        ${['film','lens','filter','exp'].map(k=>`
          <div class="cell kv"><span class="lb">${FIELD_LABEL[k]}</span>${chipsU(k, s[k]||[], 'row')}</div>`).join('')}
        <div class="cell kv"><span class="lb">Roll</span><input data-act="inp" data-k="roll" value="${esc(s.roll||'')}"></div>
      </div>

      <!-- 상단 3단: 연결 / 카메라 위치 / 사운드 -->
      <div class="grid r3">
        <div class="cell">
          <h5>연결 / Continuity</h5>
          ${sta(s,'continuity','앞뒤 컷 연결 — 의상·소품·동선·시선 방향 등',2)}
          <span class="lb" style="margin-top:8px">특이사항</span>
          ${chipsU('flags', s.flags||[])}
        </div>
        <div class="cell">
          <h5>카메라 위치 &lt;Tracking / Fix / Pan&gt;</h5>
          ${chipsF('camPos', s.camPos||[])}
          ${sta(s,'camPosNote','카메라 움직임 · 앵글 · 사이즈',2)}
        </div>
        <div class="cell">
          <h5>사운드</h5>
          ${chipsU('sound', s.sound||[])}
          <h6>동시녹음</h6>
          ${sta(s,'soundNote','룸톤 · 후시 필요 컷 · 노이즈',2)}
          ${post?`<div class="postlist">후시 표시 ${post}개 — 대사 옆 [후] 버튼</div>`:''}
        </div>
      </div>

      <!-- 지문과 대사 : 페이지 전체 폭 -->
      <div class="grid full">
        <div class="cell script">
          <h5>지문과 대사 / Action &amp; Dialogue</h5>
          <div class="stat">
            <div class="s"><b>${d.length}</b><i>대사</i></div>
            <div class="s"><b>${done}</b><i>친 대사</i></div>
            <div class="s"><b>${post}</b><i>후시</i></div>
            <div class="s"><b>${dev}</b><i>불일치</i></div>
            <div class="s markbox" data-act="endchk"><b>${ENDCHK?warn:'–'}</b><i>어미반복</i></div>
          </div>
          <div class="scripthead">
            ${s.scriptName?`<span class="pill">${esc(s.scriptName)}</span>`:''}
            <button class="btn sm ${ENDCHK?'pri':''}" data-act="endchk" title="같은 문장 안에서 같은 어미가 반복되면 글자 위에 빨간 점">어미검사 ${ENDCHK?'ON':'OFF'}</button>
            ${L.length>0 ? `<select class="scenesel" data-act="pagego" title="필요한 씬으로 바로 이동">
              ${PAGES.map((p,i)=>`<option value="${i}" ${i===pi?'selected':''}>${esc((p.title||'앞부분').replace(/\s+/g,' ').slice(0,30))}</option>`).join('')}
            </select>` : ''}
            <div class="spacer"></div>
            <button class="btn sm" data-act="importfile">파일 불러오기</button>
            <button class="btn sm" data-act="paste">붙여넣기</button>
            <button class="btn sm" data-act="addline">＋ 대사</button>
          </div>
          <div class="lines" id="lines">${L.length? linesHTML(PG.lines)
            : `<div class="empty"><div class="big">＋</div><div>대본을 불러오거나 붙여넣으세요<br><span style="font-size:12px">PDF · 워드 · 한글(hwpx) · 페이지스 · 이미지</span></div></div>`}</div>
          ${L.length? pagerHTML(PAGES, pi, L.some(isScene)) : ''}
        </div>
      </div>

      <div class="paperfoot">
        <button class="btn" data-act="dupsheet">이 설정으로 다음 컷</button>
        <button class="btn dan" data-act="delsheet">이 용지 삭제</button>
      </div>
    </div>
  </div>
  ${micPanel()}`;
}

/* 지문은 기본적으로 대사 단락 안에 들어간다.
   앞에 대사가 있으면 그 대사 뒤에, 없으면 다음 대사 앞에 붙는다.
   씬 제목과, 사용자가 [떼기]로 분리한 것(attach:'none')만 독립 줄. */
const isScene = l => l.type==='a' && l.who==='씬';

/* 대본 페이지 분할 (A4 용지처럼 넘겨 보기)
   · 씬 표시(S#)가 있으면 씬 하나가 한 쪽
   · 씬 표시가 없는 대본이면 A4 한 장 분량(대사 LINES_PER_PAGE개)씩 끊는다 */
let LINES_PER_PAGE = parseInt(localStorage.getItem('carescript.pagelines')||'20',10);
function pagesOf(lines){
  const L=lines||[], pages=[];
  if(!L.length) return [{title:null, lines:[]}];

  if(L.some(isScene)){
    let cur=null;
    L.forEach(l=>{
      if(isScene(l)){ cur={title:l.text, lines:[l]}; pages.push(cur); return; }
      if(!cur){ cur={title:null, lines:[]}; pages.push(cur); }
      cur.lines.push(l);
    });
    return pages.length?pages:[{title:null, lines:[]}];
  }

  let cur={title:null, lines:[]}, cnt=0;
  L.forEach(l=>{
    if(cnt>=LINES_PER_PAGE && l.type==='d'){ pages.push(cur); cur={title:null, lines:[]}; cnt=0; }
    cur.lines.push(l);
    if(l.type==='d') cnt++;
  });
  if(cur.lines.length) pages.push(cur);
  // 쪽 이름 = 그 쪽 첫 대사
  pages.forEach(p=>{
    const f=p.lines.find(x=>x.type==='d') || p.lines[0];
    if(f) p.title = (f.who?f.who+' — ':'') + f.text.replace(/^\([^)]*\)\s*/,'').slice(0,20);
  });
  return pages;
}
const pageOfLine = (lines,id)=> pagesOf(lines).findIndex(p=>p.lines.some(l=>l.id===id));
function groupLines(L){
  const rows=[]; let down=[];
  const lastRow = ()=> rows.length ? rows[rows.length-1] : null;
  const flushDown = ()=>{ down.forEach(x=>rows.push({main:x, before:[], after:[], loose:true})); down=[]; };

  L.forEach(l=>{
    const dir = l.type==='a' && !isScene(l) && l.attach!=='none';
    if(dir){
      const prev = lastRow();
      if(l.attach==='down'){ down.push(l); return; }
      if(l.attach==='up' || (l.attach==null && prev && prev.main.type==='d')){
        if(prev && prev.main.type==='d'){ prev.after.push(l); return; }
      }
      down.push(l); return;                       // 앞에 대사가 없으면 다음 대사 앞에
    }
    if(l.type==='d'){ rows.push({main:l, before:down, after:[]}); down=[]; return; }
    flushDown();                                   // 씬 제목·분리된 지문
    rows.push({main:l, before:[], after:[], loose:true});
  });
  flushDown();
  return rows;
}
function linesHTML(L){ return groupLines(L).map(r=>lineHTML(r)).join(''); }

function stageHTML(l){
  return `<div class="stage" data-id="${l.id}">${esc(l.text)}<button class="tiny" data-act="detach" data-v="${l.id}" title="따로 떼기">떼기</button></div>`;
}
/* 지문은 대사와 같은 단락 안에서 이어져 보이게 (CSS .stage 참고) */
/* 지문 단락 분리/합치기 */

function lineHTML(row){
  const l = row.main, before = row.before||[], after = row.after||[];
  const a = l.type==='d' ? analyzeEnding(l.text) : {marks:[],warns:[]};
  const editing = R.editing===l.id;
  const isDir = l.type==='a';
  const scene = isScene(l);
  return `<div class="ln ${isDir?'dir':''} ${scene?'scene':''} ${l.done?'done':''} ${l.dev?'dev':''}" data-id="${l.id}">
    <div class="who" data-act="editwho" data-v="${l.id}">${esc(l.who|| (isDir?'지문':'?'))}</div>
    <div class="body">
      ${before.map(stageHTML).join('')}
      ${editing
        ? `<textarea data-line="${l.id}" data-act="linetext">${esc(l.text)}</textarea>
           <div class="row" style="margin-top:6px;gap:6px"><button class="btn sm pri" data-act="linedone">확인</button><button class="btn sm dan" data-act="delline" data-v="${l.id}">삭제</button></div>`
        : `<div class="tx" data-act="editline" data-v="${l.id}">${markedHTML(l.text, a.marks)}</div>`}
      ${after.map(stageHTML).join('')}
      ${a.warns.length?`<div class="warnrow">● ${a.warns.map(w=>esc(w)).join(' · ')}<button class="btn sm" data-act="fixhint" data-v="${l.id}">고치기</button></div>`:''}
      ${l.dev?`<div class="devrow">실제 친 대사 : “${esc(l.dev.spoken)}” <b>(일치율 ${Math.round(l.dev.score*100)}%)</b>
        <button class="btn sm" data-act="applydev" data-v="${l.id}">대본에 반영</button>
        <button class="btn sm" data-act="cleardev" data-v="${l.id}">무시</button></div>`:''}
      ${l.note?`<div class="note">${esc(l.note)}</div>`:''}
    </div>
    <div class="acts">
      ${isDir
        ? (scene ? '' : `<button data-act="attachup" data-v="${l.id}" title="대사 단락 안으로 넣기">합치기</button>`)
        : `<button class="${l.done?'on':''}" data-act="toggledone" data-v="${l.id}" title="친 대사">${l.done?'✓':'○'}</button>
           <button class="${l.post?'on':''}" data-act="togglepost" data-v="${l.id}" title="후시녹음">후</button>`}
      <button data-act="linenote" data-v="${l.id}" title="메모">메모</button>
    </div>
  </div>`;
}

function pagerHTML(pages, pi, hasScene){
  const n=pages.length;
  const label = p => (p.title||'').replace(/\s+/g,' ').slice(0,26) || '앞부분';
  return `<div class="pager">
    <button class="pgbtn" data-act="pageprev" ${pi<=0?'disabled':''}>‹ 이전</button>
    <select class="pgsel" data-act="pagego">${
      pages.map((p,i)=>`<option value="${i}" ${i===pi?'selected':''}>${i+1}. ${esc(label(p))}</option>`).join('')
    }</select>
    <span class="pgno2"><b>${pi+1}</b> / ${n} 쪽</span>
    <button class="pgbtn" data-act="pagenext" ${pi>=n-1?'disabled':''}>다음 ›</button>
  </div>
  ${hasScene ? `<div class="pghint">씬(S#) 단위로 나눴습니다</div>`
             : `<div class="pghint">씬 표시가 없는 대본이라 <b>한 쪽에 대사 ${LINES_PER_PAGE}개</b>씩 나눴습니다
                  <button class="tinybtn" data-act="pagelines" data-v="-5">－</button>
                  <button class="tinybtn" data-act="pagelines" data-v="5">＋</button></div>`}`;
}

function micPanel(){
  return `<div class="mic">
    <div class="r1">
      <button class="btnmic ${Voice.on?'on':''}" id="micbtn" data-act="mic">${Voice.on?'듣는중':'음성'}</button>
      <div class="live">
        <div class="lb">음성인식 ${Voice.on?'· 켜짐':'· 꺼짐'}</div>
        <div class="tx ${Voice.interim?'i':''}" id="miclive">${esc(Voice.interim || Voice.last || '버튼을 누르면 배우가 친 대사에 자동으로 밑줄이 그어집니다')}</div>
      </div>
      <button class="iconbtn" data-act="micinfo">?</button>
    </div>
    <div class="r2"><span>정확도</span>
      <input type="range" min="40" max="95" value="${Voice.thr*100}" data-act="thr">
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
      toast('음성인식 시작 — 대사를 치면 자동으로 밑줄');
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
    if(!best || best.sc < this.thr*0.6){ toast('매칭 안 됨: “'+(alts[0]||'').slice(0,18)+'”'); return; }
    const l = best.line;
    l.done = true;
    if(best.sc >= this.thr){ l.dev=null; }
    else { l.dev = { spoken, score:best.sc }; }
    this.cursor = best.i;
    touch(s); save();
    const pg = pageOfLine(s.lines, l.id);
    if(pg>=0 && pg!==(R.page||0)){ go({page:pg}); } else { refreshLines(); }
    const el = $(`.ln[data-id="${l.id}"]`);
    if(el){ el.scrollIntoView({block:'center',behavior:'smooth'}); el.animate([{opacity:.3},{opacity:1}],{duration:700}); }
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
  const L=s.lines||[];
  const pages=pagesOf(L);
  const pi=Math.max(0, Math.min(R.page||0, pages.length-1));
  c.innerHTML = linesHTML(pages[pi].lines);

  // 통계 갱신 (전체 기준)
  const d=L.filter(l=>l.type==='d');
  const done=d.filter(l=>l.done).length, post=L.filter(l=>l.post).length, dev=L.filter(l=>l.dev).length;
  let warn=0; if(ENDCHK) d.forEach(l=>{ if(analyzeEnding(l.text).warns.length) warn++; });
  const b=$$('.cell.script .stat .s b');
  if(b.length>=5){ b[0].textContent=d.length; b[1].textContent=done; b[2].textContent=post;
                   b[3].textContent=dev; b[4].textContent=ENDCHK?warn:'–'; }
  // 사운드 칸의 후시 표시 개수
  const pl=$('.postlist'); if(pl) pl.textContent=`후시 표시 ${post}개 — 대사 옆 [후] 버튼`;
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
function newSheetFrom(base){
  const s = {
    id:uid(), projectId:R.pid, createdAt:now(), updatedAt:now(), deleted:false,
    pageNo: base? String((parseInt(base.pageNo,10)||0)+1) : '1',
    date: base?.date || today(), start: base? '' : hhmm(), end:'',
    location: base?.location||'',
    scene: base?.scene||'', cut: base? String((parseInt(base.cut,10)||0)+1) : '', cutDesc:'',
    temp: base?.temp||'', roll: base?.roll||'',
    continuity:'', camPosNote:'', soundNote:'', notes:'',
    scriptName: base?.scriptName||'',
    lines:[]
  };
  [...MULTI, 'camPos'].forEach(k=> s[k] = base ? [...(base[k]||[])] : []);
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
    case 'opensheet': go({v:'sheet',sid:v,tab:'script',editing:null,page:0}); Voice.cursor=-1; break;
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
        {label:'이름 · 감독 · 스크립터 수정', run:async()=>{
          const r=await ask({title:'프로젝트 수정',fields:[{k:'name',label:'작품 제목',value:p.name},{k:'dir',label:'감독 / 팀',value:p.dir||''}]});
          if(r?.name){ p.name=r.name; p.dir=r.dir; touch(p); save(); render(); }}},
        {label:'폴더 이동', run:async()=>{
          const r=await ask({title:'폴더 이동',fields:[{k:'folderId',label:'폴더',type:'select',value:p.folderId||'',
            opts:[{v:'',t:'미분류'},...alive(DB.folders).map(x=>({v:x.id,t:x.name}))]}]});
          if(r){ p.folderId=r.folderId||null; touch(p); save(); render(); }}},
        {label:'CSV 내보내기', run:()=>exportCSV(p)},
        {label:'프로젝트 삭제', dan:true, run:async()=>{
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
        {label:'이 설정으로 다음 컷', run:()=>{ const ns=newSheetFrom(s); go({v:'sheet',sid:ns.id,tab:'info'}); }},
        {label:'이 용지 CSV', run:()=>exportCSV(getProject(s.projectId), s.id)},
        {label:'밑줄 전체 해제', run:()=>{ (s.lines||[]).forEach(l=>{l.done=false;l.dev=null;}); touch(s); save(); render(); }},
        {label:'삭제', dan:true, run:async()=>{ if(await confirmBox('이 기록 삭제?','되돌릴 수 없습니다.')){ s.deleted=true; touch(s); save(); go({v:'project',sid:null}); }}}
      ]); break;
    case 'stamp': s[t.dataset.k]=hhmm(); touch(s); save(); render(); break;
    case 'theme': { const n=document.documentElement.dataset.theme==='dark'?'light':'dark';
      document.documentElement.dataset.theme=n; localStorage.setItem('carescript.theme',n); break; }


    /* --- 멀티셀렉트 --- */
    case 'chip': {
      const arr = s[f] ||= [];
      const i=arr.indexOf(v); i<0?arr.push(v):arr.splice(i,1);
      touch(s); save(); t.classList.toggle('on'); break; }
    case 'delpreset': {
      const usedIn = alive(DB.sheets).filter(x=>(x[f]||[]).includes(v));
      const ok = await confirmBox(`'${v}' 항목 삭제`,
        usedIn.length ? `이 항목을 쓰고 있는 용지 ${usedIn.length}장에서도 함께 빠집니다.` : '목록에서 지웁니다.');
      if(!ok) break;
      DB.presets[f] = (DB.presets[f]||[]).filter(x=>x!==v);
      usedIn.forEach(x=>{ x[f]=x[f].filter(y=>y!==v); touch(x); });
      save(); render(); toast(`'${v}' 삭제됨`);
      break; }
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
    case 'attachup': {
      const l=(s.lines||[]).find(x=>x.id===v); if(!l) break;
      l.attach=null; touch(s); save(); refreshLines(); break; }   // 자동 배치로 되돌림
    case 'detach': {
      const l=(s.lines||[]).find(x=>x.id===v); if(!l) break;
      l.attach='none'; l.who='지문'; touch(s); save(); refreshLines(); break; }
    case 'pagelines': {
      LINES_PER_PAGE = Math.max(5, Math.min(80, LINES_PER_PAGE + (+v)));
      localStorage.setItem('carescript.pagelines', LINES_PER_PAGE);
      go({page:0}); toast(`한 쪽에 대사 ${LINES_PER_PAGE}개`); break; }
    case 'pageprev': go({page:Math.max(0,(R.page||0)-1)}); break;
    case 'pagenext': go({page:(R.page||0)+1}); break;
    case 'endchk': ENDCHK=!ENDCHK; localStorage.setItem('carescript.endchk', ENDCHK?'1':'0');
      render(); toast(ENDCHK?'어미 반복 검사 켜짐':'어미 반복 검사 꺼짐'); break;
    case 'resetdone': (s.lines||[]).forEach(l=>{l.done=false;l.dev=null;}); Voice.cursor=-1; touch(s); save(); refreshLines(); break;

    /* --- 대본 가져오기 --- */
    case 'paste': {
      const r=await ask({title:'대본 붙여넣기', desc:'“이름: 대사” 또는 시나리오 형식(이름 줄 + 대사 줄)을 자동 인식합니다. 파일이면 파일 불러오기를 쓰세요.',
        fields:[{k:'raw',label:'대본 원문',type:'textarea',rows:12,ph:'준호: 어제 내가 작업을 해서, 오늘 일어나서 피곤해\n미영: 그러게 말이야'}], ok:'불러오기'});
      if(r?.raw){
        const parsed=parseScript(r.raw);
        if(!parsed.length){ toast('인식된 대사가 없어요','warn'); break; }
        if((s.lines||[]).length && !(await confirmBox('기존 대본 교체?',`현재 ${s.lines.length}줄이 있습니다.`,'교체'))) break;
        s.lines=parsed; touch(s); save(); go({tab:'script',editing:null,page:0}); toast(`${parsed.length}줄 불러옴`,'ok');
      }
      break; }
    case 'importfile': {
      const inp=document.createElement('input'); inp.type='file'; inp.accept=ACCEPT;
      inp.onchange=()=>{ const file=inp.files[0]; if(file) importDocument(file); };
      inp.click(); break; }

    /* --- 음성 --- */
    case 'mic': Voice.toggle(); break;
    case 'micinfo': modal(`<h3>음성인식 사용법</h3>
      <div class="desc">현장에서 아이패드를 배우 쪽에 두고 켜 두세요.</div>
      <div class="card" style="line-height:1.8;font-size:14px">
        1. 대본을 먼저 불러옵니다.<br>
        2. 마이크 버튼 ON → 배우가 대사를 치면 <b>일치하는 줄에 자동 밑줄</b>.<br>
        3. 대본과 다르게 쳤으면 <b style="color:var(--ac2)">대본불일치</b>로 표시되고 실제 친 말이 함께 남습니다.<br>
        4. 버튼으로 <b style="color:var(--post)">후시 필요</b> 표시 → 사운드 항목에 자동 반영.<br>
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
        scriptName:'3고_샘플.fdx',notes:'배우 애드립 있었음 — 후시 검토',lines:parseScript(raw)};
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
  if(act==='inp'){ const s=getSheet(R.sid); if(!s) return; s[t.dataset.k]=t.value; touch(s); save();
    if(t.tagName==='TEXTAREA' && t.closest('.paper')) autoGrow(t); }
  else if(act==='pinp'){ const s=getSheet(R.sid); const p=s&&getProject(s.projectId); if(!p) return; p[t.dataset.k]=t.value; touch(p); save(); }
  else if(act==='dpart'){
    const s=getSheet(R.sid); if(!s) return;
    const g=k=>{ const el=document.querySelector(`[data-act="dpart"][data-k="${k}"]`); return (el?el.value:'').replace(/\D/g,''); };
    const y=g('y'), m=g('m'), d=g('d');
    if(y.length===2 && m.length>=1 && d.length>=1) s.date=`20${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    touch(s); save();
  }

  else if(act==='linetext'){
    const s=getSheet(R.sid); const l=s.lines.find(x=>x.id===t.dataset.line);
    if(l){ l.text=t.value; touch(s); save(); autoGrow(t); }
  }
  else if(act==='search'){ R.q=t.value; clearTimeout(window.__st); window.__st=setTimeout(()=>{ const c=$('.slist')||$('.empty'); render(); const i=$('[data-act="search"]'); i&&(i.focus(),i.setSelectionRange(i.value.length,i.value.length)); },350); }
  else if(act==='pagego'){ go({page:+t.value}); }
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
        <div style="color:var(--warn);font-weight:800;font-size:14px;margin-bottom:6px">서버 준비가 아직 안 됐어요</div>
        <div style="font-size:13px;line-height:1.7;color:var(--tx2)">
          케어센터 공유용 테이블이 아직 없습니다. Supabase 대시보드 → <b>SQL Editor</b> 에서
          <b>supabase-설정.sql</b> 파일 내용을 한 번만 실행하면 바로 연결됩니다.<br>
          <span style="color:var(--tx3)">그 전까지는 이 기기에만 저장되고, 기록이 사라지지는 않습니다.</span>
        </div>
      </div>`:''}
      <div class="card" style="padding:12px">
        <div style="font-size:12px;color:var(--tx3);font-weight:700;margin-bottom:6px">현재 연결</div>
        <div style="font-size:15px;font-weight:700;color:${Sync.state==='on'?'var(--ok)':'var(--warn)'}">
          ${Sync.backend==='hub'?'현장 서버 (LAN)':Sync.backend==='sb'?'케어센터 서버':'이 기기에만 저장'}
          <span style="font-weight:500;color:var(--tx3);font-size:12px">${Sync.backend==='off'?'':Sync.state==='on'?' · 연결됨':' · 연결 안 됨'}</span>
        </div>
        ${Sync.backend==='hub'?`<div style="font-size:12px;color:var(--tx3);margin-top:4px">${esc(Sync.hub)}</div>`:''}
      </div>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn" data-x="auto">자동 감지</button>
        <button class="btn" data-x="sb">케어센터 서버로</button>
        <button class="btn" data-x="theme">${theme==='dark'?'밝은 화면':'어두운 화면'}</button>
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
        <button class="btn" data-x="backup">전체 백업(JSON)</button>
        <button class="btn" data-x="restore">백업 복원</button>
      </div>
      <div style="font-size:12px;color:var(--tx3)">프로젝트 ${alive(DB.projects).length} · 용지 ${alive(DB.sheets).length} · 버전 ${typeof BUILD!=='undefined'?BUILD:'-'}</div>
      <button class="btn" data-x="hardreload">최신 버전으로 다시 불러오기</button>
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
      case 'hardreload': {
        if('caches' in window){ try{ (await caches.keys()).forEach(k=>caches.delete(k)); }catch(_){} }
        location.replace(location.pathname+'?r='+Date.now());
        break; }
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

/* 파일을 화면에 끌어다 놓아도 대본으로 불러오기 */
document.addEventListener('dragover', e=>{
  if(!e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return;
  e.preventDefault(); document.body.classList.add('dropping');
});
document.addEventListener('dragleave', e=>{ if(e.relatedTarget===null) document.body.classList.remove('dropping'); });
document.addEventListener('drop', e=>{
  if(!e.dataTransfer || !e.dataTransfer.files.length) return;
  e.preventDefault(); document.body.classList.remove('dropping');
  if(R.v!=='sheet'){ toast('기록을 먼저 연 뒤 파일을 놓아주세요','warn'); return; }
  importDocument(e.dataTransfer.files[0]);
});
console.log('%c케어스크립트 ready','color:#ffb02e;font-weight:bold');
