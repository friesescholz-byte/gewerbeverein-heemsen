function getDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Gewerbeverein Heemsen</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #f8f9fa; margin:0; color:#333; }
        header { background: #333333; color: white; padding: 20px 40px; display:flex; justify-content:space-between; align-items:center;}
        header h2 { margin: 0; color: white; }
        .container { max-width: 1000px; margin: 40px auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);}
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; color: #666;}
        .btn { background: #c1121f; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; text-decoration:none; font-weight: 500; transition: 0.2s;}
        .btn:hover { background: #9c0e18; }
        .btn-small { padding: 6px 12px; font-size: 13px; }
        .btn-outline { background: transparent; border: 1px solid #ccc; color: #333; }
        .btn-outline:hover { background: #f1f1f1; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        
        /* Tabs */
        .tabs { display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .tab-btn { background: none; border: none; font-size: 18px; font-weight: 600; color: #888; cursor: pointer; padding: 10px 20px; transition: 0.2s; border-radius: 6px; }
        .tab-btn:hover { color: #333; background: #f1f1f1; }
        .tab-btn.active { color: #c1121f; background: rgba(193,18,31,0.05); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }

        /* Modal */
        .modal { display:none; position:fixed; top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7); align-items:center; justify-content:center; z-index: 1000;}
        .modal-content { background: white; padding: 40px; border-radius: 16px; width: 600px; max-height: 90vh; overflow-y: auto;}
        
        .form-group { margin-bottom: 24px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: #444; }
        .help-text { font-size: 12px; color: #888; margin-bottom: 8px; display: block; }
        
        input[type="text"], input[type="date"], input[type="time"], textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing:border-box; font-family:inherit; transition: 0.2s; }
        input:focus, textarea:focus { outline: none; border-color: #c1121f; box-shadow: 0 0 0 3px rgba(193,18,31,0.1); }
        textarea { height: 120px; resize: vertical; }
        
        /* File Upload */
        .file-upload-wrapper { border: 2px dashed #ddd; border-radius: 6px; padding: 20px; text-align: center; background: #fafafa; cursor: pointer; transition: 0.2s; margin-bottom: 10px;}
        .file-upload-wrapper:hover { border-color: #c1121f; background: #fffafb; }
        .file-upload-wrapper input[type="file"] { display: none; }
        .file-upload-text { color: #666; font-weight: 500; }
        .file-upload-text span { color: #c1121f; text-decoration: underline; }
        
        /* Previews */
        .preview-container { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
        .preview-item { position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; border: 1px solid #ddd; }
        .preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .preview-remove { position: absolute; top: 4px; right: 4px; background: rgba(220,53,69,0.9); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; cursor: pointer; border: none; padding: 0; }
        .preview-remove:hover { background: #c82333; }

        .form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <header>
        <h2>Dashboard</h2>
        <a href="/logout" class="btn btn-outline" style="color:white;border-color:rgba(255,255,255,0.3);">Logout</a>
    </header>
    
    <div class="container">
        
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('news')">Aktuelles / News</button>
            <button class="tab-btn" onclick="switchTab('events')">Termine</button>
        </div>

        <!-- NEWS TAB -->
        <div id="tab-news" class="tab-content active">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; font-size: 20px;">Aktuelle Beiträge</h3>
                <button class="btn" onclick="openNewsEditor()">+ Neuer Beitrag</button>
            </div>
            <table>
                <thead><tr><th>Datum</th><th>Titel</th><th>Bilder</th><th>Aktionen</th></tr></thead>
                <tbody id="news-list"></tbody>
            </table>
        </div>

        <!-- EVENTS TAB -->
        <div id="tab-events" class="tab-content">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; font-size: 20px;">Terminkalender</h3>
                <button class="btn" onclick="openEventEditor()">+ Neuer Termin</button>
            </div>
            <table>
                <thead><tr><th>Datum</th><th>Titel</th><th>Ort</th><th>Aktionen</th></tr></thead>
                <tbody id="events-list"></tbody>
            </table>
        </div>
    </div>

    <!-- NEWS MODAL -->
    <div id="modal-news" class="modal">
        <div class="modal-content">
            <h3 id="news-modal-title" style="margin-top:0; font-size:24px; margin-bottom:24px;">Beitrag erstellen</h3>
            <form id="news-form">
                <input type="hidden" id="news-id">
                
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" id="news-title" required placeholder="Z.B. Erfolgreiches Netzwerktreffen">
                </div>
                
                <div class="form-group">
                    <label>Datum</label>
                    <input type="text" id="news-date" required placeholder="Z.B. 15.05.2026">
                </div>
                
                <div class="form-group">
                    <label>Auszug (Kurztext für Kachel)</label>
                    <span class="help-text">Ein kurzer, knackiger Satz für die Übersichtskarte.</span>
                    <textarea id="news-excerpt" style="height:80px" required placeholder="Gewerbeverein zu Gast in Rochlitz..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Vollständiger Text</label>
                    <span class="help-text">Mache für Absätze einfach ganz normal einen Zeilenumbruch (Enter). Erweiterte HTML-Tags wie &lt;b&gt; sind ebenfalls möglich.</span>
                    <textarea id="news-content" style="height: 180px" required placeholder="Hier kommt der erste Absatz...&#10;&#10;Und hier der zweite..."></textarea>
                </div>
                
                <div class="form-group">
                    <label>Bilder hochladen</label>
                    <div class="file-upload-wrapper" onclick="document.getElementById('file-input').click()">
                        <div class="file-upload-text">Klicken, um <span>Bilder auszuwählen</span></div>
                        <input type="file" id="file-input" multiple accept="image/*" onchange="handleFileSelect(event)">
                    </div>
                    <div class="preview-container" id="preview-container"></div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModals()">Abbrechen</button>
                    <button type="submit" class="btn" id="news-save-btn">Speichern</button>
                </div>
            </form>
        </div>
    </div>

    <!-- EVENTS MODAL -->
    <div id="modal-event" class="modal">
        <div class="modal-content">
            <h3 id="event-modal-title" style="margin-top:0; font-size:24px; margin-bottom:24px;">Termin erstellen</h3>
            <form id="event-form">
                <input type="hidden" id="event-id">
                
                <div class="form-group">
                    <label>Titel des Termins</label>
                    <input type="text" id="event-title" required placeholder="Z.B. Jahreshauptversammlung">
                </div>
                
                <div style="display:flex; gap: 20px;">
                    <div class="form-group" style="flex:1;">
                        <label>Datum</label>
                        <input type="date" id="event-date" required>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Uhrzeit</label>
                        <input type="time" id="event-time" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Ort / Treffpunkt</label>
                    <input type="text" id="event-location" required placeholder="Z.B. Alte Schule Rohrsen">
                </div>
                
                <div class="form-group">
                    <label>Beschreibung</label>
                    <span class="help-text">Genaue Details zur Veranstaltung.</span>
                    <textarea id="event-description" style="height: 120px" required placeholder="Wir laden alle Mitglieder herzlich ein..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModals()">Abbrechen</button>
                    <button type="submit" class="btn" id="event-save-btn">Speichern</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // --- TAB LOGIC ---
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById('tab-' + tabId).classList.add('active');
            event.currentTarget.classList.add('active');
            
            if(tabId === 'news') loadPosts();
            if(tabId === 'events') loadEvents();
        }

        function closeModals() {
            document.getElementById('modal-news').style.display = 'none';
            document.getElementById('modal-event').style.display = 'none';
        }

        // --- NEWS LOGIC ---
        let posts = [];
        let selectedFiles = []; 
        let existingImages = []; 

        async function loadPosts() {
            const tbody = document.getElementById('news-list');
            tbody.innerHTML = '<tr><td colspan="4">Lade Beiträge...</td></tr>';
            try {
                const res = await fetch('/api/news');
                posts = await res.json();
                tbody.innerHTML = '';
                if(posts.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">Noch keine Beiträge vorhanden.</td></tr>';
                    return;
                }
                posts.forEach(p => {
                    tbody.innerHTML += \`<tr>
                        <td>\${p.date}</td>
                        <td style="font-weight:500;">\${p.title}</td>
                        <td>\${p.images ? p.images.length : 0} Bild(er)</td>
                        <td>
                            <button class="btn btn-small btn-outline" onclick="editNews('\${p.id}')">Bearbeiten</button>
                            <button class="btn btn-small btn-danger" onclick="deleteNews('\${p.id}')">Löschen</button>
                        </td>
                    </tr>\`;
                });
            } catch (e) {
                tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Fehler beim Laden.</td></tr>';
            }
        }

        function openNewsEditor(post = null) {
            document.getElementById('modal-news').style.display = 'flex';
            const form = document.getElementById('news-form');
            form.reset();
            selectedFiles = [];
            existingImages = [];
            renderPreviews();

            if (post) {
                document.getElementById('news-modal-title').innerText = 'Beitrag bearbeiten';
                document.getElementById('news-id').value = post.id;
                document.getElementById('news-title').value = post.title;
                document.getElementById('news-date').value = post.date;
                document.getElementById('news-excerpt').value = post.excerpt;
                document.getElementById('news-content').value = post.content;
                if(post.images && post.images.length > 0) {
                    existingImages = [...post.images];
                    renderPreviews();
                }
            } else {
                document.getElementById('news-modal-title').innerText = 'Neuer Beitrag';
                document.getElementById('news-date').value = new Date().toLocaleDateString('de-DE');
                document.getElementById('news-id').value = '';
            }
        }

        function editNews(id) {
            const post = posts.find(p => p.id === id);
            if(post) openNewsEditor(post);
        }

        async function deleteNews(id) {
            if(!confirm('Diesen Beitrag wirklich löschen?')) return;
            try {
                await fetch('/api/news/' + id, { method: 'DELETE' });
                loadPosts();
            } catch(e) { alert('Fehler beim Löschen'); }
        }

        document.getElementById('news-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('news-save-btn');
            btn.innerText = 'Speichert... Bitte warten';
            btn.disabled = true;

            const fd = new FormData();
            if(document.getElementById('news-id').value) fd.append('id', document.getElementById('news-id').value);
            fd.append('title', document.getElementById('news-title').value);
            fd.append('date', document.getElementById('news-date').value);
            fd.append('excerpt', document.getElementById('news-excerpt').value);
            fd.append('content', document.getElementById('news-content').value);
            fd.append('existingImages', JSON.stringify(existingImages));
            selectedFiles.forEach(sf => fd.append('images', sf.file));

            try {
                await fetch('/api/news', { method: 'POST', body: fd });
                closeModals();
                loadPosts();
            } catch(e) { alert('Fehler beim Speichern: ' + e); }
            
            btn.innerText = 'Speichern';
            btn.disabled = false;
        });

        function handleFileSelect(e) {
            const files = e.target.files;
            for(let i=0; i<files.length; i++) {
                selectedFiles.push({ file: files[i], url: URL.createObjectURL(files[i]), id: Date.now() + i });
            }
            e.target.value = '';
            renderPreviews();
        }

        function removeSelectedFile(id) { selectedFiles = selectedFiles.filter(f => f.id !== id); renderPreviews(); }
        function removeExistingImage(url) { existingImages = existingImages.filter(u => u !== url); renderPreviews(); }

        function renderPreviews() {
            const container = document.getElementById('preview-container');
            container.innerHTML = '';
            existingImages.forEach(url => {
                container.innerHTML += \`<div class="preview-item"><img src="\${url}"><button type="button" class="preview-remove" onclick="removeExistingImage('\${url}')">×</button></div>\`;
            });
            selectedFiles.forEach(sf => {
                container.innerHTML += \`<div class="preview-item"><img src="\${sf.url}"><button type="button" class="preview-remove" onclick="removeSelectedFile(\${sf.id})">×</button></div>\`;
            });
        }

        // --- EVENTS LOGIC ---
        let events = [];

        async function loadEvents() {
            const tbody = document.getElementById('events-list');
            tbody.innerHTML = '<tr><td colspan="4">Lade Termine...</td></tr>';
            try {
                const res = await fetch('/api/events');
                events = await res.json();
                
                // Optional: Hier könnte man serverseitig oder clientseitig sortieren.
                // Wir sortieren clientseitig für die Backend-Anzeige: Neuere zuerst (oder nach Datum).
                events.sort((a, b) => new Date(b.date) - new Date(a.date));

                tbody.innerHTML = '';
                if(events.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4">Noch keine Termine vorhanden.</td></tr>';
                    return;
                }
                events.forEach(e => {
                    const formattedDate = new Date(e.date).toLocaleDateString('de-DE');
                    tbody.innerHTML += \`<tr>
                        <td>\${formattedDate} \${e.time}</td>
                        <td style="font-weight:500;">\${e.title}</td>
                        <td>\${e.location}</td>
                        <td>
                            <button class="btn btn-small btn-outline" onclick="editEvent('\${e.id}')">Bearbeiten</button>
                            <button class="btn btn-small btn-danger" onclick="deleteEvent('\${e.id}')">Löschen</button>
                        </td>
                    </tr>\`;
                });
            } catch (e) {
                tbody.innerHTML = '<tr><td colspan="4" style="color:red;">Fehler beim Laden.</td></tr>';
            }
        }

        function openEventEditor(eventObj = null) {
            document.getElementById('modal-event').style.display = 'flex';
            const form = document.getElementById('event-form');
            form.reset();

            if (eventObj) {
                document.getElementById('event-modal-title').innerText = 'Termin bearbeiten';
                document.getElementById('event-id').value = eventObj.id;
                document.getElementById('event-title').value = eventObj.title;
                document.getElementById('event-date').value = eventObj.date;
                document.getElementById('event-time').value = eventObj.time;
                document.getElementById('event-location').value = eventObj.location;
                document.getElementById('event-description').value = eventObj.description;
            } else {
                document.getElementById('event-modal-title').innerText = 'Neuer Termin';
                document.getElementById('event-id').value = '';
            }
        }

        function editEvent(id) {
            const e = events.find(x => x.id === id);
            if(e) openEventEditor(e);
        }

        async function deleteEvent(id) {
            if(!confirm('Diesen Termin wirklich löschen?')) return;
            try {
                await fetch('/api/events/' + id, { method: 'DELETE' });
                loadEvents();
            } catch(e) { alert('Fehler beim Löschen'); }
        }

        document.getElementById('event-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('event-save-btn');
            btn.innerText = 'Speichert... Bitte warten';
            btn.disabled = true;

            const fd = new FormData();
            if(document.getElementById('event-id').value) fd.append('id', document.getElementById('event-id').value);
            fd.append('title', document.getElementById('event-title').value);
            fd.append('date', document.getElementById('event-date').value);
            fd.append('time', document.getElementById('event-time').value);
            fd.append('location', document.getElementById('event-location').value);
            fd.append('description', document.getElementById('event-description').value);

            try {
                await fetch('/api/events', { method: 'POST', body: fd });
                closeModals();
                loadEvents();
            } catch(e) { alert('Fehler beim Speichern: ' + e); }
            
            btn.innerText = 'Speichern';
            btn.disabled = false;
        });

        // Initialize
        loadPosts();
    </script>
</body>
</html>`;
}
