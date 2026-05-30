#!/usr/bin/env python3
import re, os, sys

FIXES = [
    # UTF-8 bytes misread as Latin-1 (accented Spanish chars)
    ('Ã¡','á'),('Ã©','é'),('Ã­','í'),('Ã³','ó'),('Ãº','ú'),
    ('Ã±','ñ'),('Ã‰','É'),('Ã"','Ó'),('Ãš','Ú'),('Ã€','À'),
    ('Â©','©'),('Âº','º'),('Â°','°'),('Â¿','¿'),('Â¡','¡'),('Â·','·'),
    # UTF-8 bytes misread as Windows-1252 (smart quotes, dashes)
    ('â€œ','“'),   # â€œ  → " left double quote
    ('â€','”'),   # â€[9d] → " right double quote
    ('â€“','—'),   # â€" → — em dash
    ('â€–','–'),   # â€" → – en dash
    ('â€’','’'),   # â€™ → ' right single quote
    ('â€˜','‘'),   # â€˜ → ' left single quote
    ('â€¢','•'),   # â€¢ → • bullet
    ('â€¦','…'),   # â€¦ → … ellipsis
]

TEMPLATE = '''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="##DESC##">
    <meta name="theme-color" content="#0a1628">
    <title>##TITLE## | Perforaciones HB</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

    <header class="header scrolled" id="header">
        <div class="container">
            <div class="header-inner">
                <a href="../index.html" class="logo">
                    <img src="../img/Drillmachine-papa.png" alt="Perforaciones HB" class="logo-img">
                    <span class="logo-text">Perforaciones <strong>HB</strong></span>
                </a>
                <nav class="nav" id="nav">
                    <ul class="nav-list">
                        <li><a href="../index.html#servicios" class="nav-link">Servicios</a></li>
                        <li><a href="../index.html#nosotros" class="nav-link">Nosotros</a></li>
                        <li><a href="../index.html#notas-tecnicas" class="nav-link">Notas T&eacute;cnicas</a></li>
                        <li><a href="../index.html#contacto" class="nav-link">Contacto</a></li>
                    </ul>
                    <a href="https://wa.me/5491169924588?text=Hola,%20quiero%20solicitar%20un%20presupuesto" class="nav-cta" target="_blank" rel="noopener">
                        <i class="fab fa-whatsapp"></i> Presupuesto
                    </a>
                </nav>
                <button class="menu-btn" id="mobile-menu-btn" aria-label="Men&uacute;" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
        <div class="nav-overlay" id="nav-overlay"></div>
    </header>

    <main class="nota-main">
        <div class="nota-back">
            <div class="container">
                <a href="../index.html#notas-tecnicas" class="nota-back-link">
                    <i class="fas fa-arrow-left"></i> Volver a Notas T&eacute;cnicas
                </a>
            </div>
        </div>

        <article class="nota-article">
            <div class="container">
                <header class="nota-header">
                    <h1>##H1##</h1>
                    <p class="nota-subtitle">##SUBTITLE##</p>
                </header>
                <div class="nota-body">
##BODY##
                </div>
                <div class="nota-cta">
                    <p>&iquest;Ten&eacute;s dudas? Nuestros especialistas pueden asesorarte sin cargo.</p>
                    <div class="nota-cta-actions">
                        <a href="https://wa.me/5491169924588?text=Hola,%20quiero%20consultar%20sobre%20pozos%20de%20agua" class="btn-whatsapp" target="_blank" rel="noopener">
                            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                        </a>
                        <a href="../index.html#contacto" class="btn-outline-dark">Enviar mensaje</a>
                    </div>
                </div>
            </div>
        </article>
    </main>

    <a href="https://wa.me/5491169924588?text=Hola,%20me%20interesa%20informaci%C3%B3n%20sobre%20sus%20servicios%20de%20perforaci%C3%B3n"
       class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
        </svg>
    </a>

    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <img src="../img/Drillmachine-papa.png" alt="Perforaciones HB">
                        <span>Perforaciones <strong>HB</strong></span>
                    </div>
                    <p>Especialistas en perforaci&oacute;n de pozos de agua con m&aacute;s de 40 a&ntilde;os de experiencia en Argentina y Uruguay.</p>
                </div>
                <div class="footer-links">
                    <h4>Servicios</h4>
                    <ul>
                        <li><a href="../index.html#servicios">Residenciales</a></li>
                        <li><a href="../index.html#servicios">Industriales</a></li>
                        <li><a href="../index.html#servicios">Comerciales</a></li>
                        <li><a href="../index.html#servicios">Agr&iacute;colas</a></li>
                        <li><a href="../index.html#servicios">Riego</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>Contacto</h4>
                    <p><i class="fas fa-phone"></i> <a href="tel:+5491169924588">+54 9 11 6992 4588</a></p>
                    <p><i class="fas fa-envelope"></i> <a href="mailto:info@perforacioneshb.com.ar">info@perforacioneshb.com.ar</a></p>
                    <p><i class="fas fa-location-dot"></i> Luis Guill&oacute;n, Bs. As.</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p class="copyright">&copy; 2025 Perforaciones HB. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <script src="../script.js"></script>
</body>
</html>'''

def fix_enc(s):
    for bad, good in FIXES:
        s = s.replace(bad, good)
    return s

notas_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'notas')
files = [f for f in os.listdir(notas_dir) if f.endswith('.html')]

ok = 0
for fname in files:
    fpath = os.path.join(notas_dir, fname)
    try:
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        content = fix_enc(content)

        h1_m    = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
        sub_m   = re.search(r'class="note-subtitle">\s*(.*?)\s*</p>', content, re.DOTALL)
        desc_m  = re.search(r'name="description"\s+content="(.*?)"', content)
        body_m  = re.search(r'<div class="note-body">(.*?)</div>\s*</div>\s*</section>', content, re.DOTALL)

        if not (h1_m and body_m):
            print(f"  SKIP {fname}: could not extract content")
            continue

        h1       = h1_m.group(1).strip()
        subtitle = sub_m.group(1).strip() if sub_m else ''
        desc     = desc_m.group(1).strip() if desc_m else ''
        body     = body_m.group(1).strip()
        title    = re.sub(r'<[^>]+>', '', h1)

        html = (TEMPLATE
            .replace('##TITLE##',    title)
            .replace('##H1##',       h1)
            .replace('##SUBTITLE##', subtitle)
            .replace('##DESC##',     desc)
            .replace('##BODY##',     body))

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  OK  {fname}")
        ok += 1

    except Exception as e:
        print(f"  ERR {fname}: {e}", file=sys.stderr)

print(f"\nDone: {ok}/{len(files)} files rebuilt.")
