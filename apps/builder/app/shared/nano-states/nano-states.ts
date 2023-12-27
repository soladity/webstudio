import { useMemo } from "react";
import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";
import { nanoid } from "nanoid";
import type { AuthPermit } from "@webstudio-is/trpc-interface/index.server";
import type { ItemDropTarget, Placement } from "@webstudio-is/design-system";
import type {
  Assets,
  DataSource,
  DataSources,
  Instance,
  Prop,
  Props,
  Resource,
  StyleDecl,
  Styles,
  StyleSource,
  StyleSources,
  StyleSourceSelections,
} from "@webstudio-is/sdk";
import type { Style } from "@webstudio-is/css-engine";
import type { DragStartPayload } from "~/canvas/shared/use-drag-drop";
import { shallowComputed } from "../store-utils";
import { type InstanceSelector } from "../tree-utils";
import type { htmlTags as HtmlTags } from "html-tags";
import { instancesStore, selectedInstanceSelectorStore } from "./instances";
import { selectedPageStore } from "./pages";
import type { UnitSizes } from "~/builder/features/style-panel/shared/css-value-input/convert-units";
import type { Project } from "@webstudio-is/project";

export const projectStore = atom<Project | undefined>();
export const $project = projectStore;

export const $domains = atom<string[]>([]);

export const rootInstanceStore = computed(
  [instancesStore, selectedPageStore],
  (instances, selectedPage) => {
    if (selectedPage === undefined) {
      return undefined;
    }
    return instances.get(selectedPage.rootInstanceId);
  }
);

export const dataSourcesStore = atom<DataSources>(new Map());
export const $dataSources = dataSourcesStore;
export const dataSourceVariablesStore = atom<Map<DataSource["id"], unknown>>(
  new Map()
);
export const $dataSourceVariables = dataSourceVariablesStore;

export const $resources = atom(new Map<Resource["id"], Resource>());
export const $resourceValues = atom(new Map<Resource["id"], unknown>());

export const propsStore = atom<Props>(new Map());
export const $props = propsStore;
export const propsIndexStore = computed(propsStore, (props) => {
  const propsByInstanceId = new Map<Instance["id"], Prop[]>();
  for (const prop of props.values()) {
    const { instanceId } = prop;
    let instanceProps = propsByInstanceId.get(instanceId);
    if (instanceProps === undefined) {
      instanceProps = [];
      propsByInstanceId.set(instanceId, instanceProps);
    }
    instanceProps.push(prop);
  }
  return {
    propsByInstanceId,
  };
});

export const stylesStore = atom<Styles>(new Map());
export const $styles = stylesStore;

export const useInstanceStyles = (instanceId: undefined | Instance["id"]) => {
  const instanceStylesStore = useMemo(() => {
    return shallowComputed([stylesIndexStore], (stylesIndex) => {
      if (instanceId === undefined) {
        return [];
      }
      return stylesIndex.stylesByInstanceId.get(instanceId) ?? [];
    });
  }, [instanceId]);
  const instanceStyles = useStore(instanceStylesStore);
  return instanceStyles;
};

export const styleSourcesStore = atom<StyleSources>(new Map());
export const $styleSources = styleSourcesStore;

export const styleSourceSelectionsStore = atom<StyleSourceSelections>(
  new Map()
);
export const $styleSourceSelections = styleSourceSelectionsStore;

export type StyleSourceSelector = {
  styleSourceId: StyleSource["id"];
  state?: string;
};

export const selectedStyleSourceSelectorStore = atom<
  undefined | StyleSourceSelector
>(undefined);

/**
 * Indexed styles data is recomputed on every styles update
 * Compumer should use shallow-equal to check all items in the list
 * are the same to avoid unnecessary rerenders
 *
 * Potential optimization can be maintaining the index as separate state
 * though will require to move away from running immer patches on array
 * of styles
 */
export const stylesIndexStore = computed(
  [stylesStore, styleSourceSelectionsStore],
  (styles, styleSourceSelections) => {
    const stylesByStyleSourceId = new Map<StyleSource["id"], StyleDecl[]>();
    for (const styleDecl of styles.values()) {
      const { styleSourceId } = styleDecl;
      let styleSourceStyles = stylesByStyleSourceId.get(styleSourceId);
      if (styleSourceStyles === undefined) {
        styleSourceStyles = [];
        stylesByStyleSourceId.set(styleSourceId, styleSourceStyles);
      }
      styleSourceStyles.push(styleDecl);
    }

    const stylesByInstanceId = new Map<Instance["id"], StyleDecl[]>();
    for (const { instanceId, values } of styleSourceSelections.values()) {
      const instanceStyles: StyleDecl[] = [];
      for (const styleSourceId of values) {
        const styleSourceStyles = stylesByStyleSourceId.get(styleSourceId);
        if (styleSourceStyles) {
          instanceStyles.push(...styleSourceStyles);
        }
      }
      stylesByInstanceId.set(instanceId, instanceStyles);
    }

    return {
      stylesByStyleSourceId,
      stylesByInstanceId,
    };
  }
);

