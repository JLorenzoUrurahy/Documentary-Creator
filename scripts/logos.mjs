#!/usr/bin/env node
// Marca, em cada capítulo, a cena em que cada organização de src/logos.json é
// citada pela primeira vez, gravando ali o campo "logos". O logo entra na tela
// quando o nome é falado. Logos só os fornecidos pelo usuário em public/cedidas/.
//
//   node scripts/logos.mjs 7          marca o capítulo 7
//   node scripts/logos.mjs 7 --ver    só mostra o que marcaria
//   node scripts/logos.mjs 7 --tirar  remove os logos do capítulo
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const numero = process.argv[2];
const opcoes = new Set(process.argv.slice(3));
if (!/^\d+$/.test(numero ?? "")) {
  console.error("Uso: node scripts/logos.mjs <capítulo> [--ver] [--tirar]");
  process.exit(1);
}
const logos = JSON.parse(readFileSync(join(raiz, "src/logos.json"), "utf8"));
const arquivo = join(raiz, "src/capitulos", `capitulo-${numero}.json`);
const capitulo = JSON.parse(readFileSync(arquivo, "utf8"));
// Logos por cena: no mapa a fileira fica embaixo, à esquerda, e cabem cinco.
const maximo = (cena) => (cena.tipo === "mapa" ? 5 : 2);

for (const cena of capitulo.cenas) delete cena.logos;
if (!opcoes.has("--tirar")) {
  for (const [id, dados] of Object.entries(logos)) {
    const padrao = new RegExp(dados.padrao);
    for (const cena of capitulo.cenas) {
      if (!cena.narracao || cena.tipo === "titulo" || cena.semLogos) continue;
      const mostrado = cena.narracao.replace(/\[([^|\]]+)\|[^\]]+\]/g, "$1");
      const achado = mostrado.match(padrao);
      if (!achado) continue;
      if ((cena.logos ?? []).length >= maximo(cena)) continue;
      (cena.logos ??= []).push({ id, quando: achado[0] });
      console.log(`${numero} ${cena.id}: ${id} ("${achado[0]}")`);
      break;
    }
  }
}
if (!opcoes.has("--ver")) writeFileSync(arquivo, JSON.stringify(capitulo, null, 2) + "\n");
