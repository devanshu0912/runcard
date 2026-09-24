const pad = (n: number) => String(n).padStart(2, '0');

export function paceSecPerKm(distanceKm: number, durationSec: number): number {
  if (distanceKm <= 0 || durationSec <= 0) return 0;
  return durationSec / distanceKm;
}

/** 332 -> "5:32" */
export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '--:--';
  const total = Math.round(secPerKm);
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

/** 1710 -> "28:30", 3723 -> "1:02:03" */
export function formatDuration(totalSec: number): string {
  const t = Math.max(0, Math.round(totalSec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** 5 -> "5.00", 42.195 -> "42.20", 100 -> "100.0". Rounds first so 99.999 gives "100.0", not "100.00". */
export function formatDistance(km: number): string {
  return Number(km.toFixed(2)) >= 100 ? km.toFixed(1) : km.toFixed(2);
}

export function formatSpeed(distanceKm: number, durationSec: number): string {
  if (durationSec <= 0) return '--';
  return (distanceKm / (durationSec / 3600)).toFixed(1);
}

export function formatDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return d.toDateString();
  }
}

/** Accepts "28:30", "1:05:00", or plain minutes "45". Returns seconds or null. */
export function parseDuration(input: string): number | null {
  const parts = input.trim().split(':').map((p) => p.trim());
  if (parts.length < 1 || parts.length > 3) return null;
  if (parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.slice(1).some((n) => n >= 60)) return null;
  const sec = parts.length === 1 ? nums[0] * 60 : nums.reduce((acc, n) => acc * 60 + n, 0);
  return sec > 0 ? sec : null;
}

/** Accepts "5", "10.5", "10,5". Returns km or null. */
export function parseDistance(input: string): number | null {
  const km = Number(input.trim().replace(',', '.'));
  return Number.isFinite(km) && km > 0 && km < 1000 ? km : null;
}
