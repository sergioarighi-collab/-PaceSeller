#!/usr/bin/env python3
"""
Padroniza as fotos de produto em app/public/products/ pra um mesmo tamanho de tela e
mesma escala visual do tênis dentro do quadro — ver "Fotos de produto" em
docs/guia-dev-frontend.md pro racional completo.

As fotos vêm recortadas direto dos PDFs da Tesla Footwear, cada uma com um enquadramento
diferente (algumas rente ao tênis, outras com bastante margem sobrando). Mesmo com
object-fit:contain no CSS, isso fazia o tênis aparecer em escalas bem diferentes entre
os cards. Este script detecta a bounding box real do tênis em cada foto (qualquer pixel
significativamente não-branco) e recoloca numa tela fixa, sempre ocupando a mesma fração
da largura.

Uso: python3 scripts/normalize_product_photos.py
Requer: pillow, numpy (pip install pillow numpy)

Rodar de novo só é necessário se uma foto nova entrar em app/public/products/ — nesse
caso, rodar o script inteiro é seguro mesmo pras fotos já tratadas (idempotente: a
segunda passada detecta a mesma bounding box de sempre, já que a imagem já está
centralizada em fundo branco).
"""

import os
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
PRODUCTS_DIR = REPO_ROOT / 'app' / 'public' / 'products'

CANVAS_W, CANVAS_H = 900, 520
CONTENT_FRAC_W = 0.82  # o tênis ocupa 82% da largura da tela final
MAX_H_FRAC = 0.90  # trava de segurança pra fotos de perfil mais "altas" que o normal
WHITE_THRESH = 228  # min(R,G,B) abaixo disso = conteúdo (tênis), não fundo
MIN_ROW_COL_PIXELS = 3  # ignora ruído: linha/coluna só conta como "tênis" com >= N pixels
BG_COLOR = (255, 255, 255)


def bbox_of_content(im: Image.Image):
    arr = np.asarray(im.convert('RGB')).astype(np.int16)
    minchan = arr.min(axis=2)
    mask = minchan < WHITE_THRESH
    cols = np.where(mask.sum(axis=0) >= MIN_ROW_COL_PIXELS)[0]
    rows = np.where(mask.sum(axis=1) >= MIN_ROW_COL_PIXELS)[0]
    if len(cols) == 0 or len(rows) == 0:
        return None
    return int(cols.min()), int(rows.min()), int(cols.max()), int(rows.max())


def process(path: Path) -> None:
    im = Image.open(path).convert('RGB')
    bbox = bbox_of_content(im)
    if bbox is None:
        print(f'SKIP (nenhum conteúdo detectado): {path.name}')
        return

    x0, y0, x1, y1 = bbox
    cropped = im.crop((x0, y0, x1 + 1, y1 + 1))
    cw, ch = cropped.size

    scale = (CANVAS_W * CONTENT_FRAC_W) / cw
    if ch * scale > CANVAS_H * MAX_H_FRAC:
        scale = (CANVAS_H * MAX_H_FRAC) / ch
    new_w, new_h = max(1, round(cw * scale)), max(1, round(ch * scale))
    resized = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new('RGB', (CANVAS_W, CANVAS_H), BG_COLOR)
    canvas.paste(resized, ((CANVAS_W - new_w) // 2, (CANVAS_H - new_h) // 2))
    canvas.save(path, quality=92)
    print(f'{path.name}: conteúdo {cw}x{ch} -> {new_w}x{new_h} em tela {CANVAS_W}x{CANVAS_H}')


def main() -> None:
    if not PRODUCTS_DIR.is_dir():
        raise SystemExit(f'Diretório não encontrado: {PRODUCTS_DIR}')
    for name in sorted(os.listdir(PRODUCTS_DIR)):
        if name.lower().endswith('.jpg'):
            process(PRODUCTS_DIR / name)


if __name__ == '__main__':
    main()
