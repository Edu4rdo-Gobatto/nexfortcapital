"""
Extrai do logo original tudo o que a Torre 3D e a assinatura precisam, sem inventar formas.

Uso (na raiz do projeto):
    python design/torre/extract_torre.py               # gera os arquivos .ts
    python design/torre/extract_torre.py --check DIR   # também grava imagens de conferência em DIR

Entrada: design/referencias/logo-nexfort-original.png (1080 px, JPEG de origem; a Torre tem ~240 px).

Saídas (geradas, não edite à mão):
    src/components/torre/geometry.ts  perfil de revolução da Torre + ameias (unidades 3D: 1 = 100 px do logo)
    src/components/torre/miolo.ts     urso e touro em vetor + degradê original medido
    src/components/brand/marks.ts     emblema 2D (silhueta, miolo, filetes) e o nome "NEXFORT CAPITAL" em vetor
    src/app/icon.svg                  favicon: o emblema sobre o fundo da página

Miolo (urso e touro): se design/torre/miolo-redesenho.json existir, o desenho vem dele (variante "escolhida",
ou --variante A|B|original). O JSON é gerado por design/torre/curar_miolo.py a partir de pontos-chave curados.

Como funciona:
    - A silhueta, o miolo quente e os filetes claros são separados por cor (o desenho é de cores chapadas).
    - Cada camada vira um campo contínuo, ampliado 8x e levemente alisado; o contorno sai da isolinha 0,5
      por marching squares (precisão subpixel) e é simplificado (Ramer-Douglas-Peucker).
    - O perfil da Torre é a meia-largura da silhueta linha a linha, em torno do eixo medido.
    - As ameias do logo têm larguras iguais no desenho 2D. No 3D elas ficam em volta do eixo com ângulos
      asin(x / R) calculados das bordas medidas e espelhados atrás: de frente, a silhueta é a do logo.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "design" / "referencias" / "logo-nexfort-original.png"
OUT_GEOMETRY = ROOT / "src" / "components" / "torre" / "geometry.ts"
OUT_MIOLO = ROOT / "src" / "components" / "torre" / "miolo.ts"
OUT_MARKS = ROOT / "src" / "components" / "brand" / "marks.ts"
OUT_ICON = ROOT / "src" / "app" / "icon.svg"

ROOK_BOX = (462, 350, 618, 612)  # a Torre no logo de 1080 px
WORD_BOX = (132, 614, 950, 686)  # "NEXFORT CAPITAL"
UP = 8  # ampliação de trabalho
UNIT = 100.0  # px do logo por unidade 3D
ICON_BG = "#f6f5f9"  # fundo do favicon: o mesmo neutro tingido da página (--color-paper em globals.css)
HEADER = "// Gerado por design/torre/extract_torre.py a partir do logo original. Não edite à mão.\n"


# ---------------------------------------------------------------------------------------------- campos


def gaussian_kernel(sigma: float) -> np.ndarray:
    radius = max(1, int(math.ceil(sigma * 3)))
    x = np.arange(-radius, radius + 1, dtype=np.float64)
    k = np.exp(-(x**2) / (2 * sigma**2))
    return k / k.sum()


def blur(field: np.ndarray, sigma: float) -> np.ndarray:
    """Desfoque gaussiano separável (float, sem perder precisão como o PIL em 8 bits)."""
    if sigma <= 0:
        return field
    k = gaussian_kernel(sigma)
    pad = len(k) // 2
    out = np.pad(field, pad, mode="edge")
    out = np.apply_along_axis(lambda r: np.convolve(r, k, mode="valid"), 1, out)
    out = np.apply_along_axis(lambda c: np.convolve(c, k, mode="valid"), 0, out)
    return out


def upscale(field: np.ndarray, factor: int) -> np.ndarray:
    """Amplia um campo float com bicúbica, alinhando centros de pixel (coordenada x_up = (x + 0.5) * f - 0.5)."""
    img = Image.fromarray(field.astype(np.float32), mode="F")
    big = img.resize((field.shape[1] * factor, field.shape[0] * factor), Image.BICUBIC)
    return np.asarray(big, dtype=np.float64)


def segment_logo(rgb: np.ndarray) -> dict[str, np.ndarray]:
    """Silhueta (fundo claro ligado às bordas), miolo quente e filetes claros, como no extrator antigo."""
    rgb = rgb.astype(np.int16)
    r, b = rgb[..., 0], rgb[..., 2]
    low, high = rgb.min(axis=2), rgb.max(axis=2)
    light = ((low > 200) & (high - low < 30)).astype(np.uint8) * 255
    flood = Image.fromarray(light).copy()  # .copy(): no Pillow 12 o fromarray compartilha memória
    for corner in [(0, 0), (flood.width - 1, 0), (0, flood.height - 1), (flood.width - 1, flood.height - 1)]:
        ImageDraw.floodfill(flood, corner, 128)
    silhouette = np.asarray(flood) != 128
    warm = silhouette & (r > b + 60)
    inner = np.asarray(Image.fromarray(silhouette.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(3))) > 0
    lines = inner & ~warm & (low > 150)
    return {"silhouette": silhouette, "warm": warm, "lines": lines, "inner": inner}


def silhouette_field(rgb: np.ndarray, masks: dict[str, np.ndarray]) -> np.ndarray:
    """Campo 0..1 da silhueta: distância de cor ao fundo nas bordas (antisserrilhado = subpixel), 1 no miolo."""
    bg = np.array([232.0, 228.0, 227.0])
    dist = np.abs(rgb.astype(np.float64) - bg).max(axis=2) / 215.0
    field = np.clip(dist, 0, 1)
    field[~masks["silhouette"]] = np.minimum(field[~masks["silhouette"]], 0.49)  # fundo nunca vira Torre
    field[masks["inner"]] = 1.0  # filetes claros de dentro não furam a silhueta
    return field


# ------------------------------------------------------------------------------------ marching squares


def marching_squares(field: np.ndarray, t: float = 0.5) -> list[np.ndarray]:
    """Isolinhas fechadas de field == t, em coordenadas de pixel (x, y)."""
    F = np.pad(field, 1, mode="constant", constant_values=min(field.min(), t) - 1.0)
    H, W = F.shape
    tl, tr = F[:-1, :-1] > t, F[:-1, 1:] > t
    br, bl = F[1:, 1:] > t, F[1:, :-1] > t
    case = tl * 8 + tr * 4 + br * 2 + bl * 1
    center = (F[:-1, :-1] + F[:-1, 1:] + F[1:, 1:] + F[1:, :-1]) / 4 > t

    def h(i: int, j: int) -> int:  # aresta horizontal na linha i, entre as colunas j e j+1
        return (i * W + j) * 2

    def v(i: int, j: int) -> int:  # aresta vertical na coluna j, entre as linhas i e i+1
        return (i * W + j) * 2 + 1

    links: dict[int, list[int]] = {}

    def link(a: int, b: int) -> None:
        links.setdefault(a, []).append(b)
        links.setdefault(b, []).append(a)

    for i, j in np.argwhere((case > 0) & (case < 15)):
        c = int(case[i, j])
        top, right, bottom, left = h(i, j), v(i, j + 1), h(i + 1, j), v(i, j)
        if c in (1, 14):
            link(left, bottom)
        elif c in (2, 13):
            link(right, bottom)
        elif c in (3, 12):
            link(left, right)
        elif c in (4, 11):
            link(top, right)
        elif c in (6, 9):
            link(top, bottom)
        elif c in (7, 8):
            link(left, top)
        elif c == 5:  # tr e bl dentro (sela)
            if center[i, j]:
                link(left, top), link(right, bottom)
            else:
                link(top, right), link(left, bottom)
        elif c == 10:  # tl e br dentro (sela)
            if center[i, j]:
                link(top, right), link(left, bottom)
            else:
                link(left, top), link(right, bottom)

    def point(key: int) -> tuple[float, float]:
        cell, vertical = divmod(key, 2)
        i, j = divmod(cell, W)
        if vertical:
            a, b = F[i, j], F[i + 1, j]
            return j - 1.0, i + (t - a) / (b - a) - 1.0
        a, b = F[i, j], F[i, j + 1]
        return j + (t - a) / (b - a) - 1.0, i - 1.0

    contours, seen = [], set()
    for start in links:
        if start in seen:
            continue
        loop, prev, cur = [start], None, start
        seen.add(start)
        while True:
            nxt = [n for n in links[cur] if n != prev]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
            if cur == start:
                break
            if cur in seen:
                break
            seen.add(cur)
            loop.append(cur)
        if len(loop) >= 8:
            contours.append(np.array([point(k) for k in loop]))
    return contours


def rdp(points: np.ndarray, tol: float) -> np.ndarray:
    """Ramer-Douglas-Peucker para uma polilinha aberta (iterativo)."""
    keep = np.zeros(len(points), dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        p, q = points[a], points[b]
        seg = q - p
        norm = np.hypot(*seg)
        rel = points[a + 1 : b] - p
        d = np.abs(seg[0] * rel[:, 1] - seg[1] * rel[:, 0]) / norm if norm > 1e-9 else np.hypot(rel[:, 0], rel[:, 1])
        k = int(np.argmax(d))
        if d[k] > tol:
            m = a + 1 + k
            keep[m] = True
            stack += [(a, m), (m, b)]
    return points[keep]


def simplify_closed(loop: np.ndarray, tol: float) -> np.ndarray:
    far = int(np.argmax(np.hypot(*(loop - loop.mean(axis=0)).T)))
    ring = np.vstack([loop[far:], loop[:far], loop[far : far + 1]])
    return rdp(ring, tol)[:-1]


def signed_area(loop: np.ndarray) -> float:
    """Área com sinal (fórmula do cadarço): positiva no sentido horário, com y para baixo."""
    return 0.5 * float(np.dot(loop[:, 0], np.roll(loop[:, 1], -1)) - np.dot(loop[:, 1], np.roll(loop[:, 0], -1)))


def bezier(P: np.ndarray, t: np.ndarray) -> np.ndarray:
    """Pontos da Bézier cúbica de pontos de controle P (4×2) nos parâmetros t."""
    t = np.asarray(t)[:, None]
    return (1 - t) ** 3 * P[0] + 3 * (1 - t) ** 2 * t * P[1] + 3 * (1 - t) * t**2 * P[2] + t**3 * P[3]


def contours_of(field: np.ndarray, sigma_px: float, tol_px: float, min_area_px: float = 4.0) -> list[np.ndarray]:
    """Contornos de um campo na resolução de origem (px), a partir da versão ampliada e alisada."""
    big = blur(upscale(field, UP), sigma_px * UP)
    loops = []
    for loop in marching_squares(big, 0.5):
        pts = (loop + 0.5) / UP - 0.5  # volta para coordenadas de pixel da origem
        area = abs(signed_area(pts))
        if area >= min_area_px:
            loops.append(simplify_closed(pts, tol_px))
    return loops


def to_path(loops: list[np.ndarray], dx: float = 0.0, dy: float = 0.0, scale: float = 1.0, nd: int = 2) -> str:
    parts = []
    for loop in loops:
        coords = [f"{(x + dx) * scale:.{nd}f} {(y + dy) * scale:.{nd}f}" for x, y in loop]
        parts.append("M" + "L".join(coords) + "Z")
    return "".join(parts)


# ------------------------------------------------------------------ caminhos SVG (M, L, C, Q, Z, absolutos)
# O redesenho do miolo (miolo-redesenho.json) é guardado como caminhos SVG em px do recorte da Torre.
# Estas funções leem, transformam e achatam esses caminhos, para gerar o 3D, o emblema e o favicon.

_PATH_TOKEN = re.compile(r"[MLCQZ]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?")
_PATH_ARGS = {"M": 2, "L": 2, "C": 6, "Q": 4, "Z": 0}
Segment = tuple[str, tuple[float, ...]]


def parse_path(d: str) -> list[Segment]:
    tokens = _PATH_TOKEN.findall(d)
    segments: list[Segment] = []
    i, cmd = 0, ""
    while i < len(tokens):
        if tokens[i] in _PATH_ARGS:
            cmd = tokens[i]
            i += 1
            if cmd == "Z":
                segments.append(("Z", ()))
                continue
        n = _PATH_ARGS[cmd]
        segments.append((cmd, tuple(float(t) for t in tokens[i : i + n])))
        i += n
        if cmd == "M":
            cmd = "L"  # pares seguintes a um M são retas (regra do SVG)
    return segments


def map_path(d: str, fn, nd: int = 2) -> str:
    """Aplica fn(x, y) -> (x', y') a todos os pontos (incluindo os de controle) e reescreve o caminho."""
    out = []
    for cmd, args in parse_path(d):
        pts = [fn(args[k], args[k + 1]) for k in range(0, len(args), 2)]
        out.append(cmd + " ".join(f"{v:.{nd}f}" for p in pts for v in p))
    return "".join(out)


def flatten_path(d: str, step: float = 0.25) -> list[np.ndarray]:
    """Contornos como polilinhas (curvas amostradas a cada ~step px)."""
    loops: list[list[tuple[float, float]]] = []
    cur: list[tuple[float, float]] = []
    for cmd, a in parse_path(d):
        if cmd == "M":
            if cur:
                loops.append(cur)
            cur = [(a[0], a[1])]
        elif cmd == "L":
            cur.append((a[0], a[1]))
        elif cmd in ("C", "Q"):
            p0 = np.array(cur[-1])
            ctrl = [p0] + [np.array(a[k : k + 2]) for k in range(0, len(a), 2)]
            n = max(8, int(sum(np.hypot(*(ctrl[k + 1] - ctrl[k])) for k in range(len(ctrl) - 1)) / step))
            ts = np.linspace(0, 1, n + 1)[1:]
            if cmd == "C":
                cur.extend((float(x), float(y)) for x, y in bezier(np.array(ctrl), ts))
            else:
                for t in ts:
                    p = (1 - t) ** 2 * ctrl[0] + 2 * (1 - t) * t * ctrl[1] + t**2 * ctrl[2]
                    cur.append((float(p[0]), float(p[1])))
    if cur:
        loops.append(cur)
    return [np.array(lp) for lp in loops]


REDESIGN_JSON = ROOT / "design" / "torre" / "miolo-redesenho.json"


def load_redesign_data() -> dict | None:
    """O JSON do redesenho do miolo, lido uma vez, ou None se ele não existir."""
    return json.loads(REDESIGN_JSON.read_text(encoding="utf-8")) if REDESIGN_JSON.exists() else None


def pick_variant(data: dict | None, variant: str | None) -> tuple[str, dict] | None:
    """Variante do redesenho (A ou B), ou None para o traçado original.

    variant: "A", "B", "original" ou None (usa a variante "escolhida" do JSON, se ele existir).
    """
    if variant == "original" or data is None:
        return None
    name = variant or data["escolhida"]
    if name not in data["variantes"]:
        raise SystemExit(f"variante '{name}' não existe em {REDESIGN_JSON.name} (há: {', '.join(data['variantes'])})")
    return name, data["variantes"][name]


# ------------------------------------------------------------------------------------------------ Torre


def measure_profile(field: np.ndarray) -> tuple[float, np.ndarray, np.ndarray]:
    """Meia-largura da silhueta por linha (ampliada), em px da origem. Retorna eixo, y e raio."""
    big = blur(upscale(field, UP), 0.35 * UP)
    ys, rs, centers = [], [], []
    for row in range(big.shape[0]):
        line = big[row]
        inside = line > 0.5
        if not inside.any():
            continue
        idx = np.where(inside)[0]
        a, b = idx[0], idx[-1]
        # cruzamentos subpixel nas pontas
        xl = a - 1 + (0.5 - line[a - 1]) / (line[a] - line[a - 1]) if a > 0 else float(a)
        xr = b + (line[b] - 0.5) / (line[b] - line[b + 1]) if b + 1 < len(line) else float(b)
        y = (row + 0.5) / UP - 0.5
        xl, xr = (xl + 0.5) / UP - 0.5, (xr + 0.5) / UP - 0.5
        ys.append(y), rs.append((xr - xl) / 2), centers.append((xl + xr) / 2)
    ys, rs, centers = np.array(ys), np.array(rs), np.array(centers)
    body = (ys > 75) & (ys < 240)
    axis = float(np.median(centers[body]))
    return axis, ys, rs


def merlon_layout(field: np.ndarray, axis: float, crown_r: float) -> dict[str, float | list]:
    """Bordas das ameias na faixa das ameias, convertidas em ângulos em volta do eixo."""
    big = blur(upscale(field, UP), 0.35 * UP)
    rows = [int((y + 0.5) * UP - 0.5) for y in np.arange(20, 31, 0.5)]
    edges_all = []
    for row in rows:
        line = big[row] > 0.5
        flips = np.where(np.diff(line.astype(np.int8)) != 0)[0]
        xs = [((f + 0.5) + 0.5) / UP - 0.5 for f in flips]
        if len(xs) == 8:
            edges_all.append(xs)
    edges = np.mean(np.array(edges_all), axis=0) - axis  # 8 bordas: 4 ameias
    left, right = -edges[:4][::-1], edges[4:]  # espelha a metade esquerda para comparar
    half = (left + right) / 2  # [início A, fim A, início B, fim B] a partir do centro (px)
    a0, a1, b0 = (math.asin(min(1.0, x / crown_r)) for x in half[:3])
    # A borda externa da ameia B coincide com a silhueta; um vão invisível de frente fica no flanco (90°),
    # com a mesma largura do vão central.
    b1 = math.pi / 2 - a0
    quarter = [(a0, a1), (b0, b1)]
    spans = []
    for s, e in quarter:  # espelha nos quatro quadrantes (frente/trás e esquerda/direita)
        spans += [(s, e), (-e, -s), (math.pi - e, math.pi - s), (-(math.pi - s), -(math.pi - e))]
    spans.sort()
    # topo e fundo: topo das ameias e fundo dos vãos, medidos nas colunas centrais
    return {"half_edges_px": half.tolist(), "spans": spans}


def column_top(field: np.ndarray, x: float) -> float:
    big = blur(upscale(field, UP), 0.35 * UP)
    col = big[:, int((x + 0.5) * UP - 0.5)]
    idx = np.where(col > 0.5)[0]
    a = idx[0]
    y = a - 1 + (0.5 - col[a - 1]) / (col[a] - col[a - 1])
    return (y + 0.5) / UP - 0.5


# Trechos do perfil (y em px do recorte da Torre), redesenhados sobre a medida: o JPEG deixa a borda em
# escada (o raio pula 0,5 px a cada ~6 linhas) e a laca brilhante transforma cada degrau num anel. Cada
# trecho vira uma forma lisa ajustada aos dados: reta, polinômio de grau baixo ou arco de elipse.
PROFILE_SEGMENTS = [
    ("parede da coroa", 47.3, ("const",)),
    ("chanfro", 60.0, ("poly", 1)),
    ("colar", 71.6, ("poly", 4)),
    ("garganta do colar", 78.2, ("poly", 3)),
    ("pescoço e corpo", 170.6, ("poly", 5)),
    ("anel", 181.4, ("poly", 4)),
    ("bojo", 209.0, ("poly", 3)),
    ("cintura", 218.3, ("poly", 2)),
    ("canto do plinto", 226.6, ("poly", 3)),
    ("lateral do plinto", 241.5, ("const",)),
]


def build_profile(ys: np.ndarray, rs: np.ndarray, floor_y: float, bottom_y: float) -> tuple[list[tuple[float, float]], list[str]]:
    """Perfil de revolução (r, y em px da origem, y para baixo), do eixo no piso da coroa até o eixo no fundo."""
    report = []
    edges = [floor_y] + [end for _, end, _ in PROFILE_SEGMENTS]
    fits = []
    for (name, _, model), y0, y1 in zip(PROFILE_SEGMENTS, edges[:-1], edges[1:]):
        sel = (ys >= y0 + 0.4) & (ys <= y1 - 0.4)
        y, r = ys[sel], rs[sel]
        kind = model[0]
        if kind == "const":
            c = float(np.median(r))
            f = (lambda c: lambda q: np.full_like(np.asarray(q, dtype=float), c))(c)
        else:  # polinômio de grau baixo: liso por construção, sem a escada do JPEG
            coef = np.polyfit(y, r, model[1])
            f = (lambda coef: lambda q: np.polyval(coef, q))(coef)
        resid = r - f(y)
        report.append(f"{name:18s} {y0:6.1f}-{y1:6.1f}  resíduo máx {np.abs(resid).max():.2f} px")
        fits.append((y0, y1, f))

    # avalia a cada 0,5 px e mistura os trechos vizinhos em ±0,5 px (sem degrau nas emendas)
    grid = np.arange(floor_y, edges[-1], 0.5)
    r_out = np.zeros_like(grid)
    for k, (y0, y1, f) in enumerate(fits):
        inside = (grid >= y0) & (grid < y1)
        r_out[inside] = f(grid[inside])
    for k in range(len(fits) - 1):
        yb = fits[k][1]
        win = np.abs(grid - yb) <= 0.5
        t = (grid[win] - (yb - 0.5)) / 1.0
        t = t * t * (3 - 2 * t)
        r_out[win] = (1 - t) * fits[k][2](grid[win]) + t * fits[k + 1][2](grid[win])

    pts = [(0.0, floor_y)] + [(float(a), float(b)) for a, b in zip(r_out, grid)]

    # fundo abaulado (a base curva do desenho): y(r) liso, com tangente horizontal no eixo
    r_side = float(r_out[-1])
    bot = (ys >= edges[-1]) & (rs > 4)
    rr, yy = rs[bot], ys[bot]
    # y = y_tip - c2 r² - c4 r⁴, passando pela lateral do plinto
    A = np.column_stack([np.ones_like(rr), rr**2, rr**4])
    coef, *_ = np.linalg.lstsq(A, yy, rcond=None)
    dome = lambda r: coef[0] + coef[1] * r**2 + coef[2] * r**4
    shift = edges[-1] - dome(r_side)  # emenda exata com a lateral
    for r in np.linspace(r_side, 0, 48)[1:]:
        pts.append((float(r), float(dome(r) + shift)))
    report.append(f"{'fundo':18s} {edges[-1]:6.1f}-{dome(0) + shift:6.1f}  (medido até {bottom_y:.1f})")
    return pts, report


def add_grooves(profile: list[tuple[float, float]], grooves: list[tuple[float, float, float]]) -> list[tuple[float, float]]:
    """Ranhuras reais onde o logo desenha filetes: (y, profundidade, meia-largura) em px."""
    out = []
    for r, y in profile:
        cut = 0.0
        for gy, depth, half in grooves:
            d = abs(y - gy)
            if d < half:
                cut = max(cut, depth * 0.5 * (1 + math.cos(math.pi * d / half)))
        out.append((max(0.0, r - cut) if r > 0 else r, y))
    return out


# ---------------------------------------------------------------------------------------------- degradê


def warm_gradient(rgb: np.ndarray, warm: np.ndarray, stops: int = 6) -> tuple[float, float, list[tuple[float, str]]]:
    core = np.asarray(Image.fromarray(warm.astype(np.uint8) * 255).filter(ImageFilter.MinFilter(3))) > 0
    rows = [y for y in range(rgb.shape[0]) if core[y].sum() > 3]
    y0, y1 = rows[0], rows[-1]
    cols = np.array([rgb[y][core[y]].mean(axis=0) for y in rows], dtype=np.float64)
    cols = np.array([np.convolve(np.pad(cols[:, c], 3, mode="edge"), np.ones(7) / 7, mode="valid") for c in range(3)]).T
    out = []
    for k in range(stops):
        f = k / (stops - 1)
        y = y0 + f * (y1 - y0)
        c = np.array([np.interp(y, rows, cols[:, ch]) for ch in range(3)])
        out.append((f, "#%02x%02x%02x" % tuple(int(round(v)) for v in c)))
    return float(y0), float(y1), out


# ------------------------------------------------------------------------------------------------- main


def fmt(v: float, nd: int = 4) -> str:
    s = f"{v:.{nd}f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def load_logo() -> tuple[Image.Image, np.ndarray, dict[str, np.ndarray], np.ndarray]:
    """O logo, o recorte da Torre, as máscaras de cor e o campo da silhueta."""
    logo = Image.open(SOURCE).convert("RGB")
    rgb = np.asarray(logo.crop(ROOK_BOX))
    masks = segment_logo(rgb)
    return logo, rgb, masks, silhouette_field(rgb, masks)


def warm_trace(masks: dict[str, np.ndarray]) -> list[np.ndarray]:
    """Traçado do miolo quente, estendido para fora da silhueta onde encosta nela (sem fresta azul na borda)."""
    warm = masks["warm"]
    grown = np.asarray(Image.fromarray(warm.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))) > 0
    warm_ext = warm | (grown & ~masks["silhouette"])
    return contours_of(blur(warm_ext.astype(np.float64), 0.3), 0.55, 0.06, min_area_px=6.0)


def silhouette_trace(field: np.ndarray) -> list[np.ndarray]:
    return contours_of(field, 0.35, 0.05)


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")  # o console do Windows usa cp1252 e quebra com acentos
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", type=Path, help="pasta para as imagens de conferência")
    parser.add_argument("--variante", help="miolo: uma variante de design/torre/miolo-redesenho.json (A, B...) ou 'original' (o traçado do logo); padrão: a 'escolhida' do JSON")
    args = parser.parse_args()

    logo, rgb, masks, field = load_logo()

    axis, ys, rs = measure_profile(field)
    top_y = float(np.mean([column_top(field, axis + dx) for dx in (-45, -15, 15, 45)]))  # topo das ameias
    floor_y = float(np.mean([column_top(field, axis + dx) for dx in (-31, 0, 31)]))  # fundo dos vãos
    crown_r = float(np.median(rs[(ys > 36) & (ys < 46)]))
    layout = merlon_layout(field, axis, crown_r)
    profile, profile_report = build_profile(ys, rs, floor_y, float(ys[-1]))
    bottom_y = profile[-1][1]  # ponta do fundo abaulado, já no perfil redesenhado
    mid_y = (top_y + bottom_y) / 2
    # filetes do logo -> ranhuras: dois no colar, um na base (medidos nas linhas claras)
    lines_y = sorted({int(y) for y, x in np.argwhere(masks["lines"]) if x > 45 and masks["lines"][y].sum() > 20})
    groove_rows = []
    for y in lines_y:
        if not groove_rows or y - groove_rows[-1][-1] > 2:
            groove_rows.append([y])
        else:
            groove_rows[-1].append(y)
    grooves = [(float(np.mean(g)), 0.9, 1.4) for g in groove_rows]  # centro do pixel = coordenada inteira
    profile = add_grooves(profile, grooves)

    # unidades 3D: x = r / UNIT, y para cima, centro vertical da Torre em 0
    def Y(y: float) -> float:
        return (mid_y - y) / UNIT

    lathe = [(r / UNIT, Y(y)) for r, y in profile][::-1]  # de baixo para cima (normais para fora)

    # miolo: contorno do quente, estendido para fora da silhueta onde encosta nela (sem fresta azul na borda)
    warm = masks["warm"]
    warm_loops = warm_trace(masks)
    g_y0, g_y1, stops = warm_gradient(rgb, warm)

    # emblema 2D: silhueta, miolo (sem extensão) e filetes
    sil_loops = silhouette_trace(field)
    miolo_loops = contours_of(blur(warm.astype(np.float64), 0.3), 0.55, 0.06, min_area_px=6.0)
    line_field = blur(masks["lines"].astype(np.float64), 0.25)
    line_loops = contours_of(line_field, 0.3, 0.05, min_area_px=1.5)

    # caminho do miolo em px do recorte: o redesenho curado (JSON) ou, sem ele, o traçado original. O redesenho é
    # um caminho só: o 3D usa como está (a borda passa 3 px da silhueta) e o 2D recorta pela silhueta (clip-path)
    redesign_data = load_redesign_data()
    variant_paths = {"original": to_path(miolo_loops)}  # para as imagens de conferência (--check): todas as variantes
    if redesign_data:
        variant_paths |= {k: v["d"] for k, v in redesign_data["variantes"].items()}
    redesign = pick_variant(redesign_data, args.variante)
    variant_name = redesign[0] if redesign else "original"
    if redesign:
        miolo_d3d = miolo_d2d = redesign[1]["d"]
        warm_loops = miolo_loops = flatten_path(miolo_d3d)
    else:
        miolo_d3d, miolo_d2d = to_path(warm_loops), to_path(miolo_loops)

    # nome: luminância (preto sobre cinza-claro)
    word_rgb = np.asarray(logo.crop(WORD_BOX)).astype(np.float64)
    lum = word_rgb @ np.array([0.299, 0.587, 0.114])
    word_field = np.clip((240.0 - lum) / 225.0, 0, 1)
    word_loops = contours_of(word_field, 0.42, 0.07, min_area_px=3.0)
    allpts = np.vstack(word_loops)
    wx0, wy0 = allpts.min(axis=0)
    wx1, wy1 = allpts.max(axis=0)

    # --- geometry.ts
    navy = tuple(int(v) for v in rgb[masks["silhouette"] & ~masks["warm"] & ~masks["lines"] & (rgb.max(axis=2) < 140)].mean(axis=0))
    spans = layout["spans"]
    geometry = HEADER + f"""
