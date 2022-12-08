import { Flex, Grid, IconButton_deprecated } from "@webstudio-is/design-system";
import { DotFilledIcon } from "@webstudio-is/icons";
import { useIsFromCurrentBreakpoint } from "../../../shared/use-is-from-current-breakpoint";
import type { Style } from "@webstudio-is/css-data";
import type { CreateBatchUpdate } from "../../../shared/use-style-data";

export const FlexGrid = ({
  currentStyle,
  batchUpdate,
}: {
  currentStyle: Style;
  batchUpdate: ReturnType<CreateBatchUpdate>;
}) => {
  const isCurrentBreakpoint = useIsFromCurrentBreakpoint([
    "flexDirection",
    "justifyContent",
    "justifyItems",
    "alignContent",
    "alignItems",
  ]);
  const flexDirection = currentStyle.flexDirection?.value as string;
  const justifyContent = currentStyle.justifyContent?.value as string;
  const alignItems = currentStyle.alignItems?.value as string;
  const direction = Number(flexDirection.includes("column"));
  const cells = [
    "_0_0",
    "_0_1",
    "_0_2",
    "_1_0",
    "_1_1",
    "_1_2",
    "_2_0",
    "_2_1",
    "_2_2",
  ];
  const rowOptions: Record<string, number> = {
    stretch: 0,
    normal: 0,
    start: 0,
    center: 1,
    end: 2,
  };
  const columnOptions: Record<string, number> = {
    "space-around": 0,
    normal: 0,
    start: 0,
    center: 1,
    end: 2,
  };
  const rowValue = rowOptions[alignItems];
  const columnValue = columnOptions[justifyContent];
  const currentPosition = rowValue * 3 + columnValue;
  const setAlignItems = batchUpdate.setProperty("alignItems");
  const setJustifyContent = batchUpdate.setProperty("justifyContent");
  return (
    <Grid
      css={{
        width: "100%",
        aspectRatio: "1 / 1",
        padding: "$spacing$4",
        borderRadius: "4px",
        background: "$loContrast",
        border: "2px solid currentColor",
        alignItems: "center",
        gap: "$spacing$1",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gridTemplateAreas: `
          "${cells.slice(0, 0 + 3).join(" ")}"
          "${cells.slice(3, 3 + 3).join(" ")}"
          "${cells.slice(6, 6 + 3).join(" ")}"
        `,
        color: isCurrentBreakpoint ? "$colors$blue9" : "$colors$slate8",
        transform: direction
          ? "rotate(-90deg) scaleX(-1)"
          : "rotate(0deg) scaleX(1)",
      }}
    >
      {cells.map((value, index) => (
        <Flex
          justify="center"
          align="center"
          key={index}
          css={{
            gridArea: value,
            width: "100%",
            height: "100%",
          }}
        >
          <IconButton_deprecated
            css={{
              width: "100%",
              height: "100%",
              color: "$colors$gray8",
              "&:hover": {
                bc: "$colors$slate4",
              },
              "&:focus": {
                background: "none",
                boxShadow: "none",
                outline: "none",
              },
            }}
            onClick={() => {
              const [alignItems, justifyContent] = cells[index]
                .slice(1)
                .split("_")
                .map((value) => ["start", "center", "end"][parseFloat(value)]);
              setAlignItems(alignItems);
              setJustifyContent(justifyContent);
              batchUpdate.publish();
            }}
          >
            <DotFilledIcon />
          </IconButton_deprecated>
        </Flex>
      ))}
      <Flex
        css={{
          gridArea: cells[currentPosition],
          ...(alignItems === "stretch" && {
            gridColumnEnd: "none",
          }),
          ...(justifyContent === "space-around" && {
            gridRowEnd: "none",
            justifyContent: "space-around",
          }),
          alignItems:
            `start center end start center end start center end`.split(" ")[
              currentPosition
            ],
          pointerEvents: "none",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          gap: "calc($spacing$3 / 2)",
          color: "currentColor",
        }}
      >
        {["60%", "100%", "60%"].map((value, index) => (
          <Flex
            key={index}
            css={{
              inlineSize: value,
              blockSize: "calc(100% / 3)",
              maxBlockSize: "$spacing$4",
              background: "currentColor",
              borderRadius: "calc($borderRadius$4 / 2)",
            }}
          ></Flex>
        ))}
      </Flex>
    </Grid>
  );
};
