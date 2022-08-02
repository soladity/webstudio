import { useRef, useMemo } from "react";
import {
  isEqualRect,
  isNearEdge,
  getClosestRectIndex,
  getPlacementBetween,
  getPlacementInside,
  getPlacementNextTo,
  getRectsOrientation,
  getIndexAdjustment,
  type Rect,
  type ChildrenOrientation,
  type Placement,
} from "./geometry-utils";

// @todo: use this in useDrag as well
type UsableElement = HTMLElement | SVGElement;
const toUseableElement = (
  element: Element | undefined | null
): UsableElement | undefined => {
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    return element;
  }
};

// By looking at a specific child and it's neighbours,
// determines their orientation relative to each other
const getLocalChildrenOrientation = (
  parent: UsableElement,
  childrentRects: Rect[],
  childIndex: number
): ChildrenOrientation => {
  const previous = childrentRects[childIndex - 1] as Rect | undefined;
  const current = childrentRects[childIndex] as Rect | undefined;
  const next = childrentRects[childIndex + 1] as Rect | undefined;

  if (current === undefined || (next === undefined && previous === undefined)) {
    const probe = document.createElement("div");
    const { children } = parent;
    if (childIndex > children.length - 1) {
      parent.appendChild(probe);
    } else {
      parent.insertBefore(probe, children[childIndex]);
    }
    const probeRect = probe.getBoundingClientRect();
    parent.removeChild(probe);

    return probeRect.width === 0 && probeRect.height !== 0
      ? "horizontal"
      : "vertical";
  }

  return getRectsOrientation(previous, current, next);
};

// Partial information about a drop target
// used during the selection of a new drop target
export type PartialDropTarget<Data> = {
  data: Data;
  element: UsableElement;
};

export type DropTarget<Data> = PartialDropTarget<Data> & {
  rect: DOMRect;
  indexWithinChildren: number;
  placement: Placement;
};

// We pass around data, to avoid extra data lookups.
// For example, data found in isDropTarget
// doesn't have to be looked up again in swapDropTarget.
export type UseDropProps<Data> = {
  // To check that the element can qualify as a target
  isDropTarget: (target: UsableElement) => Data | false;

  // Distance from an edge to set nearEdge to true in swapDropTarget
  edgeDistanceThreshold?: number;

  // Given the potential target that has passed the isDropTarget check,
  // and the position of the pointer on the target,
  // you can swap to another target
  swapDropTarget: (
    // undefined is passed when no suitable element is found under the pointer
    dropTarget: (PartialDropTarget<Data> & { nearEdge: boolean }) | undefined
  ) => PartialDropTarget<Data>;

  onDropTargetChange: (dropTarget: DropTarget<Data>) => void;
};

export type UseDropHandlers = {
  handleMove: (pointerCoordinates: { x: number; y: number }) => void;
  handleScroll: () => void;
  handleEnd: () => void;
  rootRef: (target: Element | null) => void;
};

const getInitialState = <Data>() => {
  return {
    root: undefined as UsableElement | undefined,
    pointerCoordinates: undefined as { x: number; y: number } | undefined,
    dropTarget: undefined as DropTarget<Data> | undefined,
    childrenRectsCache: new WeakMap<UsableElement, Rect[]>(),
    lastCandidateElement: undefined as UsableElement | undefined,
    lastCandidateIsNearEdge: undefined as boolean | undefined,
  };
};