/** Unidades 3D: 1 = {UNIT:g} px do logo de 1080 px. Eixo medido em x = {axis:.2f} px do recorte da Torre. */
export const TORRE_UNIT_PX = {UNIT:g};

/** Altura total (do topo das ameias ao fundo), em unidades. A Torre fica centrada em y = 0. */
export const TORRE_HEIGHT = {fmt((bottom_y - top_y) / UNIT)};

/** Perfil de revolução [raio, y], de baixo para cima, para LatheGeometry. Inclui as ranhuras dos filetes. */
export const TORRE_PROFILE: ReadonlyArray<readonly [number, number]> = [
{chr(10).join(f"  [{fmt(r, 6)}, {fmt(y, 6)}]," for r, y in lathe)}
];

/** Ameias: anéis entre raio interno e externo, do piso da coroa ao topo. Ângulos em radianos (0 = frente, +x à direita). */
export const TORRE_MERLONS = {{
  outerRadius: {fmt(crown_r / UNIT)},
  innerRadius: {fmt(crown_r * 0.7 / UNIT)},
  bottom: {fmt(Y(floor_y))},
  top: {fmt(Y(top_y))},
  spans: [
{chr(10).join(f"    [{fmt(s, 5)}, {fmt(e, 5)}]," for s, e in spans)}
  ] as ReadonlyArray<readonly [number, number]>,
}};

