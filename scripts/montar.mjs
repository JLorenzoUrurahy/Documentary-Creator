#!/usr/bin/env node
// Junta os blocos de um capítulo (bloco-a.json, bloco-b.json...) em
// src/capitulos/capitulo-N.json, insere a cena de título depois do gancho e
// registra o capítulo em src/capitulos/index.ts.
//
//   node scripts/montar.mjs <N> <pasta dos blocos> "<título>" "<subtítulo>"
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const [numero, pasta, titulo, subtitulo] = process.argv.slice(2);
if (!/^\d+$/.test(numero ?? "") || !pasta || !titulo) {
  console.error('Uso: node scripts/montar.mjs <N> <pasta dos blocos> "<título>" "<subtítulo>"');
  process.exit(1);
}

const arquivos = readdirSync(pasta)
  .filter((nome) => /^bloco-[a-z]\.json$/.test(nome))
  .sort();
if (arquivos.length === 0) {
  console.error(`Nenhum bloco-<letra>.json em ${pasta}`);
  process.exit(1);
}

const cenas = [];
const fontes = [];
const conferir = [];
const urls = new Set();
for (const nome of arquivos) {
  const bloco = JSON.parse(readFileSync(join(pasta, nome), "utf8"));
  cenas.push(...bloco.cenas);
  for (const fonte of bloco.fontes ?? []) {
    if (!urls.has(fonte.url)) {
      urls.add(fonte.url);
      fontes.push(fonte);
    }
  }
  conferir.push(...(bloco.conferir ?? []));
}

const cenaTitulo = {
  id: "t00-titulo",
  tipo: "titulo",
  numero: Number(numero),
  titulo,
  ...(subtitulo ? { subtitulo } : {}),
  duracao: 5,
};
const capitulo = {
  numero: Number(numero),
  titulo,
  ...(subtitulo ? { subtitulo } : {}),
  fontes,
  conferir,
  cenas: [cenas[0], cenaTitulo, ...cenas.slice(1)],
};
writeFileSync(
  join(raiz, "src/capitulos", `capitulo-${numero}.json`),
  JSON.stringify(capitulo, null, 2) + "\n",
);
const arquivoAudio = join(raiz, "src/capitulos", `capitulo-${numero}.audio.json`);
if (!existsSync(arquivoAudio)) {
  writeFileSync(arquivoAudio, "{}\n");
}

// Registra no índice, se ainda não estiver lá.
const arquivoIndice = join(raiz, "src/capitulos/index.ts");
let indice = readFileSync(arquivoIndice, "utf8");
if (!indice.includes(`./capitulo-${numero}.json`)) {
  const anterior = `  { capitulo: capitulo${numero - 1} as Capitulo, audio: audio${numero - 1} as AudioCapitulo },\n`;
  const importAnterior = `import audio${numero - 1} from "./capitulo-${numero - 1}.audio.json";\n`;
  if (!indice.includes(anterior) || !indice.includes(importAnterior)) {
    console.error(`Registre o capítulo ${numero} à mão em src/capitulos/index.ts (o ${numero - 1} não está lá).`);
    process.exit(1);
  }
  indice = indice
    .replace(
      importAnterior,
      `${importAnterior}import capitulo${numero} from "./capitulo-${numero}.json";\nimport audio${numero} from "./capitulo-${numero}.audio.json";\n`,
    )
    .replace(
      anterior,
      `${anterior}  { capitulo: capitulo${numero} as Capitulo, audio: audio${numero} as AudioCapitulo },\n`,
    );
  writeFileSync(arquivoIndice, indice);
}
console.log(
  `Capítulo ${numero}: ${arquivos.length} blocos, ${capitulo.cenas.length} cenas, ${fontes.length} fontes, ${conferir.length} pontos a conferir.`,
);
