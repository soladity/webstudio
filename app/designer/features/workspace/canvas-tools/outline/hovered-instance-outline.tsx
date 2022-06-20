import { useMemo } from "react";
import { useHoveredInstanceRect } from "~/shared/nano-states";
import {
  useHoveredInstanceData,
  useSelectedInstanceData,
} from "~/designer/shared/nano-states";
import { Outline } from "./outline";
import { Label } from "./label";

const useStyle = (rect?: DOMRect) => {
  return useMemo(() => {
    if (rect === undefined) return;
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }, [rect]);
};

export const HoveredInstanceOutline = () => {
  const [selectedInstanceData] = useSelectedInstanceData();
  const [instanceRect] = useHoveredInstanceRect();
  const style = useStyle(instanceRect);
  const [instanceData] = useHoveredInstanceData();

  if (
    style === undefined ||
    instanceData === undefined ||
    instanceRect === undefined ||
    selectedInstanceData?.id === instanceData.id
  ) {
    return null;
  }

  return (
    <Outline style={style}>
      <Label component={instanceData.component} instanceRect={instanceRect} />
    </Outline>
  );
};
