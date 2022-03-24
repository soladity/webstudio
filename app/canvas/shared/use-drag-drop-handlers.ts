import { useState } from "react";
import memoize from "lodash.memoize";
import { type Instance } from "@webstudio-is/sdk";
import { type DragData, type DropData } from "~/shared/component";
import {
  findInstanceById,
  type InstanceInsertionSpec,
  type InstanceReparentingSpec,
} from "~/shared/tree-utils";
import {
  findClosestChild,
  findInsertionIndex,
  getDragOverInfo,
} from "~/shared/dom-utils";
import { useDropData, useSelectedInstance } from "./nano-values";
import { publish, useSubscribe } from "./pubsub";
//import {usePointerOutline} from './use-pointer-outline'

// Avoid recalculating rects for each node during dragging.
const getBoundingClientRect = memoize((element) =>
  element.getBoundingClientRect()
);

const getComputedStyle = memoize((element) => window.getComputedStyle(element));

export const useDragDropHandlers = ({
  rootInstance,
}: {
  rootInstance: Instance;
}): {
  instanceInsertionSpec?: InstanceInsertionSpec;
  instanceReparentingSpec?: InstanceReparentingSpec;
} => {
  const [selectedInstance, setSelectedInstance] = useSelectedInstance();
  const [instanceInsertionSpec, setInstanceInsertionSpec] =
    useState<InstanceInsertionSpec>();
  const [instanceReparentingSpec, setInstanceReparentingSpec] =
    useState<InstanceReparentingSpec>();
  const [dropData, setDropData] = useDropData();
  const [dragData, setDragData] = useState<DragData>();

  const insert = ({
    instance,
    dropData,
  }: {
    instance: Instance;
    dropData: DropData;
  }) => {
    const instanceInsertionSpec = {
      instance,
      parentId: dropData.instance.id,
      position: dropData.position,
    } as const;
    setInstanceInsertionSpec(instanceInsertionSpec);
    publish<"syncInstanceInsertion", InstanceInsertionSpec>({
      type: "syncInstanceInsertion",
      payload: instanceInsertionSpec,
    });
  };

  useSubscribe<"dragStartInstance">("dragStartInstance", () => {
    setSelectedInstance(undefined);
  });

  useSubscribe<"dragEndInstance">("dragEndInstance", () => {
    // Cleanup
    if (getBoundingClientRect.cache?.clear) getBoundingClientRect.cache.clear();
    if (getComputedStyle.cache?.clear) getComputedStyle.cache.clear();
    setDropData(undefined);
    setDragData(undefined);

    if (
      dropData === undefined ||
      dragData === undefined ||
      // Can't reparent an instance inside itself
      dropData.instance.id === dragData.instance.id
    ) {
      return;
    }

    const isNew =
      findInstanceById(rootInstance, dragData.instance.id) === undefined;

    if (isNew) {
      insert({
        instance: dragData.instance,
        dropData,
      });
      return;
    }
    const instanceReparentingSpec = {
      parentId: dropData.instance.id,
      position: dropData.position,
      id: dragData.instance.id,
    };

    setInstanceReparentingSpec(instanceReparentingSpec);
    publish<"syncInstanceReparenting", InstanceReparentingSpec>({
      type: "syncInstanceReparenting",
      payload: instanceReparentingSpec,
    });
  });

  //const updatePointerOutline = usePointerOutline();
  useSubscribe<"dragInstance", DragData>("dragInstance", (dragData) => {
    const { currentOffset } = dragData;
    // updatePointerOutline(currentOffset)
    const dragOver = getDragOverInfo(currentOffset, getBoundingClientRect);

    if (dragOver.element === undefined) return;

    const dropInstance = findInstanceById(rootInstance, dragOver.element.id);

    if (dropInstance === undefined) return;

    const closestChild = findClosestChild(
      dragOver.element,
      currentOffset,
      getBoundingClientRect,
      getComputedStyle
    );

    let insertionIndex = 0;

    // When element has children.
    if (dragOver.element !== undefined && closestChild !== undefined) {
      insertionIndex = findInsertionIndex(dragOver, closestChild);
    }

    const dropData = {
      instance: dropInstance,
      position: insertionIndex,
    };

    setDragData(dragData);
    setDropData(dropData);
    publish<"dropPreview", { dropData: DropData; dragData: DragData }>({
      type: "dropPreview",
      payload: { dropData, dragData },
    });
  });

  useSubscribe<"insertInstance", Instance>("insertInstance", (instance) => {
    if (selectedInstance === undefined) {
      setSelectedInstance(rootInstance);
    }
    insert({
      instance,
      dropData: {
        position: "end",
        instance: selectedInstance ?? rootInstance,
      },
    });
  });

  return { instanceInsertionSpec, instanceReparentingSpec };
};
