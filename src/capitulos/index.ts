import type { PropsCapitulo } from "../motor/Capitulo";
import type { AudioCapitulo, Capitulo } from "../tipos";
import capitulo1 from "./capitulo-1.json";
import audio1 from "./capitulo-1.audio.json";

// Para cada capítulo novo: importar o .json e o .audio.json e somar à lista.
// O .audio.json é criado por "npm run narrar -- N"; antes disso o vídeo usa
// uma duração estimada pelo texto.
export const capitulos: PropsCapitulo[] = [
  { capitulo: capitulo1 as Capitulo, audio: audio1 as AudioCapitulo },
];
