import { createValueContainer, useValue } from "react-nano-state";
import { type Breakpoint } from "@webstudio-is/sdk";
import {
  type SelectedInstanceData,
  type HoveredInstanceData,
} from "~/shared/canvas-components";
import { type SyncStatus } from "~/shared/sync";

const selectedInstanceDataContainer = createValueContainer<
  SelectedInstanceData | undefined
>();
export const useSelectedInstanceData = () =>
  useValue(selectedInstanceDataContainer);

const hoveredInstanceDataContainer = createValueContainer<
  HoveredInstanceData | undefined
>();
export const useHoveredInstanceData = () =>
  useValue(hoveredInstanceDataContainer);

const isShareDialogOpenContainer = createValueContainer<boolean>(false);
export const useIsShareDialogOpen = () => useValue(isShareDialogOpenContainer);

const isPublishDialogOpenContainer = createValueContainer<boolean>(false);
export const useIsPublishDialogOpen = () =>
  useValue(isPublishDialogOpenContainer);

const selectedBreakpointContainer = createValueContainer<
  Breakpoint | undefined
>();
export const useSelectedBreakpoint = () =>
  useValue(selectedBreakpointContainer);

const zoomContainer = createValueContainer<number>(100);
export const useZoom = () => useValue(zoomContainer);

const canvasWidthContainer = createValueContainer<number>(0);
export const useCanvasWidth = () => useValue(canvasWidthContainer);

const canvasRectContainer = createValueContainer<DOMRect | undefined>();
export const useCanvasRect = () => useValue(canvasRectContainer);

const syncStatusContainer = createValueContainer<SyncStatus>("idle");
export const useSyncStatus = () => useValue(syncStatusContainer);
