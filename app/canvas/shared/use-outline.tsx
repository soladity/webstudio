import { useMemo } from "react";
import { createPortal } from "react-dom";
import { getBoundingClientRect } from "~/shared/dom-utils";
import { primitives } from "~/shared/component";
import {
  useHoveredElement,
  useSelectedElement,
  useSelectedInstance,
} from "./nano-values";
import { styled, darkTheme } from "~/shared/design-system";
import { type Instance } from "@webstudio-is/sdk";

const Outline = styled("div", {
  position: "absolute",
  pointerEvents: "none",
  outline: "1px solid $blue9",
  outlineOffset: -1,
  // This can be rewriten using normal node once needed
  "&::before": {
    display: "flex",
    content: "attr(data-label)",
    padding: "0 $1",
    marginTop: "-$4",
    height: "$4",
    position: "absolute",
    backgroundColor: "$blue9",
    color: "$hiContrast",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "$2",
    fontFamily: "$sans",
    lineHeight: 1,
    minWidth: "$6",
  },
});

export const useOutline = (currentInstance: Instance) => {
  const [selectedInstance] = useSelectedInstance();
  const [selectedElement] = useSelectedElement();
  const [hoveredElement] = useHoveredElement();

  const element =
    currentInstance === selectedInstance ? selectedElement : hoveredElement;
  const component = element?.dataset?.component;

  const style = useMemo(() => {
    if (element === undefined) return undefined;
    const rect = getBoundingClientRect(element);
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }, [element]);

  if (component === undefined || style === undefined) {
    return null;
  }

  const primitive = primitives[component as Instance["component"]];

  return createPortal(
    <Outline
      data-label={primitive.label}
      style={style}
      className={darkTheme}
    />,
    document.body
  );
};
