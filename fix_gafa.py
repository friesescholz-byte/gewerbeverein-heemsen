import re

with open('gafa.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace membership related stuff with GAFA safely
new_text = re.sub(r'<title>.*?</title>', '<title>GAFA Anmeldung - Gewerbeverein Heemsen</title>', text)
new_text = re.sub(r'<h1.*?>.*?</h1>', '<h1 class="page-title">Platz auf der GAFA sichern</h1>', new_text, count=1)
new_text = re.sub(r'<p class="hero-subtitle".*?>.*?</p>', '<p class="hero-subtitle" style="color: white; font-size: 1.2rem; margin-top: 15px; opacity: 0.9;">Präsentieren Sie Ihr Unternehmen auf der größten regionalen Gewerbeschau.</p>', new_text, count=1)

new_text = new_text.replace('Schritt 1: Antrag (PDF) herunterladen', 'Schritt 1: Anmeldung herunterladen')
new_text = new_text.replace('Schritt 2: Ausfüllen', 'Schritt 2: Standplatz wählen & Ausfüllen')
new_text = new_text.replace('Schritt 3: Antrag hochladen', 'Schritt 3: Anmeldung hochladen')
new_text = new_text.replace('Mitgliedsantrag', 'GAFA-Anmeldung')
new_text = new_text.replace('den Gewerbeverein Heemsen', 'die GAFA')
new_text = new_text.replace('Mitgliedschaft', 'Standplatz')
new_text = new_text.replace('https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/beitrittserklaerung_gewerbeverein_heemsen_04_2023%5B737%5D%5B230_5843009213952439%5D.pdf', '#')

with open('gafa.html', 'w', encoding='utf-8') as f:
    f.write(new_text)
print('GAFA html fixed!')
