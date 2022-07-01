import {
  useHoveredInstanceRect,
  useTextEditingInstanceId,
} from "~/shared/nano-states";
import {
  useHoveredInstanceData,
  useSelectedInstanceData,
} from "~/designer/shared/nano-states";
import { Outline } from "./outline";
import { Label } from "./label";

export const HoveredInstanceOutline = () => {
  const [selectedInstanceData] = useSelectedInstanceData();
  const [instanceRect] = useHoveredInstanceRect();
  const [hoveredInstanceData] = useHoveredInstanceData();
  const [textEditingInstanceId] = useTextEditingInstanceId();

  const isEditingCurrentInstance =
    textEditingInstanceId === hoveredInstanceData?.id;
  const isHoveringSelectedInstance =
    selectedInstanceData?.id === hoveredInstanceData?.id;

  if (
    hoveredInstanceData === undefined ||
    instanceRect === undefined ||
    isHoveringSelectedInstance ||
    isEditingCurrentInstance
  ) {
    return null;
  }

  return (
    <Outline rect={instanceRect}>
      <Label
        component={hoveredInstanceData.component}
        instanceRect={instanceRect}
      />
    </Outline>
  );
};
