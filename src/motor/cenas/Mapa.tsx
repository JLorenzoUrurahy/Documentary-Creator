import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import {
  geoGraticule10,
  geoInterpolate,
  geoNaturalEarth1,
  geoPath,
} from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
// Contorno dos continentes: Natural Earth (domínio público), via world-atlas.
import terra110 from "world-atlas/land-110m.json";
import {
  ALTURA,
  COR,
  FONTE_TEXTO,
  FONTE_TITULO,
  LARGURA,
  MARGEM,
  TOPO,
} from "../../estilo";
import type { CenaMapa, Coord } from "../../tipos";
import { type Ritmo, suave, surgir } from "../tempo";

const topologia = terra110 as unknown as Topology<{ land: GeometryCollection }>;
const continentes = feature(topologia, topologia.objects.land);
const grade = geoGraticule10();

// Com escala 1 o mundo inteiro cabe na largura da tela.
const ESCALA_BASE = 335;
const CENTRO_Y = 470;

export const Mapa: React.FC<{ cena: CenaMapa; ritmo: Ritmo }> = ({
  cena,
  ritmo,
}) => {
  const camera = suave(ritmo.quadro, ritmo.duracao * 0.08, ritmo.duracao * 0.85);
  const destino = cena.ate ?? cena.vista;
  const lon = cena.vista.lon + (destino.lon - cena.vista.lon) * camera;
  const lat = cena.vista.lat + (destino.lat - cena.vista.lat) * camera;
  const escala =
    cena.vista.escala * Math.pow(destino.escala / cena.vista.escala, camera);

  const projecao = useMemo(() => {
    const p = geoNaturalEarth1()
      .scale(ESCALA_BASE * escala)
      .rotate([-lon, 0])
      .translate([LARGURA / 2, CENTRO_Y]);
    // Centraliza a latitude pedida sem inclinar o globo.
    const centro = p([lon, lat]);
    if (centro) {
      p.translate([LARGURA / 2, CENTRO_Y + (CENTRO_Y - centro[1])]);
    }
    return p;
  }, [lon, lat, escala]);

  const caminho = useMemo(() => geoPath(projecao), [projecao]);
  const lugares = cena.lugares ?? [];
  const rotas = cena.rotas ?? [];

  return (
    <AbsoluteFill>
      <svg width={LARGURA} height={ALTURA}>
        <path
          d={caminho(grade) ?? ""}
          fill="none"
          stroke={COR.borda}
          strokeWidth={1}
          opacity={0.5}
        />
        <path
          d={caminho(continentes) ?? ""}
          fill={COR.terra}
          stroke={COR.terraBorda}
          strokeWidth={1.5}
        />

        {rotas.map((rota, r) => {
          const inicio = ritmo.entra(rota.quando, r, rotas.length);
          const fim = rota.ate
            ? ritmo.entra(rota.ate, r + 1, rotas.length)
            : inicio + Math.round(ritmo.duracao * 0.5);
          const avanco = suave(ritmo.quadro, inicio, Math.max(fim, inicio + 20));
          const pontos = tracarRota(rota.pontos)
            .map((c) => projecao(c))
            .filter((c): c is [number, number] => c !== null);
          if (pontos.length < 2 || avanco <= 0) {
            return null;
          }
          const ate = Math.max(2, Math.round(pontos.length * avanco));
          const visivel = pontos.slice(0, ate);
          const ponta = visivel[visivel.length - 1];
          return (
            <g key={r}>
              <polyline
                points={visivel.map((c) => c.join(",")).join(" ")}
                fill="none"
                stroke={COR.vermelho}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2 12"
              />
              <circle cx={ponta[0]} cy={ponta[1]} r={11} fill={COR.vermelho} />
              <circle
                cx={ponta[0]}
                cy={ponta[1]}
                r={11 + ((ritmo.quadro % 30) / 30) * 22}
                fill="none"
                stroke={COR.vermelho}
                strokeWidth={3}
                opacity={1 - (ritmo.quadro % 30) / 30}
              />
            </g>
          );
        })}

        {lugares.map((lugar, k) => {
          const xy = projecao(lugar.coord);
          if (!xy) {
            return null;
          }
          const p = surgir(ritmo, ritmo.entra(lugar.quando, k, lugares.length));
          const cor = lugar.destaque ? COR.dourado : COR.texto;
          // Rótulo para a esquerda quando o ponto está perto da borda direita.
          const esquerda = xy[0] > LARGURA - 420;
          return (
            <g key={lugar.nome} opacity={p}>
              <circle cx={xy[0]} cy={xy[1]} r={(lugar.destaque ? 13 : 9) * p} fill={cor} />
              <circle
                cx={xy[0]}
                cy={xy[1]}
                r={(lugar.destaque ? 24 : 17) * p}
                fill="none"
                stroke={cor}
                strokeWidth={2}
                opacity={0.6}
              />
              <text
                x={xy[0] + (esquerda ? -30 : 30)}
                y={xy[1] + 12}
                textAnchor={esquerda ? "end" : "start"}
                fontFamily={lugar.destaque ? FONTE_TITULO : FONTE_TEXTO}
                fontWeight={lugar.destaque ? 700 : 600}
                fontSize={lugar.destaque ? 44 : 32}
                fill={cor}
                stroke={COR.fundo}
                strokeWidth={8}
                paintOrder="stroke"
                style={{ textTransform: lugar.destaque ? "uppercase" : "none" }}
              >
                {lugar.nome}
              </text>
            </g>
          );
        })}
      </svg>
      {cena.titulo ? (
        <div
          style={{
            position: "absolute",
            left: MARGEM,
            top: TOPO,
            fontFamily: FONTE_TITULO,
            fontWeight: 700,
            fontSize: 64,
            textTransform: "uppercase",
            color: COR.texto,
            opacity: surgir(ritmo, 4),
            textShadow: `0 0 24px ${COR.fundo}, 0 0 8px ${COR.fundo}`,
          }}
        >
          {cena.titulo}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Liga os pontos por arcos de grande círculo, com passos proporcionais à distância.
const tracarRota = (pontos: Coord[]): Coord[] => {
  const saida: Coord[] = [];
  for (let n = 0; n < pontos.length - 1; n++) {
    const entre = geoInterpolate(pontos[n], pontos[n + 1]);
    const dLon = Math.abs(pontos[n + 1][0] - pontos[n][0]);
    const dLat = Math.abs(pontos[n + 1][1] - pontos[n][1]);
    const passos = Math.max(4, Math.round((Math.min(dLon, 360 - dLon) + dLat) / 2));
    for (let k = 0; k < passos; k++) {
      saida.push(entre(k / passos) as Coord);
    }
  }
  saida.push(pontos[pontos.length - 1]);
  return saida;
};
