# Briefing: incluir no capítulo o que veio do livro de Drysdale

Você vai editar UM arquivo: `src/capitulos/capitulo-N.json` (o N do seu pedido). Não toque em outros capítulos nem no código.

Leia antes: `CLAUDE.md` (seção "Como escrever um capítulo"), `src/tipos.ts`, o seu capítulo inteiro, `roteiro/ANALISE-LIVRO-DRYSDALE.md` e as análises parciais em `roteiro/analise-livro/` (trazem cada item com a linha do livro). O texto do livro está em `/tmp/claude-0/-home-user-Documentary-Creator/4636e212-fbdc-5716-8ac9-7bff335c3e1e/scratchpad/livro/livro.txt` (inglês): vá às linhas indicadas e confira cada fato no próprio livro antes de escrever. Não invente nada que não esteja no livro ou no roteiro.

## Regras

- Narração em português do Brasil, no mesmo tom do capítulo: frases curtas, concreto, sem adjetivo de enfeite.
- Cena nova: 60 a 110 palavras de narração. Tipos existentes (`cartao`, `linha`, `comparacao`, `linhagem`, `mapa`, `citacao`); nunca mais de duas cenas seguidas do mesmo tipo, contando as vizinhas. Não crie `perfil` novo.
- `"quando"` em todo item, evento, lugar e nó, com trecho que existe na narração da cena, com as mesmas palavras (na forma mostrada: de `[1964|mil novecentos e sessenta e quatro]` o trecho é `1964`).
- Anos sempre `[1981|mil novecentos e oitenta e um]`. Palavra estrangeira ou sigla difícil: `[forma escrita|como se fala]`. Siga as pronúncias já usadas no capítulo.
- O que vem de entrevista entra com a fonte na frase: "Segundo Carlos Gracie Júnior, em entrevista a Robert Drysdale, ...", "Peixotinho conta que ...". Tese do autor entra como "Para Drysdale, ...".
- DIVERGÊNCIAS: onde o livro diz algo diferente do que narramos, a narração passa a citar as duas versões e quem afirma cada uma. Mude o mínimo de frases; mantenha a cena dentro de 110 palavras (corte outra frase se precisar) e ajuste os `quando` que dependiam do trecho mudado.
- Não mude o `id` de cena existente. Id de cena nova: o da cena anterior com sufixo (`a07b-...`), único no capítulo.
- Parafraseie o livro; não traduza trechos longos. Nada sobre integralismo, DOPS ou espionagem de 1943. Nenhuma menção nova a logo ou imagem do UFC.
- Não mexa nos campos `logos`, `fundo` e `wiki` das cenas existentes. Cena nova não leva `fundo` nem `logos`.
- No nível do capítulo: acrescente em `fontes` `{"titulo": "Robert Drysdale, The Rise and Evolution of Brazilian Jiu-Jitsu (2023)", "url": "https://www.amazon.com/dp/B0BW2GFRLV"}` se ainda não houver entrada do livro (confira o formato das outras), e em `conferir` uma linha por ponto que dependa de uma só entrevista. Tire de `conferir` o que o livro resolveu.
- Onde uma cena existente já conta parte do item, prefira completar essa cena a criar outra. O capítulo não deve repetir a mesma informação em duas cenas.

## Ao terminar

Rode `node scripts/validar.mjs N` e corrija até dar 0 erros. Confira que o JSON continua válido e com 2 espaços de recuo. Responda com: a lista das cenas novas (id, tipo, título, palavras), a lista das cenas alteradas (id e o que mudou) e os pontos que deixou de fora, com o motivo.
