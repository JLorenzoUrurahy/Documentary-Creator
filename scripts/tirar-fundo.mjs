#!/usr/bin/env node
// Tira o fundo de cenas:  node scripts/tirar-fundo.mjs <N> <prefixo de id> [...]
import { readFileSync, writeFileSync } from "node:fs";
const [numero, ...prefixos] = process.argv.slice(2);
const caminho = `src/capitulos/capitulo-${numero}.json`;
const capitulo = JSON.parse(readFileSync(caminho, "utf8"));
for (const cena of capitulo.cenas) {
  if (cena.fundo && prefixos.some((p) => cena.id.startsWith(p))) {
    delete cena.fundo;
    console.log(`  sem fundo: ${cena.id}`);
  }
}
writeFileSync(caminho, JSON.stringify(capitulo, null, 2) + "\n");
