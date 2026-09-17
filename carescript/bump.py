#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""배포할 때마다 파일 버전을 바꿔서 브라우저가 옛 파일을 붙잡지 못하게 한다."""
import re, datetime, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
build = datetime.datetime.now().strftime('%y%m%d.%H%M')

h = open('index.html', encoding='utf-8').read()
h = re.sub(r'href="app\.css(\?v=[^"]*)?"', f'href="app.css?v={build}"', h)
h = re.sub(r'src="app\.js(\?v=[^"]*)?"',  f'src="app.js?v={build}"',  h)
open('index.html', 'w', encoding='utf-8').write(h)

j = open('app.js', encoding='utf-8').read()
if re.search(r"^const BUILD = '.*';$", j, re.M):
    j = re.sub(r"^const BUILD = '.*';$", f"const BUILD = '{build}';", j, flags=re.M)
else:
    j = j.replace("'use strict';", f"'use strict';\nconst BUILD = '{build}';", 1)
open('app.js', 'w', encoding='utf-8').write(j)
print(build)
