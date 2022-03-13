import produce from "immer";
import { type Instance } from "@webstudio-is/sdk";
import { populateInstance } from "./populate";
import { createInstance } from "./create-instance";

export type InstanceInsertionSpec = {
  component: Instance["component"];
  parentId: Instance["id"];
  id: Instance["id"];
  position: number | "end";
};

export const insertInstanceMutable = (
  rootInstance: Instance,
  instance: Instance,
  spec: Pick<InstanceInsertionSpec, "parentId" | "position">
): boolean => {
  if (spec.parentId !== rootInstance.id) {
    for (const child of rootInstance.children) {
      if (typeof child === "string") continue;
      const hasInserted = insertInstanceMutable(child, instance, spec);
      if (hasInserted === true) return true;
    }
    return false;
  }

  // Inserting inside the selected/hovered instance.
  if (typeof spec.position === "number") {
    rootInstance.children.splice(spec.position, 0, instance);
    return true;
  }

  // Inserting after all children
  if (spec.position === "end") {
    rootInstance.children.push(instance);
    return true;
  }

  return true;
};

export const insertInstance = (
  spec: InstanceInsertionSpec,
  rootInstance: Instance,
  options: { populate?: boolean } = { populate: true }
) => {
  const newInstance = createInstance({
    component: spec.component,
    id: spec.id,
  });
  const populatedInstance = options.populate
    ? populateInstance(newInstance)
    : newInstance;

  const updatedInstance = produce(rootInstance, (draftRootInstance) => {
    insertInstanceMutable(draftRootInstance, populatedInstance, spec);
  });

  return {
    instance: updatedInstance,
    insertedInstance: populatedInstance,
  };
};
