#!/usr/bin/env python3
"""Render a one-page Type 1 per-candidate field sheet, not a decision verdict.
Usage: uv run --with reportlab python skills/decision-analysis-print/scripts/render.py INPUT.json OUTPUT.pdf
"""
import json
import sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

INK, MUTED, BLUE, LINE, PALE = '#233044', '#516277', '#2361A0', '#B1BDCA', '#F5F8FB'

def render(src: Path, dst: Path) -> None:
    spec = json.loads(src.read_text(encoding='utf-8'))
    factors = spec['factors']
    if not (1 <= len(factors) <= 14):
        raise ValueError('This one-page layout supports 1–14 factors; split or redesign, never silently omit one.')
    ids = [f['id'] for f in factors]
    if len(set(ids)) != len(ids):
        raise ValueError('Factor IDs must be unique.')
    for f in factors:
        if not all(f.get(k) for k in ('id', 'name', 'description')):
            raise ValueError(f'Factor missing id/name/description: {f!r}')
    regular = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    bold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    if not (Path(regular).exists() and Path(bold).exists()):
        raise FileNotFoundError('DejaVuSans fonts not found; configure Unicode TTF paths before rendering.')
    pdfmetrics.registerFont(TTFont('FieldRegular', regular))
    pdfmetrics.registerFont(TTFont('FieldBold', bold))
    dst.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(dst), pagesize=landscape(letter))
    c.setTitle(spec.get('title', 'Évaluer un candidat'))

    def text(x, y, value, size: float=7.5, heavy=False, color=INK):
        c.setFont('FieldBold' if heavy else 'FieldRegular', size)
        c.setFillColor(color)
        c.drawString(x, y, str(value))

    def line(x, y, end, color=LINE):
        c.setStrokeColor(color); c.setLineWidth(.6); c.line(x, y, end, y)

    def mark(x, y, label, size: float=7):
        c.setStrokeColor(INK); c.setLineWidth(.85); c.rect(x, y-1, 8, 8, stroke=1, fill=0)
        text(x+11, y, label, size)

    def wrap(value, width=347, size=7.4):
        lines, current = [], ''
        for word in value.split():
            test = (current+' '+word).strip()
            if current and pdfmetrics.stringWidth(test, 'FieldRegular', size) > width:
                lines.append(current); current = word
            else:
                current = test
        if current: lines.append(current)
        return lines

    title = spec.get('title', 'Évaluer un candidat')
    if pdfmetrics.stringWidth(title, 'FieldBold', 12.5) > 740:
        raise ValueError('Title exceeds printable width.')
    text(28, 584, title.upper(), 12.5, True, BLUE)
    text(28, 563, spec.get('candidate_label', 'Candidat')+' :', 8, True)
    line(115, 560, 560)
    text(574, 563, 'Date :', 8, True); line(610, 560, 763)
    text(28, 543, 'Une case cochée = critère évalué. Deux cases vides = pas encore évalué. Corriger si l’information change.', 7.8, color=MUTED)

    for i, factor in enumerate(factors):
        col, row = divmod(i, 7)
        x, top, w = 28+col*373, 522-row*69, 363
        c.setFillColor(PALE); c.setStrokeColor(LINE); c.setLineWidth(.7)
        c.roundRect(x, top-64, w, 64, 5, fill=1, stroke=1)
        text(x+8, top-13, factor['id'], 8.1, True, BLUE)
        text(x+32, top-13, factor['name'], 8.5, True)
        conditional = factor.get('not_applicable')
        name_end = x+32+pdfmetrics.stringWidth(factor['name'], 'FieldBold', 8.5)
        if conditional:
            if name_end > x+263: raise ValueError(f"Conditional label collides with name: {factor['id']}")
            mark(x+274, top-14, conditional, 6.8)
        elif name_end > x+w-8:
            raise ValueError(f"Name exceeds card width: {factor['id']}")
        lines = wrap(factor['description'])
        if len(lines) > 2: raise ValueError(f"Description too long for card {factor['id']}; shorten or redesign.")
        for j, part in enumerate(lines): text(x+8, top-26-j*9, part, 7.4)
        mark(x+8, top-47, 'acceptable'); mark(x+181, top-47, 'non acceptable')
        text(x+8, top-59, 'Précision :', 6.8, True, MUTED); line(x+66, top-61, x+w-8)

    if len(factors) <= 13:
        text(410, 102, 'SUITE ENVISAGÉE', 8.3, True, BLUE)
        mark(410, 82, 'écarter'); mark(505, 82, 'clarifier'); mark(609, 82, 'considérer ce lieu')
        text(410, 61, 'Point à éclaircir :', 7.4, True); line(529, 59, 762)
    line(28, 36, 764)
    text(28, 23, 'Deux cases vides = non évalué. « Sans objet » si le critère conditionnel ne s’applique pas. Aucun verdict automatique.', 7.35, color=MUTED)
    c.showPage(); c.save()

if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: render.py INPUT.json OUTPUT.pdf')
    render(Path(sys.argv[1]), Path(sys.argv[2]))
