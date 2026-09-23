import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Canvas,
  Circle,
  LinearGradient,
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
import {
  formatDate,
  formatDistance,
  formatDuration,
  formatPace,
  formatSpeed,
  paceSecPerKm,
} from '../lib/format';

/** Card aspect ratio 4:5 — the shape Instagram feed and WhatsApp status both handle well. */
export const CARD_ASPECT = 1.25;

const FAMILY = Platform.select({ ios: 'Helvetica Neue', default: 'sans-serif' });

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
  canvasRef?: ReturnType<typeof useCanvasRef>;
};

export function RunCard({ run, theme, width: W, canvasRef }: Props) {
  const H = W * CARD_ASPECT;
  const P = W * 0.075; // outer padding

  const fonts = useMemo(
    () => ({
      brand: makeFont(W * 0.042, 'bold'),
      small: makeFont(W * 0.036),
      hero: makeFont(W * 0.25, 'bold'),
      unit: makeFont(W * 0.075, 'bold'),
      title: makeFont(W * 0.045),
      label: makeFont(W * 0.034),
      value: makeFont(W * 0.068, 'bold'),
    }),
    [W],
  );

  const routePath = useMemo(() => {
    if (!run.route) return null;
    const pts = projectRoute(run.route, { x: P, y: W * 0.2, w: W - 2 * P, h: W * 0.44 });
    if (pts.length < 2) return null;
    const path = Skia.Path.Make();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
    return { path, start: pts[0], end: pts[pts.length - 1] };
  }, [run.route, W, P]);

  const distance = formatDistance(run.distanceKm);
  const distanceW = textWidth(fonts.hero, distance);
  const date = formatDate(run.startTime);
  const dateW = textWidth(fonts.small, date);

  const heroBase = routePath ? W * 0.93 : W * 0.7;
  const titleY = heroBase + W * 0.08;
  const labelY = H - P - W * 0.09;
  const valueY = H - P;
  const colW = (W - 2 * P) / 3;

  const stats = [
    { label: 'Pace /km', value: formatPace(paceSecPerKm(run.distanceKm, run.durationSec)) },
    { label: 'Time', value: formatDuration(run.durationSec) },
    run.elevationGainM !== undefined
      ? { label: 'Elevation', value: `${run.elevationGainM} m` }
      : { label: 'km/h', value: formatSpeed(run.distanceKm, run.durationSec) },
  ];

  return (
    <Canvas ref={canvasRef} style={{ width: W, height: H }}>
      <Rect x={0} y={0} width={W} height={H}>
        <LinearGradient start={vec(0, 0)} end={vec(W, H)} colors={theme.bg} />
      </Rect>

      {/* Header: wordmark + date */}
      <Text x={P} y={P + W * 0.04} text="runcard" font={fonts.brand} color={theme.text} />
      <Text x={W - P - dateW} y={P + W * 0.04} text={date} font={fonts.small} color={theme.muted} />

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
      <Text x={P - W * 0.01} y={heroBase} text={distance} font={fonts.hero} color={theme.text} />
      <Text x={P + distanceW + W * 0.01} y={heroBase} text="km" font={fonts.unit} color={theme.accent} />
      {run.title ? (
        <Text x={P} y={titleY} text={run.title.slice(0, 32)} font={fonts.title} color={theme.muted} />
      ) : null}

      {/* Stats row */}
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          <Text x={P + i * colW} y={labelY} text={s.label} font={fonts.label} color={theme.muted} />
          <Text x={P + i * colW} y={valueY} text={s.value} font={fonts.value} color={theme.text} />
        </React.Fragment>
      ))}
    </Canvas>
  );
}
