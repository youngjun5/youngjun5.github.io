#!/usr/bin/env python3
"""케어센터 허브 전역 검색용 색인 생성.

각 방의 데이터에서 '제목 + 짧은 설명'만 뽑아 search-index.json 으로 만든다.
방 데이터(gear_data.json, sentences.json, torah_data.json)가 바뀌면 다시 돌릴 것:
    python3 tools/build_search_index.py
일정(팀 달력)은 Supabase에서 실시간으로 읽으므로 여기 포함하지 않는다.
"""
import json, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEB = re.compile(r'[֐-׿\u200F\u200E]+')
out = []


def add(room, url, title, sub=''):
    title = (title or '').strip()
    if not title:
        return
    out.append({'r': room, 'u': url, 't': title[:90], 's': (sub or '').strip()[:80]})


def load(path):
    p = os.path.join(BASE, path)
    if not os.path.exists(p):
        print('  (없음) ' + path, file=sys.stderr)
        return None
    with open(p, encoding='utf-8') as f:
        return json.load(f)


# ── 장비 ──────────────────────────────────────────────
gear = load('gear/gear_data.json') or []
for g in gear:
    bits = [b for b in (g.get('cat'), g.get('loc'), g.get('status')) if b]
    add('장비', 'gear/', g.get('name'), ' · '.join(bits))

# ── 토라포션 ──────────────────────────────────────────
torah = load('torah/torah_data.json') or []
for t in torah:
    title = HEB.sub('', t.get('title', ''))
    title = re.sub(r'\(\s*[/\s]*\)', '', title)
    title = re.sub(r'\s{2,}', ' ', title).strip(' -—')
    m = re.search(r'토라 본문:</strong>\s*([^<]+)', t.get('html', ''))
    ref = re.sub(r'\s+', ' ', m.group(1)).strip() if m else t.get('cat', '')
    add('토라포션', 'torah/', title, ref)

# ── 영어 공부방 ───────────────────────────────────────
eng = load('english/sentences.json') or {}
for pack in eng.get('packs', []):
    for mod in pack.get('modules', []):
        for it in mod.get('items', []):
            add('영어 공부방', 'english/', it.get('en'), it.get('ko'))

# ── 말하기 훈련 (주제 목록) ────────────────────────────
imp = os.path.join(BASE, 'impromptu/index.html')
if os.path.exists(imp):
    src = open(imp, encoding='utf-8').read()
    m = re.search(r'var DATA = (\{.*?\});', src, re.S)
    if m:
        d = json.loads(m.group(1))
        for key, c in d.get('cats', {}).items():
            for t in c['topics']:
                add('말하기 훈련', 'impromptu/', t, c['label'])
        for t in d.get('deep', []):
            add('말하기 훈련', 'impromptu/', t['ko'], t.get('en', ''))

dst = os.path.join(BASE, 'search-index.json')
with open(dst, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

by = {}
for o in out:
    by[o['r']] = by.get(o['r'], 0) + 1
print('색인 %d건 → %s (%d KB)' % (len(out), os.path.relpath(dst, BASE), os.path.getsize(dst) // 1024))
for k, v in sorted(by.items(), key=lambda x: -x[1]):
    print('  %-12s %d' % (k, v))
