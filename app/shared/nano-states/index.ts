import { createValueContainer, useValue } from "react-nano-state";
import { type Breakpoint, type Instance } from "@webstudio-is/sdk";

export const rootInstanceContainer = createValueContainer<
  Instance | undefined
>();
export const useRootInstance = () => useValue(rootInstanceContainer);

export const breakpointsContainer = createValueContainer<Array<Breakpoint>>([]);
export const useBreakpoints = () => useValue(breakpointsContainer);

const isPreviewModeContainer = createValueContainer<boolean>(false);
export const useIsPreviewMode = () => useValue(isPreviewModeContainer);

const selectedInstanceRectContainer = createValueContainer<
  DOMRect | undefined
>();
export const useSelectedInstanceRect = () =>
  useValue(selectedInstanceRectContainer);

const hoveredInstanceRectContainer = createValueContainer<
  DOMRect | undefined
>();
export const useHoveredInstanceRect = () =>
  useValue(hoveredInstanceRectContainer);
