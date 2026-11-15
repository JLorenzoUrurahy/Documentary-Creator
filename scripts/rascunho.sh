#!/usr/bin/env bash
# Folha de quadros de um capítulo: um quadro perto do fim de cada cena, em
# folhas de até 24 quadros. Serve para conferir o visual antes de narrar
# (usa a duração estimada) e depois de narrar (usa a duração real).
#
#   bash scripts/rascunho.sh <N> <pasta de saída>
set -euo pipefail
cd "$(dirname "$0")/.."
numero="${1:?Uso: bash scripts/rascunho.sh <N> <pasta de saída>}"
saida="${2:?Uso: bash scripts/rascunho.sh <N> <pasta de saída>}"
mkdir -p "$saida"

# Mesmo cálculo de src/motor/tempo.ts: fala gravada + 0,7 s, ou 2,5 palavras por segundo.
quadros=$(node -e '
const numero = process.argv[1];
const capitulo = require(`./src/capitulos/capitulo-${numero}.json`);
let audio = {};
try { audio = require(`./src/capitulos/capitulo-${numero}.audio.json`); } catch {}
let inicio = 0;
const saida = [];
for (const cena of capitulo.cenas) {
  const palavras = cena.narracao
    ? cena.narracao.replace(/\[([^|\]]+)\|[^\]]+\]/g, "$1").split(/\s+/).filter(Boolean).length
    : 0;
  const segundos = audio[cena.id] ? audio[cena.id].duracao + 0.7 : palavras ? palavras / 2.5 + 0.7 : cena.duracao ?? 4;
  const duracao = Math.ceil(segundos * 30);
  saida.push(Math.round(inicio + duracao * 0.9));
  inicio += duracao;
}
console.log(saida.join(" "));
' "$numero")

n=0
for quadro in $quadros; do
  n=$((n + 1))
  npx remotion still "capitulo-$numero" "$saida/$(printf %03d "$n").png" --frame="$quadro" --scale=0.34 >/dev/null 2>&1 \
    || echo "falhou a cena $n (quadro $quadro)"
done

folha=0
for inicio in $(seq 1 24 "$n"); do
  folha=$((folha + 1))
  ffmpeg -y -v error -start_number "$inicio" -i "$saida/%03d.png" -frames:v 1 \
    -vf "tile=4x6:padding=4" "$saida/folha-$folha.jpg"
done
echo "$n quadros em $folha folha(s): $saida/folha-*.jpg"
