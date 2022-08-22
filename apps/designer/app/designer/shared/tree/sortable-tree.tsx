import { useState, useMemo, useRef } from "react";
import { type Instance, components } from "@webstudio-is/react-sdk";
import {
  type DropTarget,
  type Rect,
  useDrag,
  useDrop,
  useHold,
  Box,
} from "@webstudio-is/design-system";
import {
  findInstanceById,
  getInstancePath,
  getInstancePathWithPositions,
} from "~/shared/tree-utils";
import { createPortal } from "react-dom";
import { getIsExpandable } from "./tree-node";
import { BaseTree, useExpandState, type TreeProps } from "./base-tree";

type Placement = DropTarget<unknown>["placement"];

export const SortableTree = (
  props: TreeProps & {
    onDragEnd: (event: {
      instanceId: Instance["id"];
      dropTarget: { instanceId: Instance["id"]; position: number | "end" };
    }) => void;
  }
) => {
  const { root, onDragEnd } = props;

  const { getIsExpanded, setIsExpanded } = useExpandState(props);

  const rootRef = useRef<HTMLElement | null>(null);

  const [dragItem, setDragItem] = useState<Instance>();
  const [dropTarget, setDropTarget] = useState<DropTarget<Instance>>();

  const [horizontalShift, setHorizontalShift] = useState(0);

  const dragItemDepth = useMemo(
    () => dragItem && getInstancePath(root, dragItem.id).length - 1,
    [dragItem, root]
  );

  // Here we want to allow user to shift placement line horizontally
  // but only if that corresponds to a meaningful position in the tree
  const finalDropTarget = useMemo<
    | {
        instance: Instance;
        position: number | "end";
        placement:
          | { type: "rect"; rect: Rect }
          | { type: "line"; line: Placement };
      }
    | undefined
  >(() => {
    if (
      dropTarget === undefined ||
      dragItemDepth === undefined ||
      dragItem === undefined
    ) {
      return undefined;
    }

    const { data, placement, rect, indexWithinChildren } = dropTarget;

    // Placement type “inside-parent” means that useDrop didn’t find any children,
    // and the “placement” corresponds to a line near an edge of the parent.
    // This means the drop target is empty or collapsed.
    // In this case, we want to show a rect instead of a line.
    // Also, we don’t want to apply shift, as there’s no line to shift.
    if (placement.type === "inside-parent") {
      return {
        instance: data,
        position: "end",
        placement: { type: "rect", rect: rect },
      };
    }

    const dropTargetPath = getInstancePathWithPositions(root, data.id);
    dropTargetPath.reverse();

    const currentDepth = dropTargetPath.length;
    const desiredDepth = dragItemDepth + horizontalShift;

    const shiftLine = (depth: number) => {
      // @todo: fix magic numbers
      const shift = depth * 15 + 15;
      return {
        ...placement,
        x: placement.x + shift,
        length: placement.length - shift,
      };
    };

    const withoutShift = {
      instance: data,
      position: indexWithinChildren,
      placement: { type: "line", line: shiftLine(currentDepth) },
    } as const;

    if (desiredDepth < currentDepth) {
      // Unless we're currently at the bottom of drop target's children,
      // decreasing depth will not correspond to a new meaningful position
      if (indexWithinChildren !== data.children.length) {
        // But there's a special case when the index is `last - 1` and the last child is the drag item.
        // When drag item is removed from its current position, `last - 1` will become `last`.

        if (indexWithinChildren !== data.children.length - 1) {
          return withoutShift;
        }

        const lastChild = data.children[data.children.length - 1];
        const lastChildIsDragItem =
          lastChild !== undefined &&
          typeof lastChild !== "string" &&
          lastChild.id === dragItem.id;

        if (lastChildIsDragItem === false) {
          return withoutShift;
        }
      }

      const difference = Math.min(
        dropTargetPath.length - 1,
        currentDepth - desiredDepth
      );

      // Ideally we should check canAcceptChildren on the new target
      // but we assume that because it already has a child, it can accept more.

      return {
        instance: dropTargetPath[difference].instance,
        position: dropTargetPath[difference - 1].position + 1,
        placement: {
          type: "line",
          line: shiftLine(currentDepth - difference),
        },
      };
    }

    if (desiredDepth > currentDepth) {
      let shifted = 0;
      let newParent = data;
      let potentialNewParent = data.children[indexWithinChildren - 1];

      while (
        potentialNewParent !== undefined &&
        typeof potentialNewParent !== "string" &&
        getIsExpanded(potentialNewParent) &&
        components[potentialNewParent.component].canAcceptChild() &&
        shifted < desiredDepth - currentDepth
      ) {
        newParent = potentialNewParent;
        potentialNewParent = newParent.children[newParent.children.length - 1];
        shifted++;
      }

      return {
        instance: newParent,
        position: "end",
        placement: { type: "line", line: shiftLine(currentDepth + shifted) },
      };
    }

    return withoutShift;
  }, [
    dragItem,
    dragItemDepth,
    dropTarget,
    root,
    horizontalShift,
    getIsExpanded,
  ]);

  // @todo: not sure what this should return,
  // need to understand better when it's used
  //
  // maybe we should return previous dropTarget, or current dragItem's parent?
  const getFallbackDropTarget = () => {
    return {
      data: root,
      element: rootRef.current as HTMLElement,
      final: true,
    };
  };

  const useHoldHandler = useHold<DropTarget<Instance>>({
    isEqual: (a, b) => a.data.id === b.data.id,
    holdTimeThreshold: 1000,
    onHold: (dropTarget) => {
      if (
        getIsExpandable(dropTarget.data) &&
        getIsExpanded(dropTarget.data) === false
      ) {
        setIsExpanded(dropTarget.data.id, true);
      }
    },
  });

  const dropHandlers = useDrop<Instance>({
    emulatePointerAlwaysInRootBounds: true,

    placementPadding: 0,

    elementToData: (element) => {
      const id = (element as HTMLElement).dataset.dropTargetId;
      const instance = id && findInstanceById(root, id);
      return instance || false;
    },

    swapDropTarget: (dropTarget) => {
      if (dragItem === undefined || dropTarget === undefined) {
        return getFallbackDropTarget();
      }

      if (dropTarget.data.id === root.id) {
        return dropTarget;
      }

      const path = getInstancePath(root, dropTarget.data.id);
      path.reverse();

      if (dropTarget.area === "top" || dropTarget.area === "bottom") {
        path.shift();
      }

      // Don't allow to drop inside drag item or any of its children
      const dragItemIndex = path.findIndex(
        (instance) => instance.id === dragItem.id
      );
      if (dragItemIndex !== -1) {
        path.splice(0, dragItemIndex + 1);
      }

      const data = path.find((instance) =>
        components[instance.component].canAcceptChild()
      );

      if (data === undefined) {
        return getFallbackDropTarget();
      }

      const element = rootRef.current?.querySelector(
        `[data-drop-target-id="${data.id}"]`
      );

      if (element == null) {
        return getFallbackDropTarget();
      }

      return { data, element, final: true };
    },

    onDropTargetChange: (dropTarget) => {
      useHoldHandler.setData(dropTarget);
      setDropTarget(dropTarget);
    },

    getValidChildren: (element) => {
      return Array.from(
        // @todo: if this works as expected, we need a selector that assumes less about the DOM structure
        element.querySelectorAll(":scope > div > [data-drop-target-id]")
      );
    },
  });

  const dragHandlers = useDrag<Instance>({
    // @todo: fix magic number
    shiftDistanceThreshold: 15,

    elementToData: (element) => {
      const dragItemElement = element.closest("[data-drag-item-id]");
      if (!(dragItemElement instanceof HTMLElement)) {
        return false;
      }
      const id = dragItemElement.dataset.dragItemId;
      if (id === undefined || id === root.id) {
        return false;
      }
      return findInstanceById(root, id) || false;
    },
    onStart: ({ data }) => {
      setDragItem(data);
      dropHandlers.handleStart();
    },
    onMove: (point) => {
      dropHandlers.handleMove(point);
    },
    onShiftChange: ({ shifts }) => {
      setHorizontalShift(shifts);
    },
    onEnd: ({ isCanceled }) => {
      if (finalDropTarget && dragItem && isCanceled === false) {
        onDragEnd({
          instanceId: dragItem.id,
          dropTarget: {
            instanceId: finalDropTarget.instance.id,
            position: finalDropTarget.position,
          },
        });
      }

      setHorizontalShift(0);
      setDragItem(undefined);
      setDropTarget(undefined);
      dropHandlers.handleEnd();
      useHoldHandler.reset();
    },
  });

  return (
    <>
      <BaseTree
        {...props}
        getIsExpanded={getIsExpanded}
        setIsExpanded={setIsExpanded}
        onExpandTransitionEnd={dropHandlers.handleDomMutation}
        ref={(element) => {
          rootRef.current = element;
          dragHandlers.rootRef(element);
          dropHandlers.rootRef(element);
        }}
      />
      {finalDropTarget &&
        createPortal(
          finalDropTarget.placement.type === "rect" ? (
            <PlacementIndicatorOutline rect={finalDropTarget.placement.rect} />
          ) : (
            <PlacementIndicatorLine line={finalDropTarget.placement.line} />
          ),

          document.body
        )}
    </>
  );
};

const PlacementIndicatorLine = ({ line }: { line: Placement }) => {
  return (
    <Box
      style={{
        // @todo: fix magic numbers
        top: line.y - 1,
        left: line.x + 4,
        width: line.length - 4,
        height: 2,
      }}
      css={{
        boxSizing: "content-box",
        position: "absolute",
        background: "#f531b3",
        pointerEvents: "none",
      }}
    >
      <Box
        css={{
          // @todo: fix magic numbers
          width: 8,
          height: 8,
          top: -3,
          left: -7,
          position: "absolute",
          border: "solid 2px #f531b3",
          borderRadius: "50%",
        }}
      />
    </Box>
  );
};

const PlacementIndicatorOutline = ({ rect }: { rect: Rect }) => {
  return (
    <Box
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
      css={{
        position: "absolute",
        pointerEvents: "none",
        outline: "2px solid #f531b3",
        borderRadius: 6,
      }}
    />
  );
};
