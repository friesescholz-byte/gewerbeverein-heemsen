import re

with open('ueber-uns.html', 'r', encoding='utf-8') as f:
    html = f.read()

# CSS to inject
css_to_inject = '''
        .timeline {
            position: relative;
            max-width: 1000px;
            margin: 0 auto;
        }
        .timeline::after {
            content: '';
            position: absolute;
            width: 4px;
            background-color: rgba(228, 0, 51, 0.1);
            top: 0;
            bottom: 0;
            left: 50%;
            margin-left: -2px;
            border-radius: 2px;
        }
        .timeline-item {
            padding: 20px 50px;
            position: relative;
            background-color: inherit;
            width: 50%;
            box-sizing: border-box;
        }
        .timeline-item:nth-child(odd) {
            left: 0;
        }
        .timeline-item:nth-child(even) {
            left: 50%;
        }
        .timeline-dot {
            position: absolute;
            width: 24px;
            height: 24px;
            right: -12px;
            background-color: white;
            border: 5px solid var(--primary-color);
            top: 35px;
            border-radius: 50%;
            z-index: 1;
            box-shadow: 0 0 0 6px rgba(228, 0, 51, 0.15);
        }
        .timeline-item:nth-child(even) .timeline-dot {
            left: -12px;
        }
        .timeline-content {
            padding: 40px;
            background-color: white;
            position: relative;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.04);
            transition: all 0.3s ease;
            border: 1px solid rgba(0,0,0,0.02);
        }
        .timeline-content:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 50px rgba(228, 0, 51, 0.08);
            border-color: rgba(228, 0, 51, 0.1);
        }
        .timeline-date {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary-color);
            margin-bottom: 5px;
        }
        .timeline-content h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            margin-bottom: 15px;
            color: var(--secondary-color);
        }
        .timeline-content p {
            color: var(--text-muted);
            line-height: 1.8;
            margin: 0;
            font-size: 1.05rem;
        }
        .image-collage {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
            margin-top: 100px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        .image-collage img {
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            transition: transform 0.4s ease;
        }
        .image-collage img:hover {
            transform: scale(1.03);
        }
        
        @media screen and (max-width: 900px) {
            .timeline::after {
                left: 31px;
            }
            .timeline-item {
                width: 100%;
                padding-left: 80px;
                padding-right: 0px;
            }
            .timeline-item:nth-child(even) {
                left: 0%;
            }
            .timeline-item:nth-child(odd) .timeline-dot,
            .timeline-item:nth-child(even) .timeline-dot {
                left: 19px;
            }
        }
        @media screen and (max-width: 500px) {
            .timeline-content { padding: 25px; }
            .timeline-item { padding-left: 60px; }
            .timeline::after { left: 20px; }
            .timeline-item:nth-child(odd) .timeline-dot,
            .timeline-item:nth-child(even) .timeline-dot { left: 8px; }
        }
'''

# We need to insert this CSS right before </style>
html = html.replace('</style>', css_to_inject + '\n    </style>')

