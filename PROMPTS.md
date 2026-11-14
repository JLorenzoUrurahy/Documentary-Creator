# Prompts prontos

Cole no Claude Code, um por vez, trocando o que está entre colchetes.

## Modo direto (recomendado)

Escreva o tema num parágrafo, do seu jeito. O Claude faz o plano, pesquisa, escreve, narra com o ElevenLabs e entrega o MP4, capítulo por capítulo. Exemplo:

```
Quero um documentário grande sobre [TEMA], do início até hoje. Conte [O QUE NÃO PODE FALTAR]. Mostre os prós e contras de [ASSUNTO]. Uns [60] minutos.
```

Para continuar um documentário já começado: `Faça o próximo capítulo do plano.`

## Passo a passo do guia original (se preferir aprovar cada etapa)

### 1. O tema e o plano

```
Quero fazer um documentário de história com mapa animado, em código, usando o Remotion deste projeto.

Tema: [EX.: Como o Império Otomano ficou tão grande?]
Duração total: [EX.: 60 minutos]
Idioma da narração: português do Brasil

Antes de escrever qualquer código, me entregue o PLANO:
1. Os capítulos (de 6 a 10), com título e duração de cada um.
2. Dentro de cada capítulo, as cenas (uma ideia por cena), com o ano e o que o mapa mostra.
3. O estilo visual: cores do mapa, fonte dos nomes, como aparecem fronteiras, exércitos e batalhas.

Espere eu aprovar o plano antes de começar.
```

### 2. Pesquisa e roteiro de um capítulo

```
Agora o capítulo [NÚMERO] do plano.
1. Pesquise o período e liste as fontes que você usou (com o link).
2. Escreva o roteiro da narração, cena por cena, em português falado, frases curtas.
3. Para cada cena, anote: ano, lugar, o que o mapa mostra (fronteiras, exércitos, batalhas) e quanto tempo dura.
4. Marque com [CONFERIR] qualquer data ou número que você não tenha certeza.

Salve em roteiro/capitulo-[NÚMERO].md. Não invente fatos.
```

### 3. As cenas do capítulo

```
Monte em código as cenas do roteiro/capitulo-[NÚMERO].md, seguindo o estilo aprovado no plano.
- Mapa desenhado em código (sem imagem de terceiros). Para as fronteiras, use os dados de pack/historical-basemaps, no ano mais próximo de cada cena.
- Fronteiras crescendo com animação suave entre um ano e outro.
- Setas para o movimento dos exércitos e um X para as batalhas.
- Contador de ano no canto e a frase da narração como legenda embaixo.
- 30 quadros por segundo, 1920x1080.

Cada capítulo vira uma composição separada, com o nome capitulo-[NÚMERO]. Me avise quando eu puder ver na prévia.
```

### 4. Encaixar a narração

```
Coloquei a narração do capítulo [NÚMERO] em public/narracao-[NÚMERO].mp3.
1. Ponha o áudio na composição capitulo-[NÚMERO].
2. Ajuste a duração de cada cena para casar com a fala dela (a cena só muda quando a frase acaba).
3. Sincronize a legenda com a fala.
4. Coloque uma música de fundo baixinha, só se eu te passar o arquivo, e abaixe o volume dela quando tiver narração.
```

### 5. Ajustes (um por vez)

```
Deixa o mapa noturno em todas as cenas: mar quase preto, terra escura, nomes em bege claro.
```

Outros exemplos:

- Aumenta 20% o tamanho dos nomes das cidades.
- Deixa a animação das fronteiras mais lenta, 2 segundos em vez de 1.
- Troca o vermelho do império por um laranja queimado.
- Coloca o título do capítulo na tela nos primeiros 4 segundos de cada capítulo.

### 6. Gerar e juntar

```
Gere o vídeo de cada capítulo com o npx remotion render (um por vez, em out/capitulo-[NÚMERO].mp4).
Depois junte todos, na ordem, em out/documentario.mp4, sem perder qualidade.
No fim, me diga a duração total e escreva:
1. 3 opções de título pro YouTube.
2. A descrição, com os capítulos e o minuto de cada um.
3. A lista de fontes usadas no roteiro.
```

## Testes rápidos com o pack

1. **Vídeo de lançamento em uma linha** (troque `inference` pelo que a sua empresa faz):

   ```
   make a modern slick and punchy video for a modern startup that works on inference
   ```

2. **Desenho animado com o Clawd**:

   ```
   Read pack/ClaudeAnimationBase/ANIMATION_GUIDE.md, then make a 15-second video of Clawd trying to catch a butterfly.
   ```

   Sem placa de vídeo dedicada fica lento: peça pra evitar o preenchimento em aquarela.

3. **Vídeo vertical com o HyperFrames**:

   ```
   Use o HyperFrames pra fazer um vídeo vertical 9:16 de 15 segundos apresentando [SEU PRODUTO OU SERVIÇO]. Tipografia grande, uma ideia por cena, cortes no ritmo de uma batida de 120 bpm, cores [SUAS CORES]. Renderize em MP4 e confira o resultado antes de me entregar.
   ```

4. **Estilos de cinema**: digite `/lemo-opuscar:lemo-opuscar` e ele pergunta o idioma e o que você quer fazer.

5. **Método dos subagentes**:

   ```
   Leia o STORYBOARD.md e o ANIMATION_GUIDE.md de pack/PDoomVideo e de pack/functional-emotions-video e use a mesma divisão por capítulos, com subagentes em paralelo, no meu vídeo.
   ```

6. **Biblioteca de prompts**: escolha um em `pack/awesome-opus5-5-videos/prompts` ou `pack/opus-video-prompts/prompts` e troque pelo seu assunto.

## Se travar

- **Render lento**: peça pra reduzir a resolução no rascunho e só renderizar em 1080p no final.
- **Erro de ffmpeg ou Chrome não encontrado**: instale os dois e rode de novo; o lemo-opuscar pede ffmpeg 7 ou mais novo.
- **Vídeo saiu quebrado**: peça uma folha de contato com os quadros e a correção antes da entrega.
