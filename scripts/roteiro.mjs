#!/usr/bin/env node
// Gera roteiro/capitulo-N.md (narração, fontes e pontos a conferir) a partir de
// src/capitulos/capitulo-N.json, que é a fonte única do capítulo.
//
//   node scripts/roteiro.mjs 1
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const numero = process.argv[2];
if (!/^\d+$/.test(numero ?? "")) {
  console.error("Uso: node scripts/roteiro.mjs <número do capítulo>");
  process.exit(1);
}

const capitulo = JSON.parse(
  readFileSync(join(raiz, "src/capitulos", `capitulo-${numero}.json`), "utf8"),
);
const arquivoAudio = join(raiz, "src/capitulos", `capitulo-${numero}.audio.json`);
const audio = existsSync(arquivoAudio) ? JSON.parse(readFileSync(arquivoAudio, "utf8")) : {};

const mostrado = (texto) => texto.replace(/\[([^|\]]+)\|[^\]]+\]/g, "$1");
const linhas = [
  `# Capítulo ${capitulo.numero}: ${capitulo.titulo}`,
  "",
  "Gerado por `scripts/roteiro.mjs`. Para mudar o texto, edite `src/capitulos/capitulo-" +
    numero +
    ".json` e rode o script de novo.",
  "",
];
if (capitulo.subtitulo) {
  linhas.push(`*${capitulo.subtitulo}*`, "");
}

let total = 0;
linhas.push("## Narração, cena por cena", "");
for (const cena of capitulo.cenas) {
  const segundos = audio[cena.id]?.duracao ?? cena.duracao;
  total += segundos ?? 0;
  const detalhes = [cena.tipo, cena.ano, segundos ? `${Math.round(segundos)} s` : null]
    .filter(Boolean)
    .join(" · ");
  linhas.push(`### ${cena.id} (${detalhes})`, "");
  linhas.push(cena.narracao ? mostrado(cena.narracao) : "*Sem narração.*", "");
}
linhas.push(`Duração aproximada: ${Math.floor(total / 60)} min ${Math.round(total % 60)} s.`, "");

linhas.push("## Conferir antes de publicar", "");
for (const ponto of capitulo.conferir ?? []) {
  linhas.push(`- [CONFERIR] ${ponto}`);
}
linhas.push("", "## Fontes", "");
for (const fonte of capitulo.fontes ?? []) {
  linhas.push(`- [${fonte.titulo}](${fonte.url})`);
}

const arquivoFotos = join(raiz, "src/fotos.json");
const fotos = existsSync(arquivoFotos) ? JSON.parse(readFileSync(arquivoFotos, "utf8")) : {};
const comFoto = capitulo.cenas.filter((cena) => cena.wiki && fotos[cena.wiki]);
if (comFoto.length > 0) {
  // As licenças Creative Commons exigem o crédito: copie esta lista na descrição do vídeo.
  linhas.push("", "## Créditos das fotos", "");
  for (const cena of comFoto) {
    const foto = fotos[cena.wiki];
    linhas.push(`- ${cena.nome}: ${foto.autor}, ${foto.licenca}, [Wikimedia Commons](${foto.pagina})`);
  }
}

mkdirSync(join(raiz, "roteiro"), { recursive: true });
const destino = join(raiz, "roteiro", `capitulo-${numero}.md`);
writeFileSync(destino, linhas.join("\n") + "\n");
console.log(`Escrito ${destino}`);
