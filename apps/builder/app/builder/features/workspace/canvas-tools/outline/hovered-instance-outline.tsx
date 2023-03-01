import { useStore } from "@nanostores/react";
import {
  hoveredInstanceIdStore,
  hoveredInstanceOutlineStore,
  instancesStore,
  selectedInstanceIdStore,
  useTextEditingInstanceId,
} from "~/shared/nano-states";
import { Outline } from "./outline";
import { Label } from "./label";

export const HoveredInstanceOutline = () => {
  const selectedInstanceId = useStore(selectedInstanceIdStore);
  const hoveredInstanceId = useStore(hoveredInstanceIdStore);
  const instanceOutline = useStore(hoveredInstanceOutlineStore);
  const [textEditingInstanceId] = useTextEditingInstanceId();
  const instances = useStore(instancesStore);

  const isEditingText = textEditingInstanceId !== undefined;
  const isHoveringSelectedInstance = selectedInstanceId === hoveredInstanceId;
  const instance = hoveredInstanceId
    ? instances.get(hoveredInstanceId)
    : undefined;

  if (
    instance === undefined ||
    instanceOutline === undefined ||
    isHoveringSelectedInstance ||
    isEditingText
  ) {
    return null;
  }

  return (
    <Outline rect={instanceOutline.rect}>
      <Label instance={instance} instanceRect={instanceOutline.rect} />
    </Outline>
  );
};
