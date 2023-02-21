import type { Instance } from "@webstudio-is/project-build";

export const getInstancePathWithPositions = (
  instance: Instance,
  instanceId: Instance["id"]
) => {
  const path = [];

  const find = (instance: Instance) => {
    if (instance.id === instanceId) {
      return true;
    }
    for (let index = 0; index < instance.children.length; index++) {
      const child = instance.children[index];
      if (child.type === "text") {
        continue;
      }
      const found = find(child);
      if (found) {
        path.push({ item: child, position: index });
        return true;
      }
    }
  };

  if (find(instance)) {
    path.push({ item: instance, position: 0 });
  }

  return path.reverse();
};
