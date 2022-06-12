import { createValueContainer, useValue } from "react-nano-state";
import { type Instance } from "@webstudio-is/sdk";
import { type DropData } from "~/shared/canvas-components";

const dropDataContainer = createValueContainer<DropData | undefined>();
export const useDropData = () => useValue(dropDataContainer);

export const selectedInstanceContainer = createValueContainer<
  Instance | undefined
>();
export const useSelectedInstance = () => useValue(selectedInstanceContainer);

const selectedElementContainer = createValueContainer<Element | undefined>();
export const useSelectedElement = () => useValue(selectedElementContainer);
