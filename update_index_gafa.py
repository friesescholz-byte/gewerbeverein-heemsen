import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_buttons = '''<div class="gafa-buttons">
                        <a href="gafa.html" class="btn btn-primary btn-large">Jetzt Platz auf der Gafa sichern</a>
                    </div>'''

match = re.search(r'<div class="gafa-buttons">.*?</div>', text, re.DOTALL)
if match:
    new_text = text[:match.start()] + new_buttons + text[match.end():]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('Buttons replaced via regex successfully!')
else:
    print('Could not find gafa-buttons div at all.')
