#!/usr/bin/env bash
# Instala o pack completo: dependências do Remotion, os repositórios de
# referência dos dois guias (em pack/, fora do git) e confere os pré-requisitos.
#
#   bash scripts/instalar-pack.sh           instala / atualiza tudo
#   bash scripts/instalar-pack.sh --skills  também instala os 19 pacotes do motion-skills
set -euo pipefail
cd "$(dirname "$0")/.."

# Repositórios de estudo e de prompts (guia "8 repositórios") + fronteiras históricas (guia do documentário).
REPOS=(
  "JohnHeibel/ClaudeAnimationBase"
  "JohnHeibel/PDoomVideo"
  "ledbetterljoshua/functional-emotions-video"
  "joeseesun/opus-video-prompts"
  "yihui-dev/awesome-opus5-5-videos"
  "iart-ai/motion-skills"
  "aourednik/historical-basemaps"
)

# Todos os pacotes do motion-skills. Os quatro primeiros já vêm instalados no projeto.
PACOTES_SKILLS=(
  map-animation-skills explainer-video-skills data-animation-skills youtube-video-skills
  tiktok-video-skills text-message-video-skills ecommerce-video-skills ad-video-skills
  web-animation-skills motion-design-skills kinetic-typography-skills freelance-motion-skills
  webgl-animation-skills manim-skills generative-illustration-skills javascript-animation-skills
  lower-thirds-skills b-roll-skills talking-head-skills
)

echo "== Pré-requisitos"
falta=0
for cmd in node npm git ffmpeg; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "  ok     $cmd"
  else
    echo "  FALTA  $cmd"
    falta=1
  fi
done
if command -v ffmpeg >/dev/null 2>&1; then
  versao=$(ffmpeg -version | head -1 | sed -E 's/^ffmpeg version n?([0-9]+).*/\1/')
  if [[ "$versao" =~ ^[0-9]+$ ]] && [ "$versao" -lt 7 ]; then
    echo "  aviso  ffmpeg $versao: o lemo-opuscar pede ffmpeg 7 ou mais novo (o Remotion não depende dele)"
  fi
fi
[ "$falta" -eq 0 ] || { echo "Instale o que falta e rode de novo."; exit 1; }

echo "== Dependências do Remotion"
npm install --no-audit --no-fund

echo "== Repositórios de referência (pack/)"
mkdir -p pack
for repo in "${REPOS[@]}"; do
  destino="pack/${repo##*/}"
  if [ -d "$destino/.git" ]; then
    echo "  atualizando $repo"
    git -C "$destino" pull --quiet --ff-only || echo "  aviso: não deu pra atualizar $repo"
  else
    echo "  baixando    $repo"
    git clone --quiet --depth 1 "https://github.com/$repo" "$destino"
  fi
done

if [ "${1:-}" = "--skills" ]; then
  echo "== Todos os pacotes do motion-skills"
  for pacote in "${PACOTES_SKILLS[@]}"; do
    npx --yes skills add "iart-ai/$pacote" --yes --agent claude-code >/dev/null
    echo "  ok $pacote"
  done
fi

echo
echo "Pronto. Abra a prévia com: npm run dev"
echo "Os plugins lemo-opuscar e hyperframes são instalados pelo Claude Code ao abrir esta pasta."
