import { FONT_FORMATS } from "./constants";
import type { FontMeta } from "./schema";
import type { FontFormat } from "./types";

export const getFontFaces = (
  assets: Array<{ format: string; meta: FontMeta; path: string }>
) => {
  const faces = new Map();
  for (const asset of assets) {
    const face = faces.get(asset.meta.family);
    const format = FONT_FORMATS[asset.format as FontFormat];

    if (face === undefined) {
      faces.set(asset.meta.family, {
        fontFamily: asset.meta.family,
        fontStyle: asset.meta.style,
        fontWeight: asset.meta.weight,
        fontDisplay: "swap" as const,
        src: `url('${asset.path}') format('${format}')`,
      });
      continue;
    }

    // We already have that font face, so we need to add the new src
    face.src += `, url('${asset.path}') format('${format}')`;
  }
  return Array.from(faces.values());
};
