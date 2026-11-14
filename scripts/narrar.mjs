#!/usr/bin/env node
// Gera a narração de um capítulo no ElevenLabs, uma cena por vez.
//
//   node scripts/narrar.mjs 1            narra o capítulo 1
//   node scripts/narrar.mjs 1 --custo    só mostra quantos caracteres vai gastar
//   node scripts/narrar.mjs 1 --refazer  ignora o que já foi gravado
//
// Precisa da variável ELEVENLABS_API_KEY. A voz fica em narracao.config.json.
// Cenas cujo texto não mudou não são gravadas (nem cobradas) de novo.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const numero = process.argv[2];
const opcoes = new Set(process.argv.slice(3));
if (!/^\d+$/.test(numero ?? "")) {
  console.error("Uso: node scripts/narrar.mjs <número do capítulo> [--custo] [--refazer]");
  process.exit(1);
}

const config = JSON.parse(readFileSync(join(raiz, "narracao.config.json"), "utf8"));
const arquivoCapitulo = join(raiz, "src/capitulos", `capitulo-${numero}.json`);
const arquivoAudio = join(raiz, "src/capitulos", `capitulo-${numero}.audio.json`);
const capitulo = JSON.parse(readFileSync(arquivoCapitulo, "utf8"));
const audio = existsSync(arquivoAudio) ? JSON.parse(readFileSync(arquivoAudio, "utf8")) : {};
const pasta = `narracao/capitulo-${numero}`;
mkdirSync(join(raiz, "public", pasta), { recursive: true });

// "[1882|mil oitocentos e oitenta e dois]" mostra 1882 na legenda e fala por extenso.
// Devolve o texto falado e, para cada palavra mostrada, o trecho falado que corresponde a ela.
const separar = (narracao) => {
  const partes = [];
  const marca = /\[([^|\]]+)\|([^\]]+)\]/g;
  let fim = 0;
  for (const achado of narracao.matchAll(marca)) {
    partes.push({ mostrado: narracao.slice(fim, achado.index), falado: null });
    partes.push({ mostrado: achado[1], falado: achado[2] });
    fim = achado.index + achado[0].length;
  }
  partes.push({ mostrado: narracao.slice(fim), falado: null });

  let falado = "";
  const palavras = [];
  for (const parte of partes) {
    if (parte.falado !== null) {
      // A marcação inteira vira uma palavra só na legenda. Se vier colada em
      // pontuação ("[1882|...],"), a pontuação se junta a ela depois.
      const de = falado.length;
      falado += parte.falado;
      palavras.push({ p: parte.mostrado, de, ate: falado.length, colar: true });
      continue;
    }
    for (const pedaco of parte.mostrado.split(/(\s+)/)) {
      if (pedaco === "") continue;
      if (/^\s+$/.test(pedaco)) {
        falado += " ";
        continue;
      }
      const de = falado.length;
      falado += pedaco;
      const anterior = palavras[palavras.length - 1];
      const colado = anterior && anterior.ate === de;
      if (colado && (anterior.colar || /^[.,;:!?)]+$/.test(pedaco))) {
        anterior.p += pedaco;
        anterior.ate = falado.length;
        anterior.colar = false;
      } else {
        palavras.push({ p: pedaco, de, ate: falado.length });
      }
    }
  }
  return { falado: falado.trim().replace(/\s+/g, " "), bruto: falado, palavras };
};

const cenas = capitulo.cenas
  .filter((cena) => cena.narracao)
  .map((cena) => {
    const { falado, bruto, palavras } = separar(cena.narracao);
    // As posições foram medidas no texto bruto; alinha com o texto enviado.
    const recuo = bruto.length - bruto.trimStart().length;
    if (bruto.trim() !== falado) {
      throw new Error(`Cena ${cena.id}: use um espaço só entre as palavras da narração.`);
    }
    const hash = createHash("sha1")
      .update(JSON.stringify([falado, config.voz, config.modelo, config.ajustes]))
      .digest("hex");
    return { id: cena.id, falado, hash, palavras: palavras.map((w) => ({ ...w, de: w.de - recuo, ate: w.ate - recuo })) };
  });

const pendentes = cenas.filter(
  (cena) =>
    opcoes.has("--refazer") ||
    audio[cena.id]?.hash !== cena.hash ||
    !existsSync(join(raiz, "public", audio[cena.id].arquivo)),
);
const caracteres = pendentes.reduce((soma, cena) => soma + cena.falado.length, 0);
console.log(
  `Capítulo ${numero}: ${cenas.length} cenas com narração, ${pendentes.length} a gravar, ${caracteres} caracteres.`,
);
if (opcoes.has("--custo") || pendentes.length === 0) {
  process.exit(0);
}

const chave = process.env.ELEVENLABS_API_KEY;
if (!chave) {
  console.error("Falta a variável ELEVENLABS_API_KEY.");
  process.exit(1);
}

const duracaoReal = (arquivo, reserva) => {
  try {
    const saida = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo],
      { encoding: "utf8" },
    );
    return Number(saida.trim()) || reserva;
  } catch {
    return reserva;
  }
};

for (const cena of pendentes) {
  const posicao = cenas.indexOf(cena);
  const resposta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voz}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": chave, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: cena.falado,
        model_id: config.modelo,
        voice_settings: config.ajustes,
        // Dá o contexto das cenas vizinhas para a entonação ficar contínua.
        previous_text: cenas[posicao - 1]?.falado,
        next_text: cenas[posicao + 1]?.falado,
      }),
    },
  );
  if (!resposta.ok) {
    console.error(`Erro ${resposta.status} na cena ${cena.id}: ${await resposta.text()}`);
    process.exit(1);
  }
  const dados = await resposta.json();
  const arquivo = `${pasta}/${cena.id}.mp3`;
  const caminho = join(raiz, "public", arquivo);
  writeFileSync(caminho, Buffer.from(dados.audio_base64, "base64"));

  const inicios = dados.alignment.character_start_times_seconds;
  const fins = dados.alignment.character_end_times_seconds;
  const ultimo = fins.length - 1;
  const arredondar = (s) => Math.round(s * 100) / 100;
  audio[cena.id] = {
    arquivo,
    duracao: arredondar(duracaoReal(caminho, fins[ultimo])),
    palavras: cena.palavras.map((w) => ({
      p: w.p,
      i: arredondar(inicios[Math.min(w.de, ultimo)]),
      f: arredondar(fins[Math.min(w.ate - 1, ultimo)]),
    })),
    hash: cena.hash,
  };
  // Salva a cada cena: se cair no meio, o que já foi pago não se perde.
  writeFileSync(arquivoAudio, JSON.stringify(audio, null, 1) + "\n");
  console.log(`  ok ${cena.id} (${audio[cena.id].duracao}s)`);
}

const total = cenas.reduce((soma, cena) => soma + (audio[cena.id]?.duracao ?? 0), 0);
console.log(`Narração do capítulo ${numero}: ${Math.round(total)}s.`);
