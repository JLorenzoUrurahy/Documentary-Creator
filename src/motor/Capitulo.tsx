import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import {
  ALTURA,
  COR,
  FONTE_TEXTO,
  FONTE_TITULO,
  LARGURA,
  MARGEM,
} from "../estilo";
import type { AudioCapitulo, Capitulo, Cena } from "../tipos";
import fundos from "../fundos.json";
import {
  Cartao,
  Citacao,
  Comparacao,
  Linha,
  Linhagem,
  Perfil,
  Titulo,
} from "./cenas/basicas";
import { Mapa } from "./cenas/Mapa";
import {
  criarRitmo,
  montarLegendas,
  montarLinhaDoTempo,
  palavrasDaCena,
  type Ritmo,
  type Trecho,
} from "./tempo";

export type PropsCapitulo = { capitulo: Capitulo; audio: AudioCapitulo };

const desenhar = (cena: Cena, ritmo: Ritmo) => {
  switch (cena.tipo) {
    case "titulo":
      return <Titulo cena={cena} ritmo={ritmo} />;
    case "cartao":
      return <Cartao cena={cena} ritmo={ritmo} />;
    case "comparacao":
      return <Comparacao cena={cena} ritmo={ritmo} />;
    case "perfil":
      return <Perfil cena={cena} ritmo={ritmo} />;
    case "linha":
      return <Linha cena={cena} ritmo={ritmo} />;
    case "mapa":
      return <Mapa cena={cena} ritmo={ritmo} />;
    case "linhagem":
      return <Linhagem cena={cena} ritmo={ritmo} />;
    case "citacao":
      return <Citacao cena={cena} ritmo={ritmo} />;
  }
};

// Tatame: grade discreta que desliza devagar, com as bordas escurecidas.
const Fundo: React.FC = () => {
  const quadro = useCurrentFrame();
  const desvio = (quadro * 0.25) % 120;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.fundo }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COR.borda} 1px, transparent 1px), linear-gradient(90deg, ${COR.borda} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `${desvio}px ${desvio}px`,
          opacity: 0.22,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 35%, ${COR.fundo} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

type CreditoFundo = {
  arquivo: string;
  autor: string;
  licenca: string;
  emPe?: boolean;
};
const indiceFundos = fundos as Record<string, CreditoFundo>;
const SEM_FUNDO: Cena["tipo"][] = ["mapa", "titulo", "perfil"];

// Imagem de uso livre atrás da cena: preto e branco, escurecida, com
// aproximação lenta. O crédito fica no canto, acima da barra de progresso.
const FundoDaCena: React.FC<{ cena: Cena; duracao: number; indice: number }> = ({
  cena,
  duracao,
  indice,
}) => {
  const quadro = useCurrentFrame();
  const dados = cena.fundo ? indiceFundos[cena.fundo] : undefined;
  if (!dados || SEM_FUNDO.includes(cena.tipo)) {
    return null;
  }
  const avanco = quadro / Math.max(1, duracao);
  // Alterna aproximar e afastar, e o lado para onde a imagem desliza.
  const zoom = indice % 2 === 0 ? 1.06 + avanco * 0.1 : 1.16 - avanco * 0.1;
  const desliza = (indice % 4 < 2 ? 1 : -1) * (avanco - 0.5) * 50;
  const opacidade = interpolate(
    quadro,
    [0, 24, duracao - 10, duracao],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      {/* Imagem em pé (retrato): ocupa a metade direita, inteira, em vez de
          ser cortada para encher a tela. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: dados.emPe ? LARGURA * 0.5 : 0,
          width: dados.emPe ? LARGURA * 0.5 : LARGURA,
          height: ALTURA,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(dados.arquivo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 25%",
            filter: "grayscale(1) contrast(1.1) brightness(0.8)",
            transform: `scale(${zoom}) translateX(${dados.emPe ? 0 : desliza}px)`,
          }}
        />
        {dados.emPe ? (
          <AbsoluteFill
            style={{
              background: `linear-gradient(90deg, ${COR.fundo} 0%, rgba(12,13,16,0) 35%)`,
            }}
          />
        ) : null}
      </div>
      {/* Escurece à esquerda e embaixo, onde ficam o texto e a legenda. */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, rgba(12,13,16,0.92) 0%, rgba(12,13,16,0.74) 50%, rgba(12,13,16,0.3) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(12,13,16,0.6) 0%, rgba(12,13,16,0) 20%, rgba(12,13,16,0) 72%, rgba(12,13,16,0.85) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: MARGEM,
          top: ALTURA - 44,
          fontFamily: FONTE_TEXTO,
          fontSize: 20,
          color: COR.texto,
          opacity: 0.7,
        }}
      >
        Imagem: {dados.autor} · {dados.licenca} · Wikimedia Commons
      </div>
    </AbsoluteFill>
  );
};

