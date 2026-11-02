"""
Gera a sequência de quadros da abertura (BrandPrologue) a partir do vídeo do Google Flow.

Uso (na raiz do projeto):
    python design/motion/build_prologue.py design/motion/flow-v2.mp4

Precisa de ffmpeg no PATH e de Pillow + numpy.

O que faz:
  1. Extrai todos os quadros do vídeo.
  2. Mantém só os trechos de SEGMENTS: a corrida, o choque e o flash. Fica de fora a pausa em que os dois
     se encaram e o fim todo branco, que o site completa com uma camada de luz própria.
  3. Ajusta o fundo do vídeo para o ink do site (#060913).
  4. Grava WebP em duas larguras, em public/motion/prologue/<largura>/NN.webp.

Se mudar SEGMENTS, atualize FRAME_COUNT em src/components/brand/BrandPrologue.tsx
(o script imprime o total no fim).
"""

import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

# Quadros do flow-v2.mp4 (24 fps), com índice a partir de 0 e intervalos inclusivos.
# Medidos quadro a quadro: posição do touro e do urso, movimento e luminância.
SEGMENTS = [
    (0, 12),   # corrida até quase o contato
    (26, 30),  # a reaproximação e o impacto: mesma posição do quadro 12, então o corte não salta
    (33, 34),  # o empurrão; o 34 tem a mesma pose do 43, último quadro antes da faísca
    (44, 78),  # faísca, flash e explosão; do 79 em diante o quadro é quase todo branco
]

# Fundo medido no vídeo: ~(7, 11, 21). Ink do site: (6, 9, 19).
INK_OFFSET = np.array([-1, -2, -2], dtype=np.int16)

SIZES = {1920: 80, 1280: 76}  # largura → qualidade WebP

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "motion" / "prologue"


def main(video: Path) -> None:
    picked = [n for start, end in SEGMENTS for n in range(start, end + 1)]

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(video), "-fps_mode", "passthrough", f"{tmp}/%04d.png"],
            check=True,
        )
        available = len(list(Path(tmp).glob("*.png")))
        if picked[-1] >= available:
            sys.exit(f"O vídeo tem {available} quadros, mas SEGMENTS pede até o {picked[-1]}.")

        for width in SIZES:
            target = OUT / str(width)
            target.mkdir(parents=True, exist_ok=True)
            for old in target.glob("*.webp"):
                old.unlink()

        total = {width: 0 for width in SIZES}
        for index, source in enumerate(picked):
            pixels = np.asarray(Image.open(f"{tmp}/{source + 1:04d}.png").convert("RGB"), dtype=np.int16)
            frame = Image.fromarray(np.clip(pixels + INK_OFFSET, 0, 255).astype(np.uint8))
            for width, quality in SIZES.items():
                height = round(width * frame.height / frame.width)
                resized = frame if width == frame.width else frame.resize((width, height), Image.LANCZOS)
                path = OUT / str(width) / f"{index:02d}.webp"
                resized.save(path, "WEBP", quality=quality, method=6)
                total[width] += path.stat().st_size

    print(f"FRAME_COUNT = {len(picked)}")
    for width, size in total.items():
        print(f"  {width}px: {size / 1024:.0f} KB no total ({size / 1024 / len(picked):.0f} KB por quadro)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python design/motion/build_prologue.py <video.mp4>")
    main(Path(sys.argv[1]))
