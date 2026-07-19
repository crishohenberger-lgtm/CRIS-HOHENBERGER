import re

with open('artifacts/apresentacao/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's count slides
slides = re.findall(r'<div class="slide[^>]*>.*?</div>\s*<!--\s*SLIDE', content, flags=re.DOTALL)
print(f"Total slides found: {len(slides)}")
if len(slides) == 0:
    # Try another split
    slides = content.split('<!-- ========================================== -->')
    print(f"Total sections split by comments: {len(slides)}")

