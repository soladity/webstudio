import { expect, test } from "@jest/globals";
import type { Instance, Instances, InstancesItem } from "../schema/instances";
import { findTreeInstanceIds } from "./instances-utils";

const createInstance = (
  id: Instance["id"],
  component: string,
  children: InstancesItem["children"]
): InstancesItem => {
  return {
    type: "instance",
    id,
    component,
    children,
  };
};

const createInstancePair = (
  id: Instance["id"],
  component: string,
  children: InstancesItem["children"]
) => {
  return [id, createInstance(id, component, children)] as const;
};

test("find all tree instances", () => {
  const instances: Instances = new Map([
    createInstancePair("1", "Body", [{ type: "id", value: "3" }]),
    // this is outside of subtree
    createInstancePair("2", "Box", []),
    // these should be matched
    createInstancePair("3", "Box", [
      { type: "id", value: "4" },
      { type: "id", value: "5" },
    ]),
    createInstancePair("4", "Box", []),
    createInstancePair("5", "Box", []),
    // this one is from other tree
    createInstancePair("6", "Box", []),
  ]);
  expect(findTreeInstanceIds(instances, "3")).toEqual(new Set(["3", "4", "5"]));
});
