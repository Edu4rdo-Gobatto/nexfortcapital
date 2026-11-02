"""
Reconstrói a Torre da logo original (public/logo_NEXFORT.png) em alta resolução e com fundo transparente,
em public/brand/nexfort-torre.png, para usar a logo idêntica à original em todo o site.

Uso (na raiz do projeto):
    python design/motion/extract_logo.py

A logo de origem é pequena (a torre tem ~240px) e veio de um JPEG. Como o desenho é de cores chapadas,
ele é refeito por camadas, sem inventar nada:
  - silhueta: tudo que não é o fundo claro ligado às bordas;
  - azul-marinho: cor única, a média medida na própria logo;
  - filetes claros de dentro da torre: cor única;
  - urso e touro: o degradê original (amarelo → vermelho), alisado na vertical.
Cada máscara é ampliada, alisada e cortada no meio do tom: as bordas saem retas e sem serrilhado.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "public" / "logo_NEXFORT.png"
OUT = ROOT / "public" / "brand" / "nexfort-torre.png"
# Camadas para a seção Método (mesmo tamanho e enquadramento da logo inteira, sobrepostas pixel a pixel):
BASE_OUT = ROOT / "public" / "brand" / "nexfort-torre-base.png"  # só a torre, com o miolo em azul
CORE_OUT = ROOT / "public" / "brand" / "nexfort-miolo.png"  # só o urso e o touro

BOX = (462, 350, 618, 612)  # a torre na logo de 1080px, acima do texto
WORK = 12  # escala de trabalho (supersampling)
FINAL = 6  # escala final: ~940 x 1570 px


def smooth_mask(mask: np.ndarray, radius: float) -> Image.Image:
    """Máscara binária → ampliada, alisada e recortada no meio: contorno limpo em alta resolução."""
    image = Image.fromarray((mask * 255).astype(np.uint8)).resize(
        (mask.shape[1] * WORK, mask.shape[0] * WORK), Image.BILINEAR
    )
    image = image.filter(ImageFilter.GaussianBlur(radius * WORK))
    return image.point(lambda v: 255 if v >= 128 else 0)


def main() -> None:
    rgb = np.asarray(Image.open(SOURCE).convert("RGB").crop(BOX)).astype(np.int16)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    low, high = rgb.min(axis=2), rgb.max(axis=2)

    # Fundo: claro, quase sem cor e ligado às bordas.
    light = ((low > 200) & (high - low < 30)).astype(np.uint8) * 255
    flood = Image.fromarray(light).copy()
    for corner in [(0, 0), (flood.width - 1, 0), (0, flood.height - 1), (flood.width - 1, flood.height - 1)]:
        ImageDraw.floodfill(flood, corner, 128)
    silhouette = np.asarray(flood) != 128

    warm = silhouette & (r > b + 60)  # urso e touro (amarelo, laranja, vermelho)
    # Filetes claros de dentro da torre. A borda da silhueta também tem pixels claros (transição do JPEG para o
    # fundo): os filetes só contam a 1px para dentro dela, senão a torre ganharia um pontilhado em volta.
    inner = np.asarray(Image.fromarray(silhouette.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(3))) > 0
    lines = inner & ~warm & (low > 170)
    navy = silhouette & ~warm & ~lines

    navy_color = tuple(int(v) for v in rgb[navy & (high < 140)].mean(axis=0))
    line_color = tuple(int(v) for v in rgb[lines & (low > 200)].mean(axis=0))

    size = (rgb.shape[1] * WORK, rgb.shape[0] * WORK)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(Image.new("RGBA", size, navy_color + (255,)), mask=smooth_mask(silhouette, 0.9))

    # Degradê do miolo: cor média de cada linha (só pixels quentes), alisada e esticada para a largura toda.
    rows = [rgb[y][warm[y]].mean(axis=0) if warm[y].sum() > 2 else None for y in range(rgb.shape[0])]
    known = [i for i, c in enumerate(rows) if c is not None]
    ramp = np.array([np.interp(range(len(rows)), known, [rows[i][ch] for i in known]) for ch in range(3)]).T
    kernel = np.ones(5) / 5
    ramp = np.array([np.convolve(np.pad(ramp[:, ch], 2, mode="edge"), kernel, mode="valid") for ch in range(3)]).T
    gradient = Image.fromarray(ramp.clip(0, 255).astype(np.uint8)[:, None, :].repeat(rgb.shape[1], axis=1))
    gradient = gradient.resize(size, Image.BICUBIC).convert("RGBA")
    base = canvas.copy()
    warm_mask = smooth_mask(warm, 0.8)
    canvas.paste(gradient, mask=warm_mask)
    core = Image.new("RGBA", size, (0, 0, 0, 0))
    core.paste(gradient, mask=warm_mask)

    line_mask = smooth_mask(lines, 0.45)
    for layer in (canvas, base):
        layer.paste(Image.new("RGBA", size, line_color + (255,)), mask=line_mask)

    # As camadas internas não podem vazar fora da silhueta.
    outline = np.asarray(smooth_mask(silhouette, 0.9))
    canvas.putalpha(Image.fromarray(np.minimum(np.asarray(canvas.getchannel("A")), outline)))

    for layer in (base, core):
        layer.putalpha(Image.fromarray(np.minimum(np.asarray(layer.getchannel("A")), outline)))

    final_size = (rgb.shape[1] * FINAL, rgb.shape[0] * FINAL)
    final = canvas.resize(final_size, Image.LANCZOS)
    bbox = final.getchannel("A").getbbox()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    final = final.crop(bbox)
    final.save(OUT, optimize=True)
    for layer, path in ((base, BASE_OUT), (core, CORE_OUT)):
        layer.resize(final_size, Image.LANCZOS).crop(bbox).save(path, optimize=True)
    print(f"{OUT.relative_to(ROOT)}: {final.width}x{final.height} · azul {navy_color} · filetes {line_color}")


if __name__ == "__main__":
    main()
