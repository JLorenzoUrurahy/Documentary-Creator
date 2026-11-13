import {
  AbsoluteFill,
  Composition,
  interpolate,
  useCurrentFrame,
} from "remotion";

// Padrão do guia: 30 quadros por segundo, 1920x1080.
export const FPS = 30;
export const LARGURA = 1920;
export const ALTURA = 1080;

// Composição de teste: serve só pra confirmar que a prévia e o render funcionam.
// Cada capítulo do documentário entra aqui como uma <Composition> própria (capitulo-1, capitulo-2...).
export const MyComposition = () => {
  return (
    <Composition
      id="teste"
      component={Teste}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={LARGURA}
      height={ALTURA}
    />
  );
};

const Teste: React.FC = () => {
  const frame = useCurrentFrame();
  const opacidade = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ano = Math.round(
    interpolate(frame, [0, 3 * FPS - 1], [1299, 1453], {
      extrapolateRight: "clamp",
    }),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d1117",
        color: "#e8dcc4",
        fontFamily: "Georgia, serif",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 96, opacity: opacidade }}>
        Documentary Creator
      </div>
      <div style={{ fontSize: 40, opacity: opacidade * 0.7, marginTop: 24 }}>
        Tudo instalado. Dê um tema ao Claude.
      </div>
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 60,
          fontSize: 72,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {ano}
      </div>
    </AbsoluteFill>
  );
};
