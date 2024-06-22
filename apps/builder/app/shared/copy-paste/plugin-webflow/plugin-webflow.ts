import type { Instance, WebstudioFragment } from "@webstudio-is/sdk";
import {
  computeInstancesConstraints,
  findAvailableDataSources,
  findClosestDroppableTarget,
  insertInstanceChildrenMutable,
  insertWebstudioFragmentCopy,
  updateWebstudioData,
} from "../../instance-utils";
import {
  $instances,
  $registeredComponentMetas,
  $selectedInstanceSelector,
  $selectedPage,
} from "../../nano-states";
import { WfData, WfNode, WfStyle, wfNodeTypes } from "./schema";
import { addInstanceAndProperties } from "./instances-properties";
import { addStyles } from "./styles";
import { builderApi } from "~/shared/builder-api";
import { denormalizeSrcProps } from "../asset-upload";

const { toast } = builderApi;

export const mimeType = "application/json";

const toWebstudioFragment = async (wfData: WfData) => {
  const fragment: WebstudioFragment = {
    children: [],
    instances: [],
    props: [],
    breakpoints: [],
    styles: [],
    styleSources: [],
    styleSourceSelections: [],
    dataSources: [],
    resources: [],
    assets: [],
  };

  const wfNodes = new Map<WfNode["_id"], WfNode>();
  for (const node of wfData.payload.nodes) {
    if ("type" in node || "text" in node) {
      wfNodes.set(node._id, node);
    }
  }
  const wfStyles = new Map<WfStyle["_id"], WfStyle>(
    wfData.payload.styles.map((style: WfStyle) => [style._id, style])
  );
  // False value used to skip a node.
  const doneNodes = new Map<WfNode["_id"], Instance["id"] | false>();
  for (const wfNode of wfNodes.values()) {
    addInstanceAndProperties(wfNode, doneNodes, wfNodes, fragment);
  }
  await addStyles(wfNodes, wfStyles, doneNodes, fragment);
  // First node should be always the root node in theory, if not
  // we need to find a node that is not a child of any other node.
  const rootWfNode = wfData.payload.nodes[0];
  const rootInstanceId = doneNodes.get(rootWfNode._id);
  if (rootInstanceId === false) {
    return fragment;
  }
  if (rootInstanceId === undefined) {
    console.error(`No root instance id found for node ${rootWfNode._id}`);
    return fragment;
  }
  fragment.children = [
    {
      type: "id",
      value: rootInstanceId,
    },
  ];
  return fragment;
};

const parse = (clipboardData: string) => {
  let data;
  try {
    data = JSON.parse(clipboardData);
  } catch {
    return;
  }

  if (data.type !== "@webflow/XscpData") {
    return;
  }

  const unsupportedNodeTypes: Array<string> = data.payload.nodes
    .filter((node: { type: string }) => {
      return (
        node.type !== undefined &&
        wfNodeTypes.includes(node.type as (typeof wfNodeTypes)[number]) ===
          false
      );
    })
    .map((node: { type: string }) => node.type);

  if (unsupportedNodeTypes.length !== 0) {
    const message = `Skipping unsupported elements: ${unsupportedNodeTypes.join(", ")}`;
    toast.info(message);
    console.info(message);
  }

  const result = WfData.safeParse(data);

  if (result.success) {
    return result.data;
  }

  toast.error(result.error.message);
  console.error(result.error.message);
};

export const onPaste = async (clipboardData: string) => {
  const wfData = parse(clipboardData);
  if (wfData === undefined) {
    return false;
  }
  let fragment = await toWebstudioFragment(wfData);
  const selectedPage = $selectedPage.get();
  if (fragment === undefined || selectedPage === undefined) {
    return false;
  }

  fragment = await denormalizeSrcProps(fragment);

  const metas = $registeredComponentMetas.get();
  const newInstances = new Map(
    fragment.instances.map((instance) => [instance.id, instance])
  );

  // paste to the root if nothing is selected
  const instanceSelector = $selectedInstanceSelector.get() ?? [
    selectedPage.rootInstanceId,
  ];

  const rootInstanceIds = fragment.children
    .filter((child) => child.type === "id")
    .map((child) => child.value);

  const dropTarget = findClosestDroppableTarget(
    metas,
    $instances.get(),
    instanceSelector,
    computeInstancesConstraints(metas, newInstances, rootInstanceIds)
  );

  if (dropTarget === undefined) {
    return false;
  }

  updateWebstudioData((data) => {
    const { newInstanceIds } = insertWebstudioFragmentCopy({
      data,
      fragment,
      availableDataSources: findAvailableDataSources(
        data.dataSources,
        data.instances,
        instanceSelector
      ),
    });

    const children = fragment.children
      .map((child) => {
        if (child.type === "id") {
          const value = newInstanceIds.get(child.value);
          if (value) {
            return { type: "id" as const, value };
          }
        }
      })
      .filter(<T>(value: T): value is NonNullable<T> => value !== undefined);

    insertInstanceChildrenMutable(data, children, dropTarget);
  });

  return true;
};

export const __testing__ = {
  toWebstudioFragment,
};
