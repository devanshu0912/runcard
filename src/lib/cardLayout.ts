/**
 * Card geometry, kept pure so it can be checked outside the app.
 * Everything is a fraction of card width W, so the card scales to any size.
 */
import type { Run } from '../types/run';
import { formatDuration, formatPace, formatSpeed, paceSecPerKm } from './format';

/** 4:5 suits Instagram feed and WhatsApp chats; 9:16 fills a story or status screen. */
export type CardFormat = '4:5' | '9:16';
export const CARD_FORMATS: CardFormat[] = ['4:5', '9:16'];

const FORMATS: Record<
  CardFormat,
  { aspect: number; padY: number; routeTop: number; routeH: number; heroWithRoute: number; heroNoRoute: number }
> = {
  '4:5': { aspect: 5 / 4, padY: 0.075, routeTop: 0.2, routeH: 0.44, heroWithRoute: 0.93, heroNoRoute: 0.7 },
  // Taller insets keep text clear of the story UI at the top and bottom; the route gets the extra height.
  '9:16': { aspect: 16 / 9, padY: 0.14, routeTop: 0.3, routeH: 0.78, heroWithRoute: 1.36, heroNoRoute: 0.95 },
};

/** Base font sizes as fractions of W. Hero and stat values shrink from these when text is too wide. */
export const FONT = {
  brand: 0.042,
  small: 0.036,
  hero: 0.25,
  unit: 0.075,
  title: 0.045,
  label: 0.034,
  value: 0.068,
} as const;

/** Width of `text` at font size 1. Text width scales linearly with size, so one measurement is enough. */
export type MeasureText = (text: string, bold: boolean) => number;

export type Stat = { label: string; value: string };

/** The three numbers under the hero. Elevation when we have it (GPX), otherwise speed. */
export function cardStats(run: Run): Stat[] {
  return [
    { label: 'Pace /km', value: formatPace(paceSecPerKm(run.distanceKm, run.durationSec)) },
    { label: 'Time', value: formatDuration(run.durationSec) },
    run.elevationGainM !== undefined
      ? { label: 'Elevation', value: `${run.elevationGainM} m` }
      : { label: 'km/h', value: formatSpeed(run.distanceKm, run.durationSec) },
  ];
}

export type CardLayout = {
  W: number;
  H: number;
  P: number;
  headerY: number;
  routeBox: { x: number; y: number; w: number; h: number };
  heroSize: number;
  unitSize: number;
  heroX: number;
  unitX: number;
  heroY: number;
  /** Baseline of the one-line title; it is ellipsised to titleMaxW. */
  titleBaseline: number;
  titleMaxW: number;
  valueSize: number;
  labelY: number;
  valueY: number;
  colX: number[];
};

const HERO_GAP = 0.01; // between the number and "km"
const COL_GAP = 0.05; // minimum space between stat columns

export function cardLayout(opts: {
  W: number;
  format: CardFormat;
  hasRoute: boolean;
  distance: string;
  stats: Stat[];
  measure: MeasureText;
}): CardLayout {
  const { W, format, hasRoute, distance, stats, measure } = opts;
  const f = FORMATS[format];
  const H = W * f.aspect;
  const P = W * 0.075;
  const PY = W * f.padY;
  const inner = W - 2 * P;

  // Hero: shrink the number and "km" together until they fit the inner width (100+ km ultras).
  const heroX = P - W * HERO_GAP; // optical alignment: big digits carry side bearing
  const heroNatural =
    measure(distance, true) * FONT.hero * W + HERO_GAP * W + measure('km', true) * FONT.unit * W;
  const heroScale = Math.min(1, inner / heroNatural);
  const heroSize = FONT.hero * W * heroScale;
  const unitSize = FONT.unit * W * heroScale;
  const heroY = W * (hasRoute ? f.heroWithRoute : f.heroNoRoute);

  // Stats: three equal columns; shrink all values together if any would run into the next column.
  const colW = inner / stats.length;
  const colX = stats.map((_, i) => P + i * colW);
  const valueScale = Math.min(
    1,
    ...stats.map((s, i) => {
      const room = i === stats.length - 1 ? colW : colW - W * COL_GAP;
      return room / (measure(s.value, true) * FONT.value * W);
    }),
  );

  return {
    W,
    H,
    P,
    headerY: PY + W * 0.04,
    routeBox: { x: P, y: W * f.routeTop, w: inner, h: W * f.routeH },
    heroSize,
    unitSize,
    heroX,
    unitX: P + measure(distance, true) * heroSize + W * HERO_GAP * heroScale,
    heroY,
    titleBaseline: heroY + W * 0.08,
    titleMaxW: inner,
    valueSize: FONT.value * W * valueScale,
    labelY: H - PY - W * 0.09,
    valueY: H - PY,
    colX,
  };
}
