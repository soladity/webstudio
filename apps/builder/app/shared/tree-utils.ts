import { nanoid } from "nanoid";
import {
  Breakpoint,
  Breakpoints,
  findTreeInstanceIds,
  findTreeInstanceIdsExcludingSlotDescendants,
  getStyleDeclKey,
  Instance,
  Instances,
  Prop,
  Props,
  StyleDecl,
  Styles,
  StyleSource,
  StyleSources,
  StyleSourceSelection,
  StyleSourceSelections,
  StyleSourceSelectionsList,
  StyleSourcesList,
} from "@webstudio-is/project-build";
import { equalMedia } from "@webstudio-is/css-engine";
import type { WsComponentMeta } from "@webstudio-is/react-sdk";

// slots can have multiple parents so instance should be addressed
// with full rendered path to avoid double selections with slots
// and support deletion of slot child from specific parent
// selector starts with target instance and ends with root
export type InstanceSelector = Instance["id"][];

// provide a selector starting with ancestor id
// useful to select parent instance or one of breadcrumbs instances
export const getAncestorInstanceSelector = (
  instanceSelector: InstanceSelector,
  ancestorId: Instance["id"]
): undefined | InstanceSelector => {
  const ancestorIndex = instanceSelector.indexOf(ancestorId);
  if (ancestorIndex === -1) {
    return undefined;
  }
  return instanceSelector.slice(ancestorIndex);
};

export const areInstanceSelectorsEqual = (
  left?: InstanceSelector,
  right?: InstanceSelector
) => {
  if (left === undefined || right === undefined) {
    return false;
  }
  return left.join(",") === right.join(",");
};

export type DroppableTarget = {
  parentSelector: InstanceSelector;
  position: number | "end";
};

const getInstanceOrCreateFragmentIfNecessary = (
  instances: Instances,
  dropTarget: DroppableTarget
) => {
  const [parentId] = dropTarget.parentSelector;
  const instance = instances.get(parentId);
  if (instance === undefined) {
    return;
  }
  // slot should accept only single child
  // otherwise multiple slots will have to maintain own children
  // here all slot children are wrapped with fragment instance
  if (instance.component === "Slot") {
    if (instance.children.length === 0) {
      const id = nanoid();
      const fragment: Instance = {
        type: "instance",
        id,
        component: "Fragment",
        children: [],
      };
      instances.set(id, fragment);
      instance.children.push({ type: "id", value: id });
      return {
        parentSelector: [fragment.id, ...dropTarget.parentSelector],
        position: dropTarget.position,
      };
    }
    // first slot child is always fragment
    if (instance.children[0].type === "id") {
      const fragmentId = instance.children[0].value;
      return {
        parentSelector: [fragmentId, ...dropTarget.parentSelector],
        position: dropTarget.position,
      };
    }
  }
  return;
};

/**
 * Navigator tree and canvas dnd do not have text representation
 * and position does not consider it and include only instances.
 * This function adjust the position to consider text children
 */
const adjustChildrenPosition = (
  children: Instance["children"],
  position: number
) => {
  let newPosition = 0;
  let idPosition = 0;
  for (let index = 0; index < children.length; index += 1) {
    newPosition = index;
    if (idPosition === position) {
      return newPosition;
    }
    const child = children[index];
    if (child.type === "id") {
      idPosition += 1;
    }
  }
  // the index after last item
  return newPosition + 1;
};

/**
 * Wrap children before and after drop target with spans
 * to preserve lexical specific components while allowing
 * to insert into editable components
 */