/** Azul-marinho medido no logo. */
export const TORRE_NAVY = "#{navy[0]:02x}{navy[1]:02x}{navy[2]:02x}";
"""
    OUT_GEOMETRY.parent.mkdir(parents=True, exist_ok=True)
    OUT_GEOMETRY.write_text(geometry, encoding="utf-8")

    # --- miolo.ts: caminho em unidades 3D (x centrado no eixo, y para cima), pronto para a textura frontal
    def to_units(loops: list[np.ndarray]) -> list[np.ndarray]:
        return [np.column_stack([(l[:, 0] - axis) / UNIT, (l[:, 1] - mid_y) / UNIT]) for l in loops]

    miolo_units = to_units(warm_loops)
    mins = np.vstack(miolo_units).min(axis=0)
    maxs = np.vstack(miolo_units).max(axis=0)
    miolo_path_units = map_path(miolo_d3d, lambda x, y: ((x - axis) / UNIT, (y - mid_y) / UNIT), nd=4)
    miolo = HEADER + f"""
/**
 * Urso e touro (a região quente do logo), em unidades 3D com y PARA BAIXO (coordenadas de canvas/SVG):
 * x centrado no eixo da Torre, y = 0 no centro vertical dela. Variante do desenho: {variant_name}
 * ("original" = traçado do logo; A e B = redesenho com linhas mais retas, em design/torre/miolo-redesenho.json).
 * Estendido um pouco para fora da silhueta onde encosta nela, para a textura não deixar fresta azul na borda.
 */