# Now replace the HTML part
new_html_content = '''    <!-- Page Hero -->
    <section class="page-hero" style="padding: 160px 0 120px; background: linear-gradient(135deg, #111111 0%, #2a0009 100%); color: white; position: relative; overflow: hidden; text-align: center;">
        <div class="container" style="position: relative; z-index: 2;">
            <div style="display: inline-block; padding: 8px 20px; background: rgba(228, 0, 51, 0.2); border-radius: 30px; color: #ff6b8b; font-weight: 600; margin-bottom: 20px; font-size: 0.9rem; letter-spacing: 1px; border: 1px solid rgba(228, 0, 51, 0.3);">WIR SIND HEEMSEN</div>
            <h1 class="page-title" style="color: white; font-size: 4rem; margin-bottom: 25px; font-weight: 800; text-shadow: 0 5px 20px rgba(0,0,0,0.3);">Regional verwurzelt.<br>Gemeinsam engagiert.</h1>
            <p style="font-size: 1.3rem; max-width: 700px; margin: 0 auto; opacity: 0.85; line-height: 1.8; font-weight: 300;">
                Der Gewerbeverein Heemsen steht für Gemeinschaft, Austausch und die Stärkung der regionalen Wirtschaft. Zukunft im Blick seit über 40 Jahren.
            </p>
        </div>
        <!-- Abstract Background Shapes -->
        <div style="position: absolute; top: -50%; left: -10%; width: 50%; height: 200%; background: radial-gradient(circle, rgba(228,0,51,0.15) 0%, transparent 70%); transform: rotate(30deg); z-index: 1; pointer-events: none;"></div>
        <div style="position: absolute; bottom: -50%; right: -10%; width: 60%; height: 200%; background: radial-gradient(circle, rgba(228,0,51,0.1) 0%, transparent 70%); transform: rotate(-20deg); z-index: 1; pointer-events: none;"></div>
    </section>

    <!-- Main Content (Timeline) -->
    <section class="section bg-light" style="padding: 100px 0 120px;">
        <div class="container">
            
            <div style="text-align: center; margin-bottom: 80px;">
                <h2 style="font-family: 'Outfit', sans-serif; font-size: 2.8rem; color: var(--secondary-color); margin-bottom: 15px;">Unsere Geschichte</h2>
                <p style="color: var(--text-muted); font-size: 1.2rem; max-width: 600px; margin: 0 auto;">Seit 1982 macht der Gewerbeverein sichtbar, was unsere Gemeinde und die umliegenden Orte zu bieten haben.</p>
            </div>
            
            <div class="timeline">
                <!-- Timeline Item 1 -->
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">1982</div>
                        <h3>Gründung & Vision</h3>
                        <p>Gegründet wurde der Verein mit dem Ziel, die wirtschaftliche Stärke der Gemeinde Heemsen stärker in die Öffentlichkeit zu tragen. Durch die verkehrsgünstige Lage war schon damals klar: Heemsen ist ein attraktiver Standort mit großem Potenzial.</p>
                    </div>
                </div>
                
                <!-- Timeline Item 2 -->
                <div class="timeline-item right">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">1983</div>
                        <h3>Die erste Gewerbeschau</h3>
                        <p>Bereits im April 1983 fand unter dem damaligen Vorsitzenden Heinrich Dreeke die erste Gewerbeschau statt. Auf dem rund 8.000 Quadratmeter großen Gelände präsentierten 21 Aussteller ihre Leistungen eindrucksvoll.</p>
                    </div>
                </div>

                <!-- Timeline Item 3 -->
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">2018</div>
                        <h3>Regionalschau GAFA</h3>
                        <p>Der große Zuspruch der gesamten Umgebung war der Startschuss für weitere Schauen. Ein besonderer Höhepunkt war die Regionalschau GAFA 2018 im Gewerbegebiet Drakenburg, die mit beeindruckender Beteiligung stattfand.</p>
                    </div>
                </div>
                
                <!-- Timeline Item 4 -->
                <div class="timeline-item right">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">Heute</div>
                        <h3>Ein starkes Netzwerk</h3>
                        <p>Heute zählt der Gewerbeverein Heemsen 85 Mitglieder. Die stetig wachsende Zahl zeigt, wie wichtig Austausch, Zusammenhalt und regionale Sichtbarkeit für Betriebe sind. Fachvorträge, gemeinsame Fahrten und „Die Samtgemeinde radelt“ gehören fest zum Vereinsleben.</p>
                    </div>
                </div>
            </div>
            
            <!-- Image Collage -->
            <div class="image-collage">
                <img src="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/vorstand_2022-142997-11-13.webp" alt="Vorstand des Gewerbevereins Heemsen" style="width: 100%; max-width: 800px; display: block;">
                <img src="https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/gewerbeverein%20heemsen/Gewerbeverein-Heemsen-Logo.png" alt="Gewerbeverein Heemsen Logo" style="width: 100%; max-width: 300px; display: block; background: white; padding: 20px; box-sizing: border-box;">
            </div>

            <!-- Board Section -->'''

# Regex to replace everything between <!-- Page Hero --> and <!-- Board Section -->
pattern = re.compile(r'<!-- Page Hero -->.*?<!-- Board Section -->', re.DOTALL)
html = pattern.sub(new_html_content, html)

with open('ueber-uns.html', 'w', encoding='utf-8') as f:
    f.write(html)
