import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import type { Style, StyleProperty, StyleValue } from "@webstudio-is/css-data";
import { properties } from "@webstudio-is/css-data";
import type {
  Breakpoints,
  Instance,
  Instances,
  StyleDecl,
  StyleSource as StyleSourceType,
} from "@webstudio-is/project-build";
import {
  instancesStore,
  selectedInstanceBrowserStyleStore,
  selectedInstanceSelectorStore,
  selectedInstanceIntanceToTagStore,
  selectedStyleSourceStore,
  stylesIndexStore,
  useBreakpoints,
} from "~/shared/nano-states";
import { selectedBreakpointStore } from "~/shared/nano-states/breakpoints";
import type { InstanceSelector } from "~/shared/tree-utils";
import { getComponentMeta } from "@webstudio-is/react-sdk";
import type { htmlTags as HtmlTags } from "html-tags";
import { compareMedia } from "@webstudio-is/css-engine";

type CascadedValueInfo = {
  breakpointId: string;
  value: StyleValue;
};

type CascadedProperties = {
  [property in StyleProperty]?: CascadedValueInfo;
};

type InheritedValueInfo = {
  instanceId: string;
  value: StyleValue;
};

type InheritedProperties = {
  [property in StyleProperty]?: InheritedValueInfo;
};

export type StyleValueInfo = {
  value: StyleValue;
  local?: StyleValue;
  cascaded?: CascadedValueInfo;
  inherited?: InheritedValueInfo;
  preset?: StyleValue;
};

export type StyleInfo = {
  [property in StyleProperty]?: StyleValueInfo;
};

export type StyleSource = "local" | "remote" | "preset" | "default";

export const getStyleSource = (
  ...styleValueInfos: (undefined | StyleValueInfo)[]
): StyleSource => {
  // show source to use if at least one of control properties matches
  // so user could see if something is set or something is inherited
  for (const info of styleValueInfos) {
    if (info?.local) {
      return "local";
    }
  }
  for (const info of styleValueInfos) {
    if (info?.cascaded !== undefined || info?.inherited !== undefined) {
      return "remote";
    }
  }
  for (const info of styleValueInfos) {
    if (info?.preset !== undefined) {
      return "preset";
    }
  }
  return "default";
};

const styleProperties = Object.keys(properties) as StyleProperty[];
const inheritableProperties = new Set<string>();
for (const [property, value] of Object.entries(properties)) {
  if (value.inherited) {
    inheritableProperties.add(property);
  }
}

const getSelectedStyle = (
  stylesByStyleSourceId: Map<StyleSourceType["id"], StyleDecl[]>,
  breakpointId: string,
  styleSourceId: string
) => {
  const style: Style = {};
  const instanceStyles = stylesByStyleSourceId.get(styleSourceId);
  if (instanceStyles === undefined) {
    return style;
  }
  for (const styleDecl of instanceStyles) {
    if (styleDecl.breakpointId === breakpointId) {
      style[styleDecl.property] = styleDecl.value;
    }
  }
  return style;
};

/**
 * find all breakpoints which may affect current view
 */
export const getCascadedBreakpointIds = (
  breakpoints: Breakpoints,
  selectedBreakpointId?: string
) => {
  const sortedBreakpoints = Array.from(breakpoints.values()).sort(compareMedia);
  const cascadedBreakpointIds: string[] = [];
  for (const breakpoint of sortedBreakpoints) {
    if (breakpoint.id === selectedBreakpointId) {
      break;
    }
    cascadedBreakpointIds.push(breakpoint.id);
  }
  return cascadedBreakpointIds;
};

/**
 * extract all styles from breakpoints
 * affecting current view
 */
export const getCascadedInfo = (
  stylesByInstanceId: Map<Instance["id"], StyleDecl[]>,
  instanceId: string,
  cascadedBreakpointIds: string[]
) => {
  const cascadedStyle: CascadedProperties = {};
  const instanceStyles = stylesByInstanceId.get(instanceId);
  if (instanceStyles === undefined) {
    return cascadedStyle;
  }
  for (const breakpointId of cascadedBreakpointIds) {
    for (const styleDecl of instanceStyles) {
      if (styleDecl.breakpointId === breakpointId) {
        cascadedStyle[styleDecl.property] = {
          breakpointId,
          value: styleDecl.value,
        };
      }
    }
  }
  return cascadedStyle;
};