const wrapEditableChildrenAroundDropTargetMutable = (
  instances: Instances,
  props: Props,
  metas: Map<string, WsComponentMeta>,
  dropTarget: DroppableTarget
) => {
  const [parentId] = dropTarget.parentSelector;
  const parentInstance = instances.get(parentId);
  if (parentInstance === undefined || parentInstance.children.length === 0) {
    return;
  }
  // wrap only containers with text and rich text childre
  for (const child of parentInstance.children) {
    if (child.type === "id") {
      const childInstance = instances.get(child.value);
      if (childInstance === undefined) {
        return;
      }
      const childMeta = metas.get(childInstance.component);
      if (childMeta?.type !== "rich-text-child") {
        return;
      }
    }
  }
  const position =
    dropTarget.position === "end"
      ? parentInstance.children.length
      : adjustChildrenPosition(parentInstance.children, dropTarget.position);

  const newChildren: Instance["children"] = [];
  let newPosition = 0;
  // create left span when not at the beginning
  if (position !== 0) {
    const leftSpan: Instance = {
      id: nanoid(),
      type: "instance",
      component: "Text",
      children: parentInstance.children.slice(0, position),
    };
    newChildren.push({ type: "id", value: leftSpan.id });
    instances.set(leftSpan.id, leftSpan);
    const tagProp: Prop = {
      id: nanoid(),
      instanceId: leftSpan.id,
      type: "string",
      name: "tag",
      value: "span",
    };
    props.set(tagProp.id, tagProp);
    newPosition = 1;
  }
  // create right span when not in the end
  if (position < parentInstance.children.length) {
    const rightSpan: Instance = {
      id: nanoid(),
      type: "instance",
      component: "Text",
      children: parentInstance.children.slice(position),
    };
    newChildren.push({ type: "id", value: rightSpan.id });
    instances.set(rightSpan.id, rightSpan);
    const tagProp: Prop = {
      id: nanoid(),
      instanceId: rightSpan.id,
      type: "string",
      name: "tag",
      value: "span",
    };
    props.set(tagProp.id, tagProp);
  }
  parentInstance.children = newChildren;
  return {
    parentSelector: dropTarget.parentSelector,
    position: newPosition,
  };
};

const getSlotFragmentSelector = (
  instances: Instances,
  instanceSelector: InstanceSelector
) => {
  const instance = instances.get(instanceSelector[0]);
  if (
    instance?.component !== "Slot" ||
    instance.children.length === 0 ||
    instance.children[0].type !== "id"
  ) {
    return;
  }
  // first slot child is always fragment
  return [instance.children[0].value, ...instanceSelector];
};

export const reparentInstanceMutable = (
  instances: Instances,
  props: Props,
  metas: Map<string, WsComponentMeta>,
  instanceSelector: InstanceSelector,
  dropTarget: DroppableTarget
) => {
  const [instanceId, parentInstanceId] = instanceSelector;
  const prevParent =
    parentInstanceId === undefined
      ? undefined
      : instances.get(parentInstanceId);
  dropTarget =
    getInstanceOrCreateFragmentIfNecessary(instances, dropTarget) ?? dropTarget;
  dropTarget =
    wrapEditableChildrenAroundDropTargetMutable(
      instances,
      props,
      metas,
      dropTarget
    ) ?? dropTarget;
  const [parentId] = dropTarget.parentSelector;
  const nextParent = instances.get(parentId);
  const instance = instances.get(instanceId);

  // delect is target is one of own descendants
  // prevent reparenting to avoid infinite loop
  const instanceDescendants = findTreeInstanceIds(instances, instanceId);
  for (const instanceId of instanceDescendants) {
    if (dropTarget.parentSelector.includes(instanceId)) {
      return;
    }
  }

  if (
    prevParent === undefined ||
    nextParent === undefined ||
    instance === undefined
  ) {
    return;
  }

  const prevPosition = prevParent.children.findIndex(
    (child) => child.type === "id" && child.value === instanceId
  );
  if (prevPosition === -1) {
    return;
  }

  // if parent is the same, we need to adjust the position
  // to account for the removal of the instance.
  let nextPosition = dropTarget.position;
  if (
    nextPosition !== "end" &&
    prevParent.id === nextParent.id &&
    prevPosition < nextPosition
  ) {
    nextPosition -= 1;
  }

  const [child] = prevParent.children.splice(prevPosition, 1);
  if (nextPosition === "end") {
    nextParent.children.push(child);
  } else {
    nextParent.children.splice(nextPosition, 0, child);
  }
};

export const cloneStyles = (
  styles: Styles,
  clonedStyleSourceIds: Map<Instance["id"], Instance["id"]>
) => {
  const clonedStyles: StyleDecl[] = [];
  for (const styleDecl of styles.values()) {
    const styleSourceId = clonedStyleSourceIds.get(styleDecl.styleSourceId);
    if (styleSourceId === undefined) {
      continue;
    }
    clonedStyles.push({
      ...styleDecl,
      styleSourceId,
    });
  }
  return clonedStyles;
};

