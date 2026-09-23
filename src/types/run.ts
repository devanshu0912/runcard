export type LatLon = { lat: number; lon: number };

export type RunSource = 'manual' | 'gpx';

/**
 * The one data shape every import path produces.
 * Manual entry, GPX files, and later Health Connect / HealthKit all map to this.
 */
export interface Run {
  distanceKm: number;
  durationSec: number;
  startTime?: string; // ISO 8601
  elevationGainM?: number;
  route?: LatLon[]; // only GPS-carrying sources (GPX, health route data)
  title?: string;
  source: RunSource;
}
