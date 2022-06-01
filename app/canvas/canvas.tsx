import { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import store from "immerhin";
import {
  type OnChangeChildren,
  type Data,
  type Tree,
  useAllUserProps,
  WrapperComponent,
  globalStyles,
  useSubscribe,
} from "@webstudio-is/sdk";
import {
  createElementsTree,
  setInstanceChildrenMutable,
} from "~/shared/tree-utils";
import { useDragDropHandlers } from "./shared/use-drag-drop-handlers";
import { useShortcuts } from "./shared/use-shortcuts";
import {
  usePopulateRootInstance,
  useInsertInstance,
  useDeleteInstance,
  useReparentInstance,
  usePublishSelectedInstance,
  usePublishRootInstance,
  useUpdateSelectedInstance,
} from "./shared/instance";
import { useUpdateStyle } from "./shared/style";
import { useActiveElementTracking } from "./shared/active-element";
import { WrapperComponentDev } from "./features/wrapper-component";
import {
  rootInstanceContainer,
  useRootInstance,
  useBreakpoints,
} from "./shared/nano-values";
import { useSync } from "./shared/sync";
import { useManageProps } from "./shared/props";
import {
  useHandleBreakpoints,
  useInitializeBreakpoints,
} from "./shared/breakpoints";
import { ParsedProject } from "~/shared/db/project.server";

const useElementsTree = () => {
  const [rootInstance] = useRootInstance();
  const [breakpoints] = useBreakpoints();

  return useMemo(() => {
    if (rootInstance === undefined) return;

    const onChangeChildren: OnChangeChildren = (change) => {
      store.createTransaction([rootInstanceContainer], (rootInstance) => {
        if (rootInstance === undefined) return;

        const { instanceId, updates } = change;
        setInstanceChildrenMutable(instanceId, updates, rootInstance);
      });
    };

    return createElementsTree({
      instance: rootInstance,
      breakpoints,
      Component: WrapperComponentDev,
      onChangeChildren,
    });
  }, [rootInstance, breakpoints]);
};

const useSubscribePreviewMode = () => {
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  useSubscribe<"previewMode", boolean>("previewMode", setIsPreviewMode);
  return isPreviewMode;
};

const PreviewMode = () => {
  const [rootInstance] = useRootInstance();
  const [breakpoints] = useBreakpoints();
  if (rootInstance === undefined) return null;
  return createElementsTree({
    breakpoints,
    instance: rootInstance,
    Component: WrapperComponent,
  });
};

type DesignModeProps = {
  treeId: Tree["id"];
  project: ParsedProject;
};

const DesignMode = ({ treeId, project }: DesignModeProps) => {
  useDragDropHandlers();
  useUpdateStyle();
  useManageProps();
  usePublishSelectedInstance({ treeId });
  useHandleBreakpoints();
  useInsertInstance();
  useReparentInstance();
  useDeleteInstance();
  usePublishRootInstance();
  useActiveElementTracking();
  useSync({ project });
  useUpdateSelectedInstance();
  const elements = useElementsTree();
  return (
    // Using touch backend becuase html5 drag&drop doesn't fire drag events in our case
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      {elements}
    </DndProvider>
  );
};

type CanvasProps = {
  data: Data & { project: ParsedProject };
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

  if (isPreviewMode) {
    return <PreviewMode />;
  }

  return <DesignMode treeId={data.tree.id} project={data.project} />;
};
