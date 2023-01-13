import { useState } from "react";
import {
  DeprecatedButton,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  PopoverHeader,
} from "@webstudio-is/design-system";
import { GearIcon, gearIconCssVars } from "@webstudio-is/icons";
import { ImageInfo } from "./image-info";
import { cssVars } from "@webstudio-is/css-vars";
import { Asset } from "@webstudio-is/asset-uploader";

const triggerVisibilityVar = cssVars.define("trigger-visibility");

export const imageInfoTriggerCssVars = ({ show }: { show: boolean }) => ({
  [triggerVisibilityVar]: show ? "visible" : "hidden",
});

export const ImageInfoTrigger = ({
  asset,
  onDelete,
}: {
  asset: Asset;
  onDelete: (ids: Array<string>) => void;
}) => {
  const [isInfoOpen, setInfoOpen] = useState(false);
  return (
    <Popover open={isInfoOpen} onOpenChange={setInfoOpen}>
      <PopoverTrigger asChild>
        <DeprecatedButton
          variant="raw"
          title="Options"
          onClick={() => setInfoOpen(true)}
          css={{
            visibility: cssVars.use(triggerVisibilityVar, "hidden"),
            position: "absolute",
            color: "$slate11",
            top: "$spacing$3",
            right: "$spacing$3",
            cursor: "pointer",
            transition: "opacity 100ms ease",
            "&:hover": {
              color: "$hiContrast",
            },
            ...gearIconCssVars({ fill: "$colors$loContrast" }),
          }}
        >
          <GearIcon />
        </DeprecatedButton>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent css={{ zIndex: "$1" }}>
          <PopoverHeader title="Asset Details" />
          <ImageInfo
            onDelete={(ids) => {
              setInfoOpen(false);
              onDelete(ids);
            }}
            asset={asset}
          />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};
