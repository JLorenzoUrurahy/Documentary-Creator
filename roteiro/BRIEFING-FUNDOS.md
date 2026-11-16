# Briefing: escolher imagens de fundo para um capítulo

O documentário é desenhado em código (texto, mapas, linhas do tempo) sobre fundo escuro. Para dar vida, cada cena pode ter uma imagem de fundo, que entra escurecida, em preto e branco e com movimento lento, atrás do texto. Sua tarefa é escolher essas imagens para um capítulo.

## De onde

Só da Wikimedia Commons, e só arquivos que o script aceita (domínio público, CC0, CC BY, CC BY-SA). Nunca de busca de imagens, site de notícia, rede social ou site de evento. Não baixe nada: só escolha os nomes.

Ferramentas (rode da raiz do projeto):

- `node scripts/fundos.mjs --buscar "termos" 12` procura no Commons e mostra, para cada arquivo, se SERVE, a licença, o tamanho, o autor e a descrição. Busque em português e em inglês (e em japonês, se fizer sentido).
- `node scripts/fundos.mjs --conferir "Nome exato.jpg"` confere um arquivo.
- Para achar bons arquivos, vale ler a categoria do Commons ou o artigo da Wikipedia do assunto (API: `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:...&cmtype=file&cmlimit=50&format=json`, com `curl -s -A "DocumentaryCreator/1.0"`).

Se o Commons responder 429, espere alguns segundos e continue. Não faça mais de umas 3 chamadas por segundo.

## O que escolher

Leia `src/capitulos/capitulo-N.json`. Para cada cena dos tipos `cartao`, `linha`, `comparacao`, `citacao` e `linhagem` (não para `mapa`, `titulo` nem `perfil`), procure uma imagem que mostre o que a narração conta naquele momento:

- o lugar (cidade, rua, prédio, ginásio, porto, academia) de preferência na época;
- o evento ou a prática (uma luta, um treino, uma plateia, um torneio);
- um objeto ou documento (jornal de época, cartaz, kimono, faixa, troféu, navio);
- uma pessoa citada na cena, se houver foto livre dela em ação.

Regras:

- A imagem precisa ter relação clara e verdadeira com a cena. Na dúvida, deixe a cena sem fundo: é melhor nenhuma imagem do que uma enganosa. Não use foto de uma pessoa ou de um evento para ilustrar outro.
- Imagem genérica de ambientação (tatame, treino de jiu-jitsu, vista da cidade) é aceitável quando a cena fala do tema em geral, mas não repita a mesma imagem em mais de duas cenas do capítulo, e nunca em cenas seguidas.
- Prefira formato deitado. Fotos antigas pequenas servem se forem deitadas e tiverem pelo menos 600 px de largura; imagem em pé só com 1.000 px ou mais, porque ela é cortada e ampliada para encher a tela.
- Cuidado com anacronismo: para uma cena de 1882 ou de 1930, prefira imagem da época (foto antiga, gravura, jornal). Um prédio moderno só serve se a cena fala do lugar como ele é hoje, ou se o prédio já existia na época e mudou pouco.
- Sem logos, sem capas de revista ou cartazes recentes, sem capturas de vídeo ou de TV, sem imagem com marca d'água.
- Leia a descrição do arquivo para ter certeza do que ele mostra (ano, lugar, quem aparece).

A meta é cobrir a maior parte das cenas possíveis, mas só com imagem boa. É normal sobrar cena sem fundo.

## Entrega

Escreva o arquivo indicado no pedido, em JSON:

```json
{
  "fundos": {
    "<id da cena>": { "arquivo": "Nome exato no Commons.jpg", "mostra": "o que a imagem mostra, em uma frase", "porque": "ligação com a cena" }
  },
  "sem": ["<ids das cenas que ficaram sem imagem>"]
}
```

Antes de entregar, rode `--conferir` em todos os nomes escolhidos e tire os que não servem. Responda só com o número de cenas cobertas, o número sem imagem e qualquer dúvida sobre licença ou sobre o que uma imagem mostra.
