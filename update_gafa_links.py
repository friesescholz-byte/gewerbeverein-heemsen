import glob

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Update navigation links
    html = html.replace('href="index.html#gafa"', 'href="gafa.html"')
    html = html.replace('href="#gafa"', 'href="gafa.html"')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Updated GAFA links in {file}")
