import { atom, computed, type WritableAtom } from "nanostores";
import { useStore } from "@nanostores/react";
import type { Project } from "@webstudio-is/project";

const useValue = <T>(atom: WritableAtom<T>) => {
  const value = useStore(atom);
  return [value, atom.set] as const;
};

const isShareDialogOpenContainer = atom<boolean>(false);
export const useIsShareDialogOpen = () => useValue(isShareDialogOpenContainer);

const isPublishDialogOpenContainer = atom<boolean>(false);
export const useIsPublishDialogOpen = () =>
  useValue(isPublishDialogOpenContainer);

export const canvasWidthContainer = atom<number | undefined>();
export const useCanvasWidth = () => useValue(canvasWidthContainer);

export const canvasRectContainer = atom<DOMRect | undefined>();
export const useCanvasRect = () => useValue(canvasRectContainer);

export const projectContainer = atom<Project | undefined>();
export const useProject = () => useValue(projectContainer);

export const isCanvasPointerEventsEnabledStore = atom<boolean>(true);

export const workspaceRectStore = atom<DOMRect | undefined>();

export const scaleStore = computed(
  [canvasWidthContainer, workspaceRectStore],
  (canvasWidth, workspaceRect) => {
    if (
      canvasWidth === undefined ||
      workspaceRect === undefined ||
      canvasWidth <= workspaceRect.width
    ) {
      return 100;
    }
    return Number.parseFloat(
      ((workspaceRect.width / canvasWidth) * 100).toFixed(2)
    );
  }
);
