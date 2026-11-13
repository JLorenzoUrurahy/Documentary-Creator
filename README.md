# Documentary Creator

Pack para gerar documentários e vídeos com o Claude Code: você dá um tema, o Claude pesquisa, escreve o roteiro e monta cada cena em código com o [Remotion](https://www.remotion.dev). No fim sai um MP4.

## Instalar

Precisa de [Claude Code](https://claude.com/claude-code), [Node.js](https://nodejs.org) (LTS), Google Chrome, git e ffmpeg.

```bash
git clone https://github.com/JLorenzoUrurahy/Documentary-Creator
cd Documentary-Creator
bash scripts/instalar-pack.sh
```

No Windows, rode o script pelo Git Bash.

Depois, em dois terminais:

```bash
npm run dev   # prévia do vídeo no navegador
claude        # peça o vídeo; os prompts estão em PROMPTS.md
```

Na primeira vez, o Claude Code pede para confiar na pasta e instala sozinho os plugins `lemo-opuscar` e `hyperframes`.

Para conferir a instalação: `npm run teste` gera `out/teste.mp4`.

## O que vem no pack

| Item | O que é | Onde fica |
| --- | --- | --- |
| Remotion + skills oficiais | Transforma o código em vídeo | `src/`, `.claude/skills/remotion-*` |
| [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 66 estilos de cinema (`/lemo-opuscar:lemo-opuscar`) | plugin |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | HTML que vira MP4 | plugin |
| [motion-skills](https://github.com/iart-ai/motion-skills) | Skills de mapa, explicativo, gráfico de dados e YouTube | `.claude/skills/` |
| [ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) | Desenho animado pintado, personagem Clawd | `pack/` |
| [PDoomVideo](https://github.com/JohnHeibel/PDoomVideo) | Clipe inteiro para estudar o método | `pack/` |
| [functional-emotions-video](https://github.com/ledbetterljoshua/functional-emotions-video) | 7 subagentes pintando um clipe | `pack/` |
| [opus-video-prompts](https://github.com/joeseesun/opus-video-prompts) | 18 prompts e 54 casos | `pack/` |
| [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 703 prompts de vídeos virais | `pack/` |
| [historical-basemaps](https://github.com/aourednik/historical-basemaps) | Fronteiras do mundo por ano | `pack/` |

A pasta `pack/` não entra no git: o script baixa e atualiza. Para instalar os 19 pacotes do motion-skills de uma vez: `bash scripts/instalar-pack.sh --skills`.

## Antes de publicar

- **Fatos**: revise cada `[CONFERIR]` do roteiro e as fronteiras do mapa.
- **Licenças**: o Remotion é grátis para pessoa física e empresa de até 3 funcionários. O historical-basemaps é GPL-3.0. Cada repositório do pack tem a sua licença; o PDoomVideo e o opus-video-prompts não trazem arquivo de licença, então use como estudo.
- **Material de terceiros**: mapa, música e imagem têm que ser seus, livres ou licenciados.
- **Narração**: o Claude não gera voz. Grave a sua ou use um serviço de voz com IA.
