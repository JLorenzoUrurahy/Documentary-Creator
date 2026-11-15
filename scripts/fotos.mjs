#!/usr/bin/env node
// Busca fotos de uso livre das pessoas de um capítulo na Wikipedia / Wikimedia Commons.
//
//   node scripts/fotos.mjs 2            busca as fotos que faltam no capítulo 2
//   node scripts/fotos.mjs 2 --refazer  busca de novo mesmo as que já existem
//
// Para cada cena "perfil" com o campo "wiki" (título do artigo da pessoa), pega a
// imagem principal do artigo, só se ela for de uso livre (domínio público ou
// Creative Commons). Salva em public/fotos/ e anota autor e licença em
// src/fotos.json. Sem foto livre, a cena continua com as iniciais.
// Não usa chave nem serviço pago.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const numero = process.argv[2];
const refazer = process.argv.includes("--refazer");
if (!/^\d+$/.test(numero ?? "")) {
  console.error("Uso: node scripts/fotos.mjs <número do capítulo> [--refazer]");
  process.exit(1);
}

const agente = { "User-Agent": "DocumentaryCreator/1.0 (video project; node fetch)" };
const arquivoIndice = join(raiz, "src/fotos.json");
const indice = existsSync(arquivoIndice) ? JSON.parse(readFileSync(arquivoIndice, "utf8")) : {};
const capitulo = JSON.parse(
  readFileSync(join(raiz, "src/capitulos", `capitulo-${numero}.json`), "utf8"),
);
mkdirSync(join(raiz, "public/fotos"), { recursive: true });

const consultar = async (dominio, parametros) => {
  const url = `https://${dominio}/w/api.php?${new URLSearchParams({ format: "json", ...parametros })}`;
  const resposta = await fetch(url, { headers: agente });
  if (!resposta.ok) {
    throw new Error(`${dominio} respondeu ${resposta.status}`);
  }
  return resposta.json();
};

const semHtml = (texto) =>
  (texto ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const autorLimpo = (texto) => {
  const autor = semHtml(texto);
  return !autor || /unknown/i.test(autor) ? "autor desconhecido" : autor;
};

// Nome do arquivo da imagem principal do artigo, só se for de uso livre.
const imagemDoArtigo = async (titulo) => {
  for (const dominio of ["pt.wikipedia.org", "en.wikipedia.org"]) {
    const dados = await consultar(dominio, {
      action: "query",
      redirects: "1",
      prop: "pageimages",
      piprop: "name",
      pilicense: "free",
      titles: titulo,
    });
    const pagina = Object.values(dados.query?.pages ?? {})[0];
    if (pagina?.pageimage) {
      return pagina.pageimage;
    }
  }
  return null;
};

const pessoas = capitulo.cenas.filter((cena) => cena.tipo === "perfil" && cena.wiki);
let novas = 0;
for (const cena of pessoas) {
  if (indice[cena.wiki] && !refazer) {
    continue;
  }
  try {
    const nomeArquivo = await imagemDoArtigo(cena.wiki);
    if (!nomeArquivo) {
      console.log(`  sem foto livre: ${cena.nome} (${cena.wiki})`);
      continue;
    }
    const dados = await consultar("commons.wikimedia.org", {
      action: "query",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "900",
      titles: `File:${nomeArquivo}`,
    });
    const info = Object.values(dados.query?.pages ?? {})[0]?.imageinfo?.[0];
    const extensao = info?.thumburl?.split("?")[0].match(/\.(jpe?g|png)$/i)?.[1]?.toLowerCase();
    if (!info || !extensao) {
      // Arquivo fora do Commons (uso restrito) ou formato que o vídeo não abre.
      console.log(`  sem foto livre: ${cena.nome} (${cena.wiki})`);
      continue;
    }
    const imagem = await fetch(info.thumburl, { headers: agente });
    if (!imagem.ok) {
      throw new Error(`download respondeu ${imagem.status}`);
    }
    const base = cena.wiki
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .toLowerCase();
    const arquivo = `fotos/${base}.${extensao === "png" ? "png" : "jpg"}`;
    writeFileSync(join(raiz, "public", arquivo), Buffer.from(await imagem.arrayBuffer()));
    indice[cena.wiki] = {
      arquivo,
      autor: autorLimpo(info.extmetadata?.Artist?.value),
      licenca: (semHtml(info.extmetadata?.LicenseShortName?.value) || "ver página").replace(/^public domain$/i, "domínio público"),
      pagina: info.descriptionurl,
    };
    writeFileSync(arquivoIndice, JSON.stringify(indice, null, 1) + "\n");
    novas++;
    console.log(`  ok ${cena.nome}: ${indice[cena.wiki].licenca}`);
  } catch (erro) {
    console.log(`  falhou ${cena.nome}: ${erro.message}`);
  }
}
if (!existsSync(arquivoIndice)) {
  writeFileSync(arquivoIndice, "{}\n");
}
console.log(`Capítulo ${numero}: ${pessoas.length} perfis com "wiki", ${novas} fotos novas.`);
