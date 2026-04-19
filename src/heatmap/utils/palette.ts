/** 15-color gradient: purple → red → orange → cream */
export const GRAD_METAL: string[] = [
  'rgb(131,58,180)',
  'rgb(154,65,159)',
  'rgb(178,67,136)',
  'rgb(202,63,111)',
  'rgb(228,53,80)',
  'rgb(253,29,29)',
  'rgb(255,76,37)',
  'rgb(255,106,45)',
  'rgb(255,131,53)',
  'rgb(255,154,61)',
  'rgb(252,176,69)',
  'rgb(254,193,115)',
  'rgb(255,209,153)',
  'rgb(255,224,188)',
  'rgb(255,240,222)',
].reverse()

/**
 * Maps a flat counts array to palette indices (−1 = hidden / zero count).
 * Uses linear interpolation between minCount and maxCount across the palette.
 */
export function countsToFillIndices(counts: number[], paletteSize: number): number[] {
  let minCount = Infinity
  let maxCount = -Infinity

  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > 0) {
      if (counts[i] < minCount) minCount = counts[i]
      if (counts[i] > maxCount) maxCount = counts[i]
    }
  }

  const range   = maxCount - minCount
  const indices = new Array<number>(counts.length)

  for (let i = 0; i < counts.length; i++) {
    indices[i] = counts[i] === 0
      ? -1
      : range === 0
        ? 0
        : Math.min(paletteSize - 1, Math.floor((paletteSize * (counts[i] - minCount)) / range))
  }

  return indices
}
