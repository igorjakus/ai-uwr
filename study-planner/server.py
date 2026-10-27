#!/usr/bin/env python3
"""Local study planner, Python standard library only."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from datetime import datetime
import json
import os
import argparse

ROOT = Path(__file__).resolve().parent
STATE = ROOT / 'data/state.json'

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/state':
            payload = (STATE if STATE.exists() else ROOT / 'seed.json').read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(payload)
        elif self.path.startswith('/data/'):
            self.send_error(404)
        else:
            super().do_GET()

    def do_PUT(self):
        if self.path != '/api/state':
            self.send_error(404)
            return
        if self.headers.get('Origin') not in (None, f'http://{self.headers.get("Host")}'):
            self.send_error(403)
            return
        try:
            size = int(self.headers.get('Content-Length', 0))
            if not 0 < size <= 2_000_000:
                raise ValueError('Nieprawidłowy rozmiar danych')
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict) or data.get('version') != 1 or any(not isinstance(data.get(k), list) for k in ('courses', 'requirements', 'catalog', 'tasks')):
                raise ValueError('Nieprawidłowy format planera')
            STATE.parent.mkdir(exist_ok=True)
            if STATE.exists():
                backup = STATE.parent / 'backups'
                backup.mkdir(exist_ok=True)
                (backup / (datetime.now().strftime('%Y%m%d-%H%M%S-%f') + '.json')).write_bytes(STATE.read_bytes())
                for old in sorted(backup.glob('*.json'))[:-30]:
                    old.unlink()
            temp = STATE.with_suffix('.tmp')
            temp.write_text(json.dumps(data, ensure_ascii=False, indent=2))
            temp.replace(STATE)
            self.send_response(204)
            self.end_headers()
        except (ValueError, TypeError, OSError) as error:
            self.send_error(400, str(error))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    os.chdir(ROOT)
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Planer UWr: http://127.0.0.1:{args.port}', flush=True)
    server.serve_forever()
