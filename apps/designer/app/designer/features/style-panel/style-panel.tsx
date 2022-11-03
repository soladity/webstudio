import type { Publish } from "~/shared/pubsub";
import { willRender } from "~/designer/shared/breakpoints";
import { Box, Card, Paragraph, SearchField } from "@webstudio-is/design-system";
import type { SelectedInstanceData } from "~/shared/canvas-components";
import { useStyleData } from "./shared/use-style-data";
import { StyleSettings } from "./style-settings";
import { useState } from "react";
import {
  useCanvasWidth,
  useSelectedBreakpoint,
} from "~/designer/shared/nano-states";

type StylePanelProps = {
  publish: Publish;
  selectedInstanceData?: SelectedInstanceData;
};

export const StylePanel = ({
  selectedInstanceData,
  publish,
}: StylePanelProps) => {
  const { currentStyle, inheritedStyle, setProperty, createBatchUpdate } =
    useStyleData({
      selectedInstanceData,
      publish,
    });
  const [breakpoint] = useSelectedBreakpoint();
  const [canvasWidth] = useCanvasWidth();
  const [search, setSearch] = useState("");

  if (
    currentStyle === undefined ||
    inheritedStyle === undefined ||
    selectedInstanceData === undefined ||
    breakpoint === undefined
  ) {
    return null;
  }

  if (willRender(breakpoint, canvasWidth) === false) {
    return (
      <Box css={{ p: "$2" }}>
        <Card css={{ p: "$3", mt: "$3" }}>
          <Paragraph css={{ marginBottom: "$2" }}>
            {`Please increase the canvas width.`}
          </Paragraph>
          <Paragraph>
            {`"${breakpoint.label}" breakpoint minimum width is ${breakpoint.minWidth}px.`}
          </Paragraph>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <Box css={{ px: "$3", py: "$1" }}>
        <SearchField
          placeholder="Search"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          onCancel={() => {
            setSearch("");
          }}
        />
      </Box>

      <Box
        css={{
          overflow: "auto",
          position: "relative", // Hack - value picker popover positioning depends on it
        }}
      >
        <StyleSettings
          search={search}
          selectedInstanceData={selectedInstanceData}
          currentStyle={currentStyle}
          inheritedStyle={inheritedStyle}
          setProperty={setProperty}
          createBatchUpdate={createBatchUpdate}
        />
      </Box>
    </>
  );
};
