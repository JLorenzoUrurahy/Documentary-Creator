import type { PropsCapitulo } from "../motor/Capitulo";
import type { AudioCapitulo, Capitulo } from "../tipos";
import capitulo1 from "./capitulo-1.json";
import audio1 from "./capitulo-1.audio.json";
import capitulo2 from "./capitulo-2.json";
import audio2 from "./capitulo-2.audio.json";
import capitulo3 from "./capitulo-3.json";
import audio3 from "./capitulo-3.audio.json";
import capitulo4 from "./capitulo-4.json";
import audio4 from "./capitulo-4.audio.json";
import capitulo5 from "./capitulo-5.json";
import audio5 from "./capitulo-5.audio.json";
import capitulo6 from "./capitulo-6.json";
import audio6 from "./capitulo-6.audio.json";
import capitulo7 from "./capitulo-7.json";
import audio7 from "./capitulo-7.audio.json";
import capitulo8 from "./capitulo-8.json";
import audio8 from "./capitulo-8.audio.json";
import capitulo9 from "./capitulo-9.json";
import audio9 from "./capitulo-9.audio.json";
import capitulo10 from "./capitulo-10.json";
import audio10 from "./capitulo-10.audio.json";
import capitulo11 from "./capitulo-11.json";
import audio11 from "./capitulo-11.audio.json";

// Para cada capítulo novo: importar o .json e o .audio.json e somar à lista.
// O .audio.json é criado por "npm run narrar -- N"; antes disso o vídeo usa
// uma duração estimada pelo texto.
export const capitulos: PropsCapitulo[] = [
  { capitulo: capitulo1 as Capitulo, audio: audio1 as AudioCapitulo },
  { capitulo: capitulo2 as Capitulo, audio: audio2 as AudioCapitulo },
  { capitulo: capitulo3 as Capitulo, audio: audio3 as AudioCapitulo },
  { capitulo: capitulo4 as Capitulo, audio: audio4 as AudioCapitulo },
  { capitulo: capitulo5 as Capitulo, audio: audio5 as AudioCapitulo },
  { capitulo: capitulo6 as Capitulo, audio: audio6 as AudioCapitulo },
  { capitulo: capitulo7 as Capitulo, audio: audio7 as AudioCapitulo },
  { capitulo: capitulo8 as Capitulo, audio: audio8 as AudioCapitulo },
  { capitulo: capitulo9 as Capitulo, audio: audio9 as AudioCapitulo },
  { capitulo: capitulo10 as Capitulo, audio: audio10 as AudioCapitulo },
  { capitulo: capitulo11 as Capitulo, audio: audio11 as AudioCapitulo },
];
