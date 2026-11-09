"""
Monta design/prancha/img/ (WebP e SVG) a partir das capturas de design/qa/saida/, que o Git ignora.

Uso (na raiz do projeto, depois de rodar os roteiros de design/qa/ e as conferências do miolo):
    python design/prancha/montar_imagens.py

Entradas esperadas (cada uma vem de um roteiro; as que faltarem são avisadas e puladas):
    saida/antes/         capturas do estado antes da Fase 3 (capturas.mjs)
    saida/final/         capturas finais, desktop e celular (capturas.mjs --pasta=final)
    saida/prancha/       3d-<variante>-assinatura, rest-<descanso>, fade-sem/com-meio-* (torre-detalhe.mjs --pasta=prancha)
    saida/miolo/         emblema_<variante>.svg e miolo_<variante>_sobre_original.png
                         (python design/torre/extract_torre.py --check design/qa/saida/miolo, e curar_miolo.py --check o mesmo)
"""

from __future__ import annotations

import glob
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SAIDA = ROOT / "design" / "qa" / "saida"
OUT = ROOT / "design" / "prancha" / "img"
OUT.mkdir(parents=True, exist_ok=True)

feitos, faltando = [], []


def webp(src: Path, dst: str, max_width: int | None = None, quality: int = 86, crop: tuple[float, float, float, float] | None = None) -> None:
    """crop: (esquerda, topo, direita, base) em frações da imagem, para tirar o que a captura pegou além da Torre."""
    if not src.exists():
        faltando.append(str(src.relative_to(ROOT)))
        return
    im = Image.open(src).convert("RGB")
    if crop:
        w, h = im.size
        im = im.crop((round(crop[0] * w), round(crop[1] * h), round(crop[2] * w), round(crop[3] * h)))
    if max_width and im.width > max_width:
        im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
    path = OUT / dst
    im.save(path, "WEBP", quality=quality, method=6)
    feitos.append(f"{dst}  {im.width}x{im.height}  {path.stat().st_size / 1024:.0f} KB")


def capture(folder: str, pattern: str) -> Path:
    """Captura pelo nome da seção: o número do descanso no nome muda se entrar um bloco, o nome da seção não."""
    hits = sorted((SAIDA / folder).glob(pattern))
    return hits[0] if hits else SAIDA / folder / pattern


def copy(src: Path, dst: str) -> None:
    if not src.exists():
        faltando.append(str(src.relative_to(ROOT)))
        return
    shutil.copyfile(src, OUT / dst)
    feitos.append(f"{dst}  {(OUT / dst).stat().st_size / 1024:.0f} KB")


webp(SAIDA / "antes" / "desktop-00b-descanso.png", "antes-hero.webp", 1440)
webp(capture("final", "desktop-*b-descanso-hero.png"), "depois-hero.webp", 1440)
webp(capture("final", "desktop-*b-descanso-como-trabalhamos.png"), "tela-04.webp", 1440)

for v in ("original", "A", "B"):
    webp(SAIDA / "prancha" / f"3d-{v}-assinatura.png", f"3d-{v}.webp", 640, crop=(0, 0, 1, 0.975))  # sem a tira do nome, no rodapé
    copy(SAIDA / "miolo" / f"emblema_{v}.svg", f"emblema_{v}.svg")
webp(SAIDA / "miolo" / "miolo_A_sobre_original.png", "sobre_A.webp", 1280)

for rest in ("hero", "financas-empresariais", "financas-pessoais", "investimentos", "como-trabalhamos", "programas", "assinatura"):
    webp(SAIDA / "prancha" / f"rest-{rest}.png", f"rest-{rest}.webp", 420, crop=(0, 0, 1, 0.97) if rest == "assinatura" else None)

# o recorte do meio da travessia pega o título da seção seguinte, embaixo: fica só a Torre
webp(SAIDA / "prancha" / "fade-sem-meio-financas-empresariais.png", "fade-sem-meio.webp", 600, crop=(0.12, 0.14, 0.88, 0.76))
webp(SAIDA / "prancha" / "fade-com-meio-financas-empresariais.png", "fade-com-meio.webp", 600, crop=(0.12, 0.14, 0.88, 0.76))

# folha de contato do celular: os descansos lado a lado
mobile = sorted(glob.glob(str(SAIDA / "final" / "celular-*b-descanso-*.png")))
if mobile:
    ims = [Image.open(f).convert("RGB") for f in mobile]
    h = 760
    ims = [im.resize((round(im.width * h / im.height), h), Image.LANCZOS) for im in ims]
    sheet = Image.new("RGB", (sum(i.width for i in ims) + 12 * (len(ims) - 1), h), (214, 212, 224))
    x = 0
    for im in ims:
        sheet.paste(im, (x, 0))
        x += im.width + 12
    sheet.save(OUT / "celular-descansos.webp", "WEBP", quality=84, method=6)
    feitos.append(f"celular-descansos.webp  {sheet.width}x{sheet.height}  {(OUT / 'celular-descansos.webp').stat().st_size / 1024:.0f} KB")
else:
    faltando.append("saida/final/celular-*b-descanso-*.png")

print("\n".join(feitos))
total = sum(p.stat().st_size for p in OUT.iterdir()) / 1024
print(f"\n{len(feitos)} arquivos em {OUT.relative_to(ROOT)}  ({total:.0f} KB no total)")
if faltando:
    print("\nFaltando:\n  " + "\n  ".join(faltando))
