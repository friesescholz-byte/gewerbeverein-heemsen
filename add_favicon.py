import os
import glob

favicon_tag = '''
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/GH_Logo_hochaufloesend_transparent.png">
'''

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    if 'rel="icon"' not in html:
        html = html.replace('</head>', favicon_tag + '</head>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Added favicon to {file}")
    else:
        print(f"Favicon already exists in {file}")
