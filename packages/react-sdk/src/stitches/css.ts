import {
  createStitches,
  globalCss as globalCssImport,
  type CSS,
  css as createCss,
} from "@stitches/core";
import type { Breakpoint } from "../css";

let media = {};

// @todo needs fixing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stitches: any;

export { type CSS };

export const getCachedConfig = () => {
  if (stitches === undefined) {
    stitches = createStitches({ media });
  }
  return stitches;
};

export const css: typeof createCss = (...args) => {
  return getCachedConfig().css(...args);
};

export const globalCss: typeof globalCssImport = (...args) => {
  return getCachedConfig().globalCss(...args);
};

export const getCssText = (): string => {
  return getCachedConfig().getCssText();
};

export const resetCss = () => {
  getCachedConfig().reset();
};

export const setBreakpoints = (breakpoints: Array<Breakpoint>) => {
  const nextMedia: Record<string, string> = {};
  for (const breakpoint of breakpoints) {
    nextMedia[breakpoint.id] = `(min-width: ${breakpoint.minWidth}px)`;
  }
  media = nextMedia;
  stitches = undefined;
};
