import { useCallback, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import store from "immerhin";
import * as db from "~/shared/db";
import {
  type OnChangeChildren,
  type Data,
  type Tree,
  useAllUserProps,
  globalStyles,
  useSubscribe,
  createElementsTree,
} from "@webstudio-is/react-sdk";
import { setInstanceChildrenMutable } from "~/shared/tree-utils";
import { useDragDropHandlers } from "./shared/use-drag-drop-handlers";
import { useShortcuts } from "./shared/use-shortcuts";
import {
  usePopulateRootInstance,
  useInsertInstance,
  useDeleteInstance,
  useReparentInstance,
  usePublishSelectedInstanceData,
  usePublishRootInstance,
  useUpdateSelectedInstance,
  usePublishSelectedInstanceDataRect,
  usePublishHoveredInstanceRect,
  usePublishHoveredInstanceData,
  useSetHoveredInstance,
  useUnselectInstance,
  usePublishTextEditingInstanceId,
} from "./shared/instance";
import { useUpdateStyle } from "./shared/style";
import { useTrackSelectedElement } from "./shared/use-track-selected-element";
import { WrapperComponentDev } from "./features/wrapper-component";
import { useSync } from "./shared/sync";
import { useManageProps } from "./shared/props";
import {
  useHandleBreakpoints,
  useInitializeBreakpoints,
} from "./shared/breakpoints";
import {
  rootInstanceContainer,
  useBreakpoints,
  useRootInstance,
  useSubscribeScrollState,
} from "~/shared/nano-states";
import { registerContainers } from "./shared/immerhin";
import { useTrackHoveredElement } from "./shared/use-track-hovered-element";
import { usePublishScrollState } from "./shared/use-publish-scroll-state";
import {
  LexicalComposer,
  config,
} from "~/canvas/features/wrapper-component/text-editor";

registerContainers();

const useElementsTree = () => {
  const [rootInstance] = useRootInstance();
  const [breakpoints] = useBreakpoints();

  const onChangeChildren: OnChangeChildren = useCallback((change) => {
    store.createTransaction([rootInstanceContainer], (rootInstance) => {
      if (rootInstance === undefined) return;

      const { instanceId, updates } = change;
      setInstanceChildrenMutable(instanceId, updates, rootInstance);
    });
  }, []);

  return useMemo(() => {
    if (rootInstance === undefined) return null;

    return createElementsTree({
      instance: rootInstance,
      breakpoints,
      Component: WrapperComponentDev,
      onChangeChildren,
    });
  }, [rootInstance, breakpoints, onChangeChildren]);
};

const useSubscribePreviewMode = () => {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  useSubscribe<"previewMode", boolean>("previewMode", setIsPreviewMode);
  return isPreviewMode;
};

type DesignModeProps = {
  treeId: Tree["id"];
  project: db.project.Project;
  children: JSX.Element | null;
};

const dndOptions = {
  enableMouseEvents: true,
  // Prevents accidental dragging when trying to select an instance
  delay: 10,
};

const DesignMode = ({ treeId, project, children }: DesignModeProps) => {
  useDragDropHandlers();
  useUpdateStyle();
  useManageProps();
  usePublishSelectedInstanceData(treeId);
  usePublishHoveredInstanceData();
  useHandleBreakpoints();
  useInsertInstance();
  useReparentInstance();
  useDeleteInstance();
  usePublishRootInstance();
  useTrackSelectedElement();
  useTrackHoveredElement();
  useSetHoveredInstance();
  useSync({ project });
  useUpdateSelectedInstance();
  usePublishSelectedInstanceDataRect();
  usePublishHoveredInstanceRect();
  useUnselectInstance();
  usePublishScrollState();
  useSubscribeScrollState();
  usePublishTextEditingInstanceId();
  return (
    // Using touch backend becuase html5 drag&drop doesn't fire drag events in our case
    <DndProvider backend={TouchBackend} options={dndOptions}>
      {children && (
        <LexicalComposer initialConfig={config}>{children}</LexicalComposer>
      )}
    </DndProvider>
  );
};

type CanvasProps = {
  data: Data & { project: db.project.Project };
};

export const Canvas = ({ data }: CanvasProps): JSX.Element | null => {
  if (data.tree === null) {
    throw new Error("Tree is null");
  }
  useInitializeBreakpoints(data.breakpoints);
  globalStyles();
  useAllUserProps(data.props);
  usePopulateRootInstance(data.tree);
  // e.g. toggling preview is still needed in both modes
  useShortcuts();
  const isPreviewMode = useSubscribePreviewMode();
  const elements = useElementsTree();
  if (isPreviewMode) {
    return elements;
  }

  return (
    <DesignMode treeId={data.tree.id} project={data.project}>
      {elements}
    </DesignMode>
  );
};
