import type { Publish } from "~/shared/pubsub";
import { Box } from "@webstudio-is/design-system";
import { PlacementIndicator } from "@webstudio-is/design-system";
import {
  useIsPreviewMode,
  useIsScrolling,
  useSubscribeScrollState,
  useDragAndDropState,
  useSubscribeDragAndDropState,
} from "~/shared/nano-states";
import {
  HoveredInstanceOutline,
  SelectedInstanceOutline,
  DropTargetOutline,
} from "./outline";
import { useSubscribeTextToolbar, TextToolbar } from "./text-toolbar";
import { useSubscribeInstanceRect } from "./hooks/use-subscribe-instance-rect";
import { useSubscribeTextEditingInstanceId } from "./hooks/use-subscribe-editing-instance-id";

const toolsStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: "none",
  overflow: "hidden",
};

type CanvasToolsProps = {
  publish: Publish;
};

export const CanvasTools = ({ publish }: CanvasToolsProps) => {
  // @todo try to setup cross-frame atoms to vaoid this
  useSubscribeInstanceRect();
  useSubscribeTextToolbar();
  useSubscribeScrollState();
  useSubscribeDragAndDropState();
  useSubscribeTextEditingInstanceId();

  const [isPreviewMode] = useIsPreviewMode();
  const [isScrolling] = useIsScrolling();
  const [dragAndDropState] = useDragAndDropState();

  if (
    dragAndDropState.isDragging &&
    dragAndDropState.dropTarget !== undefined
  ) {
    return (
      <Box css={toolsStyle}>
        <DropTargetOutline dropTarget={dragAndDropState.dropTarget} />
        <PlacementIndicator placement={dragAndDropState.dropTarget.placement} />
      </Box>
    );
  }

  if (isPreviewMode || isScrolling) {
    return null;
  }
  return (
    <Box css={toolsStyle}>
      <SelectedInstanceOutline />
      <HoveredInstanceOutline />
      <TextToolbar publish={publish} />
    </Box>
  );
};
