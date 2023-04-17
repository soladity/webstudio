import { useStore } from "@nanostores/react";
import type { Publish } from "~/shared/pubsub";
import { Box } from "@webstudio-is/design-system";
import { PlacementIndicator } from "@webstudio-is/design-system";
import {
  useIsPreviewMode,
  useDragAndDropState,
  instancesStore,
} from "~/shared/nano-states";
import { HoveredInstanceOutline, SelectedInstanceOutline } from "./outline";
import { TextToolbar } from "./text-toolbar";
import { useSubscribeSwitchPage } from "~/shared/pages";
import { Label } from "./outline/label";
import { Outline } from "./outline/outline";
import { useSubscribeDragAndDropState } from "./use-subscribe-drag-drop-state";
import { ResizeHandles } from "./resize-handles";
import { MediaBadge } from "./media-badge";

const toolsStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  pointerEvents: "none",
};

type CanvasToolsProps = {
  publish: Publish;
};

export const CanvasTools = ({ publish }: CanvasToolsProps) => {
  // @todo try to setup cross-frame atoms to avoid this
  useSubscribeDragAndDropState();
  useSubscribeSwitchPage();

  const [isPreviewMode] = useIsPreviewMode();
  const [dragAndDropState] = useDragAndDropState();
  const instances = useStore(instancesStore);

  if (
    dragAndDropState.isDragging &&
    dragAndDropState.dropTarget !== undefined &&
    dragAndDropState.placementIndicator !== undefined
  ) {
    const { dropTarget, placementIndicator } = dragAndDropState;
    const dropTargetInstance = instances.get(dropTarget.itemSelector[0]);
    return dropTargetInstance ? (
      <Box css={toolsStyle}>
        <Outline rect={placementIndicator.parentRect}>
          <Label
            instance={dropTargetInstance}
            instanceRect={placementIndicator.parentRect}
          />
        </Outline>
        {placementIndicator !== undefined && (
          <PlacementIndicator placement={placementIndicator} />
        )}
      </Box>
    ) : null;
  }

  return (
    <Box css={toolsStyle}>
      <MediaBadge />
      <ResizeHandles />
      {isPreviewMode === false && <SelectedInstanceOutline />}
      {isPreviewMode === false && <HoveredInstanceOutline />}
      {isPreviewMode === false && <TextToolbar publish={publish} />}
    </Box>
  );
};