const CenaNaTela: React.FC<{
  trecho: Trecho;
  audio: AudioCapitulo;
  indice: number;
}> = ({ trecho, audio, indice }) => {
  const quadro = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { cena, duracao } = trecho;
  const palavras = useMemo(() => palavrasDaCena(cena, audio), [cena, audio]);
  const legendas = useMemo(() => montarLegendas(palavras), [palavras]);
  const ritmo = criarRitmo(quadro, duracao, fps, palavras);

  const opacidade = interpolate(
    quadro,
    [0, 10, duracao - 8, duracao],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const segundo = quadro / fps;
  const legenda = legendas.find(
    (bloco, n) =>
      segundo >= bloco.i &&
      segundo < (legendas[n + 1] ? legendas[n + 1].i : bloco.f + 0.4),
  );
  const gravado = audio[cena.id];

  return (
    <AbsoluteFill>
      <FundoDaCena cena={cena} duracao={duracao} indice={indice} />
      <AbsoluteFill style={{ opacity: opacidade }}>
        {desenhar(cena, ritmo)}
      </AbsoluteFill>
      {gravado ? <Audio src={staticFile(gravado.arquivo)} /> : null}
      {legenda ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            width: LARGURA,
            top: 905,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontWeight: 600,
              fontSize: 42,
              lineHeight: 1.25,
              color: COR.texto,
              backgroundColor: "rgba(0,0,0,0.72)",
              padding: "14px 34px",
              maxWidth: 1500,
              textAlign: "center",
            }}
          >
            {legenda.texto}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Ano no canto: corre do ano da cena anterior até o da cena atual.
const Ano: React.FC<{ trechos: Trecho[] }> = ({ trechos }) => {
  const quadro = useCurrentFrame();
  const indice = trechos.findIndex(
    (t) => quadro >= t.inicio && quadro < t.inicio + t.duracao,
  );
  const atual = trechos[Math.max(0, indice)];
  const alvo = atual.cena.ano;
  if (alvo === undefined) {
    return null;
  }
  let anterior: number | string | undefined;
  for (let n = indice - 1; n >= 0 && anterior === undefined; n--) {
    anterior = trechos[n].cena.ano;
  }
  const texto =
    typeof alvo === "number" && typeof anterior === "number"
      ? Math.round(
          interpolate(quadro - atual.inicio, [0, 36], [anterior, alvo], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        )
      : alvo;
  return (
    <div
      style={{
        position: "absolute",
        right: MARGEM,
        top: 44,
        fontFamily: FONTE_TITULO,
        fontWeight: 700,
        fontSize: 76,
        color: COR.dourado,
        fontVariantNumeric: "tabular-nums",
        textShadow: `0 0 20px ${COR.fundo}`,
      }}
    >
      {texto}
    </div>
  );
};

export const CapituloVideo: React.FC<PropsCapitulo> = ({ capitulo, audio }) => {
  const quadro = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { trechos, total } = useMemo(
    () => montarLinhaDoTempo(capitulo, audio, fps),
    [capitulo, audio, fps],
  );
  const naAbertura = trechos.some(
    (t) =>
      t.cena.tipo === "titulo" &&
      quadro >= t.inicio &&
      quadro < t.inicio + t.duracao,
  );

  return (
    <AbsoluteFill>
      <Fundo />
      {trechos.map((trecho, indice) => (
        <Sequence
          key={trecho.cena.id}
          from={trecho.inicio}
          durationInFrames={trecho.duracao}
        >
          <CenaNaTela trecho={trecho} audio={audio} indice={indice} />
        </Sequence>
      ))}
      {naAbertura ? null : (
        <div
          style={{
            position: "absolute",
            left: MARGEM,
            top: 62,
            fontFamily: FONTE_TITULO,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COR.suave,
          }}
        >
          <span style={{ color: COR.vermelho }}>
            {String(capitulo.numero).padStart(2, "0")}
          </span>
          {"  "}
          {capitulo.titulo}
        </div>
      )}
      <Ano trechos={trechos} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: ALTURA - 6,
          height: 6,
          width: (LARGURA * quadro) / Math.max(1, total - 1),
          backgroundColor: COR.vermelho,
        }}
      />
    </AbsoluteFill>
  );
};
