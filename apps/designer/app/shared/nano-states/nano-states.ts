import { useState } from "react";
import { createValueContainer, useValue } from "react-nano-state";
import type { Instance, PresetStyles } from "@webstudio-is/react-sdk";
import type {
  DropTargetChangePayload,
  DragStartPayload,
} from "~/canvas/shared/use-drag-drop";
import type { Breakpoint } from "@webstudio-is/css-data";
import type { DesignToken } from "@webstudio-is/design-tokens";

export const rootInstanceContainer = createValueContainer<
  Instance | undefined
>();
export const useRootInstance = () => useValue(rootInstanceContainer);

export const presetStylesContainer = createValueContainer<PresetStyles>([]);
export const usePresetStyles = () => useValue(presetStylesContainer);
export const useSetPresetStyles = (presetStyles?: PresetStyles) => {
  useState(() => {
    if (presetStyles) {
      presetStylesContainer.value = presetStyles;
    }
  });
};

export const breakpointsContainer = createValueContainer<Array<Breakpoint>>([]);
export const useBreakpoints = () => useValue(breakpointsContainer);

const isPreviewModeContainer = createValueContainer<boolean>(false);
export const useIsPreviewMode = () => useValue(isPreviewModeContainer);

const selectedInstanceOutlineContainer = createValueContainer<{
  visible: boolean;
  rect?: DOMRect;
}>({
  visible: false,
  rect: undefined,
});
export const useSelectedInstanceOutline = () =>
  useValue(selectedInstanceOutlineContainer);

const hoveredInstanceRectContainer = createValueContainer<
  DOMRect | undefined
>();
export const useHoveredInstanceRect = () =>
  useValue(hoveredInstanceRectContainer);

const isScrollingContainer = createValueContainer<boolean>(false);
export const useIsScrolling = () => useValue(isScrollingContainer);

// We are editing the text of that instance in text editor.
const textEditingInstanceIdContainer = createValueContainer<
  Instance["id"] | undefined
>();
export const useTextEditingInstanceId = () =>
  useValue(textEditingInstanceIdContainer);

export type DragAndDropState = {
  isDragging: boolean;
  origin?: "canvas" | "panel";
  dropTarget?: DropTargetChangePayload;
  dragItem?: DragStartPayload["dragItem"];
};
const dragAndDropStateContainer = createValueContainer<DragAndDropState>({
  isDragging: false,
});
export const useDragAndDropState = () => useValue(dragAndDropStateContainer);

export const designTokensContainer = createValueContainer<Array<DesignToken>>(
  []
);
export const useDesignTokens = () => useValue(designTokensContainer);
