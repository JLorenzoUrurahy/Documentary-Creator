#!/usr/bin/env node
// Imagens de fundo de uso livre (lugares, eventos, objetos, jornais de época),
// vindas da Wikimedia Commons.
//
//   node scripts/fundos.mjs 2                       baixa os fundos que faltam no capítulo 2
//   node scripts/fundos.mjs 2 --refazer             baixa de novo
//   node scripts/fundos.mjs --buscar "Theatro da Paz Belém" [quantos]
//                                                   procura no Commons e diz quais servem
//   node scripts/fundos.mjs --conferir "Arquivo.jpg" ["Outro.jpg" ...]
//                                                   só diz se cada arquivo serve (licença e tamanho)
//
// Cada cena pode ter "fundo": "Nome do arquivo no Commons.jpg". Só entram
// arquivos em domínio público ou Creative Commons que permita uso comercial e
// adaptação (CC0, CC BY, CC BY-SA). Autor e licença vão para src/fundos.json e
// aparecem na tela. Não usa chave nem serviço pago.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const agente = { "User-Agent": "DocumentaryCreator/1.0 (video project; node fetch)" };
const LARGURA_MINIMA = 500;

const semHtml = (texto) =>
  (texto ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

const pedir = async (url) => {
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const resposta = await fetch(url, { headers: agente });
    if (resposta.status !== 429) {
      return resposta;
    }
    await esperar(4000 * (tentativa + 1));
  }
  throw new Error("Commons pediu para esperar (429)");
};

// Devolve { serve, motivo, ... } para um arquivo do Commons.
export const conferir = async (nome) => {
  const titulo = `File:${nome.replace(/^(File|Ficheiro|Arquivo):/i, "").replace(/_/g, " ")}`;
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    format: "json",
    action: "query",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1920",
    titles: titulo,
  })}`;
  const dados = await (await pedir(url)).json();
  const info = Object.values(dados.query?.pages ?? {})[0]?.imageinfo?.[0];
  if (!info) {
    return { serve: false, motivo: "não existe no Commons" };
  }
  const licenca = semHtml(info.extmetadata?.LicenseShortName?.value);
  const livre =
    /^(public domain|pd\b|cc0|cc[ -]by(-sa)?[ -]\d|cc[ -]by(-sa)?$|no restrictions)/i.test(licenca) &&
    !/\b(nc|nd)\b/i.test(licenca);
  const base = { licenca, largura: info.width, altura: info.height, pagina: info.descriptionurl };
  if (!livre) {
    return { serve: false, motivo: `licença não aceita: ${licenca || "sem licença"}`, ...base };
  }
  if (!/^image\/(jpeg|png)$/.test(info.mime)) {
    return { serve: false, motivo: `formato ${info.mime}`, ...base };
  }
  if (info.width < LARGURA_MINIMA) {
    return { serve: false, motivo: `pequena demais (${info.width} px)`, ...base };
  }
  const autor = semHtml(info.extmetadata?.Artist?.value);
  return {
    serve: true,
    ...base,
    autor: !autor || /unknown/i.test(autor) ? "autor desconhecido" : autor.slice(0, 80),
    licenca: licenca.replace(/^public domain$/i, "domínio público"),
    descricao: semHtml(info.extmetadata?.ImageDescription?.value).slice(0, 200),
    url: info.thumburl ?? info.url,
    png: info.mime === "image/png",
  };
};

const argumentos = process.argv.slice(2);
if (argumentos[0] === "--conferir") {
  for (const nome of argumentos.slice(1)) {
    const r = await conferir(nome);
    console.log(
      r.serve
        ? `SERVE  ${nome} | ${r.licenca} | ${r.largura}x${r.altura} | ${r.autor} | ${r.descricao}`
        : `NÃO    ${nome} | ${r.motivo}`,
    );
    await esperar(300);
  }
  process.exit(0);
}

if (argumentos[0] === "--buscar") {
  // Procura arquivos no Commons e já diz quais servem.
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    format: "json",
    action: "query",
    list: "search",
    srnamespace: "6",
    srlimit: argumentos[2] ?? "12",
    srsearch: `${argumentos[1]} filetype:bitmap`,
  })}`;
  const dados = await (await pedir(url)).json();
  for (const achado of dados.query?.search ?? []) {
    const nome = achado.title.replace(/^File:/, "");
    const r = await conferir(nome);
    console.log(
      r.serve
        ? `SERVE  ${nome} | ${r.licenca} | ${r.largura}x${r.altura} | ${r.autor} | ${r.descricao}`
        : `NÃO    ${nome} | ${r.motivo}`,
    );
    await esperar(250);
  }
  process.exit(0);
}

const numero = argumentos[0];
const refazer = argumentos.includes("--refazer");
if (!/^\d+$/.test(numero ?? "")) {
  console.error('Uso: node scripts/fundos.mjs <capítulo> [--refazer]  |  --conferir "Arquivo.jpg"');
  process.exit(1);
}
const arquivoIndice = join(raiz, "src/fundos.json");
const indice = existsSync(arquivoIndice) ? JSON.parse(readFileSync(arquivoIndice, "utf8")) : {};
const capitulo = JSON.parse(readFileSync(join(raiz, "src/capitulos", `capitulo-${numero}.json`), "utf8"));
mkdirSync(join(raiz, "public/fundos"), { recursive: true });

const nomes = [...new Set(capitulo.cenas.map((cena) => cena.fundo).filter(Boolean))];
let novas = 0;
let recusadas = 0;
for (const nome of nomes) {
  if (indice[nome] && !refazer) {
    continue;
  }
  try {
    const r = await conferir(nome);
    if (!r.serve) {
      recusadas++;
      console.log(`  recusada: ${nome} (${r.motivo})`);
      continue;
    }
    const imagem = await pedir(r.url);
    if (!imagem.ok) {
      throw new Error(`download respondeu ${imagem.status}`);
    }
    const base = nome
      .replace(/\.[A-Za-z]+$/, "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .toLowerCase()
      .slice(0, 70);
    const arquivo = `fundos/${base}.${r.png ? "png" : "jpg"}`;
    writeFileSync(join(raiz, "public", arquivo), Buffer.from(await imagem.arrayBuffer()));
    indice[nome] = { arquivo, autor: r.autor, licenca: r.licenca, pagina: r.pagina };
    writeFileSync(arquivoIndice, JSON.stringify(indice, null, 1) + "\n");
    novas++;
    console.log(`  ok ${nome}: ${r.licenca}`);
    await esperar(400);
  } catch (erro) {
    console.log(`  falhou ${nome}: ${erro.message}`);
  }
}
if (!existsSync(arquivoIndice)) {
  writeFileSync(arquivoIndice, "{}\n");
}
console.log(`Capítulo ${numero}: ${nomes.length} fundos pedidos, ${novas} novos, ${recusadas} recusados.`);
