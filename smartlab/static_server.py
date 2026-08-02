#!/usr/bin/env python3
import http.server
import os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8190
STATIC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    httpd = http.server.HTTPServer(('0.0.0.0', PORT), CORSHandler)
    print(f"Serving {STATIC_DIR} on port {PORT}")
    sys.stdout.flush()
    httpd.serve_forever()
