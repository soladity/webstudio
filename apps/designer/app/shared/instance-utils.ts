import store from "immerhin";
import { Instance } from "@webstudio-is/project-build";
import {
  rootInstanceContainer,
  propsStore,
  stylesStore,
  selectedInstanceIdStore,
  styleSourceSelectionsStore,
  styleSourcesStore,
} from "./nano-states";
import { findSubtree, findSubtreeLocalStyleSources } from "./tree-utils";
import { removeByMutable } from "./array-utils";

export const deleteInstance = (targetInstanceId: Instance["id"]) => {
  store.createTransaction(
    [
      rootInstanceContainer,
      propsStore,
      styleSourceSelectionsStore,
      styleSourcesStore,
      stylesStore,
    ],
    (rootInstance, props, styleSourceSelections, styleSources, styles) => {
      if (rootInstance === undefined) {
        return;
      }
      // @todo tell user they can't delete root
      if (targetInstanceId === rootInstance?.id) {
        return;
      }
      const { parentInstance, subtreeIds } = findSubtree(
        rootInstance,
        targetInstanceId
      );
      const subtreeLocalStyleSourceIds = findSubtreeLocalStyleSources(
        subtreeIds,
        styleSources,
        styleSourceSelections
      );
      if (parentInstance === undefined) {
        return;
      }

      removeByMutable(
        parentInstance.children,
        (child) => child.type === "instance" && child.id === targetInstanceId
      );
      // delete props and styles of deleted instance and its descendants
      for (const prop of props.values()) {
        if (subtreeIds.has(prop.instanceId)) {
          props.delete(prop.id);
        }
      }
      removeByMutable(styleSourceSelections, (styleSourceSelection) =>
        subtreeIds.has(styleSourceSelection.instanceId)
      );
      for (const styleSourceId of subtreeLocalStyleSourceIds) {
        styleSources.delete(styleSourceId);
      }
      removeByMutable(styles, (styleDecl) =>
        subtreeLocalStyleSourceIds.has(styleDecl.styleSourceId)
      );

      selectedInstanceIdStore.set(parentInstance.id);
    }
  );
};
