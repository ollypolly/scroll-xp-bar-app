/**
 * Silly, not-remotely-scientific stats for the profile screen. None of this is measured
 * directly - there's no real touch/scroll tracking in the Shorts WebView (would mean
 * injecting a scroll listener into YouTube's own page, fragile against their DOM changing,
 * and pixel-to-distance conversion is unreliable across devices anyway). Distance is
 * approximated as one average phone-screen-height swipe per Short watched - close enough
 * for a joke stat, not for anything anyone should cite.
 */

const AVG_PHONE_SCREEN_HEIGHT_M = 0.16;
const METERS_PER_FOOT = 0.3048;
const FEET_PER_MILE = 5280;

const AVG_MOVIE_MINUTES = 110;
const WORKDAY_HOURS = 8;

export function estimateScrollDistanceMeters(totalShortsWatched: number): number {
  return totalShortsWatched * AVG_PHONE_SCREEN_HEIGHT_M;
}

export function describeScrollDistance(meters: number): string {
  const feet = meters / METERS_PER_FOOT;
  if (feet < FEET_PER_MILE) return `${Math.round(feet)} ft`;
  return `${(feet / FEET_PER_MILE).toFixed(2)} mi`;
}

export function describeMovieTime(totalWatchTimeSeconds: number): string {
  const movies = totalWatchTimeSeconds / (AVG_MOVIE_MINUTES * 60);
  if (movies < 1) return `${Math.round(movies * 100)}% of a movie`;
  return `${movies.toFixed(1)} movies`;
}

export function describeWorkdayTime(totalWatchTimeSeconds: number): string {
  const workdays = totalWatchTimeSeconds / (WORKDAY_HOURS * 3600);
  if (workdays < 1) return `${Math.round(workdays * 100)}% of a workday`;
  return `${workdays.toFixed(1)} workdays`;
}

export function xpPerHour(totalXP: number, totalWatchTimeSeconds: number): number {
  if (totalWatchTimeSeconds <= 0) return 0;
  return Math.round(totalXP / (totalWatchTimeSeconds / 3600));
}
