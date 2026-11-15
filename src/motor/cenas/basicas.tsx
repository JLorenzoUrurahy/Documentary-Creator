import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import indiceDeFotos from "../../fotos.json";
import {
  ALTURA,
  BASE_CONTEUDO,
  COR,
  FONTE_TEXTO,
  FONTE_TITULO,
  LARGURA,
  MARGEM,
  TOPO,
} from "../../estilo";
import type {
  CenaCartao,
  CenaCitacao,
  CenaComparacao,
  CenaLinha,
  CenaLinhagem,
  CenaPerfil,
  CenaTitulo,
  Coluna,
  Item,
} from "../../tipos";
import {
  quandoDoItem,
  type Ritmo,
  suave,
  surgir,
  textoDoItem,
} from "../tempo";

const area: React.CSSProperties = {
  left: MARGEM,
  top: TOPO,
  width: LARGURA - MARGEM * 2,
  height: BASE_CONTEUDO - TOPO,
};

const Rotulo: React.FC<{ children: React.ReactNode; cor?: string }> = ({
  children,
  cor = COR.dourado,
}) => (
  <div
    style={{
      fontFamily: FONTE_TITULO,
      fontWeight: 500,
      fontSize: 30,
      letterSpacing: 8,
      textTransform: "uppercase",
      color: cor,
    }}
  >
    {children}
  </div>
);

