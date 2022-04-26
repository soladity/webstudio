import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Breakpoint, Project, sort } from "@webstudio-is/sdk";
import type { Config } from "~/config";
import type { SelectedInstanceData } from "~/shared/component";
import { Box, Flex, Grid, type CSS } from "~/shared/design-system";
import interStyles from "~/shared/font-faces/inter.css";
import { SidebarLeft } from "./features/sidebar-left";
import { Inspector } from "./features/inspector";
import { CanvasIframe, useSubscribe, usePublish } from "./shared/canvas-iframe";
import {
  useBreakpoints,
  useIsPreviewMode,
  useRootInstance,
  useScale,
  useSelectedBreakpoint,
  useSelectedInstanceData,
  useSyncStatus,
  useCanvasWidth,
} from "./shared/nano-values";
import { Topbar } from "./features/topbar";
import designerStyles from "./designer.css";
import { Breadcrumbs } from "./features/breadcrumbs";
import { TreePrevew } from "./features/tree-preview";
import { usePublishShortcuts } from "./shared/shortcuts/use-publish-shortcuts";
import { type SyncStatus } from "~/shared/sync";

export const links = () => {
  return [
    { rel: "stylesheet", href: interStyles },
    { rel: "stylesheet", href: designerStyles },
  ];
};

const useSubscribeRootInstance = () => {
  const [, setValue] = useRootInstance();
  useSubscribe<"loadRootInstance">("loadRootInstance", setValue);
};

const useSubscribeSelectedInstanceData = () => {
  const [, setValue] = useSelectedInstanceData();
  useSubscribe<"selectInstance", SelectedInstanceData>(
    "selectInstance",
    setValue
  );
};

const useSubscribeSyncStatus = () => {
  const [, setValue] = useSyncStatus();
  useSubscribe<"syncStatus", SyncStatus>("syncStatus", setValue);
};

const useSubscribeBreakpoints = () => {
  const [breakpoints, setBreakpoints] = useBreakpoints();
  const [selectedBreakpoint, setSelectedBreakpoint] = useSelectedBreakpoint();
  useSubscribe<"loadBreakpoints", Array<Breakpoint>>(
    "loadBreakpoints",
    setBreakpoints
  );
  useEffect(() => {
    if (selectedBreakpoint === undefined && breakpoints.length !== 0) {
      setSelectedBreakpoint(sort(breakpoints)[breakpoints.length - 1]);
    }
  }, [breakpoints, selectedBreakpoint, setSelectedBreakpoint]);
};

const useIsDragging = (): [boolean, (isDragging: boolean) => void] => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  useSubscribe<"dragStartInstance">("dragStartInstance", () => {
    setIsDragging(true);
  });
  useSubscribe<"dragEndInstance">("dragEndInstance", () => {
    setIsDragging(false);
  });
  return [isDragging, setIsDragging];
};

type SidePanelProps = {
  children: JSX.Element | Array<JSX.Element>;
  isPreviewMode: boolean;
  css?: CSS;
  gridArea: "inspector" | "sidebar";
};

const SidePanel = ({
  children,
  isPreviewMode,
  gridArea,
  css,
}: SidePanelProps) => {
  if (isPreviewMode === true) return null;
  return (
    <Box
      as="aside"
      css={{
        gridArea,
        display: "flex",
        px: 0,
        fg: 0,
        // Left sidebar tabs won't be able to pop out to the right if we set overflowX to auto.
        //overflowY: "auto",
        bc: "$loContrast",
        height: "100%",
        ...css,
      }}
    >
      {children}
    </Box>
  );
};

const Main = ({ children }: { children: Array<JSX.Element> }) => (
  <Flex
    as="main"
    direction="column"
    css={{
      gridArea: "main",
      overflow: "hidden",
    }}
  >
    {children}
  </Flex>
);

const Workspace = ({ children }: { children: JSX.Element }) => {
  const [scale] = useScale();

  return (
    <Box
      css={{
        flexGrow: 1,
        background: "$gray8",
        overflow: "hidden",
      }}
    >
      <Flex
        direction="column"
        align="center"
        css={{
          overscrollBehavior: "contain",
          transformStyle: "preserve-3d",
          transition: "transform 50ms",
          height: "100%",
          width: "100%",
        }}
        style={{
          transform: `scale(${scale / 100})`,
        }}
      >
        {children}
      </Flex>
    </Box>
  );
};

type ChromeWrapperProps = {
  children: Array<JSX.Element>;
  isPreviewMode: boolean;
};

const ChromeWrapper = ({ children, isPreviewMode }: ChromeWrapperProps) => {
  const gridLayout = isPreviewMode
    ? {
        gridTemplateColumns: "auto 1fr",
        gridTemplateRows: "auto 1fr",
        gridTemplateAreas: `
                "header header"
                "sidebar main"
              `,
      }
    : {
        gridTemplateColumns: "auto 1fr 240px",
        gridTemplateRows: "auto 1fr",
        gridTemplateAreas: `
                "header header header"
                "sidebar main inspector"
              `,
      };
  return (
    <Grid
      css={{
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        ...gridLayout,
      }}
    >
      {children}
    </Grid>
  );
};

type DesignerProps = {
  config: Config;
  project: Project;
};

export const Designer = ({ config, project }: DesignerProps) => {
  useSubscribeSyncStatus();
  useSubscribeRootInstance();
  useSubscribeSelectedInstanceData();
  useSubscribeBreakpoints();
  const [publish, iframeRef] = usePublish();
  const [isPreviewMode] = useIsPreviewMode();
  const [isDragging, setIsDragging] = useIsDragging();
  usePublishShortcuts(publish);
  const [canvasWidth] = useCanvasWidth();

  return (
    <DndProvider backend={HTML5Backend}>
      <ChromeWrapper isPreviewMode={isPreviewMode}>
        <SidePanel gridArea="sidebar" isPreviewMode={isPreviewMode}>
          <SidebarLeft
            iframeRef={iframeRef}
            onDragChange={setIsDragging}
            publish={publish}
          />
        </SidePanel>
        <Topbar
          css={{ gridArea: "header" }}
          config={config}
          project={project}
          publish={publish}
        />
        <Main>
          <Workspace>
            <CanvasIframe
              ref={iframeRef}
              src={`${config.canvasPath}/${project.id}`}
              pointerEvents={isDragging ? "none" : "all"}
              title={project.title}
              css={{ height: "100%", width: canvasWidth || "100%" }}
            />
          </Workspace>
          <Breadcrumbs publish={publish} />
        </Main>
        <SidePanel
          gridArea="inspector"
          isPreviewMode={isPreviewMode}
          css={{ overflow: "hidden" }}
        >
          {isDragging ? <TreePrevew /> : <Inspector publish={publish} />}
        </SidePanel>
      </ChromeWrapper>
    </DndProvider>
  );
};
