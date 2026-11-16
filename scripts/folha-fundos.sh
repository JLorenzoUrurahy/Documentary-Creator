#!/usr/bin/env bash
# Folha com as imagens de fundo de um capítulo, cada uma com o id da cena.
#   bash scripts/folha-fundos.sh <N> <pasta de saída>
set -euo pipefail
cd "$(dirname "$0")/.."
n="$1"; saida="$2"; mkdir -p "$saida"
node -e '
const c=require(`./src/capitulos/capitulo-${process.argv[1]}.json`),f=require("./src/fundos.json");
for(const s of c.cenas){if(s.fundo&&f[s.fundo])console.log(s.id+"\t"+f[s.fundo].arquivo)}' "$n" > "$saida/lista.tsv"
k=0
while IFS=$'\t' read -r id arquivo; do
  k=$((k+1))
  ffmpeg -y -v error -i "public/$arquivo" -vf "scale=480:270:force_original_aspect_ratio=increase,crop=480:270,format=gray,drawbox=0:0:480:26:black@0.7:fill,drawtext=text='$id':x=6:y=5:fontsize=16:fontcolor=white" -frames:v 1 "$saida/$(printf %03d $k).png" </dev/null
done < "$saida/lista.tsv"
ffmpeg -y -v error -i "$saida/%03d.png" -frames:v 1 -vf "tile=5x6:padding=4" "$saida/fundos-$n.jpg"
echo "$k imagens: $saida/fundos-$n.jpg"
