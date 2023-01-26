import ObjectId from "bson-objectid";
import produce from "immer";
import type { Instance } from "@webstudio-is/project-build";

const updateIds = (instance: Instance) => {
  instance.id = ObjectId().toString();
  for (const child of instance.children) {
    if (child.type === "text") {
      continue;
    }
    updateIds(child);
  }
};

export const cloneInstance = (instance: Instance): Instance =>
  produce(updateIds)(instance);
