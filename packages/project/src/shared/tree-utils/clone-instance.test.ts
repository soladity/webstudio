import { describe, test, expect } from "@jest/globals";
import type { Instance } from "@webstudio-is/project-build";
import { cloneInstance } from "./clone-instance";

const getIds = (instance: Instance, ids: Array<Instance["id"]> = []) => {
  ids.push(instance.id);
  for (const child of instance.children) {
    if (child.type === "instance") {
      getIds(child);
    }
  }
  return ids;
};

describe("Clone instance", () => {
  test("ensure new ids", () => {
    const instance: Instance = {
      type: "instance",
      component: "Box",
      id: "1",
      children: [
        {
          type: "instance",
          component: "Box",
          id: "2",
          children: [
            {
              type: "instance",
              component: "Box",
              id: "3",
              children: [],
            },
          ],
        },
      ],
    };

    const ids = getIds(instance);
    const clone = cloneInstance(instance);
    const clonedIds = getIds(clone);
    ids.forEach((id, index) => {
      expect(id).not.toBe(clonedIds[index]);
    });
  });
});
