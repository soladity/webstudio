import { useEffect, useRef } from "react";
import { useMove } from "./use-move";

type IsDropTarget = (element: HTMLElement) => boolean;

const findClosestDropTarget = ({
  root,
  target,
  isDropTarget,
}: {
  root: HTMLElement;
  target: HTMLElement;
  isDropTarget: IsDropTarget;
}): HTMLElement => {
  let currentTarget: HTMLElement | null = target;
  while (currentTarget !== null && currentTarget !== root) {
    const isValid = isDropTarget(currentTarget);
    if (isValid) {
      return target;
    }
    currentTarget = currentTarget.parentElement;
  }
  return root;
};

type State =
  | {
      status: "idle";
    }
  | {
      status: "pending";
      pageX: number;
      pageY: number;
    }
  | {
      status: "dragging";
      pageX: number;
      pageY: number;
    }
  | {
      status: "canceled";
    };

export const useDrag = ({
  onStart,
  startDistanceThreashold = 3,
  onMove,
}: any = {}) => {
  const state = useRef<State>({
    status: "idle",
  });

  const cancel = () => {
    state.current = { status: "canceled" };
  };

  const setDropTarget = () => {};

  const props = useMove({
    onMoveStart(event: any) {
      state.current = {
        status: "pending",
        pageX: event.pageX,
        pageY: event.pageY,
      };

      onStart({ ...event, cancel });
      console.log(event);
    },
    onMove(event: any) {
      if (state.current.status === "canceled") {
        return;
      }

      if (
        state.current.status === "pending" &&
        Math.abs(event.pageX - state.current.pageX) < startDistanceThreashold &&
        Math.abs(event.pageY - state.current.pageY) < startDistanceThreashold
      ) {
        return;
      }

      state.current = {
        status: "dragging",
        pageX: event.pageX,
        pageY: event.pageY,
      };

      onMove({ x: event.pageX, y: event.pageY });
    },
    onMoveEnd() {
      state.current.status = "idle";
    },
  });

  return props.moveProps;
};

type Coordinate = { x: number; y: number };
type Area = "top" | "right" | "bottom" | "left" | "center";

const elementFromPoint = (coordinate: Coordinate): HTMLElement | undefined => {
  const element = document.elementFromPoint(coordinate.x, coordinate.y);
  if (element instanceof HTMLElement) return element;
};

export const useDropTargetRect = ({
  isDropTarget,
  onDropTargetChange,
  edgeThreshold = 3,
}: any) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<HTMLElement>();
  const targetRectRef = useRef<DOMRect>();
  const areaRef = useRef<Area>("center");

  return {
    handleMove(pointerCoordinate: Coordinate) {
      const target = elementFromPoint(pointerCoordinate);
      if (target === undefined || rootRef.current === null) {
        return;
      }

      const nextTarget = findClosestDropTarget({
        root: rootRef.current,
        target,
        isDropTarget,
      });

      const hasTargetChanged = nextTarget !== targetRef.current;

      let nextArea: Area = "center";

      if (hasTargetChanged) {
        targetRectRef.current = nextTarget.getBoundingClientRect();
      }

      // We are at the edge and this means user wants to insert after that element into its parent
      if (targetRectRef.current !== undefined) {
        if (pointerCoordinate.y - targetRectRef.current.top <= edgeThreshold)
          nextArea = "top";
        if (targetRectRef.current.bottom - pointerCoordinate.y <= edgeThreshold)
          nextArea = "bottom";
        if (pointerCoordinate.x - targetRectRef.current.left <= edgeThreshold)
          nextArea = "left";
        if (targetRectRef.current.right - pointerCoordinate.x <= edgeThreshold)
          nextArea = "right";
      }

      const hasAreaChanged = nextArea !== areaRef.current;

      if (hasTargetChanged || hasAreaChanged) {
        targetRef.current = nextTarget;
        areaRef.current = nextArea;
        onDropTargetChange({
          rect: targetRectRef.current,
          area: nextArea,
        });
      }
    },

    ref(rootElement: HTMLElement | null) {
      rootRef.current = rootElement;
    },
  };
};
