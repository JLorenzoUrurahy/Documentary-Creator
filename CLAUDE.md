# Documentary Creator

Projeto Remotion que transforma um parágrafo do usuário em documentário narrado: pesquisa, roteiro, narração no ElevenLabs e vídeo em código. Fale com o usuário em português do Brasil.

## Antes de qualquer coisa

Se `node_modules/` ou `pack/` não existirem (clone novo ou sessão nova na nuvem), rode `bash scripts/instalar-pack.sh`.

## Modo de trabalho: do parágrafo ao MP4, sem parar para pedir aprovação

O usuário dá o tema num parágrafo e espera o vídeo. Siga sozinho por todas as etapas e entregue o MP4. Pare só se faltar algo que apenas ele pode dar (chave, arquivo, decisão de gasto fora do normal).

1. **Plano.** Se o tema for novo, escreva `roteiro/PLANO.md`: capítulos (6 a 10), o que cada um conta e o estilo visual. Se o plano já existe, siga a tabela dele e atualize a coluna "Situação".
2. **Pesquisa.** Pesquise na internet cada capítulo antes de escrever. Não invente fatos. Onde as fontes divergem, a narração diz que divergem ou afirma só o que é seguro.
3. **Capítulo em dados.** Escreva `src/capitulos/capitulo-N.json` no formato de `src/tipos.ts`: cenas com narração em português falado, frases curtas, e o visual de cada cena. Preencha `fontes` (com link) e `conferir` (toda data, número ou versão incerta). Registre o capítulo em `src/capitulos/index.ts` (crie antes um `capitulo-N.audio.json` com `{}`).
4. **Fotos e validação.** `npm run fotos -- N` busca na Wikimedia Commons as fotos de uso livre dos perfis com `wiki` (não gasta nada). `node scripts/validar.mjs N` aponta `quando` que não existe na fala, ids repetidos e cenas longas: corrija todos os erros.
5. **Rascunho.** `npm run lint`, depois quadros de teste com `npx remotion still capitulo-N <arquivo> --frame=<n> --scale=0.5` e confira o visual antes de gastar narração.
6. **Narração.** `npm run narrar -- N`. Confira o gasto antes com `npm run narrar -- N --custo`. O script só grava de novo as cenas cujo texto mudou.
7. **Roteiro.** `npm run roteiro -- N` gera `roteiro/capitulo-N.md`.
8. **Render.** `npx remotion render capitulo-N out/capitulo-N.mp4`. Confira uma folha de quadros do resultado antes de entregar.
9. **Juntar.** Com todos os capítulos prontos, `npm run juntar` cria `out/documentario.mp4` sem recodificar.
10. **Entrega.** Envie o MP4 ao usuário, diga a duração, liste os pontos de `conferir` e faça commit e push (os MP3 da narração entram no git; `out/` não).

## Como escrever um capítulo

- Tipos de cena: `titulo`, `mapa`, `cartao`, `comparacao`, `perfil`, `linha`, `linhagem`, `citacao`. Varie: nunca mais de duas cenas seguidas do mesmo tipo.
- Cada cena narrada tem de 60 a 110 palavras. O tamanho do capítulo segue `roteiro/PLANO.md`. Um capítulo de 30 minutos tem 4 blocos de 12 a 13 cenas (cerca de 4.200 palavras); pesquise e escreva os blocos em paralelo com subagentes, um arquivo por bloco, e junte depois.
- Em todo `perfil` de pessoa real, preencha `wiki` com o título do artigo dela na Wikipedia: é o que permite buscar a foto.
- A segunda cena é sempre o `titulo` do capítulo, sem narração, com `duracao: 5`. A primeira é um gancho. A última puxa o capítulo seguinte.
- `"quando": "trecho da narração"` faz o elemento entrar na hora em que o trecho é falado. Use em todo item, lugar, evento e nó. O trecho precisa existir na narração da cena, com as mesmas palavras.
- Anos e palavras estrangeiras: `[1882|mil oitocentos e oitenta e dois]` e `[newaza|ne-uaza]` mostram a primeira forma na legenda e falam a segunda. Sempre escreva anos assim.
- `comparacao` com `tom` `bom` e `ruim` serve para prós e contras.
- `linhagem` com `incerto: true` desenha a ligação tracejada: use quando os historiadores contestam.
- Para um visual que os tipos não cobrem, crie um tipo novo em `src/tipos.ts` e um componente em `src/motor/cenas/`, no mesmo estilo.

## Padrões

- 1920x1080, 30 quadros por segundo. Cores e fontes em `src/estilo.ts`: mudar ali muda o documentário inteiro.
- Tudo desenhado em código. Fotos de pessoas só as de uso livre trazidas por `scripts/fotos.mjs`, sempre com crédito na tela; nunca baixe foto de busca de imagens, de site de notícia ou de rede social. Música e outras imagens só se o usuário fornecer o arquivo.
- O contorno dos continentes vem do Natural Earth (domínio público). Para fronteiras históricas, use `pack/historical-basemaps/geojson/world_<ano>.geojson` (GPL-3.0, trabalho em andamento: conferir).
- Voz e modelo do ElevenLabs em `narracao.config.json`. A chave vem da variável `ELEVENLABS_API_KEY`; nunca a escreva em arquivo.
- As fontes ficam dentro do projeto (`@fontsource`); o render não depende de internet.

## O pack

- **Skills** (`.claude/skills/`): Remotion oficial e, do motion-skills, mapa, explicativo, gráficos de dados e YouTube.
- **Plugins** (`.claude/settings.json`): `lemo-opuscar` (66 estilos de cinema) e `hyperframes` (HTML que vira MP4).
- **Referências** em `pack/` (fora do git, só leitura): `ClaudeAnimationBase`, `PDoomVideo`, `functional-emotions-video` (método de capítulos com subagentes em paralelo), `opus-video-prompts`, `awesome-opus5-5-videos`, `motion-skills`, `historical-basemaps`.