export const MIOLO_PATH = "{miolo_path_units}";

/** Caixa do caminho (x0, y0, x1, y1), em unidades, y para baixo. */
export const MIOLO_BOUNDS = [{fmt(mins[0])}, {fmt(mins[1])}, {fmt(maxs[0])}, {fmt(maxs[1])}] as const;

/** Degradê vertical medido no logo (média das cores quentes por linha), de cima para baixo, em unidades y para baixo. */
export const MIOLO_GRADIENT = {{
  y0: {fmt((g_y0 - mid_y) / UNIT)},
  y1: {fmt((g_y1 - mid_y) / UNIT)},
  stops: [
{chr(10).join(f'    [{fmt(f, 3)}, "{c}"],' for f, c in stops)}
  ] as ReadonlyArray<readonly [number, string]>,
}};
"""
    OUT_MIOLO.write_text(miolo, encoding="utf-8")

    # --- marks.ts: emblema e nome em px do logo (viewBox próprio)
    ex0, ey0 = np.vstack(sil_loops).min(axis=0)
    ex1, ey1 = np.vstack(sil_loops).max(axis=0)
    marks = HEADER + f"""
/** Emblema 2D (a Torre do logo), em px do logo original. Use com fill-rule="evenodd". */
export const EMBLEM = {{
  viewBox: "0 0 {ex1 - ex0:.2f} {ey1 - ey0:.2f}",
  silhouette: "{to_path(sil_loops, -ex0, -ey0)}",
  miolo: "{map_path(miolo_d2d, lambda x, y: (x - ex0, y - ey0), nd=2)}",
  lines: "{to_path(line_loops, -ex0, -ey0)}",
  /** Degradê do miolo em coordenadas do viewBox (y1 -> y2), de cima para baixo. */
  gradient: {{
    y1: {g_y0 - ey0:.2f},
    y2: {g_y1 - ey0:.2f},
    stops: [{", ".join(f'[{fmt(f, 3)}, "{c}"]' for f, c in stops)}] as ReadonlyArray<readonly [number, string]>,
  }},
  navy: "#{navy[0]:02x}{navy[1]:02x}{navy[2]:02x}",
}} as const;