const TituloCena: React.FC<{
  children: React.ReactNode;
  ritmo: Ritmo;
  tamanho?: number;
}> = ({ children, ritmo, tamanho = 84 }) => {
  const p = surgir(ritmo, 4);
  return (
    <div
      style={{
        fontFamily: FONTE_TITULO,
        fontWeight: 700,
        fontSize: tamanho,
        lineHeight: 1.05,
        color: COR.texto,
        textTransform: "uppercase",
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Lista: React.FC<{
  itens: Item[];
  ritmo: Ritmo;
  cor?: string;
  tamanho?: number;
}> = ({ itens, ritmo, cor = COR.vermelho, tamanho = 44 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: tamanho * 0.6 }}>
    {itens.map((item, n) => {
      const p = surgir(ritmo, ritmo.entra(quandoDoItem(item), n, itens.length));
      return (
        <div
          key={n}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 26,
            opacity: p,
            transform: `translateX(${(1 - p) * 40}px)`,
          }}
        >
          <div
            style={{
              width: 14,
              height: tamanho * 0.9,
              marginTop: tamanho * 0.18,
              backgroundColor: cor,
              flexShrink: 0,
              transform: `scaleY(${p})`,
              transformOrigin: "top",
            }}
          />
          <div
            style={{
              fontFamily: FONTE_TEXTO,
              fontSize: tamanho,
              lineHeight: 1.25,
              color: COR.texto,
            }}
          >
            {textoDoItem(item)}
          </div>
        </div>
      );
    })}
  </div>
);

export const Titulo: React.FC<{ cena: CenaTitulo; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const faixa = suave(ritmo.quadro, 6, 36);
  const p = surgir(ritmo, 14);
  const sub = surgir(ritmo, 30);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: surgir(ritmo, 0) }}>
        <Rotulo>Capítulo {cena.numero}</Rotulo>
      </div>
      <div
        style={{
          fontFamily: FONTE_TITULO,
          fontWeight: 700,
          fontSize: 170,
          lineHeight: 1,
          color: COR.texto,
          textTransform: "uppercase",
          marginTop: 30,
          textAlign: "center",
          maxWidth: 1600,
          opacity: p,
          transform: `scale(${interpolate(p, [0, 1], [1.06, 1])})`,
        }}
      >
        {cena.titulo}
      </div>
      {/* Faixa preta com a ponteira vermelha. */}
      <div
        style={{
          marginTop: 50,
          width: 720 * faixa,
          height: 26,
          backgroundColor: "#000",
          border: `2px solid ${COR.borda}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 60,
            top: 0,
            width: 130,
            height: "100%",
            backgroundColor: COR.vermelho,
          }}
        />
      </div>
      {cena.subtitulo ? (
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontSize: 46,
            color: COR.suave,
            marginTop: 50,
            opacity: sub,
          }}
        >
          {cena.subtitulo}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Cartao: React.FC<{ cena: CenaCartao; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const destaque = surgir(ritmo, 12);
  // Com muitos itens, tudo encolhe um pouco para não encostar no cabeçalho.
  const cheio = (cena.itens?.length ?? 0) > 4;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          ...area,
          display: "flex",
          alignItems: "center",
          gap: 80,
        }}
      >
        <div style={{ flex: 1.5 }}>
          {cena.rotulo ? (
            <div style={{ opacity: surgir(ritmo, 0), marginBottom: 22 }}>
              <Rotulo>{cena.rotulo}</Rotulo>
            </div>
          ) : null}
          <TituloCena ritmo={ritmo} tamanho={cheio ? 70 : 84}>
            {cena.titulo}
          </TituloCena>
          {cena.itens ? (
            <div style={{ marginTop: cheio ? 40 : 60 }}>
              <Lista
                itens={cena.itens}
                ritmo={ritmo}
                tamanho={cheio ? 38 : 44}
              />
            </div>
          ) : null}
        </div>
        {cena.destaque ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: FONTE_TITULO,
              fontWeight: 700,
              fontSize:
                cena.destaque.length <= 2
                  ? 260
                  : cena.destaque.length <= 5
                    ? 200
                    : cena.destaque.length <= 14
                    ? 150
                    : 96,
              lineHeight: 1,
              color: COR.dourado,
              opacity: destaque,
              transform: `scale(${interpolate(destaque, [0, 1], [0.85, 1])})`,
            }}
          >
            {cena.destaque}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const corDoTom = (tom: Coluna["tom"]) =>
  tom === "bom" ? COR.verde : tom === "ruim" ? COR.vermelho : COR.azul;

const Painel: React.FC<{ coluna: Coluna; ritmo: Ritmo; atraso: number }> = ({
  coluna,
  ritmo,
  atraso,
}) => {
  const p = surgir(ritmo, 10 + atraso);
  const cor = corDoTom(coluna.tom);
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: COR.painel,
        border: `2px solid ${COR.borda}`,
        borderTop: `10px solid ${cor}`,
        padding: "34px 44px 40px",
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONTE_TITULO,
          fontWeight: 700,
          fontSize: 52,
          textTransform: "uppercase",
          color: cor,
          marginBottom: 30,
        }}
      >
        {coluna.titulo}
      </div>
      <Lista itens={coluna.itens} ritmo={ritmo} cor={cor} tamanho={35} />
    </div>
  );
};

export const Comparacao: React.FC<{ cena: CenaComparacao; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => (
  <AbsoluteFill>
    <div
      style={{
        position: "absolute",
        ...area,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 36,
      }}
    >
      {cena.titulo ? (
        <TituloCena ritmo={ritmo} tamanho={60}>
          {cena.titulo}
        </TituloCena>
      ) : null}
      <div style={{ display: "flex", gap: 50, alignItems: "stretch" }}>
        <Painel coluna={cena.esquerda} ritmo={ritmo} atraso={0} />
        <Painel coluna={cena.direita} ritmo={ritmo} atraso={10} />
      </div>
    </div>
  </AbsoluteFill>
);

type Foto = { arquivo: string; autor: string; licenca: string };
const fotos = indiceDeFotos as Record<string, Foto>;

export const Perfil: React.FC<{ cena: CenaPerfil; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const iniciais = cena.nome
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("");
  const anel = suave(ritmo.quadro, 0, 40);
  const raio = 190;
  const volta = 2 * Math.PI * raio;
  const p = surgir(ritmo, 8);
  const foto = cena.wiki ? fotos[cena.wiki] : undefined;
  // Nome comprido ou muitos fatos: encolhe para não invadir a legenda.
  const cheio = cena.nome.length > 18 || (cena.fatos?.length ?? 0) > 5;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          ...area,
          display: "flex",
          alignItems: "center",
          gap: 100,
        }}
      >
        <div style={{ width: 440, flexShrink: 0 }}>
          <div style={{ position: "relative", width: 440, height: 440 }}>
            {foto ? (
              <Img
                src={staticFile(foto.arquivo)}
                style={{
                  position: "absolute",
                  left: 30,
                  top: 30,
                  width: 380,
                  height: 380,
                  borderRadius: 190,
                  objectFit: "cover",
                  objectPosition: "50% 20%",
                  // Preto e branco para todas as fotos terem a mesma cara.
                  filter: "grayscale(1) contrast(1.08)",
                  opacity: p,
                }}
              />
            ) : null}
            <svg width={440} height={440} style={{ position: "absolute" }}>
              {foto ? null : (
                <circle cx={220} cy={220} r={raio} fill={COR.painel} />
              )}
              <circle
                cx={220}
                cy={220}
                r={raio}
                fill="none"
                stroke={COR.dourado}
                strokeWidth={8}
                strokeDasharray={volta}
                strokeDashoffset={volta * (1 - anel)}
                transform="rotate(-90 220 220)"
              />
              {foto ? null : (
                <text
                  x={220}
                  y={270}
                  textAnchor="middle"
                  fontFamily={FONTE_TITULO}
                  fontWeight={700}
                  fontSize={150}
                  fill={COR.texto}
                  opacity={p}
                >
                  {iniciais}
                </text>
              )}
            </svg>
          </div>
          {foto ? (
            <div
              style={{
                fontFamily: FONTE_TEXTO,
                fontSize: 18,
                lineHeight: 1.3,
                color: COR.suave,
                textAlign: "center",
                marginTop: 10,
                opacity: p * 0.8,
              }}
            >
              Foto: {foto.autor.slice(0, 60)} · {foto.licenca} · Wikimedia Commons
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1 }}>
          {cena.papel ? (
            <div style={{ opacity: surgir(ritmo, 0), marginBottom: 16 }}>
              <Rotulo>{cena.papel}</Rotulo>
            </div>
          ) : null}
          <TituloCena ritmo={ritmo} tamanho={cheio ? 88 : 112}>
            {cena.nome}
          </TituloCena>
          {cena.anos ? (
            <div
              style={{
                fontFamily: FONTE_TITULO,
                fontWeight: 500,
                fontSize: 52,
                color: COR.suave,
                marginTop: 10,
                opacity: p,
              }}
            >
              {cena.anos}
            </div>
          ) : null}
          {cena.fatos ? (
            <div style={{ marginTop: cheio ? 32 : 50 }}>
              <Lista
                itens={cena.fatos}
                ritmo={ritmo}
                tamanho={cheio ? 35 : 40}
              />
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Linha: React.FC<{ cena: CenaLinha; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const n = cena.eventos.length;
  const largura = LARGURA - MARGEM * 2;
  const passo = largura / n;
  const entradas = cena.eventos.map((e, k) => ritmo.entra(e.quando, k, n));
  // A linha cresce até o último evento já revelado.
  let alcance = 0;
  entradas.forEach((inicio, k) => {
    alcance = Math.max(alcance, surgir(ritmo, inicio) * (k + 0.5) * passo);
  });
  const y = 420;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", ...area }}>
        {cena.titulo ? (
          <TituloCena ritmo={ritmo} tamanho={72}>
            {cena.titulo}
          </TituloCena>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: y,
            width: largura,
            height: 4,
            backgroundColor: COR.borda,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: y - 2,
            width: alcance,
            height: 8,
            backgroundColor: COR.vermelho,
          }}
        />
        {cena.eventos.map((evento, k) => {
          const p = surgir(ritmo, entradas[k]);
          const centro = (k + 0.5) * passo;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: centro - passo / 2 + 14,
                width: passo - 28,
                top: y - 150,
                textAlign: "center",
                opacity: p,
              }}
            >
              <div
                style={{
                  fontFamily: FONTE_TITULO,
                  fontWeight: 700,
                  fontSize:
                    evento.ano.length > 12 ? 34 : evento.ano.length > 5 ? 46 : 76,
                  lineHeight: 1.1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: 12,
                  boxSizing: "border-box",
                  color: COR.dourado,
                  height: 110,
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                {evento.ano}
              </div>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: COR.texto,
                  border: `6px solid ${COR.vermelho}`,
                  margin: "27px auto 0",
                  transform: `scale(${p})`,
                }}
              />
              <div
                style={{
                  fontFamily: FONTE_TEXTO,
                  fontSize: n > 4 ? 30 : 36,
                  lineHeight: 1.3,
                  color: COR.texto,
                  marginTop: 34,
                }}
              >
                {evento.texto}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Citacao: React.FC<{ cena: CenaCitacao; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const p = surgir(ritmo, 6);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          ...area,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 140px",
        }}
      >
        <div
          style={{
            fontFamily: FONTE_TITULO,
            fontSize: 260,
            lineHeight: 0.6,
            color: COR.vermelho,
            opacity: surgir(ritmo, 0),
          }}
        >
          “
        </div>
        <div
          style={{
            fontFamily: FONTE_TEXTO,
            fontWeight: 600,
            fontSize: 64,
            lineHeight: 1.3,
            color: COR.texto,
            opacity: p,
            transform: `translateY(${(1 - p) * 24}px)`,
          }}
        >
          {cena.texto}
        </div>
        {cena.autor ? (
          <div style={{ marginTop: 44, opacity: surgir(ritmo, 24) }}>
            <Rotulo>{cena.autor}</Rotulo>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const Linhagem: React.FC<{ cena: CenaLinhagem; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const porId = new Map(cena.nos.map((no) => [no.id, no]));
  const filhosDe = (id: string) => cena.nos.filter((no) => no.pai === id);
  const raizes = cena.nos.filter((no) => !no.pai || !porId.has(no.pai));

  // Cada folha ocupa uma coluna; cada pai fica centrado sobre os filhos.
  const coluna = new Map<string, number>();
  const nivel = new Map<string, number>();
  let folhas = 0;
  const posicionar = (id: string, profundidade: number): number => {
    nivel.set(id, profundidade);
    const filhos = filhosDe(id);
    const x =
      filhos.length === 0
        ? folhas++
        : filhos
            .map((filho) => posicionar(filho.id, profundidade + 1))
            .reduce((soma, v) => soma + v, 0) / filhos.length;
    coluna.set(id, x);
    return x;
  };
  raizes.forEach((raiz) => posicionar(raiz.id, 0));
  const niveis = Math.max(...Array.from(nivel.values())) + 1;

  const topoArvore = TOPO + (cena.titulo ? 120 : 10);
  const larguraLivre = LARGURA - MARGEM * 2;
  const passoX = larguraLivre / Math.max(1, folhas);
  const passoY = (BASE_CONTEUDO - topoArvore) / niveis;
  // As caixas encolhem quando a árvore é larga ou alta.
  const caixa = {
    l: Math.min(470, passoX - 28),
    a: Math.min(146, passoY - 46),
  };
  const escala = Math.min(1, caixa.l / 400, caixa.a / 146);
  const posicao = new Map(
    cena.nos.map((no) => [
      no.id,
      {
        x: MARGEM + passoX * ((coluna.get(no.id) ?? 0) + 0.5),
        y: topoArvore + passoY * (nivel.get(no.id) ?? 0),
      },
    ]),
  );
  const entrada = new Map(
    cena.nos.map((no, k) => [
      no.id,
      ritmo.entra(no.quando, k, cena.nos.length),
    ]),
  );

  return (
    <AbsoluteFill>
      {cena.titulo ? (
        <div style={{ position: "absolute", left: MARGEM, top: TOPO }}>
          <TituloCena ritmo={ritmo} tamanho={68}>
            {cena.titulo}
          </TituloCena>
        </div>
      ) : null}
      <svg width={LARGURA} height={ALTURA} style={{ position: "absolute" }}>
        {cena.nos.map((no) => {
          const de = no.pai ? posicao.get(no.pai) : undefined;
          const para = posicao.get(no.id);
          if (!de || !para) {
            return null;
          }
          const p = suave(
            ritmo.quadro,
            (entrada.get(no.id) ?? 0) - 12,
            (entrada.get(no.id) ?? 0) + 6,
          );
          const y1 = de.y + caixa.a;
          const meio = (y1 + para.y) / 2;
          return (
            <path
              key={no.id}
              d={`M ${de.x} ${y1} C ${de.x} ${meio}, ${para.x} ${meio}, ${para.x} ${para.y}`}
              fill="none"
              stroke={no.incerto ? COR.suave : COR.vermelho}
              strokeWidth={5}
              strokeDasharray={no.incerto ? "14 12" : undefined}
              opacity={p}
            />
          );
        })}
      </svg>
      {cena.nos.map((no) => {
        const lugar = posicao.get(no.id);
        if (!lugar) {
          return null;
        }
        const p = surgir(ritmo, entrada.get(no.id) ?? 0);
        return (
          <div
            key={no.id}
            style={{
              position: "absolute",
              left: lugar.x - caixa.l / 2,
              top: lugar.y,
              width: caixa.l,
              height: caixa.a,
              boxSizing: "border-box",
              overflow: "hidden",
              backgroundColor: COR.painel,
              border: `2px solid ${no.incerto ? COR.suave : COR.borda}`,
              borderLeft: `10px solid ${no.incerto ? COR.suave : COR.dourado}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: `0 ${Math.round(22 * escala)}px`,
              opacity: p,
              transform: `scale(${interpolate(p, [0, 1], [0.9, 1])})`,
            }}
          >
            <div
              style={{
                fontFamily: FONTE_TITULO,
                fontWeight: 700,
                fontSize: Math.max(26, Math.round(44 * escala)),
                color: COR.texto,
                textTransform: "uppercase",
                lineHeight: 1.08,
              }}
            >
              {no.nome}
            </div>
            {no.sub ? (
              <div
                style={{
                  fontFamily: FONTE_TEXTO,
                  fontSize: Math.max(19, Math.round(28 * escala)),
                  lineHeight: 1.2,
                  color: COR.suave,
                  marginTop: 5,
                }}
              >
                {no.sub}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
