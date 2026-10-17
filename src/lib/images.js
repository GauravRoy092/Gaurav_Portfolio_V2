// ==========================================================================
// IMAGE HELPER — every content image points at a raster fallback (.png/.jpg)
// while a sibling .webp sits next to it on disk. <picture> elements use this
// helper to provide the webp source; browsers without webp support fall back
// to the original file automatically.
// ==========================================================================

const RASTER_EXT = /\.(png|jpe?g)$/i;

export const webpVariant = (src) =>
  src && RASTER_EXT.test(src) ? src.replace(RASTER_EXT, '.webp') : null;