export const useDrop = <Data>(props: UseDropProps<Data>): UseDropHandlers => {
  // We want to use fresh props every time we use them,
  // but we don't need to react to updates.
  // So we can put them in a ref and make useMemo below very efficient.
  const latestProps = useRef<UseDropProps<Data>>(props);
  latestProps.current = props;

  const state = useRef(getInitialState<Data>());

  // We want to return a stable object to avoid re-renders when it's a dependency
  return useMemo(() => {
    const getChildrenRects = (parent: UsableElement, parentRect: Rect) => {
      const fromCache = state.current.childrenRectsCache.get(parent);
      if (fromCache !== undefined) {
        return fromCache;
      }

      // We convert to relative coordinates to be able to store the result in cache.
      // Otherwise we would have to clear cache on scroll.
      const toRelativeCoordinates = (rect: Rect) => ({
        left: rect.left - parentRect.left,
        top: rect.top - parentRect.top,
        width: rect.width,
        height: rect.height,
      });

      const result = Array.from(parent.children).map((child) =>
        toRelativeCoordinates(child.getBoundingClientRect())
      );

      state.current.childrenRectsCache.set(parent, result);
      return result;
    };

    const setDropTarget = (partialDropTarget: PartialDropTarget<Data>) => {
      const { pointerCoordinates } = state.current;
      if (pointerCoordinates === undefined) {
        return;
      }

      const parentRect = partialDropTarget.element.getBoundingClientRect();

      const pointerRelativeToParent = {
        x: pointerCoordinates.x - parentRect.left,
        y: pointerCoordinates.y - parentRect.top,
      };

      const childrenRects = getChildrenRects(
        partialDropTarget.element,
        parentRect
      );

      const closestChildIndex =
        childrenRects.length === 0
          ? 0
          : getClosestRectIndex(childrenRects, pointerRelativeToParent);
      const closestChildRect = childrenRects[closestChildIndex] as
        | Rect
        | undefined;

      const childrenOrientation = getLocalChildrenOrientation(
        partialDropTarget.element,
        childrenRects,
        closestChildIndex
      );

      const indexAdjustment = getIndexAdjustment(
        pointerRelativeToParent,
        closestChildRect,
        childrenOrientation
      );

      const indexWithinChildren = closestChildIndex + indexAdjustment;

      const current = state.current.dropTarget;
      if (
        current === undefined ||
        current.element !== partialDropTarget.element ||
        current.indexWithinChildren !== indexWithinChildren ||
        !isEqualRect(current.rect, parentRect)
      ) {
        const side =
          childrenOrientation === "horizontal"
            ? indexAdjustment > 0
              ? "right"
              : "left"
            : indexAdjustment > 0
            ? "bottom"
            : "top";

        const toGlobalCoordinates = (placement: Placement | undefined) =>
          placement && {
            ...placement,
            x: placement.x + parentRect.left,
            y: placement.y + parentRect.top,
          };

        const neighbourRect = childrenRects[
          indexAdjustment === 0 ? closestChildIndex - 1 : closestChildIndex + 1
        ] as Rect | undefined;

        const placement =
          toGlobalCoordinates(
            getPlacementBetween(closestChildRect, neighbourRect)
          ) ||
          toGlobalCoordinates(
            getPlacementNextTo(parentRect, closestChildRect, side)
          ) ||
          getPlacementInside(parentRect, childrenOrientation);

        const dropTarget: DropTarget<Data> = {
          ...partialDropTarget,
          rect: parentRect,
          indexWithinChildren,
          placement,
        };

        state.current.dropTarget = dropTarget;
        latestProps.current.onDropTargetChange(dropTarget);
      }
    };

    const detectTarget = () => {
      const {
        edgeDistanceThreshold = 3,
        isDropTarget,
        swapDropTarget,
      } = latestProps.current;

      const { pointerCoordinates, root } = state.current;

      // @todo: Cache this?
      // Not expensive by itself, but it may call isDropTarget multiple times.
      let candidate =
        root &&
        findClosestDropTarget({
          root,
          initialElement:
            pointerCoordinates &&
            toUseableElement(
              document.elementFromPoint(
                pointerCoordinates.x,
                pointerCoordinates.y
              )
            ),
          isDropTarget,
        });

      const isNewCandidate =
        candidate?.element !== state.current.lastCandidateElement;
      state.current.lastCandidateElement = candidate?.element;
      const candidateIsNearEdge =
        candidate &&
        pointerCoordinates &&
        isNearEdge(
          pointerCoordinates,
          edgeDistanceThreshold,
          candidate.element.getBoundingClientRect()
        );
      const isNewIsNearEdge =
        candidateIsNearEdge !== state.current.lastCandidateIsNearEdge;
      state.current.lastCandidateIsNearEdge = candidateIsNearEdge;

      // to avoid calling swapDropTarget unnecessarily on every pointermove
      if (!isNewCandidate && !isNewIsNearEdge) {
        return;
      }

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const swappedTo = swapDropTarget(
          candidate &&
            pointerCoordinates && {
              ...candidate,
              nearEdge: isNearEdge(
                pointerCoordinates,
                edgeDistanceThreshold,
                candidate.element.getBoundingClientRect()
              ),
            }
        );

        if (swappedTo.element === candidate?.element) {
          setDropTarget(candidate);
          return;
        }

        candidate = swappedTo;
      }
    };

    return {
      handleMove(pointerCoordinates) {
        state.current.pointerCoordinates = pointerCoordinates;
        detectTarget();
      },

      handleScroll() {
        detectTarget();
      },

      handleEnd() {
        state.current = getInitialState();
      },

      rootRef(rootElement) {
        state.current.root = toUseableElement(rootElement);
      },
    };
  }, []);
};

// @todo: maybe rather than climbing the DOM tree,
// we should use document.elementsFromPoint() array?
// Might work better with absolutly positioned elements.
const findClosestDropTarget = <Data>({
  root,
  initialElement,
  isDropTarget,
}: {
  root: UsableElement;
  initialElement: UsableElement | undefined;
  isDropTarget: (target: UsableElement) => Data | false;
}): PartialDropTarget<Data> | undefined => {
  // The element we get from elementFromPoint() might not be inside the root
  if (!initialElement || !root.contains(initialElement)) {
    return undefined;
  }

  let currentElement: UsableElement | undefined = initialElement;
  while (currentElement !== undefined) {
    const data = isDropTarget(currentElement);
    if (data !== false) {
      return { data: data, element: currentElement };
    }
    if (currentElement === root) {
      break;
    }
    currentElement = toUseableElement(currentElement.parentElement);
  }
};