export const assetsStore = atom<Assets>(new Map());
export const $assets = assetsStore;

export const selectedInstanceBrowserStyleStore = atom<undefined | Style>();

// Init with some defaults to avoid undefined
export const selectedInstanceUnitSizesStore = atom<UnitSizes>({
  ch: 8,
  vw: 3.2,
  vh: 4.8,
  em: 16,
  rem: 16,
  px: 1,
});

/**
 * instanceId => tagName store for selected instance and its ancestors
 */
export const selectedInstanceIntanceToTagStore = atom<
  undefined | Map<Instance["id"], HtmlTags>
>();

/**
 * pending means: previous selected instance unmounted,
 * and we don't know yet whether a new one will mount
 **/
export const selectedInstanceRenderStateStore = atom<
  "mounted" | "notMounted" | "pending"
>("notMounted");

export const selectedInstanceStatesByStyleSourceIdStore = computed(
  [stylesStore, styleSourceSelectionsStore, selectedInstanceSelectorStore],
  (styles, styleSourceSelections, selectedInstanceSelector) => {
    const statesByStyleSourceId = new Map<StyleSource["id"], string[]>();
    if (selectedInstanceSelector === undefined) {
      return statesByStyleSourceId;
    }
    const styleSourceIds = new Set(
      styleSourceSelections.get(selectedInstanceSelector[0])?.values
    );
    for (const styleDecl of styles.values()) {
      if (
        styleDecl.state === undefined ||
        styleSourceIds.has(styleDecl.styleSourceId) === false
      ) {
        continue;
      }
      let states = statesByStyleSourceId.get(styleDecl.styleSourceId);
      if (states === undefined) {
        states = [];
        statesByStyleSourceId.set(styleDecl.styleSourceId, states);
      }
      if (states.includes(styleDecl.state) === false) {
        states.push(styleDecl.state);
      }
    }
    return statesByStyleSourceId;
  }
);

export const selectedInstanceStyleSourcesStore = computed(
  [
    styleSourceSelectionsStore,
    styleSourcesStore,
    selectedInstanceSelectorStore,
  ],
  (styleSourceSelections, styleSources, selectedInstanceSelector) => {
    const selectedInstanceStyleSources: StyleSource[] = [];
    if (selectedInstanceSelector === undefined) {
      return selectedInstanceStyleSources;
    }
    const [selectedInstanceId] = selectedInstanceSelector;
    const styleSourceIds =
      styleSourceSelections.get(selectedInstanceId)?.values ?? [];
    let hasLocal = false;
    for (const styleSourceId of styleSourceIds) {
      const styleSource = styleSources.get(styleSourceId);
      if (styleSource !== undefined) {
        selectedInstanceStyleSources.push(styleSource);
        if (styleSource.type === "local") {
          hasLocal = true;
        }
      }
    }
    // generate style source when selection has not local style sources
    // it is synchronized whenever styles are updated
    if (hasLocal === false) {
      // always put local style source last
      selectedInstanceStyleSources.push({
        type: "local",
        id: nanoid(),
      });
    }
    return selectedInstanceStyleSources;
  }
);

export const selectedOrLastStyleSourceSelectorStore = computed(
  [selectedInstanceStyleSourcesStore, selectedStyleSourceSelectorStore],
  (styleSources, selectedStyleSourceSelector) => {
    if (selectedStyleSourceSelector !== undefined) {
      return selectedStyleSourceSelector;
    }
    const lastStyleSource = styleSources.at(-1);
    if (lastStyleSource !== undefined) {
      return { styleSourceId: lastStyleSource.id };
    }
    return;
  }
);

/**
 * Provide selected style source with fallback
 * to the last style source of selected instance
 */
export const selectedStyleSourceStore = computed(
  [selectedInstanceStyleSourcesStore, selectedStyleSourceSelectorStore],
  (styleSources, selectedStyleSourceSelector) => {
    return (
      styleSources.find(
        (item) => item.id === selectedStyleSourceSelector?.styleSourceId
      ) ?? styleSources.at(-1)
    );
  }
);
export const $selectedStyleSource = selectedStyleSourceStore;

/**
 * Store the list of active states inferred from dom element
 * to display style values as remote
 */
export const $selectedInstanceStates = atom(new Set<string>());

export const hoveredInstanceSelectorStore = atom<undefined | InstanceSelector>(
  undefined
);

export const $isPreviewMode = atom<boolean>(false);

export const $authPermit = atom<AuthPermit>("view");

export const $authToken = atom<string | undefined>(undefined);

export type DragAndDropState = {
  isDragging: boolean;
  dropTarget?: ItemDropTarget;
  dragPayload?: DragStartPayload;
  placementIndicator?: Placement;
};

export const $dragAndDropState = atom<DragAndDropState>({
  isDragging: false,
});
