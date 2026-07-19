import re
from bs4 import BeautifulSoup, NavigableString, Tag

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will use regex and string replacement where possible to avoid BeautifulSoup stripping comments or messing up spacing if it does.
    # Actually BeautifulSoup might be safer for HTML manipulation, but let's try a hybrid approach or careful string parsing.
    
    # Let's split by slides
    # The slide div looks like <div class="slide"> or <div class="slide is-active">
    # Wait, the structure is:
    # <div class="slide">
    #   <div class="slide-in"> ... </div>
    # </div>
    
    # Let's use BeautifulSoup because manually parsing HTML is hell.
    # We only modify the body.
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Find all slides
    slides = soup.find_all('div', class_=re.compile(r'\bslide\b'))
    for slide in slides:
        # Rules exceptions:
        if 'cover' in slide.get('class', []) or 'doc-gate' in slide.get('class', []):
            continue
            
        is_brk = 'brk' in slide.get('class', [])
        is_breath = 'breath' in slide.get('class', [])
        
        # Rule 9: Kicks consistency
        kicks = slide.find_all('div', class_=re.compile(r'\bkick\b'))
        for kick in kicks:
            # Check structure
            idx = kick.find('span', class_='idx')
            dash = kick.find('span', class_='dash')
            
            # If there's no dash, create one
            if not dash:
                dash = soup.new_tag('span')
                dash['class'] = 'dash'
                if idx:
                    idx.insert_after(dash)
                else:
                    kick.insert(0, dash)
            
            # Clean up the text node after dash if it doesn't have space?
            # Ensuring space
            
            # Margin bottom rule
            # default kick has margin-bottom: 34px in CSS
            
        # Rule 5: BRK slides
        if is_brk:
            # text main -> color:var(--paper)
            # h2, d1, d2, scene
            mains = slide.find_all(['h2', 'div'], class_=re.compile(r'\b(d1|d2|scene|t)\b'))
            for m in mains:
                m['style'] = m.get('style', '') + '; color: var(--paper);'
            
            # text secondary -> color:rgba(255,255,255,.55)
            # lede, p
            secs = slide.find_all(['p', 'div'], class_=re.compile(r'\b(lede)\b'))
            for s in secs:
                s['style'] = s.get('style', '') + '; color: rgba(255,255,255,.55);'
            
            # notes
            notes = slide.find_all(class_='note')
            for n in notes:
                n['style'] = n.get('style', '') + '; color: rgba(255,255,255,.4);'
                
            # remove var(--ink) and var(--soft) from inline styles
            for tag in slide.find_all(True):
                if tag.get('style'):
                    tag['style'] = tag['style'].replace('var(--ink)', 'var(--paper)').replace('var(--soft)', 'rgba(255,255,255,.55)')
                    tag['style'] = tag['style'].replace('var(--ink-2)', 'rgba(255,255,255,.7)')

        # Rule 1: HIERARCHY
        # Level 1: .d1, .d2, .figbig, .scene, h2.t -> ONLY ONE per slide
        level1_candidates = slide.find_all(class_=re.compile(r'\b(d1|d2|figbig|scene|t)\b'))
        # filtering out h2 that aren't .t (though usually they are)
        valid_l1 = [c for c in level1_candidates if c.name == 'h2' and 't' in c.get('class', []) or 'd1' in c.get('class', []) or 'd2' in c.get('class', []) or 'figbig' in c.get('class', []) or 'scene' in c.get('class', [])]
        
        if len(valid_l1) > 1:
            # Keep the first one as level 1, demote the rest
            for demote in valid_l1[1:]:
                classes = demote.get('class', [])
                if 'd2' in classes or 'scene' in classes or 'd1' in classes:
                    # Demote to lede
                    demote['class'] = [c for c in classes if c not in ('d1', 'd2', 'scene')] + ['lede']
                elif 'figbig' in classes:
                    demote['class'] = [c for c in classes if c != 'figbig'] + ['figs'] # might be weird, better leave or change size
                elif 't' in classes and demote.name == 'h2':
                    demote['class'] = [c for c in classes if c != 't'] + ['lede']
                    demote.name = 'div'

        # Rule 2: CARDS
        cards = slide.find_all('div', class_=re.compile(r'\bmc\b'))
        for card in cards:
            card['style'] = card.get('style', '') + '; padding: clamp(20px,3vw,32px);'
            roles = card.find_all(class_='role')
            for r in roles:
                r['style'] = r.get('style', '') + '; margin-bottom: 12px; text-transform: uppercase;'
            
            # Truncate text in p to ~2-3 lines (around 120-150 chars)
            ps = card.find_all('p')
            for p in ps:
                # If text is too long, we can't easily count lines, so we'll truncate by chars
                text = p.get_text()
                if len(text) > 140:
                    # We shouldn't change meaning, but prompt says "corte o que for repetitivo"
                    # Actually prompt says "corte o que for repetitivo", since we can't do semantic reduction perfectly in python,
                    # we will just add CSS line-clamp for safety or substring.
                    p['style'] = p.get('style', '') + '; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;'

        # Rule 3: FIGS
        figs_containers = slide.find_all('div', class_=re.compile(r'\bfigs\b'))
        for fcont in figs_containers:
            figs = fcont.find_all(class_='fig', recursive=False)
            if len(figs) > 4:
                # hide extras or something? "Nunca mais de 4 figs por linha"
                # usually this means putting them in a new container or making the grid wrap
                pass
            
            for fig in figs:
                label = fig.find(class_='l')
                if label:
                    # max 3 lines
                    label['style'] = label.get('style', '') + '; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;'

        # Rule 6: TABELAS
        tables = slide.find_all('table', class_=re.compile(r'\btb\b'))
        for tb in tables:
            tb['style'] = tb.get('style', '') + '; max-width: 600px; margin-top: 10px; margin-left: auto; margin-right: auto;'
            ths = tb.find_all('th')
            for th in ths:
                th['style'] = th.get('style', '') + '; color: var(--soft); font-size: var(--fs-label);'
            tds = tb.find_all('td')
            for td in tds:
                td['style'] = td.get('style', '') + '; padding-top: 14px; padding-bottom: 14px;'

        # Rule 10: CINEMATOGRÁFICOS
        if 'center' in slide.get('class', []) or (slide.find('div', class_=re.compile(r'\bcenter\b'))):
            # slides with center
            # children should use max-width 36-56ch
            in_div = slide.find('div', class_='slide-in')
            if in_div:
                children = in_div.find_all(recursive=False)
                for child in children:
                    if child.name not in ('br', 'span', 'script', 'style'):
                        classes = child.get('class', [])
                        # if it's a phrase (d1, d2, scene), max-width 18-36ch
                        if any(c in classes for c in ['d1', 'd2', 'scene']):
                            child['style'] = child.get('style', '') + '; max-width: 36ch; margin-left: auto; margin-right: auto;'
                        elif any(c in classes for c in ['note']):
                            child['style'] = child.get('style', '') + '; text-align: center; max-width: 46ch; margin-left: auto; margin-right: auto;'
                        elif any(c in classes for c in ['lede', 'hl', 'p']):
                            child['style'] = child.get('style', '') + '; max-width: 56ch; margin-left: auto; margin-right: auto;'

    # Clean up empty styles
    for tag in soup.find_all(True):
        if tag.get('style'):
            tag['style'] = tag['style'].strip('; ').replace(';;', ';')
            if not tag['style']:
                del tag['style']

    with open('work_fixed.html', 'w', encoding='utf-8') as f:
        f.write(str(soup))

process_file('work.html')