export const getPresetStyle = (
  instances: Instances,
  instanceId: undefined | Instance["id"],
  tagName: HtmlTags
) => {
  if (instanceId === undefined) {
    return;
  }
  const instance = instances.get(instanceId);
  if (instance === undefined) {
    return;
  }
  if (tagName === undefined) {
    return;
  }
  return getComponentMeta(instance.component)?.presetStyle?.[tagName];
};

/**
 * extract all inheritable styles from ancestor instances
 * including active breakpoints
 */
export const getInheritedInfo = (
  instances: Instances,
  stylesByInstanceId: Map<Instance["id"], StyleDecl[]>,
  instanceSelector: InstanceSelector,
  selectedInstanceIntanceToTag: Map<Instance["id"], HtmlTags>,
  cascadedBreakpointIds: string[],
  selectedBreakpointId: string
) => {
  const inheritedStyle: InheritedProperties = {};
  // skip current instance and start with root til parent
  for (const instanceId of instanceSelector.slice(1).reverse()) {
    const ancestorInstance = instances.get(instanceId);
    if (ancestorInstance === undefined) {
      continue;
    }
    const cascadedAndSelectedBreakpointIds = [
      ...cascadedBreakpointIds,
      selectedBreakpointId,
    ];

    const ancestorInstanceStyles = stylesByInstanceId.get(ancestorInstance.id);
    if (ancestorInstanceStyles === undefined) {
      continue;
    }

    const tagName = selectedInstanceIntanceToTag.get(instanceId);

    const presetStyle =
      tagName !== undefined
        ? getPresetStyle(instances, ancestorInstance.id, tagName)
        : undefined;
    if (presetStyle) {
      for (const [styleProperty, styleValue] of Object.entries(presetStyle)) {
        if (inheritableProperties.has(styleProperty)) {
          inheritedStyle[styleProperty as StyleProperty] = {
            instanceId: ancestorInstance.id,
            value: styleValue,
          };
        }
      }
    }

    // extract styles from all active breakpoints
    for (const breakpointId of cascadedAndSelectedBreakpointIds) {
      for (const styleDecl of ancestorInstanceStyles) {
        if (
          styleDecl.breakpointId === breakpointId &&
          inheritableProperties.has(styleDecl.property)
        ) {
          inheritedStyle[styleDecl.property] = {
            instanceId: ancestorInstance.id,
            value: styleDecl.value,
          };
        }
      }
    }
  }
  return inheritedStyle;
};

/**
 * combine all local, cascaded, inherited and browser styles
 */
export const useStyleInfo = () => {
  const [breakpoints] = useBreakpoints();
  const selectedBreakpoint = useStore(selectedBreakpointStore);
  const selectedBreakpointId = selectedBreakpoint?.id;
  const selectedInstanceSelector = useStore(selectedInstanceSelectorStore);
  const selectedStyleSource = useStore(selectedStyleSourceStore);
  const selectedStyleSourceId = selectedStyleSource?.id;
  const browserStyle = useStore(selectedInstanceBrowserStyleStore);
  const selectedInstanceIntanceToTag = useStore(
    selectedInstanceIntanceToTagStore
  );

  const instances = useStore(instancesStore);
  const { stylesByInstanceId, stylesByStyleSourceId } =
    useStore(stylesIndexStore);

  const selectedStyle = useMemo(() => {
    if (
      selectedBreakpointId === undefined ||
      selectedStyleSourceId === undefined
    ) {
      return {};
    }
    return getSelectedStyle(
      stylesByStyleSourceId,
      selectedBreakpointId,
      selectedStyleSourceId
    );
  }, [stylesByStyleSourceId, selectedBreakpointId, selectedStyleSourceId]);

  const cascadedBreakpointIds = useMemo(
    () => getCascadedBreakpointIds(breakpoints, selectedBreakpointId),
    [breakpoints, selectedBreakpointId]
  );

  const inheritedInfo = useMemo(() => {
    if (
      selectedBreakpointId === undefined ||
      selectedInstanceSelector === undefined ||
      selectedInstanceIntanceToTag === undefined
    ) {
      return {};
    }
    return getInheritedInfo(
      instances,
      stylesByInstanceId,
      selectedInstanceSelector,
      selectedInstanceIntanceToTag,
      cascadedBreakpointIds,
      selectedBreakpointId
    );
  }, [
    instances,
    stylesByInstanceId,
    cascadedBreakpointIds,
    selectedBreakpointId,
    selectedInstanceSelector,
    selectedInstanceIntanceToTag,
  ]);

  const cascadedInfo = useMemo(() => {
    if (selectedInstanceSelector === undefined) {
      return {};
    }
    return getCascadedInfo(
      stylesByInstanceId,
      selectedInstanceSelector[0],
      cascadedBreakpointIds
    );
  }, [stylesByInstanceId, selectedInstanceSelector, cascadedBreakpointIds]);

  const presetStyle = useMemo(() => {
    const selectedInstanceId = selectedInstanceSelector?.[0];
    if (selectedInstanceId === undefined) {
      return;
    }
    const tagName = selectedInstanceIntanceToTag?.get(selectedInstanceId);

    return tagName !== undefined
      ? getPresetStyle(instances, selectedInstanceSelector?.[0], tagName)
      : undefined;
  }, [instances, selectedInstanceSelector, selectedInstanceIntanceToTag]);

  const styleInfoData = useMemo(() => {
    const styleInfoData: StyleInfo = {};
    for (const property of styleProperties) {
      // temporary solution until we start computing all styles from data
      const computed = browserStyle?.[property];
      const preset = presetStyle?.[property];
      const inherited = inheritedInfo[property];
      const cascaded = cascadedInfo[property];
      const local = selectedStyle?.[property];
      const value =
        local ?? cascaded?.value ?? inherited?.value ?? preset ?? computed;
      if (value) {
        styleInfoData[property] = {
          value,
          local,
          cascaded,
          inherited,
          preset,
        };
      }
    }
    return styleInfoData;
  }, [browserStyle, presetStyle, inheritedInfo, cascadedInfo, selectedStyle]);

  return styleInfoData;
};