export const findLocalStyleSourcesWithinInstances = (
  styleSources: IterableIterator<StyleSource> | StyleSourcesList,
  styleSourceSelections:
    | IterableIterator<StyleSourceSelection>
    | StyleSourceSelectionsList,
  instanceIds: Set<Instance["id"]>
) => {
  const localStyleSourceIds = new Set<StyleSource["id"]>();
  for (const styleSource of styleSources) {
    if (styleSource.type === "local") {
      localStyleSourceIds.add(styleSource.id);
    }
  }

  const subtreeLocalStyleSourceIds = new Set<StyleSource["id"]>();
  for (const { instanceId, values } of styleSourceSelections) {
    // skip selections outside of subtree
    if (instanceIds.has(instanceId) === false) {
      continue;
    }
    // find only local style sources on selections
    for (const styleSourceId of values) {
      if (localStyleSourceIds.has(styleSourceId)) {
        subtreeLocalStyleSourceIds.add(styleSourceId);
      }
    }
  }

  return subtreeLocalStyleSourceIds;
};

export const insertInstancesMutable = (
  instances: Instances,
  props: Props,
  metas: Map<string, WsComponentMeta>,
  insertedInstances: Instance[],
  children: Instance["children"],
  dropTarget: DroppableTarget
) => {
  dropTarget =
    getInstanceOrCreateFragmentIfNecessary(instances, dropTarget) ?? dropTarget;
  dropTarget =
    wrapEditableChildrenAroundDropTargetMutable(
      instances,
      props,
      metas,
      dropTarget
    ) ?? dropTarget;
  const [parentId] = dropTarget.parentSelector;
  const parentInstance = instances.get(parentId);
  if (parentInstance === undefined) {
    return;
  }

  let treeRootInstanceId: undefined | Instance["id"] = undefined;
  for (const instance of insertedInstances) {
    if (treeRootInstanceId === undefined) {
      treeRootInstanceId = instance.id;
    }
    instances.set(instance.id, instance);
  }
  if (treeRootInstanceId === undefined) {
    return;
  }

  const { position } = dropTarget;
  if (position === "end") {
    parentInstance.children.push(...children);
  } else {
    parentInstance.children.splice(position, 0, ...children);
  }
};

export const insertInstancesCopyMutable = (
  instances: Instances,
  props: Props,
  metas: Map<string, WsComponentMeta>,
  copiedInstances: Instance[],
  dropTarget: DroppableTarget
) => {
  const newInstances: Instances = new Map();
  for (const instance of copiedInstances) {
    newInstances.set(instance.id, instance);
  }
  const newInstanceIds = findTreeInstanceIdsExcludingSlotDescendants(
    newInstances,
    copiedInstances[0].id
  );

  const copiedInstanceIds = new Map<Instance["id"], Instance["id"]>();
  const copiedInstancesWithNewIds: Instance[] = [];
  for (const instanceId of newInstanceIds) {
    const newInstanceId = nanoid();
    copiedInstanceIds.set(instanceId, newInstanceId);
  }

  const preservedChildIds = new Set<Instance["id"]>();

  for (const instance of copiedInstances) {
    const newInstanceId = copiedInstanceIds.get(instance.id);
    if (newInstanceId === undefined) {
      if (instances.has(instance.id) === false) {
        instances.set(instance.id, instance);
      }
      continue;
    }

    copiedInstancesWithNewIds.push({
      ...instance,
      id: newInstanceId,
      children: instance.children.map((child) => {
        if (child.type === "id") {
          if (newInstanceIds.has(child.value) === false) {
            preservedChildIds.add(child.value);
          }
          return {
            type: "id",
            value: copiedInstanceIds.get(child.value) ?? child.value,
          };
        }
        return child;
      }),
    });
  }

  // slot descendants ids are preserved
  // so need to prevent pasting slot inside itself
  // to avoid circular tree
  const dropTargetSelector =
    // consider slot fragment when check for cycles to avoid cases like pasting slot directly into slot
    getSlotFragmentSelector(instances, dropTarget.parentSelector) ??
    dropTarget.parentSelector;
  for (const instanceId of dropTargetSelector) {
    if (preservedChildIds.has(instanceId)) {
      return new Map();
    }
  }

  insertInstancesMutable(
    instances,
    props,
    metas,
    copiedInstancesWithNewIds,
    // consider the first instance as child
    [
      {
        type: "id",
        value: copiedInstancesWithNewIds[0].id,
      },
    ],
    dropTarget
  );

  return copiedInstanceIds;
};

