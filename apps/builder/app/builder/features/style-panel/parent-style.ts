import { useStore } from "@nanostores/react";
import { useStyleInfoByInstanceId } from "./shared/style-info";
import {
  instancesStore,
  registeredComponentMetasStore,
  selectedInstanceSelectorStore,
} from "~/shared/nano-states";

/**
 * Gets styleable parent style
 **/
export const useParentStyle = () => {
  const selectedInstanceSelector = useStore(selectedInstanceSelectorStore);
  const instances = useStore(instancesStore);
  const registeredComponentMetas = useStore(registeredComponentMetasStore);

  let parentInstanceSelector: string[] | undefined = undefined;
  for (let i = 1; i < (selectedInstanceSelector?.length ?? 0); ++i) {
    parentInstanceSelector = selectedInstanceSelector!.slice(i);
    const component = instances.get(parentInstanceSelector[0])?.component;
    const meta = component
      ? registeredComponentMetas.get(component)
      : undefined;
    if (meta?.stylable !== false) {
      break;
    }
  }

  const parentStyleInfo = useStyleInfoByInstanceId(parentInstanceSelector);
  return parentStyleInfo;
};
