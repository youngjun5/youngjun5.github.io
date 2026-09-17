#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
케어스크립트 현장 동기화 서버
 - 맥 1대에서 실행하면 같은 와이파이의 다른 맥 / 아이패드가 접속해 실시간 공유
 - 인터넷 불필요 (현장 LAN 또는 아이폰 핫스팟에서도 동작)
"""
import json, os, socket, threading, time, queue, webbrowser, sys
from urllib.parse import unquote
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, 'carescript-data.json')
PORT = int(os.environ.get('CS_PORT', '7788'))

LOCK = threading.Lock()
CLIENTS = []          # SSE 구독자 큐
STATE = {'rev': 0, 'db': {'folders': [], 'projects': [], 'sheets': []}}

MIME = {'.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
        '.js':'application/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
        '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon'}

def load_state():
    global STATE
    if os.path.exists(DATA):
        try:
            with open(DATA, encoding='utf-8') as f:
                STATE = json.load(f)
            STATE.setdefault('rev', 0)
            STATE.setdefault('db', {'folders': [], 'projects': [], 'sheets': []})
        except Exception as e:
            print('데이터 읽기 실패(새로 시작):', e)

def save_state():
    tmp = DATA + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(STATE, f, ensure_ascii=False)
    os.replace(tmp, DATA)

def merge(remote):
    """엔티티 단위 last-write-wins 병합. 변경 있으면 True"""
    changed = False
    db = STATE['db']
    for key in ('folders', 'projects', 'sheets'):
        mine = db.setdefault(key, [])
        index = {x.get('id'): i for i, x in enumerate(mine)}
        for r in remote.get(key, []) or []:
            rid = r.get('id')
            if rid is None:
                continue
            if rid not in index:
                mine.append(r); index[rid] = len(mine) - 1; changed = True
            else:
                m = mine[index[rid]]
                if (r.get('updatedAt') or '') > (m.get('updatedAt') or ''):
                    mine[index[rid]] = r; changed = True
    return changed

def broadcast(frm):
    msg = json.dumps({'rev': STATE['rev'], 'from': frm})
    for q in list(CLIENTS):
        try: q.put_nowait(msg)
        except Exception: pass

def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80)); ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

class H(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    def log_message(self, *a): pass

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code); self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body))); self._cors(); self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/api/state':
            with LOCK: self._json(STATE)
            return
        if path == '/api/events':
            q = queue.Queue(maxsize=50); CLIENTS.append(q)
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream; charset=utf-8')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self._cors(); self.end_headers()
            try:
                self.wfile.write(b'retry: 3000\n\n'); self.wfile.flush()
                while True:
                    try:
                        msg = q.get(timeout=20)
                        self.wfile.write(('data: ' + msg + '\n\n').encode('utf-8'))
                    except queue.Empty:
                        self.wfile.write(b': ping\n\n')
                    self.wfile.flush()
            except Exception:
                pass
            finally:
                if q in CLIENTS: CLIENTS.remove(q)
            return
        # 정적 파일
        rel = 'index.html' if path in ('/', '') else unquote(path).lstrip('/')
        full = os.path.normpath(os.path.join(ROOT, rel))
        if not full.startswith(ROOT) or not os.path.isfile(full):
            self.send_response(404); self.send_header('Content-Length', '0'); self.end_headers(); return
        ext = os.path.splitext(full)[1].lower()
        with open(full, 'rb') as f: body = f.read()
        self.send_response(200)
        self.send_header('Content-Type', MIME.get(ext, 'application/octet-stream'))
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-cache')
        self._cors(); self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.split('?')[0] != '/api/state':
            self._json({'error': 'not found'}, 404); return
        n = int(self.headers.get('Content-Length') or 0)
        try:
            payload = json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            self._json({'error': 'bad json'}, 400); return
        frm = payload.get('from', '')
        with LOCK:
            if merge(payload.get('db') or {}):
                STATE['rev'] += 1
                try: save_state()
                except Exception as e: print('저장 실패:', e)
                broadcast(frm)
            snapshot = dict(STATE)
        self._json(snapshot)

def main():
    load_state()
    srv = ThreadingHTTPServer(('0.0.0.0', PORT), H)
    srv.daemon_threads = True
    ip, host = lan_ip(), socket.gethostname().replace('.local', '')
    url = f'http://localhost:{PORT}/'
    print('\n' + '=' * 54)
    print('  🎬  케어스크립트 서버 실행 중')
    print('=' * 54)
    print(f'  이 맥에서      : {url}')
    print(f'  다른 맥/아이패드: http://{ip}:{PORT}/')
    print(f'                  http://{host}.local:{PORT}/')
    print(f'  데이터 파일     : {DATA}')
    print('\n  ※ 같은 와이파이에 연결되어 있어야 합니다.')
    print('  ※ 종료하려면 이 창에서 Control + C\n')
    if '--no-open' not in sys.argv:
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\n종료합니다.')

if __name__ == '__main__':
    main()
