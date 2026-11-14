import { Easing, interpolate, spring } from "remotion";
import type { AudioCapitulo, Capitulo, Cena, Palavra } from "../tipos";

// Respiro depois de cada fala, em segundos.
const PAUSA = 0.7;
// Usado só enquanto a narração ainda não foi gerada.
const PALAVRAS_POR_SEGUNDO = 2.5;

// Tira a marcação [mostrado|falado], deixando o que aparece na legenda.
export const textoMostrado = (narracao: string) =>
  narracao.replace(/\[([^|\]]+)\|[^\]]+\]/g, "$1");

export const palavrasDaCena = (
  cena: Cena,
  audio: AudioCapitulo,
): Palavra[] => {
  const gravado = audio[cena.id];
  if (gravado) {
    return gravado.palavras;
  }
  if (!cena.narracao) {
    return [];
  }
  return textoMostrado(cena.narracao)
    .split(/\s+/)
    .filter(Boolean)
    .map((p, n) => ({
      p,
      i: n / PALAVRAS_POR_SEGUNDO,
      f: (n + 1) / PALAVRAS_POR_SEGUNDO,
    }));
};

export const segundosDaCena = (cena: Cena, audio: AudioCapitulo) => {
  const gravado = audio[cena.id];
  if (gravado) {
    return gravado.duracao + PAUSA;
  }
  const palavras = palavrasDaCena(cena, audio);
  if (palavras.length > 0) {
    return palavras[palavras.length - 1].f + PAUSA;
  }
  return cena.duracao ?? 4;
};

export type Trecho = { cena: Cena; inicio: number; duracao: number };

export const montarLinhaDoTempo = (
  capitulo: Capitulo,
  audio: AudioCapitulo,
  fps: number,
) => {
  let inicio = 0;
  const trechos: Trecho[] = capitulo.cenas.map((cena) => {
    const duracao = Math.ceil(segundosDaCena(cena, audio) * fps);
    const trecho = { cena, inicio, duracao };
    inicio += duracao;
    return trecho;
  });
  return { trechos, total: inicio };
};

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");

// Segundo em que um trecho da narração começa a ser falado.
export const segundoDoTrecho = (palavras: Palavra[], trecho: string) => {
  const alvo = trecho.split(/\s+/).map(normalizar).filter(Boolean);
  if (alvo.length === 0) {
    return null;
  }
  const fala = palavras.map((w) => normalizar(w.p));
  for (let n = 0; n <= fala.length - alvo.length; n++) {
    if (alvo.every((a, k) => fala[n + k] === a)) {
      return palavras[n].i;
    }
  }
  return null;
};

export type Legenda = { texto: string; i: number; f: number };

// Agrupa as palavras em blocos curtos, quebrando na pontuação.
export const montarLegendas = (palavras: Palavra[], limite = 64): Legenda[] => {
  const blocos: Legenda[] = [];
  let atual: Palavra[] = [];
  const fechar = () => {
    if (atual.length > 0) {
      blocos.push({
        texto: atual.map((w) => w.p).join(" "),
        i: atual[0].i,
        f: atual[atual.length - 1].f,
      });
      atual = [];
    }
  };
  for (const palavra of palavras) {
    const tamanho = atual.reduce((s, w) => s + w.p.length + 1, 0);
    if (tamanho + palavra.p.length > limite) {
      fechar();
    }
    atual.push(palavra);
    const fimDeFrase = /[.!?:]$/.test(palavra.p);
    const virgulaLonga = /[,;]$/.test(palavra.p) && tamanho > limite * 0.6;
    if (fimDeFrase || virgulaLonga) {
      fechar();
    }
  }
  fechar();
  return blocos;
};

// O que cada cena recebe para se animar.
export type Ritmo = {
  quadro: number;
  duracao: number;
  fps: number;
  // Quadro em que um elemento deve entrar: pelo trecho falado, se houver,
  // ou espalhado ao longo da cena pela posição na lista.
  entra: (quando: string | undefined, indice: number, total: number) => number;
};

export const criarRitmo = (
  quadro: number,
  duracao: number,
  fps: number,
  palavras: Palavra[],
): Ritmo => ({
  quadro,
  duracao,
  fps,
  entra: (quando, indice, total) => {
    const segundo = quando ? segundoDoTrecho(palavras, quando) : null;
    if (segundo !== null) {
      return Math.max(0, Math.round(segundo * fps) - 4);
    }
    return Math.round(duracao * (0.1 + (0.7 * indice) / Math.max(1, total)));
  },
});

// Progresso de 0 a 1 de um elemento que entra em "inicio".
export const surgir = (ritmo: Ritmo, inicio: number) =>
  spring({
    frame: ritmo.quadro - inicio,
    fps: ritmo.fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });

export const suave = (
  quadro: number,
  de: number,
  ate: number,
  saida: [number, number] = [0, 1],
) =>
  interpolate(quadro, [de, ate], saida, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

export const textoDoItem = (item: string | { texto: string }) =>
  typeof item === "string" ? item : item.texto;

export const quandoDoItem = (item: string | { quando?: string }) =>
  typeof item === "string" ? undefined : item.quando;
