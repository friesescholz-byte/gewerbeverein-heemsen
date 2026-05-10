import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# CSS to inject
css_to_inject = '''
    <style>
        /* Mobile Optimization for Index Page */
        @media screen and (max-width: 768px) {
            /* Fix general section padding */
            .section {
                padding: 50px 0 !important;
            }
            
            /* Fix Hero */
            .hero-title {
                font-size: 2.5rem !important;
            }
            .hero-subtitle {
                font-size: 1.1rem !important;
            }
            
            /* Fix card grids to not overflow */
            .card-grid, .benefits-grid {
                grid-template-columns: 1fr !important;
                gap: 20px !important;
            }
            
            /* Fix membership CTA box */
            .cta-box {
                padding: 30px 20px !important;
            }
            .cta-title {
                font-size: 1.8rem !important;
            }
            
            /* Fix GAFA Section */
            .gafa-section {
                padding: 60px 20px !important;
            }
            .gafa-title {
                font-size: 2rem !important;
            }
            
            /* Fix Vorstand Section */
            .vorstand-container {
                flex-direction: column !important;
                gap: 30px !important;
            }
            .vorstand-title {
                font-size: 2rem !important;
            }
            
            /* Divider Image */
            .divider-img {
                height: 250px !important;
            }
            
            /* About Grid (if applicable) */
            .about-grid {
                grid-template-columns: 1fr !important;
                gap: 30px !important;
            }
        }
    </style>
'''

# We need to insert this CSS right before </head>
html = html.replace('</head>', css_to_inject + '\n</head>')

# Add classes to inline-styled elements
html = html.replace('div style="max-width: 800px; margin: 0 auto; background: white; padding: 60px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);"', 'div class="cta-box" style="max-width: 800px; margin: 0 auto; background: white; padding: 60px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);"')

html = html.replace('<h2 style="font-family: \'Outfit\', sans-serif; font-size: 2.5rem; margin-bottom: 20px; color: var(--secondary-color);">Werden Sie Teil eines starken Netzwerks!</h2>', '<h2 class="cta-title" style="font-family: \'Outfit\', sans-serif; font-size: 2.5rem; margin-bottom: 20px; color: var(--secondary-color);">Werden Sie Teil eines starken Netzwerks!</h2>')

html = html.replace('section class="section" id="gafa" style="background: linear-gradient(135deg, var(--secondary-color) 0%, #1a1a1a 100%); color: white; text-align: center; padding: 100px 0;"', 'section class="section gafa-section" id="gafa" style="background: linear-gradient(135deg, var(--secondary-color) 0%, #1a1a1a 100%); color: white; text-align: center; padding: 100px 0;"')

html = html.replace('<h2 style="font-family: \'Outfit\', sans-serif; font-size: 3rem; margin-bottom: 20px;">Die GAFA Gewerbeschau</h2>', '<h2 class="gafa-title" style="font-family: \'Outfit\', sans-serif; font-size: 3rem; margin-bottom: 20px;">Die GAFA Gewerbeschau</h2>')

html = html.replace('div style="display: flex; align-items: center; gap: 60px; flex-wrap: wrap;"', 'div class="vorstand-container" style="display: flex; align-items: center; gap: 60px; flex-wrap: wrap;"')

html = html.replace('<h2 style="font-family: \'Outfit\', sans-serif; font-size: 2.5rem; margin-bottom: 20px; color: var(--secondary-color);">Unser Vorstand</h2>', '<h2 class="vorstand-title" style="font-family: \'Outfit\', sans-serif; font-size: 2.5rem; margin-bottom: 20px; color: var(--secondary-color);">Unser Vorstand</h2>')

html = html.replace('div style="width: 100%; height: 400px; background-image: url', 'div class="divider-img" style="width: 100%; height: 400px; background-image: url')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
