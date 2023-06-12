import { type ReadableAtom, atom } from "nanostores";
import { createContext } from "react";
import type { Assets } from "@webstudio-is/asset-uploader";
import type { Pages, PropsByInstanceId } from "./props";

export type Params = {
  renderer?: "canvas" | "preview";
  /**
   * Base url ir base path for images with ending slash.
   * Used for configuring image with different sizes.
   * Concatinated with "name?width=&quality=&format=".
   *
   * For example
   * /asset/image/ used by default in builder
   * https://image-transform.wstd.io/cdn-cgi/image/
   * https://webstudio.is/cdn-cgi/image/
   */
  imageBaseUrl: string;
  /**
   * Base url or base path for any asset with ending slash.
   * Used to load assets like fonts or images in styles
   * Concatinated with "name".
   *
   * For example
   * /s/uploads/
   * /asset/file/
   * https://assets-dev.webstudio.is/
   * https://assets.webstudio.is/
   */
  assetBaseUrl: string;
};

export const ReactSdkContext = createContext<
  Params & {
    propsByInstanceIdStore: ReadableAtom<PropsByInstanceId>;
    assetsStore: ReadableAtom<Assets>;
    pagesStore: ReadableAtom<Pages>;
  }
>({
  imageBaseUrl: "/",
  assetBaseUrl: "/",
  propsByInstanceIdStore: atom(new Map()),
  assetsStore: atom(new Map()),
  pagesStore: atom(new Map()),
});
