import type { XYCoord } from "react-dnd";
import { type Instance } from "@webstudio-is/sdk";

export type DragData = {
  instance: Instance;
  currentOffset: XYCoord;
};

export type DropData = {
  instance: Instance;
  position: number | "end";
};
