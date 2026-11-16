#!/usr/bin/env node
// Grava no capítulo os fundos escolhidos por um subagente.
//   node scripts/aplicar-fundos.mjs <N> <arquivo de entrega.json> [prefixos de id a deixar de fora...]
import { readFileSync, writeFileSync } from "node:fs";
const [numero, entrega, ...fora] = process.argv.slice(2);
const escolhas = JSON.parse(readFileSync(entrega, "utf8")).fundos;
const caminho = `src/capitulos/capitulo-${numero}.json`;
const capitulo = JSON.parse(readFileSync(caminho, "utf8"));
let postos = 0;
for (const cena of capitulo.cenas) {
  const escolha = escolhas[cena.id];
  if (!escolha || ["mapa", "titulo", "perfil"].includes(cena.tipo)) continue;
  if (fora.some((prefixo) => cena.id.startsWith(prefixo))) {
    console.log(`  fora: ${cena.id}`);
    continue;
  }
  cena.fundo = escolha.arquivo;
  postos++;
}
writeFileSync(caminho, JSON.stringify(capitulo, null, 2) + "\n");
console.log(`Capítulo ${numero}: ${postos} cenas com fundo.`);
