# Documentary Creator

Projeto Remotion para gerar documentários de história com mapa animado, do tema ao MP4. Fale com o usuário em português do Brasil.

## Antes de qualquer coisa

Se `node_modules/` ou `pack/` não existirem (clone novo ou sessão nova na nuvem), rode `bash scripts/instalar-pack.sh`.

## Fluxo (seguir nesta ordem, um capítulo por vez)

1. **Plano**: capítulos, cenas e estilo visual. Esperar a aprovação do usuário antes de escrever código.
2. **Roteiro**: pesquisar, listar fontes com link e salvar em `roteiro/capitulo-N.md`. Marcar com `[CONFERIR]` toda data ou número incerto. Não inventar fatos.
3. **Cenas**: cada capítulo é uma `<Composition>` com id `capitulo-N`, registrada em `src/Composition.tsx`, com o código em `src/capitulos/`.
4. **Narração**: áudio em `public/narracao-N.mp3`; a duração de cada cena acompanha a fala.
5. **Render**: `npx remotion render capitulo-N out/capitulo-N.mp4`, um por vez; depois juntar em `out/documentario.mp4` com ffmpeg sem recodificar.

Os prompts prontos de cada etapa estão em `PROMPTS.md`.

## Padrões

- 1920x1080, 30 quadros por segundo (`FPS`, `LARGURA`, `ALTURA` em `src/Composition.tsx`).
- Mapa desenhado em código, sem imagem de terceiros. Fronteiras: `pack/historical-basemaps/geojson/world_<ano>.geojson`, no ano mais próximo da cena. Copiar para `public/` ou `src/` só os arquivos usados. O autor avisa que é trabalho em andamento: conferir as fronteiras.
- Contador de ano no canto, frase da narração como legenda embaixo, setas para exércitos, X para batalhas.
- Quando o usuário aprovar o estilo, salvar em `ESTILO.md` e seguir nos capítulos seguintes.
- Música e imagem só se o usuário fornecer o arquivo.
- Rascunho em resolução baixa (`--scale 0.5`); 1080p só no render final.

## O pack

- **Skills** (`.claude/skills/`): Remotion oficial e, do motion-skills, mapa, explicativo, gráficos de dados e YouTube.
- **Plugins** (`.claude/settings.json`): `lemo-opuscar` (66 estilos de cinema, `/lemo-opuscar:lemo-opuscar`) e `hyperframes` (HTML que vira MP4).
- **Referências** em `pack/` (fora do git, só leitura):
  - `ClaudeAnimationBase`: kit p5.js com o personagem Clawd; ler `ANIMATION_GUIDE.md`.
  - `PDoomVideo` e `functional-emotions-video`: `STORYBOARD.md` e `ANIMATION_GUIDE.md` mostram como dividir um clipe em capítulos para subagentes em paralelo.
  - `opus-video-prompts` e `awesome-opus5-5-videos`: prompts prontos para adaptar.
  - `motion-skills`: índice dos 19 pacotes de skills.
  - `historical-basemaps`: fronteiras históricas (GPL-3.0).
