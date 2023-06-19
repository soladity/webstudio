import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import type { htmlTags as HtmlTags } from "html-tags";
import {
  html,
  type Style,
  type StyleProperty,
  type StyleValue,
} from "@webstudio-is/css-data";
import { properties } from "@webstudio-is/css-data";
import {
  StyleSourceSelections,
  type Breakpoints,
  type Instance,
  type Instances,
  type StyleDecl,
  type StyleSource as StyleSourceType,
  Breakpoint,
} from "@webstudio-is/project-build";
import { compareMedia } from "@webstudio-is/css-engine";
import {
  type StyleSourceSelector,
  instancesStore,
  selectedInstanceSelectorStore,
  selectedInstanceIntanceToTagStore,
  stylesIndexStore,
  selectedOrLastStyleSourceSelectorStore,
  breakpointsStore,
  styleSourceSelectionsStore,
  registeredComponentMetasStore,
} from "~/shared/nano-states";
import { selectedBreakpointStore } from "~/shared/nano-states";
import type { InstanceSelector } from "~/shared/tree-utils";
import type { WsComponentMeta } from "@webstudio-is/react-sdk";

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

type SourceValueInfo = {
  styleSourceId: string;
  value: StyleValue;
};

type SourceProperties = {
  [property in StyleProperty]?: SourceValueInfo;
};

/*
 * For some cases we are encouraging to use custom defaults, than
 * `initial` values provided by browsers. This helps in controlling the behaviour
 * of such properties
 */
const CUSTOM_DEFAULT_VALUES: Partial<Record<StyleProperty, StyleValue>> = {
  outlineWidth: { value: 0, type: "unit", unit: "px" },
};

export type StyleValueInfo = {
  value: StyleValue;
  local?: StyleValue;
  previousSource?: SourceValueInfo;
  nextSource?: SourceValueInfo;
  cascaded?: CascadedValueInfo;
  inherited?: InheritedValueInfo;
  preset?: StyleValue;
  htmlValue?: StyleValue;
};

export type StyleInfo = {
  [property in Exclude<StyleProperty, "color">]?: StyleValueInfo;
} & {
  /**
   * In order to maintain code efficiency and reduce clutter, we should only expose the currentColor value for the color property.
   * We can consider it an edge case when it is necessary to display the actual currentColor value in the Color Picker.
   */
  color?: StyleValueInfo & {
    /**
     * Only color property can have currentColor
     * Now we take it from the computed style, @todo: calculate when we are going to remove computed.
     **/
    currentColor?: StyleValue | undefined;
  };
};

export type StyleSource =
  | "local"
  | "overwritten"
  | "remote"
  | "preset"
  | "default";