export const useInstanceStyleData = (
  instanceSelector: InstanceSelector | undefined
) => {
  const instances = useStore(instancesStore);
  const { stylesByInstanceId } = useStore(stylesIndexStore);
  const [breakpoints] = useBreakpoints();
  const selectedBreakpoint = useStore(selectedBreakpointStore);

  // We assume that instance ancestor contains tags we need to get preset styles
  // Its not always true, but to extract parent styles it works well
  const selectedInstanceIntanceToTag = useStore(
    selectedInstanceIntanceToTagStore
  );

  const selectedBreakpointId = selectedBreakpoint?.id;

  const presetStyle = useMemo(() => {
    const selectedInstanceId = instanceSelector?.[0];
    if (selectedInstanceId === undefined) {
      return;
    }
    const tagName = selectedInstanceIntanceToTag?.get(selectedInstanceId);

    return tagName !== undefined
      ? getPresetStyle(instances, instanceSelector?.[0], tagName)
      : undefined;
  }, [instances, instanceSelector, selectedInstanceIntanceToTag]);

  const cascadedBreakpointIds = useMemo(
    () => getCascadedBreakpointIds(breakpoints, selectedBreakpointId),
    [breakpoints, selectedBreakpointId]
  );

  const selfAndCascadeInfo = useMemo(() => {
    if (instanceSelector === undefined || selectedBreakpointId === undefined) {
      return {};
    }
    return getCascadedInfo(stylesByInstanceId, instanceSelector[0], [
      ...cascadedBreakpointIds,
      selectedBreakpointId,
    ]);
  }, [
    stylesByInstanceId,
    instanceSelector,
    cascadedBreakpointIds,
    selectedBreakpointId,
  ]);

  const inheritedInfo = useMemo(() => {
    if (
      selectedBreakpointId === undefined ||
      instanceSelector === undefined ||
      selectedInstanceIntanceToTag === undefined
    ) {
      return {};
    }
    return getInheritedInfo(
      instances,
      stylesByInstanceId,
      instanceSelector,
      selectedInstanceIntanceToTag,
      cascadedBreakpointIds,
      selectedBreakpointId
    );
  }, [
    instances,
    stylesByInstanceId,
    cascadedBreakpointIds,
    selectedBreakpointId,
    instanceSelector,
    selectedInstanceIntanceToTag,
  ]);

  const styleData = useMemo(() => {
    const styleData: Style = {};
    for (const property of styleProperties) {
      // temporary solution until we start computing all styles from data
      const preset = presetStyle?.[property];
      const inherited = inheritedInfo[property];
      const cascaded = selfAndCascadeInfo[property];
      const value = cascaded?.value ?? inherited?.value ?? preset;

      if (value) {
        styleData[property] = value;
      }
    }
    return styleData;
  }, [presetStyle, selfAndCascadeInfo, inheritedInfo]);

  return styleData;
};
