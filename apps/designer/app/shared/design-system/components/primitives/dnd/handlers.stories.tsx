import { ComponentMeta } from "@storybook/react";
import React, { useRef, useState } from "react";
import { Box } from "../../box";
import { useDropTarget } from "./use-drop-target";
import { useDrag } from "./use-drag";
import { getPlacement, PlacementIndicator, type Rect } from "./placement";
import { useAutoScroll } from "./use-auto-scroll";

export const Playground = () => {
  const [dropTargetRect, setDropTargetRect] = useState<Rect>();
  const [placementIndicatorRect, setPlacementIndicatorRect] = useState<Rect>();
  const holdRef = useRef<HTMLElement>();
  const dragItemRef = useRef<HTMLElement>();

  const handleHoldEnd = () => {
    holdRef.current?.style.removeProperty("background");
  };

  const dropTargetHandlers = useDropTarget({
    isDropTarget(element: HTMLElement) {
      return element.dataset.draggable === "true";
    },
    onDropTargetChange({ rect, target }) {
      setDropTargetRect(rect);
      const placementRect = getPlacement({ target });
      setPlacementIndicatorRect(placementRect);
    },
    onHold({ target }: { target: HTMLElement }) {
      handleHoldEnd();
      holdRef.current = target;
      target.style.background = "red";
    },
  });

  const autoScrollHandlers = useAutoScroll();

  const dragProps = useDrag({
    onStart(event) {
      if (event.target.dataset.draggable === "false") {
        event.cancel();
        return;
      }
      dragItemRef.current = event.target;
      autoScrollHandlers.setEnabled(true);
    },
    onMove: (poiterCoordinate) => {
      dropTargetHandlers.handleMove(poiterCoordinate);
      autoScrollHandlers.handleMove(poiterCoordinate);
    },
    onEnd() {
      dropTargetHandlers.handleEnd();
      setDropTargetRect(undefined);
      setPlacementIndicatorRect(undefined);
      handleHoldEnd();
      autoScrollHandlers.setEnabled(false);
    },
    onShiftChange({ shifts }) {
      if (dragItemRef.current) {
        dragItemRef.current.textContent = `shifted ${shifts}`;
      }
    },
  });

  return (
    <Box
      {...dragProps}
      ref={(el) => {
        dropTargetHandlers.rootRef(el);
        autoScrollHandlers.targetRef(el);
      }}
      css={{ display: "block", overflow: "auto", height: 500 }}
      onScroll={dropTargetHandlers.handleScroll}
    >
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$cyanA9" />
      <Item background="$slateA9" />
      <Item background="$blueA9" draggable={false}>
        Not Draggable
      </Item>
      <Outline rect={dropTargetRect} />
      <PlacementIndicator rect={placementIndicatorRect} />
    </Box>
  );
};

export default {} as ComponentMeta<typeof Playground>;

const Item = ({
  background,
  draggable = true,
  children,
}: {
  background: string;
  draggable?: boolean;
  children?: React.ReactNode;
}) => (
  <Box
    css={{ height: 100, width: 100, background, margin: 10 }}
    data-draggable={draggable}
  >
    {children}
  </Box>
);

const Outline = ({ rect }: { rect?: Rect }) => {
  if (rect === undefined) return null;
  const style = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
  return (
    <Box
      style={style}
      css={{
        position: "absolute",
        pointerEvents: "none",
        outline: "1px solid red",
        outlineOffset: -1,
      }}
    />
  );
};
