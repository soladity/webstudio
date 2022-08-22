import {
  type InstanceProps,
  type Instance,
  allUserPropsContainer,
} from "@webstudio-is/react-sdk";
import { selectedInstanceContainer } from "./nano-states";
import { cloneInstance } from "~/shared/tree-utils";
import { cloneProps } from "~/shared/props-utils";
import { publish } from "~/shared/pubsub";

let currentInstance: Instance | undefined;
let currentProps: InstanceProps | undefined;

export const copy = () => {
  if (selectedInstanceContainer.value === undefined) return;
  currentInstance = selectedInstanceContainer.value;
  currentProps = allUserPropsContainer.value[currentInstance.id];
};

export const paste = () => {
  if (currentInstance === undefined) return;
  const instance = cloneInstance(currentInstance);
  const props = currentProps
    ? cloneProps(currentProps, { instanceId: instance.id })
    : undefined;
  publish({
    type: "insertInstance",
    payload: {
      instance,
      props,
    },
  });
};
