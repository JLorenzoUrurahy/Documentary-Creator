// Formato dos arquivos src/capitulos/capitulo-N.json.
//
// Narração: texto corrido em português falado. Para mostrar uma coisa na
// legenda e falar outra, use [mostrado|falado], por exemplo
// "Em [1882|mil oitocentos e oitenta e dois], Kano abre a escola."
//
// "quando": trecho da narração da própria cena. O elemento aparece na tela
// no instante em que esse trecho é falado.

export type Item = string | { texto: string; quando?: string };

export type Coord = [number, number]; // [longitude, latitude]

// escala 1 = mundo inteiro na tela.
export type Vista = { lon: number; lat: number; escala: number };

export type Coluna = {
  titulo: string;
  itens: Item[];
  tom?: "bom" | "ruim" | "neutro";
};

type Base = {
  id: string;
  ano?: number | string;
  narracao?: string;
  // Só para cenas sem narração, em segundos.
  duracao?: number;
  // Nome de um arquivo da Wikimedia Commons (ex.: "Belem-TeatroPaz1.jpg") para
  // o fundo da cena. scripts/fundos.mjs baixa só os de uso livre e anota o
  // crédito, que aparece na tela. Não vale para mapa, título e perfil.
  fundo?: string;
};

export type CenaTitulo = Base & {
  tipo: "titulo";
  numero: number;
  titulo: string;
  subtitulo?: string;
};

export type CenaCartao = Base & {
  tipo: "cartao";
  rotulo?: string;
  titulo: string;
  destaque?: string;
  itens?: Item[];
};

export type CenaComparacao = Base & {
  tipo: "comparacao";
  titulo?: string;
  esquerda: Coluna;
  direita: Coluna;
};

export type CenaPerfil = Base & {
  tipo: "perfil";
  nome: string;
  anos?: string;
  papel?: string;
  fatos?: Item[];
  // Título do artigo da pessoa na Wikipedia (ex.: "Hélio_Gracie"), usado por
  // scripts/fotos.mjs para buscar uma foto de uso livre. Sem foto livre, a
  // cena mostra as iniciais.
  wiki?: string;
};

export type CenaLinha = Base & {
  tipo: "linha";
  titulo?: string;
  eventos: { ano: string; texto: string; quando?: string }[];
};

export type CenaMapa = Base & {
  tipo: "mapa";
  titulo?: string;
  vista: Vista;
  // Se existir, a câmera viaja de "vista" até aqui ao longo da cena.
  ate?: Vista;
  lugares?: { nome: string; coord: Coord; quando?: string; destaque?: boolean }[];
  rotas?: { pontos: Coord[]; quando?: string; ate?: string }[];
};

export type CenaLinhagem = Base & {
  tipo: "linhagem";
  titulo?: string;
  nos: {
    id: string;
    nome: string;
    sub?: string;
    pai?: string;
    quando?: string;
    // Ligação contestada pelos historiadores: desenhada tracejada.
    incerto?: boolean;
  }[];
};

export type CenaCitacao = Base & {
  tipo: "citacao";
  texto: string;
  autor?: string;
};

export type Cena =
  | CenaTitulo
  | CenaCartao
  | CenaComparacao
  | CenaPerfil
  | CenaLinha
  | CenaMapa
  | CenaLinhagem
  | CenaCitacao;

export type Capitulo = {
  numero: number;
  titulo: string;
  subtitulo?: string;
  fontes: { titulo: string; url: string }[];
  // Pontos que o usuário precisa conferir antes de publicar.
  conferir?: string[];
  cenas: Cena[];
};

export type Palavra = { p: string; i: number; f: number };

// Gerado por scripts/narrar.mjs em src/capitulos/capitulo-N.audio.json.
export type AudioCena = {
  arquivo: string;
  duracao: number;
  palavras: Palavra[];
  hash: string;
};

export type AudioCapitulo = Record<string, AudioCena>;
