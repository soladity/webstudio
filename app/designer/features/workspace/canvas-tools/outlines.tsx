import { useCanvasRect, useZoom } from "~/designer/shared/nano-states";
import { styled } from "~/shared/design-system";
import { useSelectedInstanceRect } from "~/shared/nano-states";

const Outline = styled(
  "div",
  {
    position: "absolute",
    pointerEvents: "none",
    outline: "2px solid $blue9",
    outlineOffset: -2,
    top: 0,
    left: 0,
  },
  {
    variants: {
      state: {
        selected: {
          zIndex: "$4",
        },
        hovered: {
          zIndex: "$3",
        },
      },
    },
  }
);

const Label = styled(
  "div",
  {
    position: "absolute",
    display: "flex",
    padding: "0 $1",
    height: "$4",
    color: "$hiContrast",
    alignItems: "center",
    justifyContent: "center",
    gap: "$1",
    fontSize: "$2",
    fontFamily: "$sans",
    lineHeight: 1,
    minWidth: "$6",
  },
  {
    variants: {
      state: {
        selected: {
          backgroundColor: "$blue9",
        },
        hovered: {
          color: "$blue9",
        },
      },
      position: {
        outside: {
          top: "-$4",
        },
        inside: {
          top: 0,
        },
      },
    },
  }
);

type SelectedInstanceOutlineProps = {
  toolsRect: Omit<DOMRect, "toJSON">;
};

export const SelectedInstanceOutline = ({
  toolsRect,
}: SelectedInstanceOutlineProps) => {
  const [instanceRect] = useSelectedInstanceRect();
  const [canvasRect] = useCanvasRect();
  const [zoom] = useZoom();
  console.log("canvasRect", canvasRect);
  if (
    canvasRect === undefined ||
    instanceRect === undefined ||
    toolsRect === undefined
  ) {
    return null;
  }

  let style;
  console.log("zoom", zoom);
  const top =
    (canvasRect.top - toolsRect.top + instanceRect.top) * (zoom / 100);
  const left = canvasRect.left - toolsRect.left + instanceRect.left;

  style = {
    top,
    left,
    width: instanceRect.width,
    height: instanceRect.height,
  };

  return <Outline state="selected" style={style} />;
};