/** "NEXFORT CAPITAL" traçado do logo original, em px do logo. Use com fill-rule="evenodd". */
export const WORDMARK = {{
  viewBox: "0 0 {wx1 - wx0:.2f} {wy1 - wy0:.2f}",
  d: "{to_path(word_loops, -wx0, -wy0)}",
}} as const;
"""
    OUT_MARKS.parent.mkdir(parents=True, exist_ok=True)
    OUT_MARKS.write_text(marks, encoding="utf-8")

    # emblema em SVG (silhueta, miolo recortado por ela e filetes): o favicon e as imagens de conferência usam o mesmo gabarito
    ew, eh = ex1 - ex0, ey1 - ey0
    navy_hex = f"#{navy[0]:02x}{navy[1]:02x}{navy[2]:02x}"

    def emblem_svg(miolo_d: str, width: float, height: float, ox: float = 0.0, oy: float = 0.0, bg: str | None = None, lines: bool = True) -> str:
        dx, dy = ox - ex0, oy - ey0
        sil = to_path(sil_loops, dx, dy, nd=1)
        stops_xml = "".join(f'<stop offset="{f:.3f}" stop-color="{c}"/>' for f, c in stops)
        rect = f'<rect width="{width:.2f}" height="{height:.2f}" rx="{width * 0.18:.2f}" fill="{bg}"/>\n' if bg else ""
        filetes = f'<path fill="#dcdcf0" fill-rule="evenodd" d="{to_path(line_loops, dx, dy, nd=1)}"/>\n' if lines else ""
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.2f} {height:.2f}">\n{rect}'
            f'<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="{g_y0 + dy:.2f}" y2="{g_y1 + dy:.2f}">{stops_xml}</linearGradient>'
            f'<clipPath id="c"><path clip-rule="evenodd" d="{sil}"/></clipPath></defs>\n'
            f'<path fill="{navy_hex}" fill-rule="evenodd" d="{sil}"/>\n'
            f'<path fill="url(#g)" clip-path="url(#c)" fill-rule="evenodd" d="{map_path(miolo_d, lambda x, y: (x + dx, y + dy), nd=1)}"/>\n'
            f"{filetes}</svg>\n"
        )

    # --- icon.svg (favicon do App Router): o emblema num quadrado do fundo da página, visível em abas claras e escuras
    side = eh * 1.16
    OUT_ICON.write_text(emblem_svg(miolo_d2d, side, side, (side - ew) / 2, (side - eh) / 2, bg=ICON_BG, lines=False), encoding="utf-8")

    print(f"eixo x={axis:.2f}px  topo={top_y:.2f}  piso={floor_y:.2f}  fundo={bottom_y:.2f}  coroa R={crown_r:.2f}px")
    print(f"ameias (meias-bordas px): {[round(v, 2) for v in layout['half_edges_px']]}")
    print(f"vãos/ameias (graus): {[(round(math.degrees(s), 1), round(math.degrees(e), 1)) for s, e in spans]}")
    print(f"ranhuras y(px): {[round(g[0], 1) for g in grooves]}")
    print("perfil redesenhado:\n  " + "\n  ".join(profile_report))
    print(f"perfil: {len(lathe)} pontos  ·  miolo ({variant_name}): {len(parse_path(miolo_d3d))} comandos  ·  nome: {len(word_loops)} contornos")
    print(f"degradê: {stops}  ·  azul {navy}")
    for p in (OUT_GEOMETRY, OUT_MIOLO, OUT_MARKS, OUT_ICON):
        print(f"  {p.relative_to(ROOT)}  {p.stat().st_size / 1024:.1f} KB")

    if args.check:
        args.check.mkdir(parents=True, exist_ok=True)
        for name, d in variant_paths.items():  # emblema 2D de cada variante do miolo (a prancha usa estes arquivos)
            (args.check / f"emblema_{name}.svg").write_text(emblem_svg(d, ew, eh), encoding="utf-8")
        check(args.check, logo, axis, mid_y, lathe, spans, crown_r, floor_y, top_y, sil_loops, miolo_loops, line_loops, word_loops, stops, g_y0, g_y1, navy)


# --------------------------------------------------------------------------------------------- conferência


def check(out: Path, logo: Image.Image, axis, mid_y, lathe, spans, crown_r, floor_y, top_y, sil_loops, miolo_loops, line_loops, word_loops, stops, g_y0, g_y1, navy) -> None:
    """Compara o vetor com o original: vista frontal da Torre (perfil + ameias) e o nome, ampliados 4x."""
    out.mkdir(parents=True, exist_ok=True)
    S = 4
    x0, y0 = ROOK_BOX[0], ROOK_BOX[1]
    w, h = ROOK_BOX[2] - x0, ROOK_BOX[3] - y0
    orig = logo.crop(ROOK_BOX).resize((w * S, h * S), Image.LANCZOS)

    # 1) silhueta frontal reconstruída do 3D: perfil espelhado + ameias projetadas (ortográfica, elevação 0)
    front = Image.new("L", (w * S, h * S), 0)
    d = ImageDraw.Draw(front)
    pts = [((axis + r * UNIT + 0.5) * S, (mid_y - y * UNIT + 0.5) * S) for r, y in lathe]
    mirror = [((axis - r * UNIT + 0.5) * S, (mid_y - y * UNIT + 0.5) * S) for r, y in lathe[::-1]]
    d.polygon(pts + mirror, fill=255)
    for s, e in spans:
        if abs(s) <= math.pi / 2 and abs(e) <= math.pi / 2:
            xa, xb = sorted((crown_r * math.sin(s), crown_r * math.sin(e)))
            d.rectangle([(axis + xa + 0.5) * S, (top_y + 0.5) * S, (axis + xb + 0.5) * S, (floor_y + 0.5) * S], fill=255)
    orig_sil = Image.fromarray((segment_logo(np.asarray(logo.crop(ROOK_BOX)))["silhouette"] * 255).astype(np.uint8)).resize((w * S, h * S), Image.BILINEAR)
    a = np.asarray(front) > 127
    b = np.asarray(orig_sil) > 127
    iou = (a & b).sum() / (a | b).sum()
    diff = np.zeros((h * S, w * S, 3), dtype=np.uint8)
    diff[a & b] = (60, 60, 90)
    diff[a & ~b] = (230, 60, 40)  # só no 3D
    diff[~a & b] = (40, 170, 230)  # só no original
    Image.fromarray(diff).save(out / "torre_frente_diff.png")
    print(f"conferência: silhueta frontal 3D x original  IoU = {iou:.4f}  (vermelho = só 3D, azul = só original)")

    # 2) emblema 2D vetorial renderizado x original
    def render(loops_list, colors, size, offset, scale):
        """Renderiza com a regra evenodd (XOR dos contornos), como o SVG final."""
        img = Image.new("RGB", size, (236, 233, 232))
        silhouette = None
        for k, (loops, color) in enumerate(zip(loops_list, colors)):
            acc = np.zeros((size[1], size[0]), dtype=bool)
            for loop in loops:
                m = Image.new("L", size, 0)
                ImageDraw.Draw(m).polygon([((x + offset[0] + 0.5) * scale, (y + offset[1] + 0.5) * scale) for x, y in loop], fill=255)
                acc ^= np.asarray(m) > 127
            if k == 0:
                silhouette = acc
            elif k == 1:
                acc &= silhouette  # o miolo é recortado pela silhueta, como o clip-path do SVG
            img.paste(Image.new("RGB", size, color), mask=Image.fromarray((acc * 255).astype(np.uint8)))
        return img

    emb = render([sil_loops, miolo_loops, line_loops], [navy, (232, 120, 20), (210, 210, 235)], (w * S, h * S), (0, 0), S)
    pair = Image.new("RGB", (w * S * 2 + 20, h * S), (255, 255, 255))
    pair.paste(orig, (0, 0)), pair.paste(emb, (w * S + 20, 0))
    pair.save(out / "emblema_lado_a_lado.png")

    wx0, wy0 = WORD_BOX[0], WORD_BOX[1]
    ww, wh = WORD_BOX[2] - wx0, WORD_BOX[3] - wy0
    worig = logo.crop(WORD_BOX).resize((ww * 2, wh * 2), Image.LANCZOS)
    wvec = render([word_loops], [(10, 10, 10)], (ww * 2, wh * 2), (0, 0), 2)
    wpair = Image.new("RGB", (ww * 2, wh * 4 + 10), (255, 255, 255))
    wpair.paste(worig, (0, 0)), wpair.paste(wvec, (0, wh * 2 + 10))
    wpair.save(out / "nome_original_x_vetor.png")
    print(f"imagens em {out}")


if __name__ == "__main__":
    main()
