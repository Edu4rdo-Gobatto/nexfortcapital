"""
Redesenho do miolo (urso e touro) com linhas mais retas: gera design/torre/miolo-redesenho.json.

Uso (na raiz do projeto):
    python design/torre/curar_miolo.py               # grava o JSON
    python design/torre/curar_miolo.py --check DIR   # também grava as imagens de conferência em DIR

Por que existe: o traçado automático do logo (JPEG pequeno) deixa a borda do urso e do touro em escada e
ondulada, e a laca brilhante do 3D mostra cada ondulação. Aqui o contorno é redesenhado sobre a medida:
    - os PONTOS-CHAVE são escolhidos à mão (orelha, focinho, queixo, divisa urso/touro, chifre, linha do
      pescoço, mancha vermelha da base), em px do recorte da Torre (o mesmo sistema de extract_torre.py);
    - entre dois pontos, a aresta é RETA onde a forma é reta;
    - só onde a forma é curva (variante A) a aresta vira uma Bézier cúbica ajustada ao traçado original;
    - a variante B (facetada) troca toda curva por poucos segmentos retos (RDP);
    - onde o miolo encosta na silhueta, a borda segue a silhueta e passa 3 px para fora: o emblema 2D e o favicon
      recortam pela silhueta (clip-path) e não deixam fresta azul; no 3D o limbo esmaece para o azul de qualquer jeito.

O JSON guarda, por variante, o caminho final `d` (é o que o extract_torre.py lê) e os pontos-chave (consulta).
A variante usada é a "escolhida": este script a preserva quando o JSON já existe (padrão: A). Para trocar, edite
"escolhida" no JSON e rode extract_torre.py de novo, ou passe --variante A|B|original a ele. Para ajustar um
ponto: mude-o em KEYS_A abaixo e rode este script (depois, extract_torre.py).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import extract_torre as et

EXT = 3.0  # px que a borda do miolo passa para fora da silhueta (só o 3D vê; o 2D recorta)
RDP_B = 1.7  # tolerância do RDP da variante facetada (px)

# --------------------------------------------------------------------------------------------- pontos-chave
# (nome, (x, y), estilo da aresta que CHEGA neste ponto vindo do anterior, tangente opcional em graus)
# Estilos: "L" reta · "C" Bézier ajustada ao traçado · "R" retas (RDP) · "X" prolongamento reto para fora da silhueta · "borda" acompanha a silhueta.
# Ordem horária (y para baixo). O primeiro ponto recebe a aresta de fechamento (a orelha).
# Tangente: direção do percurso no ponto (0° = para a direita, 90° = para baixo); suaviza duas arestas vizinhas.

Key = tuple[str, tuple[float, float], str, float | None]

KEYS_A: list[Key] = [
    ("orelha_topo", (50.4, 137.5), "C", None),  # a orelha é a única curva fechada do urso
    ("coroa_topo", (88.0, 127.5), "C", 0.0),  # testa e costas: dois arcos, com tangente horizontal no ponto mais alto
    ("coroa_dir", (112.8, 132.3), "C", None),
    ("coroa_fim", (118.8, 134.0), "X", None),  # prolonga a testa até a borda (fora da silhueta)
    ("mancha_esq", (64.1, 255.3), "borda", None),  # desce pela borda direita e volta pela base
    ("mancha_curva", (106.6, 240.4), "C", None),  # arco convexo da mancha vermelha, da base até o fundo do queixo do touro
    ("pescoco_base", (116.3, 228.0), "C", None),  # canto arredondado da cabeça do touro
    ("pescoco_topo", (108.2, 198.0), "L", None),  # a linha do pescoço do touro é reta
    ("junta_baixo", (105.2, 196.1), "L", None),  # o gancho arredondado onde o chifre encontra o pescoço, em duas retas curtas
    ("junta_cima", (105.2, 194.3), "L", None),
    ("chifre_ponta", (119.5, 175.1), "C", None),  # borda de baixo do chifre: arco convexo
    ("vale", (104.0, 185.6), "C", None),  # borda de cima do chifre
    ("cocuruto", (84.0, 179.4), "C", 180.0),  # divisa urso/touro: onda suave
    ("queixo_fim", (54.2, 187.4), "C", None),
    ("queixo_ini", (39.8, 185.2), "L", None),  # o queixo do urso é reto
    ("focinho_baixo", (34.0, 181.6), "L", None),
    ("focinho_topo", (33.6, 178.8), "L", None),
    ("nariz", (40.2, 169.0), "L", None),
    ("bochecha", (40.0, 156.0), "L", None),
    ("orelha_baixo", (48.9, 145.3), "L", None),
]

# B: as mesmas arestas, sem nenhuma curva (cada "C" vira retas pelo RDP)
KEYS_B: list[Key] = [(n, p, "R" if s == "C" else s, t) for n, p, s, t in KEYS_A]

VARIANTES = {
    "A": {
        "nome": "Redesenho A: retas onde a forma é reta, curvas deliberadas só onde ela é curva",
        "descricao": (
            "Queixo, focinho, bochecha, nariz e a linha do pescoço do touro são retas. Ficam curvos, e suaves, "
            "só a orelha, a testa, a divisa urso/touro, o chifre e a mancha vermelha da base."
        ),
        "keys": KEYS_A,
    },
    "B": {
        "nome": "Redesenho B: facetado, só retas",
        "descricao": "Todos os contornos em segmentos retos (RDP de ~1,7 px sobre as mesmas arestas): leitura de entalhe.",
        "keys": KEYS_B,
    },
}

# ------------------------------------------------------------------------------------------- dados do logo


def load_logo_data() -> dict:
    """O logo e o que se mede dele, pelas mesmas funções do extract_torre.py (o traçado de referência é o mesmo)."""
    logo, _, masks, field = et.load_logo()
    axis, ys, rs = et.measure_profile(field)
    fine = max(et.warm_trace(masks), key=len)  # a ilhota espúria (12 pontos junto à borda) fica de fora
    if et.signed_area(fine) < 0:  # sentido horário, como os pontos-chave
        fine = fine[::-1]
    sil = max(et.silhouette_trace(field), key=len)
    big = et.blur(et.upscale(field, et.UP), 0.35 * et.UP)
    return {"logo": logo, "axis": axis, "ys": ys, "rs": rs, "fine": fine, "sil": sil, "big": big, "warm": masks["warm"]}


def right_edge(data: dict, y: float) -> float:
    return float(np.interp(y, data["ys"], data["axis"] + data["rs"]))


def bottom_edge(data: dict, x: float) -> float:
    """Menor y (o mais baixo) da silhueta na coluna x, em px do recorte."""
    big = data["big"]
    col = big[:, int(round((x + 0.5) * et.UP - 0.5))]
    idx = np.where(col > 0.5)[0]
    b = idx[-1]
    y = b + (col[b] - 0.5) / (col[b] - col[b + 1]) if b + 1 < len(col) else float(b)
    return (y + 0.5) / et.UP - 0.5


def border_run(data: dict, start: tuple[float, float], end: tuple[float, float]) -> list[tuple[float, float]]:
    """Pontos da borda que acompanha a silhueta, EXT px para fora: desce pela direita e volta pela base."""
    pts = []
    y = start[1] + 10
    while y < 226.5:
        pts.append((right_edge(data, y) + EXT, y))
        y += 10
    # lateral e canto do plinto, depois o fundo abaulado até a ponta esquerda da mancha
    pts.append((right_edge(data, 232.0) + EXT, 232.0))
    pts.append((right_edge(data, 240.0) + EXT, 240.0))
    x = right_edge(data, 240.0) - 3.0
    while x > end[0] + 4:
        pts.append((x, bottom_edge(data, x) + EXT))
        x -= 8
    return pts


# ------------------------------------------------------------------------------------- ajuste de curvas


def arc_between(fine: np.ndarray, a: tuple[float, float], b: tuple[float, float]) -> np.ndarray:
    """Trecho do traçado original (sentido horário) entre os pontos mais próximos de a e b."""
    ia = int(np.argmin(np.hypot(*(fine - a).T)))
    ib = int(np.argmin(np.hypot(*(fine - b).T)))
    idx = list(range(ia, ib + 1)) if ib >= ia else list(range(ia, len(fine))) + list(range(0, ib + 1))
    pts = fine[idx].copy()
    pts[0], pts[-1] = a, b
    return pts


def fit_cubic(pts: np.ndarray, t1: np.ndarray | None, t2: np.ndarray | None, iters: int = 8) -> np.ndarray:
    """Bézier cúbica de p0 a p3 ajustada por mínimos quadrados; t1/t2: tangentes unitárias (sentido do percurso)."""
    p0, p3 = pts[0], pts[-1]
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    u = d / d[-1]
    dense = np.linspace(0, 1, 400)
    P = np.array([p0, p0 + (p3 - p0) / 3, p0 + 2 * (p3 - p0) / 3, p3])
    n = len(pts)
    for _ in range(iters):
        b0, b1, b2, b3 = (1 - u) ** 3, 3 * (1 - u) ** 2 * u, 3 * (1 - u) * u**2, u**3
        zero = np.zeros(n)
        if t1 is None and t2 is None:  # P1 e P2 livres
            rhs = np.r_[pts[:, 0] - b0 * p0[0] - b3 * p3[0], pts[:, 1] - b0 * p0[1] - b3 * p3[1]]
            cols = [np.r_[b1, zero], np.r_[b2, zero], np.r_[zero, b1], np.r_[zero, b2]]
            s = np.linalg.lstsq(np.column_stack(cols), rhs, rcond=None)[0]
            P = np.array([p0, [s[0], s[2]], [s[1], s[3]], p3])
        elif t1 is not None and t2 is not None:  # P1 = p0 + a1 t1 ; P2 = p3 - a2 t2
            rhs = np.r_[pts[:, 0] - (b0 + b1) * p0[0] - (b2 + b3) * p3[0], pts[:, 1] - (b0 + b1) * p0[1] - (b2 + b3) * p3[1]]
            cols = [np.r_[b1 * t1[0], b1 * t1[1]], np.r_[-b2 * t2[0], -b2 * t2[1]]]
            a = np.linalg.lstsq(np.column_stack(cols), rhs, rcond=None)[0]
            P = np.array([p0, p0 + max(a[0], 0.2) * t1, p3 - max(a[1], 0.2) * t2, p3])
        elif t1 is not None:  # P1 = p0 + a1 t1 ; P2 livre
            rhs = np.r_[pts[:, 0] - (b0 + b1) * p0[0] - b3 * p3[0], pts[:, 1] - (b0 + b1) * p0[1] - b3 * p3[1]]
            cols = [np.r_[b1 * t1[0], b1 * t1[1]], np.r_[b2, zero], np.r_[zero, b2]]
            s = np.linalg.lstsq(np.column_stack(cols), rhs, rcond=None)[0]
            P = np.array([p0, p0 + max(s[0], 0.2) * t1, [s[1], s[2]], p3])
        else:  # P2 = p3 - a2 t2 ; P1 livre
            rhs = np.r_[pts[:, 0] - b0 * p0[0] - (b2 + b3) * p3[0], pts[:, 1] - b0 * p0[1] - (b2 + b3) * p3[1]]
            cols = [np.r_[b1, zero], np.r_[zero, b1], np.r_[-b2 * t2[0], -b2 * t2[1]]]
            s = np.linalg.lstsq(np.column_stack(cols), rhs, rcond=None)[0]
            P = np.array([p0, [s[0], s[1]], p3 - max(s[2], 0.2) * t2, p3])
        curve = et.bezier(P, dense)  # reparametriza: cada ponto vai para o parâmetro mais próximo
        u = dense[np.argmin(((pts[:, None, :] - curve[None, :, :]) ** 2).sum(axis=2), axis=1)]
        u[0], u[-1] = 0.0, 1.0
    return P


def dist_to_polyline(points: np.ndarray, poly: np.ndarray, closed: bool = False) -> np.ndarray:
    a = poly if closed else poly[:-1]
    b = np.roll(poly, -1, axis=0) if closed else poly[1:]
    ab = b - a
    ap = points[:, None, :] - a[None, :, :]
    t = np.clip((ap * ab[None]).sum(axis=2) / np.maximum((ab**2).sum(axis=1), 1e-12)[None, :], 0, 1)
    proj = a[None] + t[..., None] * ab[None]
    return np.sqrt(((points[:, None, :] - proj) ** 2).sum(axis=2)).min(axis=1)


def direction(deg: float | None) -> np.ndarray | None:
    return None if deg is None else np.array([np.cos(np.radians(deg)), np.sin(np.radians(deg))])


# ----------------------------------------------------------------------------------------- montagem


def build(data: dict, keys: list[Key]) -> tuple[str, list[str]]:
    """Caminho SVG (px do recorte) e relatório das arestas, a partir dos pontos-chave."""
    fine = data["fine"]
    n = len(keys)
    report = []
    segs = [f"M{keys[0][1][0]:.1f} {keys[0][1][1]:.1f}"]
    for i in range(1, n + 1):
        prev = keys[i - 1]
        cur = keys[i % n]
        name, p, style, _ = cur
        a = np.array(prev[1])
        b = np.array(p)
        if style == "L":
            segs.append(f"L{b[0]:.1f} {b[1]:.1f}")
            arc = arc_between(fine, tuple(a), tuple(b))
            dev = float(dist_to_polyline(arc, np.array([a, b])).max())
            report.append(f"{prev[0]:>16s} → {name:<16s} reta        desvio {dev:4.2f} px")
        elif style == "X":
            segs.append(f"L{b[0]:.1f} {b[1]:.1f}")
            report.append(f"{prev[0]:>16s} -> {name:<16s} prolonga     para fora da silhueta (sem medida)")
        elif style == "borda":
            pts = border_run(data, tuple(a), tuple(b))
            for x, y in pts:
                segs.append(f"L{x:.1f} {y:.1f}")
            segs.append(f"L{b[0]:.1f} {b[1]:.1f}")
            report.append(f"{prev[0]:>16s} → {name:<16s} borda       {len(pts)} pontos na silhueta (+{EXT:g} px)")
        elif style == "R":
            arc = arc_between(fine, tuple(a), tuple(b))
            poly = et.rdp(arc, RDP_B)
            for x, y in poly[1:]:
                segs.append(f"L{x:.1f} {y:.1f}")
            dev = float(max(dist_to_polyline(arc, poly).max(), dist_to_polyline(poly, arc).max()))
            report.append(f"{prev[0]:>16s} → {name:<16s} {len(poly) - 1} retas      desvio {dev:4.2f} px")
        else:  # "C"
            arc = arc_between(fine, tuple(a), tuple(b))
            P = fit_cubic(arc, direction(prev[3]), direction(cur[3]))
            segs.append(f"C{P[1][0]:.1f} {P[1][1]:.1f} {P[2][0]:.1f} {P[2][1]:.1f} {P[3][0]:.1f} {P[3][1]:.1f}")
            curve = et.bezier(P, np.linspace(0, 1, 200))
            dev = float(max(dist_to_polyline(arc, curve).max(), dist_to_polyline(curve, arc).max()))
            report.append(f"{prev[0]:>16s} → {name:<16s} curva       desvio {dev:4.2f} px")
    return "".join(segs) + "Z", report


def near_edge(data: dict, pts: np.ndarray, margin: float = 2.2) -> np.ndarray:
    """Pontos fora da silhueta ou a menos de `margin` px da borda dela (a borda do miolo é de propósito)."""
    sil = data["sil"]
    d = dist_to_polyline(pts, sil, closed=True)
    inside = point_in_polygon(pts, sil)
    return ~inside | (d < margin)


def point_in_polygon(pts: np.ndarray, poly: np.ndarray) -> np.ndarray:
    x, y = pts[:, 0][:, None], pts[:, 1][:, None]
    x0, y0 = poly[:, 0][None, :], poly[:, 1][None, :]
    x1, y1 = np.roll(poly[:, 0], -1)[None, :], np.roll(poly[:, 1], -1)[None, :]
    cond = (y0 > y) != (y1 > y)
    xin = (x1 - x0) * (y - y0) / np.where(y1 == y0, 1e-12, y1 - y0) + x0
    return (cond & (x < xin)).sum(axis=1) % 2 == 1


def deviation(data: dict, d: str) -> tuple[float, float]:
    """Desvio máximo (px) entre o caminho e o traçado original, sem a borda da silhueta. Retorna (máx, p95)."""
    curated = et.flatten_path(d, 0.2)[0]
    fine = data["fine"]
    fine_dense = np.vstack([np.linspace(fine[i], fine[(i + 1) % len(fine)], 4, endpoint=False) for i in range(len(fine))])
    c_closed = np.vstack([curated, curated[:1]])
    f_closed = np.vstack([fine, fine[:1]])
    d1 = dist_to_polyline(curated, f_closed)[~near_edge(data, curated)]
    d2 = dist_to_polyline(fine_dense, c_closed)[~near_edge(data, fine_dense)]
    both = np.r_[d1, d2]
    return float(both.max()), float(np.percentile(both, 95))


def mask_iou(data: dict, d: str) -> float:
    """IoU entre o miolo redesenhado (recortado pela silhueta) e a região quente medida no logo."""
    S = 8
    h, w = data["warm"].shape
    img = Image.new("L", (w * S, h * S), 0)
    ImageDraw.Draw(img).polygon([((x + 0.5) * S, (y + 0.5) * S) for x, y in et.flatten_path(d, 0.2)[0]], fill=255)
    sil = Image.new("L", (w * S, h * S), 0)
    ImageDraw.Draw(sil).polygon([((x + 0.5) * S, (y + 0.5) * S) for x, y in data["sil"]], fill=255)
    a = (np.asarray(img) > 127) & (np.asarray(sil) > 127)
    b = np.asarray(Image.fromarray(data["warm"].astype(np.uint8) * 255).resize((w * S, h * S), Image.BILINEAR)) > 127
    return float((a & b).sum() / (a | b).sum())


def overlay(data: dict, variants: dict[str, str], out: Path) -> None:
    """Sobreposição 10x: original, traçado fino (ciano) e redesenho (magenta), com grade em px do recorte."""
    S = 10
    x0, y0, x1, y1 = 22, 122, 150, 260
    base = data["logo"].crop(et.ROOK_BOX).crop((x0, y0, x1, y1)).resize(((x1 - x0) * S, (y1 - y0) * S), Image.LANCZOS)
    for name, d in variants.items():
        img = base.copy()
        dr = ImageDraw.Draw(img, "RGBA")
        for gx in range((x0 // 10 + 1) * 10, x1, 10):
            dr.line([((gx - x0 + 0.5) * S, 0), ((gx - x0 + 0.5) * S, img.height)], fill=(255, 255, 255, 90))
            dr.text(((gx - x0 + 0.5) * S + 2, 2), str(gx), fill=(255, 255, 255, 255))
        for gy in range((y0 // 10 + 1) * 10, y1, 10):
            dr.line([(0, (gy - y0 + 0.5) * S), (img.width, (gy - y0 + 0.5) * S)], fill=(255, 255, 255, 90))
            dr.text((2, (gy - y0 + 0.5) * S + 2), str(gy), fill=(255, 255, 255, 255))
        fine = [((x - x0 + 0.5) * S, (y - y0 + 0.5) * S) for x, y in data["fine"]]
        dr.line(fine + [fine[0]], fill=(0, 255, 255, 255), width=2)
        for loop in et.flatten_path(d, 0.2):
            pts = [((x - x0 + 0.5) * S, (y - y0 + 0.5) * S) for x, y in loop]
            dr.line(pts + [pts[0]], fill=(255, 0, 255, 255), width=3)
        for cmd, args in et.parse_path(d):
            if cmd in ("M", "L"):
                px, py = (args[0] - x0 + 0.5) * S, (args[1] - y0 + 0.5) * S
                dr.ellipse([px - 4, py - 4, px + 4, py + 4], outline=(255, 255, 0, 255), width=2)
        img.save(out / f"miolo_{name}_sobre_original.png")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # o console do Windows usa cp1252 e quebra com acentos e setas
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", type=Path, help="pasta para as imagens de conferência")
    args = parser.parse_args()

    data = load_logo_data()
    result = {}
    paths = {}
    for name, v in VARIANTES.items():
        d, report = build(data, v["keys"])
        dmax, p95 = deviation(data, d)
        iou = mask_iou(data, d)
        print(f"\n== variante {name}: {v['nome']}")
        print("\n".join(report))
        print(f"   desvio máximo {dmax:.2f} px · p95 {p95:.2f} px · IoU com a região quente {iou:.4f} · {len(et.parse_path(d))} comandos · {len(d)} bytes")
        paths[name] = d
        result[name] = {
            "nome": v["nome"],
            "descricao": v["descricao"],
            "desvio_max_px": round(dmax, 2),
            "iou_regiao_quente": round(iou, 4),
            "pontos_chave": {n: [p[0], p[1]] for n, p, _, _ in v["keys"]},
            "d": d,
        }

    previous = et.load_redesign_data()  # a escolha do autor não se perde ao reajustar um ponto
    chosen = previous["escolhida"] if previous and previous.get("escolhida") in VARIANTES else "A"
    out_json = {
        "versao": 1,
        "unidade": "px do recorte da Torre (ROOK_BOX de extract_torre.py), y para baixo; caminho SVG absoluto (M, L, C, Z)",
        "escolhida": chosen,
        "nota": (
            "Redesenho autorizado pelo autor em 08/11/2026 (urso e touro 'tortos'): altera de leve o desenho do logo. "
            "A borda direita e a base do miolo passam 3 px para fora da silhueta de propósito: o emblema 2D e o favicon "
            "recortam pela silhueta (sem fresta azul) e, no 3D, o limbo esmaece para o azul. Para trocar de variante, "
            "mude 'escolhida' e rode python design/torre/extract_torre.py (ou use --variante A|B|original)."
        ),
        "variantes": result,
    }
    et.REDESIGN_JSON.write_text(json.dumps(out_json, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n{et.REDESIGN_JSON.relative_to(et.ROOT)} gravado")

    if args.check:
        args.check.mkdir(parents=True, exist_ok=True)
        overlay(data, paths, args.check)
        print(f"imagens em {args.check}")


if __name__ == "__main__":
    main()
