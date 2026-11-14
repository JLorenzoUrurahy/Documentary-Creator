#!/usr/bin/env bash
# Junta out/capitulo-1.mp4, out/capitulo-2.mp4... em out/documentario.mp4, sem recodificar.
set -euo pipefail
cd "$(dirname "$0")/.."
lista=$(mktemp)
trap 'rm -f "$lista"' EXIT
total=0
for arquivo in $(ls out/capitulo-*.mp4 2>/dev/null | sort -V); do
  echo "file '$PWD/$arquivo'" >> "$lista"
  total=$((total + 1))
done
[ "$total" -gt 0 ] || { echo "Nenhum out/capitulo-N.mp4 encontrado."; exit 1; }
ffmpeg -y -v error -f concat -safe 0 -i "$lista" -c copy out/documentario.mp4
segundos=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/documentario.mp4)
printf 'out/documentario.mp4: %s capítulos, %d min %d s\n' "$total" "$((${segundos%.*} / 60))" "$((${segundos%.*} % 60))"