export const getStyleSource = (
  ...styleValueInfos: (undefined | StyleValueInfo)[]
): StyleSource => {
  // show source to use if at least one of control properties matches
  // so user could see if something is set or something is inherited
  for (const info of styleValueInfos) {
    if (info?.nextSource && info.local) {
      return "overwritten";
    }
  }
  for (const info of styleValueInfos) {
    if (info?.local) {
      return "local";
    }
  }
  for (const info of styleValueInfos) {
    if (
      info?.previousSource !== undefined ||
      info?.nextSource !== undefined ||
      info?.cascaded !== undefined
    ) {
      return "remote";
    }
  }
  for (const info of styleValueInfos) {
    if (info?.preset !== undefined) {
      return "preset";
    }
  }
  for (const info of styleValueInfos) {
    if (info?.htmlValue !== undefined) {
      return "default";
    }
  }
  for (const info of styleValueInfos) {
    if (info?.inherited !== undefined) {
      return "remote";
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
  styleSourceSelector: StyleSourceSelector
) => {
  const style: Style = {};
  const instanceStyles = stylesByStyleSourceId.get(
    styleSourceSelector.styleSourceId
  );
  if (instanceStyles === undefined) {
    return style;
  }
  for (const styleDecl of instanceStyles) {
    // @todo consider making stateless styles remote when state is selected
    if (
      styleDecl.breakpointId === breakpointId &&
      styleDecl.state === undefined
    ) {
      style[styleDecl.property] = styleDecl.value;
    }
  }
  for (const styleDecl of instanceStyles) {
    if (
      styleDecl.breakpointId === breakpointId &&
      styleDecl.state === styleSourceSelector.state
    ) {
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
      if (
        styleDecl.breakpointId === breakpointId &&
        styleDecl.state === undefined
      ) {
        cascadedStyle[styleDecl.property] = {
          breakpointId,
          value: styleDecl.value,
        };
      }
    }
  }
  return cascadedStyle;
};

export const getInstanceComponent = (
  instances: Instances,
  instanceId: undefined | Instance["id"]
) => {
  if (instanceId === undefined) {
    return;
  }
  const instance = instances.get(instanceId);
  if (instance === undefined) {
    return;
  }
  return instance.component;
};

export const getPresetStyleRule = (
  meta: undefined | WsComponentMeta,
  tagName: HtmlTags,
  styleSourceSelector?: StyleSourceSelector
) => {
  const presetStyles = meta?.presetStyle?.[tagName];
  if (presetStyles === undefined) {
    return;
  }
  const presetStyle: Style = {};
  for (const styleDecl of presetStyles) {
    // @todo consider making stateless styles remote when state is selected
    if (styleDecl.state === undefined) {
      presetStyle[styleDecl.property] = styleDecl.value;
    }
    if (styleDecl.state === styleSourceSelector?.state) {
      presetStyle[styleDecl.property] = styleDecl.value;
    }
  }
  return presetStyle;
};

/**
 * extract all inheritable styles from ancestor instances
 * including active breakpoints
 */
export const getInheritedInfo = (
  instances: Instances,
  metas: Map<string, WsComponentMeta>,
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

    const tagName = selectedInstanceIntanceToTag.get(instanceId);
    const component = getInstanceComponent(instances, instanceId);
    const presetStyle =
      tagName !== undefined && component !== undefined
        ? metas.get(component)?.presetStyle?.[tagName]
        : undefined;
    if (presetStyle) {
      for (const styleDecl of presetStyle) {
        if (
          styleDecl.state === undefined &&
          inheritableProperties.has(styleDecl.property)
        ) {
          inheritedStyle[styleDecl.property] = {
            instanceId: ancestorInstance.id,
            value: styleDecl.value,
          };
        }
      }
    }

    const ancestorInstanceStyles = stylesByInstanceId.get(ancestorInstance.id);
    if (ancestorInstanceStyles === undefined) {
      continue;
    }

    // extract styles from all active breakpoints
    for (const breakpointId of cascadedAndSelectedBreakpointIds) {
      for (const styleDecl of ancestorInstanceStyles) {
        if (
          styleDecl.breakpointId === breakpointId &&
          styleDecl.state === undefined &&
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

export const getPreviousSourceInfo = (
  styleSourceSelections: StyleSourceSelections,
  stylesByInstanceId: Map<Instance["id"], StyleDecl[]>,
  selectedInstanceSelector: InstanceSelector,
  selectedStyleSourceSelector: StyleSourceSelector,
  breakpointId: Breakpoint["id"]
) => {
  const previousSourceStyle: SourceProperties = {};
  const [selectedInstanceId] = selectedInstanceSelector;
  const { styleSourceId } = selectedStyleSourceSelector;
  const styleSourceSelection = styleSourceSelections.get(selectedInstanceId);
  const instanceStyles = stylesByInstanceId.get(selectedInstanceId);
  if (styleSourceSelection === undefined || instanceStyles === undefined) {
    return previousSourceStyle;
  }
  const previousSourceIds = styleSourceSelection.values.slice(
    0,
    styleSourceSelection.values.indexOf(styleSourceId)
  );
  // expect instance styles to be ordered
  for (const styleDecl of instanceStyles) {
    if (
      styleDecl.breakpointId === breakpointId &&
      previousSourceIds.includes(styleDecl.styleSourceId)
    ) {
      previousSourceStyle[styleDecl.property] = {
        styleSourceId: styleDecl.styleSourceId,
        value: styleDecl.value,
      };
    }
  }
  return previousSourceStyle;
};

export const getNextSourceInfo = (
  styleSourceSelections: StyleSourceSelections,
  stylesByInstanceId: Map<Instance["id"], StyleDecl[]>,
  selectedInstanceSelector: InstanceSelector,
  selectedStyleSourceSelector: StyleSourceSelector,
  breakpointId: Breakpoint["id"]
) => {
  const nextSourceStyle: SourceProperties = {};
  const [selectedInstanceId] = selectedInstanceSelector;
  const { styleSourceId } = selectedStyleSourceSelector;
  const styleSourceSelection = styleSourceSelections.get(selectedInstanceId);
  const instanceStyles = stylesByInstanceId.get(selectedInstanceId);
  if (styleSourceSelection === undefined || instanceStyles === undefined) {
    return nextSourceStyle;
  }
  const nextSourceIds = styleSourceSelection.values.slice(
    // exclude current style source
    styleSourceSelection.values.indexOf(styleSourceId) + 1
  );
  // expect instance styles to be ordered
  for (const styleDecl of instanceStyles) {
    if (
      styleDecl.breakpointId === breakpointId &&
      nextSourceIds.includes(styleDecl.styleSourceId)
    ) {
      nextSourceStyle[styleDecl.property] = {
        styleSourceId: styleDecl.styleSourceId,
        value: styleDecl.value,
      };
    }
  }
  return nextSourceStyle;
};

/**
 * combine all local, cascaded, inherited and browser styles
 */
export const useStyleInfo = () => {
  const breakpoints = useStore(breakpointsStore);
  const selectedBreakpoint = useStore(selectedBreakpointStore);
  const selectedBreakpointId = selectedBreakpoint?.id;
  const selectedInstanceSelector = useStore(selectedInstanceSelectorStore);
  const selectedOrLastStyleSourceSelector = useStore(
    selectedOrLastStyleSourceSelectorStore
  );
  const selectedInstanceIntanceToTag = useStore(
    selectedInstanceIntanceToTagStore
  );

  const instances = useStore(instancesStore);
  const metas = useStore(registeredComponentMetasStore);
  const { stylesByInstanceId, stylesByStyleSourceId } =
    useStore(stylesIndexStore);
  const styleSourceSelections = useStore(styleSourceSelectionsStore);

  const selectedStyle = useMemo(() => {
    if (
      selectedBreakpointId === undefined ||
      selectedOrLastStyleSourceSelector === undefined
    ) {
      return {};
    }
    return getSelectedStyle(
      stylesByStyleSourceId,
      selectedBreakpointId,
      selectedOrLastStyleSourceSelector
    );
  }, [
    stylesByStyleSourceId,
    selectedBreakpointId,
    selectedOrLastStyleSourceSelector,
  ]);

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
      metas,
      stylesByInstanceId,
      selectedInstanceSelector,
      selectedInstanceIntanceToTag,
      cascadedBreakpointIds,
      selectedBreakpointId
    );
  }, [
    instances,
    metas,
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

  const previousSourceInfo = useMemo(() => {
    if (
      selectedInstanceSelector === undefined ||
      selectedOrLastStyleSourceSelector === undefined ||
      selectedBreakpointId === undefined
    ) {
      return {};
    }
    return getPreviousSourceInfo(
      styleSourceSelections,
      stylesByInstanceId,
      selectedInstanceSelector,
      selectedOrLastStyleSourceSelector,
      selectedBreakpointId
    );
  }, [
    styleSourceSelections,
    stylesByInstanceId,
    selectedInstanceSelector,
    selectedOrLastStyleSourceSelector,
    selectedBreakpointId,
  ]);

  const nextSourceInfo = useMemo(() => {
    if (
      selectedInstanceSelector === undefined ||
      selectedOrLastStyleSourceSelector === undefined ||
      selectedBreakpointId === undefined
    ) {
      return {};
    }
    return getNextSourceInfo(
      styleSourceSelections,
      stylesByInstanceId,
      selectedInstanceSelector,
      selectedOrLastStyleSourceSelector,
      selectedBreakpointId
    );
  }, [
    styleSourceSelections,
    stylesByInstanceId,
    selectedInstanceSelector,
    selectedOrLastStyleSourceSelector,
    selectedBreakpointId,
  ]);

  const presetStyle = useMemo(() => {
    const selectedInstanceId = selectedInstanceSelector?.[0];
    if (
      selectedInstanceId === undefined ||
      selectedOrLastStyleSourceSelector === undefined
    ) {
      return;
    }
    const tagName = selectedInstanceIntanceToTag?.get(selectedInstanceId);
    const component = getInstanceComponent(instances, selectedInstanceId);
    if (tagName === undefined || component === undefined) {
      return;
    }
    return getPresetStyleRule(
      metas.get(component),
      tagName,
      selectedOrLastStyleSourceSelector
    );
  }, [
    instances,
    metas,
    selectedInstanceSelector,
    selectedInstanceIntanceToTag,
    selectedOrLastStyleSourceSelector,
  ]);

  const htmlStyle = useMemo(() => {
    const instanceId = selectedInstanceSelector?.[0];
    if (instanceId === undefined) {
      return;
    }
    const tagName = selectedInstanceIntanceToTag?.get(instanceId);
    if (tagName === undefined) {
      return;
    }
    const styles = html[tagName];
    if (styles === undefined) {
      return;
    }
    const style: Style = {};
    for (const styleDecl of styles) {
      style[styleDecl.property] = styleDecl.value;
    }
    return style;
  }, [selectedInstanceSelector, selectedInstanceIntanceToTag]);

  const styleInfoData = useMemo(() => {
    const styleInfoData: StyleInfo = {};
    for (const property of styleProperties) {
      // temporary solution until we start computing all styles from data
      const htmlValue = htmlStyle?.[property];
      const defaultValue =
        CUSTOM_DEFAULT_VALUES[property] ??
        properties[property as keyof typeof properties].initial;
      const preset = presetStyle?.[property];
      const inherited = inheritedInfo[property];
      const cascaded = cascadedInfo[property];
      const previousSource = previousSourceInfo[property];
      const nextSource = nextSourceInfo[property];
      const local = selectedStyle?.[property];
      const ownValue =
        local ??
        nextSource?.value ??
        previousSource?.value ??
        cascaded?.value ??
        preset ??
        htmlValue;
      const inheritedValue = inherited?.value;
      const value = ownValue ?? inheritedValue ?? defaultValue;
      if (value) {
        if (property === "color") {
          const ownColor =
            ownValue?.type === "keyword" &&
            (ownValue.value === "inherit" || ownValue.value === "currentColor")
              ? undefined
              : ownValue;
          const inheritedColor =
            inheritedValue?.type === "keyword" &&
            (inheritedValue.value === "inherit" ||
              inheritedValue.value === "currentColor")
              ? undefined
              : inheritedValue;
          const currentColor = ownColor ?? inheritedColor ?? defaultValue;
          styleInfoData[property] = {
            value,
            local,
            nextSource,
            previousSource,
            cascaded,
            inherited,
            preset,
            htmlValue,
            currentColor,
          };
        } else {
          styleInfoData[property] = {
            value,
            local,
            nextSource,
            previousSource,
            cascaded,
            inherited,
            preset,
            htmlValue,
          };
        }
      }
    }
    return styleInfoData;
  }, [
    htmlStyle,
    presetStyle,
    inheritedInfo,
    cascadedInfo,
    nextSourceInfo,
    previousSourceInfo,
    selectedStyle,
  ]);

  return styleInfoData;
};

export const useInstanceStyleData = (
  instanceSelector: InstanceSelector | undefined
) => {
  const instances = useStore(instancesStore);
  const metas = useStore(registeredComponentMetasStore);
  const { stylesByInstanceId } = useStore(stylesIndexStore);
  const breakpoints = useStore(breakpointsStore);
  const selectedBreakpoint = useStore(selectedBreakpointStore);

  // We assume that instance ancestor contains tags we need to get preset styles
  // Its not always true, but to extract parent styles it works well
  const selectedInstanceIntanceToTag = useStore(
    selectedInstanceIntanceToTagStore
  );

  const selectedBreakpointId = selectedBreakpoint?.id;

  const presetStyle = useMemo(() => {
    const instanceId = instanceSelector?.[0];
    if (instanceId === undefined) {
      return;
    }
    const tagName = selectedInstanceIntanceToTag?.get(instanceId);
    const component = getInstanceComponent(instances, instanceId);
    if (tagName === undefined || component === undefined) {
      return;
    }
    return getPresetStyleRule(metas.get(component), tagName);
  }, [instances, metas, instanceSelector, selectedInstanceIntanceToTag]);

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
      metas,
      stylesByInstanceId,
      instanceSelector,
      selectedInstanceIntanceToTag,
      cascadedBreakpointIds,
      selectedBreakpointId
    );
  }, [
    instances,
    metas,
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
