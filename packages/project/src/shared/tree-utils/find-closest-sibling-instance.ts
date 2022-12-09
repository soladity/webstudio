import { type Instance } from "@webstudio-is/react-sdk";

export const findClosestSiblingInstance = (
  instance: Instance,
  instanceId: Instance["id"]
): Instance | undefined => {
  if (instance.children.length === 0) {
    return;
  }
  const children = instance.children.filter(
    (instance) => typeof instance === "object"
  ) as Array<Instance>;
  const index = children.findIndex((instance) => instance.id === instanceId);
  if (index === -1) {
    return;
  }
  const nextInstance = children[index + 1];
  if (nextInstance !== undefined) {
    return nextInstance;
  }
  const previousInstance = children[index - 1];
  return previousInstance;
};
