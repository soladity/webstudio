import { z } from "zod";
import { Asset as DbAsset } from "@webstudio-is/prisma-client";
import { Asset } from "../types";
import { getAssetPath } from "./get-asset-path";
import { FONT_FORMATS } from "../constants";

const ImageMeta = z.object({
  width: z.number(),
  height: z.number(),
});
export type ImageMeta = z.infer<typeof ImageMeta>;

// @todo fonts meta
const FontMeta = z.object({});
export type FontMeta = z.infer<typeof FontMeta>;

export const formatAsset = (asset: DbAsset): Asset => {
  const Schema = FONT_FORMATS.includes(asset.format) ? FontMeta : ImageMeta;
  const meta = Schema.parse(JSON.parse(asset.meta));
  return {
    ...asset,
    meta,
    path: getAssetPath(asset),
  };
};
