import React, { useEffect, useRef } from "react";
import { useRootInstance } from "~/shared/nano-states";
import {
  useDropTarget,
  useDrag,
  usePlacement,
  type Rect,
  type DropTarget,
} from "~/shared/design-system/components/primitives/dnd";
import { findInstanceById, getInstancePath } from "~/shared/tree-utils";
import { primitives } from "~/shared/canvas-components";
import { publish, type Instance } from "@webstudio-is/react-sdk";

// This is used in tree-preview
// @todo: Update it to use the new events, or fire these events as well.
export type DragData = { instance: Instance };
export type DropData = {
  instance: { id: Instance["id"] };
  position: number | "end";
};
// publish<"dropPreview", { dropData: DropData; dragData: DragData }>({
//   type: "dropPreview",
//   payload: { dropData, dragData },
// });

// data shared between iframe and main window
export type DropTargetSharedData = { rect: Rect; placementRect: Rect };

export const useDragAndDrop = () => {
  const [rootInstance] = useRootInstance();

  const state = useRef({
    dropTarget: undefined as DropTarget<Instance> | undefined,
    placement: undefined as { index: number; placementRect: Rect } | undefined,
  });

  const publishDropTargetChange = () => {
    const { dropTarget, placement } = state.current;
    if (dropTarget === undefined || placement === undefined) {
      return;
    }
    publish<"dropTargetChange", DropTargetSharedData>({
      type: "dropTargetChange",
      payload: {
        rect: dropTarget.rect,
        placementRect: placement.placementRect,
      },
    });
  };

  const placementHandlers = usePlacement({
    onPlacementChange: (placement) => {
      state.current.placement = placement;
      publishDropTargetChange();
    },
  });

  const dropTargetHandlers = useDropTarget<Instance>({
    isDropTarget(element) {
      return (
        (rootInstance !== undefined &&
          element.id !== "" &&
          findInstanceById(rootInstance, element.id)) ||
        false
      );
    },

    isSameData(a, b) {
      return a.id === b.id;
    },

    // This must be fast, it can be called multiple times per pointer move
    swapDropTarget(dropTarget) {
      if (
        rootInstance === undefined ||
        dropTarget.data.id === rootInstance.id
      ) {
        return dropTarget;
      }

      if (
        primitives[dropTarget.data.component].canAcceptChild() &&
        dropTarget.area === "center"
      ) {
        return dropTarget;
      }

      // @todo: Don't allow to dpop inside drag item or any of its children

      const path = getInstancePath(rootInstance, dropTarget.data.id);
      path.reverse().shift();

      const data =
        path.find((instance) =>
          primitives[instance.component].canAcceptChild()
        ) || rootInstance;

      const element = document.getElementById(data.id);
      if (element == null) {
        return dropTarget;
      }

      return { data, element };
    },

    onDropTargetChange(dropTarget) {
      state.current.dropTarget = dropTarget;
      placementHandlers.handleTargetChange(dropTarget.element);

      // @todo: The line above may or may not fire publishDropTargetChange as well.
      // So we're firing duplicate events.
      // One more reason to merge useDropTarget and usePlacement.
      publishDropTargetChange();
    },
  });

  const dragProps = useDrag({
    onStart(_event) {
      // autoScrollHandlers.setEnabled(true);

      // @todo: Find drag item instance or cancel the event

      // @todo: Pass drag item instance id
      publish<"dragStart">({ type: "dragStart" });
    },
    onMove: (poiterCoordinate) => {
      dropTargetHandlers.handleMove(poiterCoordinate);
      // autoScrollHandlers.handleMove(poiterCoordinate);
      placementHandlers.handleMove(poiterCoordinate);
    },
    onEnd() {
      dropTargetHandlers.handleEnd();
      // autoScrollHandlers.setEnabled(false);
      placementHandlers.handleEnd();

      publish<"dragEnd">({ type: "dragEnd" });
    },
  });

  // We want to use <body> as a root for drag items.
  // The DnD hooks weren't designed for that.
  // This is a temporary solution.
  //
  // NOTE: maybe use root instance's element as a root?
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      dragProps.onPointerDown?.(
        event as any as React.PointerEvent<HTMLElement>
      );
    };

    const handleScroll = () => {
      dropTargetHandlers.handleScroll();
      placementHandlers.handleScroll();
    };

    const rootElement = document.body;

    rootElement.addEventListener("pointerdown", handlePointerDown);
    rootElement.addEventListener("scroll", handleScroll);
    dropTargetHandlers.rootRef(rootElement);
    () => {
      rootElement.removeEventListener("pointerdown", handlePointerDown);
      rootElement.removeEventListener("scroll", handleScroll);
      dropTargetHandlers.rootRef(null);
    };

    // NOTE: need to make the dependencies more stable,
    // because as is this will fire on every render
  }, [dragProps, dropTargetHandlers, placementHandlers]);
};
