import { useSubscribe, type Instance } from "@webstudio-is/react-sdk";
import { useDragAndDropState } from "./nano-states";
import { DropTargetSharedData } from "~/canvas/shared/use-drag-drop";

export const useSubscribeDragAndDropState = () => {
  const [state, setState] = useDragAndDropState();

  useSubscribe<"dropTargetChange", DropTargetSharedData>(
    "dropTargetChange",
    (dropTarget) => {
      if (state.isDragging) {
        setState({ ...state, dropTarget });
      }
    }
  );

  useSubscribe<"dragStart", { dragItem: { instanceId: Instance["id"] } }>(
    "dragStart",
    ({ dragItem }) => {
      setState({ isDragging: true, dragItem });
    }
  );

  useSubscribe<"dragEnd">("dragEnd", () => {
    setState({ isDragging: false });
  });
};
