// Gerado por design/torre/extract_torre.py a partir do logo original. Não edite à mão.

/**
 * Urso e touro (a região quente do logo), em unidades 3D com y PARA BAIXO (coordenadas de canvas/SVG):
 * x centrado no eixo da Torre, y = 0 no centro vertical dela. Variante do desenho: A
 * ("original" = traçado do logo; A e B = redesenho com linhas mais retas, em design/torre/miolo-redesenho.json).
 * Estendido um pouco para fora da silhueta onde encosta nela, para a textura não deixar fresta azul na borda.
 */
export const MIOLO_PATH = "M-0.2723 0.0435C-0.1213 -0.0085 -0.0703 -0.0565 0.1037 -0.0565C0.1917 -0.0565 0.2707 -0.0355 0.3517 -0.0085L0.4117 0.0085L0.4307 0.1085L0.4507 0.2085L0.4797 0.3085L0.5427 0.4085L0.5427 0.5085L0.5827 0.6085L0.6207 0.7085L0.5947 0.8085L0.6567 0.9085L0.6647 0.9885L0.6647 1.0685L0.6047 1.1325L0.5247 1.1595L0.4447 1.1795L0.3647 1.1965L0.2847 1.2125L0.2047 1.2215L0.1247 1.2275L0.0447 1.2345L-0.0353 1.2345L-0.1353 1.2215C-0.0903 1.0675 0.1397 1.0295 0.2897 1.0725C0.3737 1.0595 0.3757 1.0275 0.3867 0.9485L0.3057 0.6485L0.2757 0.6295L0.2757 0.6115C0.3597 0.5885 0.4507 0.5235 0.4187 0.4195C0.3947 0.4845 0.3227 0.5085 0.2637 0.5245C0.2057 0.5385 0.1127 0.4625 0.0637 0.4625C-0.0623 0.4625 -0.1263 0.4905 -0.2343 0.5425L-0.3783 0.5205L-0.4363 0.4845L-0.4403 0.4565L-0.3743 0.3585L-0.3763 0.2285L-0.2873 0.1215C-0.2663 0.1005 -0.3413 0.0715 -0.2723 0.0435Z";

/** Caixa do caminho (x0, y0, x1, y1), em unidades, y para baixo. */
export const MIOLO_BOUNDS = [-0.4403, -0.0565, 0.6647, 1.2345] as const;

/** Degradê vertical medido no logo (média das cores quentes por linha), de cima para baixo, em unidades y para baixo. */
export const MIOLO_GRADIENT = {
  y0: -0.0415,
  y1: 1.1885,
  stops: [
    [0, "#fbae14"],
    [0.2, "#f49202"],
    [0.4, "#e36d04"],
    [0.6, "#d14303"],
    [0.8, "#c21e04"],
    [1, "#ab0709"],
  ] as ReadonlyArray<readonly [number, string]>,
};
