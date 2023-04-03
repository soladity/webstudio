import {
  Box,
  Flex,
  Grid,
  DeprecatedIconButton,
} from "@webstudio-is/design-system";
import { toValue } from "@webstudio-is/css-engine";
import { DotIcon } from "@webstudio-is/icons";
import type { CreateBatchUpdate } from "../../../shared/use-style-data";
import { getStyleSource, type StyleInfo } from "../../../shared/style-info";
import { theme } from "@webstudio-is/design-system";

export const FlexGrid = ({
  currentStyle,
  batchUpdate,
}: {
  currentStyle: StyleInfo;
  batchUpdate: ReturnType<CreateBatchUpdate>;
}) => {
  const styleSource = getStyleSource(
    currentStyle.flexDirection,
    currentStyle.justifyContent,
    currentStyle.justifyItems,
    currentStyle.alignContent,
    currentStyle.alignItems
  );
  const flexDirection = toValue(currentStyle.flexDirection?.value);
  const justifyContent = toValue(currentStyle.justifyContent?.value);
  const alignItems = toValue(currentStyle.alignItems?.value);
  const setAlignItems = batchUpdate.setProperty("alignItems");
  const setJustifyContent = batchUpdate.setProperty("justifyContent");
  const alignment = ["start", "center", "end"];
  const gridSize = alignment.length;
  const isFlexDirectionColumn =
    flexDirection === "column" || flexDirection === "column-reverse";

  let color = theme.colors.foregroundFlexUiMain;
  if (styleSource === "local") {
    color = theme.colors.borderLocalFlexUi;
  }
  if (styleSource === "remote") {
    color = theme.colors.borderRemoteFlexUi;
  }

  return (
    <Grid
      tabIndex={0}
      css={{
        width: "100%",
        aspectRatio: "1 / 1",
        padding: theme.spacing[4],
        borderRadius: "4px",
        background: theme.colors.backgroundControls,
        outlineStyle: "solid",
        outlineWidth: styleSource === "default" ? 1 : 2,
        outlineColor: color,
        alignItems: "center",
        gap: theme.spacing[1],
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        color,
        "&:focus-within": {
          outlineWidth: 2,
          outlineColor: theme.colors.borderLocalFlexUi,
        },
      }}
    >
      {Array.from(Array(gridSize * gridSize), (_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        // grid edges starts with 1
        let gridColumn = `${x + 1} / ${x + 2}`;
        let gridRow = `${y + 1} / ${y + 2}`;
        if (isFlexDirectionColumn) {
          [gridColumn, gridRow] = [gridRow, gridColumn];
        }
        return (
          <Flex
            key={index}
            justify="center"
            align="center"
            css={{
              width: "100%",
              height: "100%",
              gridColumn,
              gridRow,
            }}
          >
            <DeprecatedIconButton
              tabIndex={-1}
              css={{
                width: "100%",
                height: "100%",
                color: theme.colors.foregroundFlexUiMain,
                "&:hover": {
                  // @todo not clear which token to use here
                  background: theme.colors.slate4,
                },
                "&:focus": {
                  background: "none",
                  boxShadow: "none",
                  outline: "none",
                },
              }}
              onClick={() => {
                const justifyContent = alignment[x];
                const alignItems = alignment[y];
                setAlignItems(alignItems);
                setJustifyContent(justifyContent);
                batchUpdate.publish();
              }}
            >
              <DotIcon />
            </DeprecatedIconButton>
          </Flex>
        );
      })}

      <Flex
        css={{
          width: "100%",
          height: "100%",
          // fill whole grid
          gridColumn: "-1 / 1",
          gridRow: "-1 / 1",
          p: 1,
          gap: 2,
          pointerEvents: "none",
          // controlled styles
          flexDirection,
          justifyContent,
          alignItems,
        }}
      >
        {[10, 16, 8].map((size) => (
          <Box
            key={size}
            css={{
              borderRadius: `calc(${theme.borderRadius[4]} / 2)`,
              backgroundColor: "currentColor",
              ...(isFlexDirectionColumn
                ? { minWidth: size, minHeight: 4 }
                : { minWidth: 4, minHeight: size }),
            }}
          ></Box>
        ))}
      </Flex>
    </Grid>
  );
};
