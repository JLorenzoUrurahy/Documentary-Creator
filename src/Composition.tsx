import { type CalculateMetadataFunction, Composition } from "remotion";
import { capitulos } from "./capitulos";
import { ALTURA, FPS, LARGURA } from "./estilo";
import { CapituloVideo, type PropsCapitulo } from "./motor/Capitulo";
import { montarLinhaDoTempo } from "./motor/tempo";

// A duração de cada capítulo sai da narração gravada.
const calcular: CalculateMetadataFunction<PropsCapitulo> = ({ props }) => ({
  durationInFrames: montarLinhaDoTempo(props.capitulo, props.audio, FPS).total,
});

// Cada capítulo registrado em src/capitulos/index.ts vira a composição capitulo-N.
export const MyComposition = () => {
  return (
    <>
      {capitulos.map((props) => (
        <Composition
          key={props.capitulo.numero}
          id={`capitulo-${props.capitulo.numero}`}
          component={CapituloVideo}
          defaultProps={props}
          calculateMetadata={calcular}
          durationInFrames={FPS}
          fps={FPS}
          width={LARGURA}
          height={ALTURA}
        />
      ))}
    </>
  );
};