export const insertStyleSourcesCopyMutable = (
  styleSources: StyleSources,
  copiedStyleSources: StyleSource[],
  newStyleSourceIds: Set<StyleSource["id"]>
) => {
  // store map of old ids to new ids to copy dependant data
  const copiedStyleSourceIds = new Map<StyleSource["id"], StyleSource["id"]>();
  for (const styleSource of copiedStyleSources) {
    // insert without changes when style source is shared
    if (newStyleSourceIds.has(styleSource.id) === false) {
      // prevent overriding shared style sources if already exist
      if (styleSources.has(styleSource.id) === false) {
        styleSources.set(styleSource.id, styleSource);
      }
      continue;
    }

    const newStyleSourceId = nanoid();
    copiedStyleSourceIds.set(styleSource.id, newStyleSourceId);
    styleSources.set(newStyleSourceId, {
      ...styleSource,
      id: newStyleSourceId,
    });
  }
  return copiedStyleSourceIds;
};

export const insertPropsCopyMutable = (
  props: Props,
  copiedProps: Prop[],
  copiedInstanceIds: Map<Instance["id"], Instance["id"]>
) => {
  for (const prop of copiedProps) {
    const newInstanceId = copiedInstanceIds.get(prop.instanceId);
    // insert without changes when instance does not have new id
    if (newInstanceId === undefined) {
      // prevent overriding shared props if already exist
      if (props.has(prop.id) === false) {
        props.set(prop.id, prop);
      }
      continue;
    }

    // copy prop before inserting
    const newPropId = nanoid();
    props.set(newPropId, {
      ...prop,
      id: newPropId,
      instanceId: newInstanceId,
    });
  }
};

export const insertStyleSourceSelectionsCopyMutable = (
  styleSourceSelections: StyleSourceSelections,
  copiedStyleSourceSelections: StyleSourceSelection[],
  copiedInstanceIds: Map<Instance["id"], Instance["id"]>,
  copiedStyleSourceIds: Map<StyleSource["id"], StyleSource["id"]>
) => {
  for (const styleSourceSelection of copiedStyleSourceSelections) {
    // insert without changes when style source selection does not have new instance id
    const { instanceId } = styleSourceSelection;
    const newInstanceId = copiedInstanceIds.get(instanceId);
    if (newInstanceId === undefined) {
      // prevent overriding shared style source selections if already exist
      if (styleSourceSelections.has(instanceId) === false) {
        styleSourceSelections.set(instanceId, styleSourceSelection);
      }
      continue;
    }

    const newValues = styleSourceSelection.values.map(
      (styleSourceId) =>
        // preserve shared style source ids
        copiedStyleSourceIds.get(styleSourceId) ?? styleSourceId
    );
    styleSourceSelections.set(newInstanceId, {
      instanceId: newInstanceId,
      values: newValues,
    });
  }
};

export const insertStylesCopyMutable = (
  styles: Styles,
  copiedStyles: StyleDecl[],
  copiedStyleSourceIds: Map<StyleSource["id"], StyleSource["id"]>,
  mergedBreakpointIds: Map<Breakpoint["id"], Breakpoint["id"]>
) => {
  for (const styleDecl of copiedStyles) {
    const newStyleSourceId = copiedStyleSourceIds.get(styleDecl.styleSourceId);
    // fallback to old id in case breakpoint was added without changes
    const newBreakpointId =
      mergedBreakpointIds.get(styleDecl.breakpointId) ?? styleDecl.breakpointId;
    // insert without changes when style source does not have new id
    if (newStyleSourceId === undefined) {
      const newStyleDecl = {
        ...styleDecl,
        breakpointId: newBreakpointId,
      };
      const styleDeclKey = getStyleDeclKey(newStyleDecl);
      // prevent overriding shared styles if already exist
      if (styles.has(styleDeclKey) === false) {
        styles.set(styleDeclKey, newStyleDecl);
      }
      continue;
    }

    const styleDeclCopy = {
      ...styleDecl,
      styleSourceId: newStyleSourceId,
      breakpointId: newBreakpointId,
    };
    styles.set(getStyleDeclKey(styleDeclCopy), styleDeclCopy);
  }
};

export const mergeNewBreakpointsMutable = (
  breakpoints: Breakpoints,
  newBreakpoints: Breakpoint[]
) => {
  const mergedBreakpointIds = new Map<Breakpoint["id"], Breakpoint["id"]>();
  for (const newBreakpoint of newBreakpoints) {
    let matched = false;
    for (const breakpoint of breakpoints.values()) {
      if (equalMedia(breakpoint, newBreakpoint)) {
        matched = true;
        mergedBreakpointIds.set(newBreakpoint.id, breakpoint.id);
        break;
      }
    }
    if (matched === false) {
      breakpoints.set(newBreakpoint.id, newBreakpoint);
    }
  }
  return mergedBreakpointIds;
};
