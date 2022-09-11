import { useState, useEffect } from "react";
import { Flex, IconButton, Tooltip } from "@webstudio-is/design-system";
import { LockOpenIcon, LockCloseIcon } from "@webstudio-is/icons";
import type { Style } from "@webstudio-is/react-sdk";
import type { CreateBatchUpdate } from "../../../shared/use-style-data";

export const Lock = ({
  name,
  pairedKeys,
  currentStyle,
  batchUpdate,
}: {
  name: string;
  pairedKeys: Array<keyof Style>;
  currentStyle: Style;
  batchUpdate: ReturnType<CreateBatchUpdate>;
}) => {
  const aKey = pairedKeys[0];
  const bKey = pairedKeys[1];
  const a = currentStyle[aKey];
  const b = currentStyle[bKey];
  const aVal =
    a?.value + (a?.type === "unit" && a.unit !== "number" ? a.unit : "");
  const bVal =
    b?.value + (b?.type === "unit" && b.unit !== "number" ? b.unit : "");
  const [isPaired, setIsPaired] = useState(aVal === bVal);

  useEffect(() => {
    if (!isPaired) return;
    if (aVal === bVal) return;
    batchUpdate.setProperty(aKey)(aVal);
    batchUpdate.setProperty(bKey)(aVal);
    batchUpdate.publish();
  }, [aKey, bKey, aVal, bVal, isPaired, batchUpdate]);

  return (
    <Tooltip
      content={isPaired ? "Unlock" : "Lock"}
      delayDuration={400}
      disableHoverableContent={true}
    >
      <Flex
        data-property={name}
        css={{
          width: "100%",
          justifyContent: "center",
          gridArea: name,
        }}
      >
        <IconButton
          css={{
            "&:focus": {
              outline: "none",
            },
          }}
          onClick={() => setIsPaired((value) => !value)}
        >
          {isPaired ? <LockCloseIcon /> : <LockOpenIcon />}
        </IconButton>
      </Flex>
    </Tooltip>
  );
};
