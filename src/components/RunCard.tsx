import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Canvas,
  Circle,
  LinearGradient,
  Paragraph,
  Path,
  Rect,
  Skia,
  Text,
  matchFont,
  useCanvasRef,
  vec,
  type SkFont,
} from '@shopify/react-native-skia';

import type { Run } from '../types/run';
import type { CardTheme } from '../theme/cardThemes';
import { projectRoute } from '../lib/route';
import { formatDate, formatDistance } from '../lib/format';
import { FONT, cardLayout, cardStats, type CardFormat } from '../lib/cardLayout';

export { CARD_FORMATS, type CardFormat } from '../lib/cardLayout';

const FAMILY = Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' });
const MEASURE_SIZE = 100;

function makeFont(size: number, weight: 'normal' | 'bold' = 'normal'): SkFont {
  return matchFont({ fontFamily: FAMILY, fontSize: size, fontWeight: weight });
}

function textWidth(font: SkFont, text: string): number {
  const f = font as SkFont & { getTextWidth?: (t: string) => number };
  return f.getTextWidth ? f.getTextWidth(text) : font.measureText(text).width;
}

type Props = {
  run: Run;
  theme: CardTheme;
  width: number;
  format?: CardFormat;
  canvasRef?: ReturnType<typeof useCanvasRef>;
};

export function RunCard({ run, theme, width: W, format = '4:5', canvasRef }: Props) {
  // Reference fonts for measuring; layout scales widths linearly from these.
  const measureFonts = useMemo(
    () => ({ regular: makeFont(MEASURE_SIZE), bold: makeFont(MEASURE_SIZE, 'bold') }),
    [],
  );

  const distance = formatDistance(run.distanceKm);
  const stats = cardStats(run);
  const hasRoute = !!run.route && run.route.length >= 2;

  const L = cardLayout({
    W,
    format,
    hasRoute,
    distance,
    stats,
    measure: (text, bold) => textWidth(bold ? measureFonts.bold : measureFonts.regular, text) / MEASURE_SIZE,
  });

  const fonts = useMemo(
    () => ({
      brand: makeFont(W * FONT.brand, 'bold'),
      small: makeFont(W * FONT.small),
      label: makeFont(W * FONT.label),
    }),
    [W],
  );
  const heroFont = useMemo(() => makeFont(L.heroSize, 'bold'), [L.heroSize]);
  const unitFont = useMemo(() => makeFont(L.unitSize, 'bold'), [L.unitSize]);
  const valueFont = useMemo(() => makeFont(L.valueSize, 'bold'), [L.valueSize]);

  const { x: boxX, y: boxY, w: boxW, h: boxH } = L.routeBox;
  const routePath = useMemo(() => {
    if (!run.route) return null;
    const pts = projectRoute(run.route, { x: boxX, y: boxY, w: boxW, h: boxH });
    if (pts.length < 2) return null;
    const path = Skia.Path.Make();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
    return { path, start: pts[0], end: pts[pts.length - 1] };
  }, [run.route, boxX, boxY, boxW, boxH]);

  // Paragraph (not Text) so Hindi, other Indian scripts and emoji fall back to system fonts,
  // and long titles end in "…" instead of running off the card.
  const title = run.title?.replace(/\s+/g, ' ').trim();
  const titleParagraph = useMemo(() => {
    if (!title) return null;
    const p = Skia.ParagraphBuilder.Make({
      maxLines: 1,
      ellipsis: '…',
      textStyle: { color: Skia.Color(theme.muted), fontSize: W * FONT.title, fontFamilies: [FAMILY] },
    })
      .addText(title)
      .build();
    p.layout(L.titleMaxW);
    return p;
  }, [title, theme.muted, W, L.titleMaxW]);

  const date = formatDate(run.startTime);
  const dateW = textWidth(fonts.small, date);

  return (
    <Canvas ref={canvasRef} style={{ width: W, height: L.H }}>
      <Rect x={0} y={0} width={W} height={L.H}>
        <LinearGradient start={vec(0, 0)} end={vec(W, L.H)} colors={theme.bg} />
      </Rect>

      {/* Header: wordmark + date */}
      <Text x={L.P} y={L.headerY} text="runcard" font={fonts.brand} color={theme.text} />
      <Text x={W - L.P - dateW} y={L.headerY} text={date} font={fonts.small} color={theme.muted} />

      {/* Route */}
      {routePath && (
        <>
          <Path
            path={routePath.path}
            color={theme.route}
            style="stroke"
            strokeWidth={W * 0.012}
            strokeCap="round"
            strokeJoin="round"
          />
          <Circle cx={routePath.start.x} cy={routePath.start.y} r={W * 0.016} color={theme.accent} />
          <Circle cx={routePath.end.x} cy={routePath.end.y} r={W * 0.016} color={theme.route} />
        </>
      )}

      {/* Hero distance — the one loud element */}
      <Text x={L.heroX} y={L.heroY} text={distance} font={heroFont} color={theme.text} />
      <Text x={L.unitX} y={L.heroY} text="km" font={unitFont} color={theme.accent} />
      {titleParagraph ? (
        <Paragraph
          paragraph={titleParagraph}
          x={L.P}
          y={L.titleBaseline - (titleParagraph.getLineMetrics()[0]?.baseline ?? W * FONT.title)}
          width={L.titleMaxW}
        />
      ) : null}

      {/* Stats row */}
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          <Text x={L.colX[i]} y={L.labelY} text={s.label} font={fonts.label} color={theme.muted} />
          <Text x={L.colX[i]} y={L.valueY} text={s.value} font={valueFont} color={theme.text} />
        </React.Fragment>
      ))}
    </Canvas>
  );
}
