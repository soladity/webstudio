import { Box, Flex, Toaster } from "@webstudio-is/design-system";
import { type Instance, type InstanceProps } from "@webstudio-is/react-sdk";
import { useCanvasWidth, useZoom } from "~/designer/shared/nano-states";
import { CanvasTools } from "./canvas-tools";
import { type Publish } from "~/shared/pubsub";

declare module "~/shared/pubsub" {
  export interface PubsubMap {
    insertInstance: {
      instance: Instance;
      dropTarget?: { parentId: Instance["id"]; position: number };
      props?: InstanceProps;
    };
    reparentInstance: {
      instanceId: Instance["id"];
      dropTarget: { instanceId: Instance["id"]; position: number };
    };
    unselectInstance: undefined;
  }
}

const workspaceStyle = {
  flexGrow: 1,
  background: "$gray3",
  // scroll behaviour should be derived from the iframe
  overflow: "hidden",
  scrollbarGutter: "stable",
  position: "relative",
};

const zoomStyle = {
  transformStyle: "preserve-3d",
  transition: "transform 200ms ease-out",
  height: "100%",
  width: "100%",
};

const canvasContainerStyle = {
  position: "relative",
  height: "100%",
};

type WorkspaceProps = {
  children: JSX.Element;
  onTransitionEnd: () => void;
  publish: Publish;
};

export const Workspace = ({
  children,
  onTransitionEnd,
  publish,
}: WorkspaceProps) => {
  const [zoom] = useZoom();
  const [canvasWidth] = useCanvasWidth();

  const handleWorkspaceClick = () => {
    publish({ type: "unselectInstance" });
  };

  return (
    <Box css={workspaceStyle} onClick={handleWorkspaceClick}>
      <Flex
        direction="column"
        align="center"
        css={zoomStyle}
        style={{ transform: `scale(${zoom / 100})` }}
        onTransitionEnd={onTransitionEnd}
      >
        <Box css={canvasContainerStyle} style={{ width: canvasWidth }}>
          {children}
          <CanvasTools publish={publish} />
        </Box>
      </Flex>
      <Toaster />
    </Box>
  );
};
