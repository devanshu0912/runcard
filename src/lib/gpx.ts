import type { LatLon, Run } from '../types/run';

type TrackPoint = LatLon & { ele?: number; time?: number };

const EARTH_RADIUS_M = 6371000;
const MAX_ROUTE_POINTS = 500; // plenty for drawing a card; keeps memory small
const ELEVATION_NOISE_M = 3; // ignore GPS altitude jitter below this

export function haversineM(a: LatLon, b: LatLon): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

function readAttr(attrs: string, name: string): number | undefined {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`));
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

function readTag(body: string, tag: string): string | undefined {
  const m = body.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].trim() : undefined;
}

/** "Run &amp; coffee" -> "Run & coffee". Handles the five XML entities and numeric ones. */
export function decodeXmlEntities(s: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] !== '#') return named[code.toLowerCase()] ?? whole;
    const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole;
  });
}

export function downsample<T>(points: T[], max: number): T[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const out = points.filter((_, i) => i % step === 0);
  if (out[out.length - 1] !== points[points.length - 1]) out.push(points[points.length - 1]);
  return out;
}

/**
 * Minimal, dependency-free GPX parser.
 * Works with GPX exported from Strava, Garmin, Nike Run Club, Coros, etc.
 */
export function parseGpx(xml: string): Run {
  const points: TrackPoint[] = [];
  const re = /<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(xml)) !== null) {
    const lat = readAttr(match[1], 'lat');
    const lon = readAttr(match[1], 'lon');
    if (lat === undefined || lon === undefined) continue;
    const body = match[2] ?? '';
    const ele = readTag(body, 'ele');
    const time = readTag(body, 'time');
    const t = time ? Date.parse(time) : NaN;
    points.push({
      lat,
      lon,
      ele: ele !== undefined && ele !== '' ? Number(ele) : undefined,
      time: Number.isNaN(t) ? undefined : t,
    });
  }

  if (points.length < 2) {
    throw new Error('This file has no track points. Export the activity as GPX and try again.');
  }

  let distanceM = 0;
  for (let i = 1; i < points.length; i++) distanceM += haversineM(points[i - 1], points[i]);

  const timed = points.filter((p) => p.time !== undefined);
  if (timed.length < 2) {
    throw new Error(
      'This file has no timestamps, so time and pace can’t be worked out. Enter the run manually instead.',
    );
  }
  const durationSec = (timed[timed.length - 1].time! - timed[0].time!) / 1000;
  if (distanceM < 10 || durationSec <= 0) {
    throw new Error('This file doesn’t show any movement. Check you picked the right run, or enter it manually.');
  }

  // Elevation gain with a small dead-band so GPS altitude noise doesn't inflate it.
  let gain = 0;
  let anchor: number | undefined;
  for (const p of points) {
    if (p.ele === undefined || !Number.isFinite(p.ele)) continue;
    if (anchor === undefined) {
      anchor = p.ele;
    } else if (p.ele - anchor > ELEVATION_NOISE_M) {
      gain += p.ele - anchor;
      anchor = p.ele;
    } else if (anchor - p.ele > ELEVATION_NOISE_M) {
      anchor = p.ele;
    }
  }

  const nameMatch = xml.match(/<trk>[\s\S]*?<name>([\s\S]*?)<\/name>/);
  const title = nameMatch
    ? decodeXmlEntities(nameMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '')).trim() || undefined
    : undefined;

  return {
    distanceKm: distanceM / 1000,
    durationSec,
    startTime: new Date(timed[0].time!).toISOString(),
    elevationGainM: anchor === undefined ? undefined : Math.round(gain),
    route: downsample(
      points.map(({ lat, lon }) => ({ lat, lon })),
      MAX_ROUTE_POINTS,
    ),
    title,
    source: 'gpx',
  };
}
