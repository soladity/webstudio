import { FloatingPanel } from "~/builder/shared/floating-panel";
import { ImageManager } from "~/builder/shared/image-manager";
import type { ReactElement } from "react";

export const ImageControl = (props: {
  onAssetIdChange: (assetId: string) => void;
  children: ReactElement;
}) => {
  return (
    <FloatingPanel
      title="Images"
      zIndex={1}
      content={
        <ImageManager
          onChange={(asset) => {
            props.onAssetIdChange(asset.id);
          }}
        />
      }
    >
      {props.children}
    </FloatingPanel>
  );
};
