import { atom, type WritableAtom } from "nanostores";
import { useStore } from "@nanostores/react";
import type { Pages } from "@webstudio-is/project-build";
import type { Project } from "@webstudio-is/project";
import type { AssetContainer, DeletingAssetContainer } from "../assets";
import { minWidth } from "~/builder/features/breakpoints/width-setting";

const useValue = <T>(atom: WritableAtom<T>) => {
  const value = useStore(atom);
  return [value, atom.set] as const;
};

const isShareDialogOpenContainer = atom<boolean>(false);
export const useIsShareDialogOpen = () => useValue(isShareDialogOpenContainer);

const isPublishDialogOpenContainer = atom<boolean>(false);
export const useIsPublishDialogOpen = () =>
  useValue(isPublishDialogOpenContainer);

const canvasWidthContainer = atom<number>(minWidth);
export const useCanvasWidth = () => useValue(canvasWidthContainer);

const canvasRectContainer = atom<DOMRect | undefined>();
export const useCanvasRect = () => useValue(canvasRectContainer);

const assetsContainer = atom<Array<AssetContainer | DeletingAssetContainer>>(
  []
);
export const useAssetsContainer = () => useValue(assetsContainer);

const pagesContainer = atom<Pages | undefined>();
export const usePages = () => useValue(pagesContainer);

const currentPageIdContainer = atom<string | undefined>();
export const useCurrentPageId = () => useValue(currentPageIdContainer);

const projectContainer = atom<Project | undefined>();
export const useProject = () => useValue(projectContainer);

export type TextToolbarState = {
  selectionRect: DOMRect;
  isBold: boolean;
  isItalic: boolean;
  isSuperscript: boolean;
  isSubscript: boolean;
  isLink: boolean;
  isSpan: boolean;
};
const textToolbarState = atom<undefined | TextToolbarState>();
export const useTextToolbarState = () => useValue(textToolbarState);
