import { useMemo, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import type { Instances } from "@webstudio-is/sdk";
import {
  type Params,
  type Components,
  createElementsTree,
  coreMetas,
  corePropsMetas,
} from "@webstudio-is/react-sdk";
import * as baseComponents from "@webstudio-is/sdk-components-react";
import * as baseComponentMetas from "@webstudio-is/sdk-components-react/metas";
import * as baseComponentPropsMetas from "@webstudio-is/sdk-components-react/props";
import * as remixComponents from "@webstudio-is/sdk-components-react-remix";
import * as remixComponentMetas from "@webstudio-is/sdk-components-react-remix/metas";
import * as remixComponentPropsMetas from "@webstudio-is/sdk-components-react-remix/props";
import * as radixComponents from "@webstudio-is/sdk-components-react-radix";
import * as radixComponentMetas from "@webstudio-is/sdk-components-react-radix/metas";
import * as radixComponentPropsMetas from "@webstudio-is/sdk-components-react-radix/props";
import { hooks as radixComponentHooks } from "@webstudio-is/sdk-components-react-radix/hooks";
import { $publisher, publish } from "~/shared/pubsub";
import { registerContainers, useCanvasStore } from "~/shared/sync";
import { useManageDesignModeStyles, GlobalStyles } from "./shared/styles";
import {
  WebstudioComponentCanvas,
  WebstudioComponentPreview,
} from "./features/webstudio-component";
import {
  assetsStore,
  pagesStore,
  instancesStore,
  selectedPageStore,
  registerComponentLibrary,
  registeredComponentsStore,
  subscribeComponentHooks,
  $isPreviewMode,
} from "~/shared/nano-states";
import { useDragAndDrop } from "./shared/use-drag-drop";
import { useCopyPaste } from "~/shared/copy-paste";
import { setDataCollapsed, subscribeCollapsedToPubSub } from "./collapsed";
import { useWindowResizeDebounced } from "~/shared/dom-hooks";
import { subscribeInstanceSelection } from "./instance-selection";
import { subscribeInstanceHovering } from "./instance-hovering";
import { useHashLinkSync } from "~/shared/pages";
import { useMount } from "~/shared/hook-utils/use-mount";
import { useSelectedInstance } from "./instance-selected-react";
import { subscribeInterceptedEvents } from "./interceptor";
import type { ImageLoader } from "@webstudio-is/image";
import { subscribeCommands } from "~/canvas/shared/commands";
import { updateCollaborativeInstanceRect } from "./collaborative-instance";
import { $params } from "./stores";

registerContainers();

const useElementsTree = (
  components: Components,
  instances: Instances,
  params: Params,
  imageLoader: ImageLoader
) => {
  const page = useStore(selectedPageStore);
  const isPreviewMode = useStore($isPreviewMode);
  const rootInstanceId = page?.rootInstanceId ?? "";

  if (typeof window === "undefined") {
    // @todo remove after https://github.com/webstudio-is/webstudio/issues/1313 now its needed to be sure that no leaks exists
    // eslint-disable-next-line no-console
    console.log({
      assetsStore: assetsStore.get().size,
      pagesStore: pagesStore.get()?.pages.length ?? 0,
      instancesStore: instancesStore.get().size,
    });
  }

  return useMemo(() => {
    return createElementsTree({
      renderer: isPreviewMode ? "preview" : "canvas",
      imageBaseUrl: params.imageBaseUrl,
      assetBaseUrl: params.assetBaseUrl,
      imageLoader,
      instances,
      rootInstanceId,
      Component: isPreviewMode
        ? WebstudioComponentPreview
        : WebstudioComponentCanvas,
      components,
    });
  }, [
    params,
    instances,
    rootInstanceId,
    components,
    isPreviewMode,
    imageLoader,
  ]);
};

const DesignMode = ({ params }: { params: Params }) => {
  useManageDesignModeStyles(params);
  useDragAndDrop();
  // We need to initialize this in both canvas and builder,
  // because the events will fire in either one, depending on where the focus is
  // @todo we need to forward the events from canvas to builder and avoid importing this
  // in both places
  useCopyPaste();

  useSelectedInstance();
  useEffect(updateCollaborativeInstanceRect, []);
  useEffect(subscribeInstanceSelection, []);
  useEffect(subscribeInstanceHovering, []);

  return null;
};

type CanvasProps = {
  params: Params;
  imageLoader: ImageLoader;
};

export const Canvas = ({
  params,
  imageLoader,
}: CanvasProps): JSX.Element | null => {
  useCanvasStore(publish);
  const isPreviewMode = useStore($isPreviewMode);

  useMount(() => {
    registerComponentLibrary({
      components: {},
      metas: coreMetas,
      propsMetas: corePropsMetas,
    });
    registerComponentLibrary({
      components: baseComponents,
      metas: baseComponentMetas,
      propsMetas: baseComponentPropsMetas,
    });
    registerComponentLibrary({
      components: remixComponents,
      metas: remixComponentMetas,
      propsMetas: remixComponentPropsMetas,
    });
    registerComponentLibrary({
      namespace: "@webstudio-is/sdk-components-react-radix",
      components: radixComponents,
      metas: radixComponentMetas,
      propsMetas: radixComponentPropsMetas,
      hooks: radixComponentHooks,
    });
  });

  useMount(() => {
    // required to compute asset and page props for rendering
    $params.set(params);
  });

  useEffect(subscribeComponentHooks, []);

  useEffect(subscribeCommands, []);

  useEffect(() => {
    $publisher.set({ publish });
  }, []);

  const selectedPage = useStore(selectedPageStore);

  useEffect(() => {
    const rootInstanceId = selectedPage?.rootInstanceId;
    if (rootInstanceId !== undefined) {
      setDataCollapsed(rootInstanceId);
    }
  });

  useWindowResizeDebounced(() => {
    const rootInstanceId = selectedPage?.rootInstanceId;
    if (rootInstanceId !== undefined) {
      setDataCollapsed(rootInstanceId);
    }
  });

  useEffect(subscribeCollapsedToPubSub, []);

  useHashLinkSync();

  useEffect(subscribeInterceptedEvents, []);

  const components = useStore(registeredComponentsStore);
  const instances = useStore(instancesStore);
  const elements = useElementsTree(components, instances, params, imageLoader);

  const [isInitialized, setInitialized] = useState(false);
  useEffect(() => {
    setInitialized(true);
  }, []);

  if (components.size === 0 || instances.size === 0) {
    return <remixComponents.Body />;
  }

  return (
    <>
      <GlobalStyles params={params} />
      {elements}
      {
        // Call hooks after render to ensure effects are last.
        // Helps improve outline calculations as all styles are then applied.
      }
      {isPreviewMode === false && isInitialized && (
        <DesignMode params={params} />
      )}
    </>
  );
};
