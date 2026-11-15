#!/usr/bin/env node
// Confere um capítulo antes de gastar narração: ids repetidos, "quando" que não
// existe na fala, cenas longas ou curtas demais, tipos repetidos em sequência.
//
//   node scripts/validar.mjs 2
//   node scripts/validar.mjs caminho/para/arquivo.json   (aceita um bloco avulso)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const alvo = process.argv[2];
if (!alvo) {
  console.error("Uso: node scripts/validar.mjs <número do capítulo | arquivo.json>");
  process.exit(1);
}
const arquivo = /^\d+$/.test(alvo) ? join(raiz, "src/capitulos", `capitulo-${alvo}.json`) : alvo;
const capitulo = JSON.parse(readFileSync(arquivo, "utf8"));

const TIPOS = ["titulo", "mapa", "cartao", "comparacao", "perfil", "linha", "linhagem", "citacao"];
const mostrado = (texto) => texto.replace(/\[([^|\]]+)\|[^\]]+\]/g, "$1");
const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .map((palavra) => palavra.replace(/[^a-z0-9]+/g, ""))
    .filter(Boolean)
    .join(" ");

const erros = [];
const avisos = [];
const ids = new Set();
let palavrasTotal = 0;
let sequencia = 0;

capitulo.cenas.forEach((cena, n) => {
  const onde = `${cena.id ?? `cena ${n + 1}`}`;
  if (!cena.id || ids.has(cena.id)) erros.push(`${onde}: id ausente ou repetido`);
  ids.add(cena.id);
  if (!TIPOS.includes(cena.tipo)) erros.push(`${onde}: tipo desconhecido "${cena.tipo}"`);

  sequencia = n > 0 && capitulo.cenas[n - 1].tipo === cena.tipo ? sequencia + 1 : 1;
  if (sequencia === 3) avisos.push(`${onde}: terceira cena seguida do tipo "${cena.tipo}"`);

  const narracao = cena.narracao ?? "";
  if (/\s{2,}|\n/.test(narracao)) erros.push(`${onde}: espaço duplo ou quebra de linha na narração`);
  if (/\b(1[0-9]{3}|20[0-9]{2})\b/.test(narracao.replace(/\[[^\]]+\]/g, ""))) {
    avisos.push(`${onde}: ano fora do formato [1930|mil novecentos e trinta]`);
  }
  const fala = normalizar(mostrado(narracao));
  const palavras = fala ? fala.split(" ").length : 0;
  palavrasTotal += palavras;
  if (cena.tipo !== "titulo" && !narracao) erros.push(`${onde}: sem narração`);
  if (palavras > 120) avisos.push(`${onde}: ${palavras} palavras (longa)`);

  // Junta tudo o que pode ter "quando" na cena.
  const elementos = [
    ...(cena.itens ?? []),
    ...(cena.fatos ?? []),
    ...(cena.eventos ?? []),
    ...(cena.lugares ?? []),
    ...(cena.rotas ?? []),
    ...(cena.nos ?? []),
    ...(cena.esquerda?.itens ?? []),
    ...(cena.direita?.itens ?? []),
  ];
  for (const elemento of elementos) {
    if (typeof elemento === "string") continue;
    for (const campo of ["quando", "ate"]) {
      const trecho = elemento[campo];
      if (typeof trecho === "string" && !` ${fala} `.includes(` ${normalizar(trecho)} `)) {
        erros.push(`${onde}: "${campo}" não está na narração: "${trecho}"`);
      }
    }
  }
  if (cena.tipo === "linhagem") {
    const nos = new Set(cena.nos.map((no) => no.id));
    cena.nos.forEach((no) => {
      if (no.pai && !nos.has(no.pai)) erros.push(`${onde}: nó "${no.id}" aponta para pai inexistente`);
    });
  }
  if (cena.tipo === "mapa") {
    const pontos = [...(cena.lugares ?? []).map((l) => l.coord), ...(cena.rotas ?? []).flatMap((r) => r.pontos)];
    for (const ponto of pontos) {
      if (!Array.isArray(ponto) || Math.abs(ponto[0]) > 180 || Math.abs(ponto[1]) > 90) {
        erros.push(`${onde}: coordenada inválida ${JSON.stringify(ponto)} (use [longitude, latitude])`);
      }
    }
  }
});

for (const aviso of avisos) console.log(`aviso: ${aviso}`);
for (const erro of erros) console.log(`ERRO:  ${erro}`);
console.log(
  `${capitulo.cenas.length} cenas, ${palavrasTotal} palavras, cerca de ${Math.round(palavrasTotal / 134)} min. ${erros.length} erros, ${avisos.length} avisos.`,
);
process.exit(erros.length > 0 ? 1 : 0);
