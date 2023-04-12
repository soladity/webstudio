import store from "immerhin";
import { findTreeInstanceIdsExcludingSlotDescendants } from "@webstudio-is/project-build";
import {
  propsStore,
  stylesStore,
  selectedInstanceSelectorStore,
  styleSourceSelectionsStore,
  styleSourcesStore,
  instancesStore,
} from "./nano-states";
import {
  type DroppableTarget,
  type InstanceSelector,
  createComponentInstance,
  findSubtreeLocalStyleSources,
  insertInstancesMutable,
  reparentInstanceMutable,
  getAncestorInstanceSelector,
} from "./tree-utils";
import { removeByMutable } from "./array-utils";
import { unstable_batchedUpdates as batchedUpdates } from "react-dom";

export const insertNewComponentInstance = (
  component: string,
  dropTarget: DroppableTarget
) => {
  batchedUpdates(() => {
    const instance = createComponentInstance(component);
    store.createTransaction([instancesStore], (instances) => {
      insertInstancesMutable(instances, [instance], [instance.id], dropTarget);
    });

    selectedInstanceSelectorStore.set([
      instance.id,
      ...dropTarget.parentSelector,
    ]);
  });
};

export const reparentInstance = (
  targetInstanceSelector: InstanceSelector,
  dropTarget: DroppableTarget
) => {
  batchedUpdates(() => {
    store.createTransaction([instancesStore], (instances) => {
      reparentInstanceMutable(instances, targetInstanceSelector, dropTarget);
    });
    selectedInstanceSelectorStore.set(targetInstanceSelector);
  });
};

export const deleteInstance = (instanceSelector: InstanceSelector) => {
  batchedUpdates(() => {
    store.createTransaction(
      [
        instancesStore,
        propsStore,
        styleSourceSelectionsStore,
        styleSourcesStore,
        stylesStore,
      ],
      (instances, props, styleSourceSelections, styleSources, styles) => {
        let targetInstanceId = instanceSelector[0];
        const parentInstanceId = instanceSelector[1];
        const grandparentInstanceId = instanceSelector[2];
        let parentInstance =
          parentInstanceId === undefined
            ? undefined
            : instances.get(parentInstanceId);

        // delete parent fragment too if its last child is going to be deleted
        // use case for slots: slot became empty and remove display: contents
        // to be displayed properly on canvas
        if (
          parentInstance?.component === "Fragment" &&
          parentInstance.children.length === 1 &&
          grandparentInstanceId !== undefined
        ) {
          targetInstanceId = parentInstance.id;
          parentInstance = instances.get(grandparentInstanceId);
        }

        const subtreeIds = findTreeInstanceIdsExcludingSlotDescendants(
          instances,
          targetInstanceId
        );
        const subtreeLocalStyleSourceIds = findSubtreeLocalStyleSources(
          subtreeIds,
          styleSources,
          styleSourceSelections
        );

        // may not exist when delete root
        if (parentInstance) {
          removeByMutable(
            parentInstance.children,
            (child) => child.type === "id" && child.value === targetInstanceId
          );
        }

        for (const instanceId of subtreeIds) {
          instances.delete(instanceId);
        }
        // delete props and styles of deleted instance and its descendants
        for (const prop of props.values()) {
          if (subtreeIds.has(prop.instanceId)) {
            props.delete(prop.id);
          }
        }
        for (const instanceId of subtreeIds) {
          styleSourceSelections.delete(instanceId);
        }
        for (const styleSourceId of subtreeLocalStyleSourceIds) {
          styleSources.delete(styleSourceId);
        }
        for (const [styleDeclKey, styleDecl] of styles) {
          if (subtreeLocalStyleSourceIds.has(styleDecl.styleSourceId)) {
            styles.delete(styleDeclKey);
          }
        }

        if (parentInstance) {
          selectedInstanceSelectorStore.set(
            getAncestorInstanceSelector(instanceSelector, parentInstance.id)
          );
        }
      }
    );
  });
};

export const deleteSelectedInstance = () => {
  batchedUpdates(() => {
    const selectedInstanceSelector = selectedInstanceSelectorStore.get();
    // @todo tell user they can't delete root
    if (
      selectedInstanceSelector === undefined ||
      selectedInstanceSelector.length === 1
    ) {
      return;
    }
    deleteInstance(selectedInstanceSelector);
  });
};
