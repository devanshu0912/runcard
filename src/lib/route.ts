import type { LatLon } from '../types/run';

export type Box = { x: number; y: number; w: number; h: number };
export type XY = { x: number; y: number };

/**
 * Projects lat/lon points into a box, keeping the route's real shape
 * (longitude is scaled by cos(latitude) so routes don't look stretched).
 * Returns [] when there's nothing meaningful to draw (e.g. treadmill runs).
 */
export function projectRoute(points: LatLon[], box: Box): XY[] {
  if (points.length < 2) return [];
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const xs = points.map((p) => p.lon * k);
  const ys = points.map((p) => -p.lat); // screen y grows downward

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;
  if (spanX < 1e-6 && spanY < 1e-6) return [];

  const scale = Math.min(box.w / (spanX || 1e-9), box.h / (spanY || 1e-9));
  const offX = box.x + (box.w - spanX * scale) / 2;
  const offY = box.y + (box.h - spanY * scale) / 2;
  return xs.map((x, i) => ({ x: offX + (x - minX) * scale, y: offY + (ys[i] - minY) * scale }));
}
