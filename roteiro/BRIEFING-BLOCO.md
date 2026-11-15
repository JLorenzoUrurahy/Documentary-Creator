# Como escrever um bloco de capítulo

Você vai pesquisar e escrever UM BLOCO de um capítulo de documentário narrado, em português do Brasil. O vídeo é montado por código a partir de um JSON de cenas. Outros blocos do mesmo capítulo são escritos por outras pessoas ao mesmo tempo: fique no seu recorte e não conte o que é dos outros.

## Leia antes

- `CLAUDE.md`, seção "Como escrever um capítulo".
- `src/tipos.ts`: formato exato das cenas.
- `src/capitulos/capitulo-2.json`: capítulo pronto. Siga o mesmo tom e o mesmo nível de detalhe.
- `roteiro/PLANO.md`: a série inteira e o que cada capítulo cobre. O espectador já viu os capítulos anteriores: não reapresente quem já foi apresentado, só relembre em meia frase.

## Pesquisa

- Pesquise na internet antes de escrever. Prefira fontes sólidas: Wikipedia (português e inglês), artigos acadêmicos (SciELO, José Cairus), Graciemag, Sherdog, Tatame, BJJ Heroes, Simon BJJ, sites oficiais de federações e eventos, e o que cita Roberto Pedreira ("Choque") e Robert Drysdale.
- NÃO invente fatos, datas, nomes, placares nem citações. Onde as fontes divergem, a narração diz que divergem ou afirma só o que é seguro, e o ponto vai para `conferir`.
- Quando a tradição de uma família ou equipe e os historiadores discordam, mostre as duas versões e diga quem defende cada uma.
- Cuidado com pessoas vivas: só fatos documentados, sem acusação nem adjetivo que as fontes não sustentem.

## Texto

- Número de cenas e de palavras: o que o pedido disser. Cada cena tem de 70 a 100 palavras de narração.
- Português falado, frases curtas, tom de quem conta uma história. Sem floreio e sem frase de efeito vazia.
- Explique termos técnicos na primeira vez (guarda, raspagem, finalização, vantagem) em poucas palavras.
- Um espaço só entre palavras; sem quebra de linha dentro da narração.
- Anos sempre assim: `[1951|mil novecentos e cinquenta e um]`. Palavras estrangeiras difíceis de ler: `[mostrado|como se fala]`, por exemplo `[Kimura|Quimúra]`. Siglas faladas letra por letra: `[UFC|U F C]`.

## Cenas

- Tipos: `mapa`, `cartao`, `comparacao`, `perfil`, `linha`, `linhagem`, `citacao`. NÃO use `titulo`. Nunca mais de duas cenas seguidas do mesmo tipo.
- `comparacao`: versões em disputa (tom `neutro` nas duas colunas) ou prós e contras (tom `bom` e `ruim`).
- `linhagem` com `incerto: true` desenha ligação contestada.
- `citacao`: só citação real, com fonte. Na dúvida, não use.
- `perfil` de pessoa real: inclua `wiki` com o título do artigo dela na Wikipedia em português ou inglês (ex.: `"Hélio_Gracie"`), se o artigo existir. É o que permite buscar a foto.
- Todo item, fato, lugar, evento, rota e nó tem `quando`: um trecho de 2 a 4 palavras copiado EXATAMENTE da narração da própria cena, na forma mostrada na legenda (para `[1951|...]` o trecho usa `1951`). Os `quando` de uma cena seguem a ordem da fala.
- Textos na tela são curtos: itens com até 9 palavras, nomes de lugar no mapa com até 4 palavras, `destaque` do cartão com até 14 caracteres.
- Mapas: coordenadas `[longitude, latitude]`. Em `vista` e `ate`, escala 1 = mundo inteiro, cerca de 3 = Brasil, cerca de 6 = uma região. Não ponha dois lugares no mesmo ponto.
- `linhagem`: no máximo 6 nós na mesma linha e 4 níveis.
- Cada cena tem `id` único com a letra do bloco e dois dígitos (ex.: `b03-kimura`) e `ano` (número) coerente com o que conta.

## Entrega

Escreva o arquivo pedido com exatamente este formato:

```json
{ "cenas": [ ... ], "fontes": [ { "titulo": "...", "url": "..." } ], "conferir": [ "..." ] }
```

Valide com `node scripts/validar.mjs <seu arquivo>` e corrija todos os erros. Não edite nenhum arquivo do repositório. Na resposta final, diga só: número de cenas, total de palavras e os 3 pontos mais incertos.
