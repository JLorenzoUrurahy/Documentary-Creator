import { loadFont } from "@remotion/fonts";
// Fontes dentro do projeto (licença OFL): o render não depende de internet.
import oswald500 from "@fontsource/oswald/files/oswald-latin-500-normal.woff2";
import oswald700 from "@fontsource/oswald/files/oswald-latin-700-normal.woff2";
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff2";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff2";

// Padrão do guia: 30 quadros por segundo, 1920x1080.
export const FPS = 30;
export const LARGURA = 1920;
export const ALTURA = 1080;

export const FONTE_TITULO = "Oswald";
export const FONTE_TEXTO = "Inter";

const fontes: [string, string, string][] = [
  [FONTE_TITULO, "500", oswald500],
  [FONTE_TITULO, "700", oswald700],
  [FONTE_TEXTO, "400", inter400],
  [FONTE_TEXTO, "600", inter600],
];
fontes.forEach(([family, weight, url]) => {
  loadFont({ family, weight, url, format: "woff2" });
});

// Paleta "tatame à noite". Mudar aqui muda o documentário inteiro.
export const COR = {
  fundo: "#0c0d10",
  painel: "#171a20",
  borda: "#2a2f39",
  terra: "#303743",
  terraBorda: "#4a5261",
  texto: "#ece3cf",
  suave: "#9a9fa9",
  vermelho: "#c8372d",
  dourado: "#d9a441",
  azul: "#4f86c6",
  verde: "#5fae7a",
};

// Área útil: o rodapé fica reservado para a legenda.
export const MARGEM = 110;
export const TOPO = 130;
export const BASE_CONTEUDO = 860;
