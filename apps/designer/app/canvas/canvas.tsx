import { useCallback, useMemo, useState } from "react";
import { computed } from "nanostores";
import store from "immerhin";
import type { CanvasData } from "@webstudio-is/project";
import {
  createElementsTree,
  registerComponents,
  registerComponentsMeta,
  customComponentsMeta,
  setParams,
  type OnChangeChildren,
  setPropsByInstanceIdStore,
} from "@webstudio-is/react-sdk";
import { publish, useSubscribe } from "~/shared/pubsub";
import { registerContainers, useCanvasStore } from "~/shared/sync";
import { useShortcuts } from "./shared/use-shortcuts";
import {
  useDeleteInstance,
  useInsertInstance,
  usePublishTextEditingInstanceId,
  useReparentInstance,
} from "./shared/instance";
import { useManageDesignModeStyles, GlobalStyles } from "./shared/styles";
import { useTrackSelectedElement } from "./shared/use-track-selected-element";
import { WrapperComponentDev } from "./features/wrapper-component";
import {
  propsIndexStore,
  rootInstanceContainer,
  useBreakpoints,
  useRootInstance,
  useSetBreakpoints,
  useSetProps,
  useSetRootInstance,
  useSetStyles,
  useSetStyleSources,
  useSetStyleSourceSelections,
  useSubscribeScrollState,
  useIsPreviewMode,
} from "~/shared/nano-states";
import { usePublishScrollState } from "./shared/use-publish-scroll-state";
import { useDragAndDrop } from "./shared/use-drag-drop";
import { utils } from "@webstudio-is/project";
import { useSubscribeDesignerReady } from "./shared/use-designer-ready";
import type { Asset } from "@webstudio-is/asset-uploader";
import { useCopyPasteInstance } from "~/shared/copy-paste";
import { customComponents } from "./custom-components";
import { useHoveredInstanceConnector } from "./hovered-instance-connector";

registerContainers();

const useElementsTree = () => {
  const [rootInstance] = useRootInstance();
  const [breakpoints] = useBreakpoints();

  const onChangeChildren: OnChangeChildren = useCallback(
    (change) => {
      store.createTransaction([rootInstanceContainer], (rootInstance) => {
        if (rootInstance === undefined) {
          return;
        }

        const { instanceId, updates } = change;
        utils.tree.setInstanceChildrenMutable(
          instanceId,
          updates,
          rootInstance,
          breakpoints[0].id
        );
      });
    },
    [breakpoints]
  );

  return useMemo(() => {
    if (rootInstance === undefined) {
      return;
    }

    return createElementsTree({
      sandbox: true,
      instance: rootInstance,
      Component: WrapperComponentDev,
      onChangeChildren,
    });
  }, [rootInstance, onChangeChildren]);
};

const useAssets = (initialAssets: Array<Asset>) => {
  const [assets, setAssets] = useState(initialAssets);
  useSubscribe("updateAssets", setAssets);
  return assets;
};

const DesignMode = () => {
  useManageDesignModeStyles();
  useInsertInstance();
  useReparentInstance();
  useDeleteInstance();
  useTrackSelectedElement();
  usePublishScrollState();
  useSubscribeScrollState();
  usePublishTextEditingInstanceId();
  useDragAndDrop();
  // We need to initialize this in both canvas and designer,
  // because the events will fire in either one, depending on where the focus is
  useCopyPasteInstance();
  useHoveredInstanceConnector();

  return null;
};

type CanvasProps = {
  data: CanvasData;
};

const propsByInstanceIdStore = computed(
  propsIndexStore,
  (propsIndex) => propsIndex.propsByInstanceId
);

export const Canvas = ({ data }: CanvasProps): JSX.Element | null => {
  if (data.build === null) {
    throw new Error("Build is null");
  }
  if (data.tree === null) {
    throw new Error("Tree is null");
  }
  const isDesignerReady = useSubscribeDesignerReady();
  const assets = useAssets(data.assets);
  useSetBreakpoints(data.breakpoints);
  useSetProps(data.tree.props);
  // inject props store to sdk
  setPropsByInstanceIdStore(propsByInstanceIdStore);
  useSetStyles(data.tree.styles);
  useSetStyleSources(data.build.styleSources);
  useSetStyleSourceSelections(data.tree.styleSourceSelections);
  useSetRootInstance(data.tree.root);
  setParams(data.params ?? null);
  useCanvasStore(publish);
  const [isPreviewMode] = useIsPreviewMode();

  registerComponents(customComponents);

  registerComponentsMeta(customComponentsMeta);

  // e.g. toggling preview is still needed in both modes
  useShortcuts();

  const elements = useElementsTree();

  if (elements === undefined) {
    return null;
  }

  if (isPreviewMode || isDesignerReady === false) {
    return (
      <>
        <GlobalStyles assets={assets} />
        {elements}
      </>
    );
  }

  return (
    <>
      <GlobalStyles assets={assets} />
      <DesignMode />
      {elements}
    </>
  );
};
