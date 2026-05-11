with open('mitglied-werden.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace membership related stuff with GAFA
new_text = text.replace('<title>Mitglied werden', '<title>GAFA Anmeldung')
new_text = new_text.replace('<h1>Mitglied im Gewerbeverein werden</h1>', '<h1>Platz auf der GAFA sichern</h1>')
new_text = new_text.replace('Werden Sie Teil eines starken, regionalen Netzwerks.', 'Präsentieren Sie Ihr Unternehmen auf der größten regionalen Gewerbeschau.')
new_text = new_text.replace('Schritt 1: PDF herunterladen', 'Schritt 1: Anmeldung herunterladen')
new_text = new_text.replace('Schritt 2: Ausfüllen', 'Schritt 2: Standplatz wählen & Ausfüllen')
new_text = new_text.replace('Schritt 3: Antrag hochladen', 'Schritt 3: Anmeldung hochladen')
new_text = new_text.replace('Mitgliedsantrag', 'GAFA-Anmeldung')
new_text = new_text.replace('den Gewerbeverein Heemsen', 'die GAFA')
new_text = new_text.replace('Mitgliedschaft', 'Standplatz')
new_text = new_text.replace('https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/beitrittserklaerung_gewerbeverein_heemsen_04_2023%5B737%5D%5B230_5843009213952439%5D.pdf', '#')

# Inject gallery before footer
gallery_html = '''
    <!-- GAFA Gallery Section -->
    <section class="section bg-light" style="padding: 80px 0;">
        <div class="container">
            <h2 style="text-align: center; font-family: 'Outfit', sans-serif; font-size: 2.5rem; margin-bottom: 40px; color: var(--secondary-color);">Eindrücke der letzten GAFA</h2>
            <div class="gafa-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <img src="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/gafa-1153x568.jpg" alt="GAFA Impression" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <img src="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/heemsen.jpg" alt="GAFA Impression" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <img src="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/Rohrsen-1.jpeg" alt="GAFA Impression" style="width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
            </div>
        </div>
    </section>
'''
new_text = new_text.replace('</main>', '</main>\n' + gallery_html)

with open('gafa.html', 'w', encoding='utf-8') as f:
    f.write(new_text)
