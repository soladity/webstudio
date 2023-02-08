import { isFeatureEnabled } from "@webstudio-is/feature-flags";
import {
  theme,
  Box,
  Card,
  DeprecatedParagraph,
} from "@webstudio-is/design-system";
import type { Instance } from "@webstudio-is/project-build";
import type { Publish } from "~/shared/pubsub";
import { willRender } from "~/designer/shared/breakpoints";
import { useStyleData } from "./shared/use-style-data";
import { StyleSettings } from "./style-settings";
import {
  useCanvasWidth,
  useSelectedBreakpoint,
} from "~/designer/shared/nano-states";
import { StyleSourcesSection } from "./style-source-section";

type StylePanelProps = {
  publish: Publish;
  selectedInstance: Instance;
};

export const StylePanel = ({ selectedInstance, publish }: StylePanelProps) => {
  const { currentStyle, setProperty, deleteProperty, createBatchUpdate } =
    useStyleData({
      selectedInstance,
      publish,
    });

  const [breakpoint] = useSelectedBreakpoint();
  const [canvasWidth] = useCanvasWidth();

  if (
    currentStyle === undefined ||
    selectedInstance === undefined ||
    breakpoint === undefined
  ) {
    return null;
  }

  if (willRender(breakpoint, canvasWidth) === false) {
    return (
      <Box css={{ p: theme.spacing[5] }}>
        <Card css={{ p: theme.spacing[9], mt: theme.spacing[9] }}>
          <DeprecatedParagraph css={{ marginBottom: theme.spacing[5] }}>
            {`Please increase the canvas width.`}
          </DeprecatedParagraph>
          <DeprecatedParagraph>
            {`"${breakpoint.label}" breakpoint minimum width is ${breakpoint.minWidth}px.`}
          </DeprecatedParagraph>
        </Card>
      </Box>
    );
  }

  return (
    <>
      {isFeatureEnabled("styleSourceInput") && (
        <Box
          css={{
            px: theme.spacing[9],
            pb: theme.spacing[9],
            boxShadow: `0px 1px 0 ${theme.colors.panelOutline}`,
          }}
        >
          <StyleSourcesSection />
        </Box>
      )}

      <Box
        css={{
          overflow: "auto",
        }}
      >
        <StyleSettings
          search=""
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
          createBatchUpdate={createBatchUpdate}
        />
      </Box>
    </>
  );
};
