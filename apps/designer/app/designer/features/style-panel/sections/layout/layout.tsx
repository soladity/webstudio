import { Box, Flex, Grid } from "@webstudio-is/design-system";
import { toValue } from "@webstudio-is/css-engine";
import type { RenderCategoryProps } from "../../style-sections";
import { FlexGrid } from "./shared/flex-grid";
import { Lock } from "./shared/lock";
import { ShowMore } from "../../shared/show-more";
import { renderProperty } from "../../style-sections";
import { MenuControl, SelectControl, TextControl } from "../../controls";
import { PropertyName } from "../../shared/property-name";
import { ColumnGapIcon, RowGapIcon } from "@webstudio-is/icons";
import { getFinalValue } from "../../shared/get-final-value";

const LayoutSectionFlex = ({
  deleteProperty,
  currentStyle,
  sectionStyle,
  createBatchUpdate,
}: RenderCategoryProps) => {
  const {
    display,
    flexDirection,
    flexWrap,
    alignItems,
    justifyContent,
    alignContent,
    columnGap,
    rowGap,
  } = sectionStyle;
  const batchUpdate = createBatchUpdate();
  const hasMenuItems = [
    flexDirection,
    flexWrap,
    alignItems,
    justifyContent,
    alignContent,
  ].some((config) => config !== undefined);

  const flexWrapValue = getFinalValue({
    currentStyle: flexWrap.currentStyle,
    inheritedStyle: flexWrap.inheritedStyle,
    property: flexWrap.styleConfig.property,
  });

  // From design: Notice that the align-content icon button is not visible by default.
  // This property only applies when flex-wrap is set to "wrap".
  const showAlignContent =
    flexWrapValue?.type === "keyword" &&
    (flexWrapValue.value === "wrap" || flexWrapValue.value === "wrap-reverse");

  return (
    <Flex css={{ flexDirection: "column", gap: "$spacing$5" }}>
      {display?.styleConfig && (
        <Grid
          css={{
            gridArea: "display",
            gridTemplateColumns: "auto 1fr",
            gap: "$spacing$13",
            width: "100%",
            fontWeight: "500",
          }}
        >
          <PropertyName
            property="display"
            label={display.styleConfig.label}
            onReset={() => deleteProperty("display")}
          />
          <SelectControl {...display} />
        </Grid>
      )}
      {hasMenuItems && (
        <Grid
          css={{
            gap: "$spacing$5",
            gridTemplateColumns:
              "repeat(2, $spacing$13) repeat(3, $spacing$13)",
            gridTemplateRows: "repeat(2, $spacing$13)",
            gridTemplateAreas: `
            "grid grid flexDirection flexWrap ."
            "grid grid alignItems justifyContent alignContent"
          `,
            alignItems: "center",
          }}
        >
          <Box css={{ gridArea: "grid" }}>
            <FlexGrid currentStyle={currentStyle} batchUpdate={batchUpdate} />
          </Box>
          {flexDirection?.styleConfig && (
            <Box css={{ gridArea: "flexDirection" }}>
              <MenuControl {...flexDirection} />
            </Box>
          )}
          {flexWrap?.styleConfig && (
            <Box css={{ gridArea: "flexWrap" }}>
              <MenuControl {...flexWrap} />
            </Box>
          )}
          {alignItems?.styleConfig && (
            <Box css={{ gridArea: "alignItems" }}>
              <MenuControl {...alignItems} />
            </Box>
          )}
          {justifyContent?.styleConfig && (
            <Box css={{ gridArea: "justifyContent" }}>
              <MenuControl {...justifyContent} />
            </Box>
          )}
          {alignContent && showAlignContent && (
            <Box css={{ gridArea: "alignContent" }}>
              <MenuControl {...alignContent} />
            </Box>
          )}
        </Grid>
      )}

      <Grid
        css={{
          gridTemplateColumns: "4fr 1fr 4fr",
          gridTemplateRows: "auto",
          gridTemplateAreas: `
            "columnGap lock rowGap"
          `,
          alignItems: "center",
        }}
      >
        {columnGap?.styleConfig && (
          <Box css={{ gridArea: "columnGap" }}>
            <TextControl icon={<ColumnGapIcon />} {...columnGap} />
          </Box>
        )}
        {rowGap?.styleConfig && columnGap?.styleConfig && (
          <Box css={{ gridArea: "lock", px: "$spacing$3" }}>
            <Lock
              pairedKeys={["columnGap", "rowGap"]}
              currentStyle={currentStyle}
              batchUpdate={batchUpdate}
            />
          </Box>
        )}
        {rowGap?.styleConfig && (
          <Box css={{ gridArea: "rowGap" }}>
            <TextControl icon={<RowGapIcon />} {...rowGap} />
          </Box>
        )}
      </Grid>
    </Flex>
  );
};

export const LayoutSection = ({
  setProperty,
  deleteProperty,
  createBatchUpdate,
  currentStyle,
  sectionStyle,
  inheritedStyle,
  category,
  styleConfigsByCategory,
  moreStyleConfigsByCategory,
}: RenderCategoryProps) => {
  const ActiveLayout = layouts.get(toValue(currentStyle.display));

  if (ActiveLayout) {
    return (
      <ActiveLayout
        setProperty={setProperty}
        deleteProperty={deleteProperty}
        createBatchUpdate={createBatchUpdate}
        currentStyle={currentStyle}
        sectionStyle={sectionStyle}
        inheritedStyle={inheritedStyle}
        category={category}
        styleConfigsByCategory={styleConfigsByCategory}
        moreStyleConfigsByCategory={moreStyleConfigsByCategory}
      />
    );
  }

  return (
    <>
      <ShowMore
        styleConfigs={moreStyleConfigsByCategory.map((entry) =>
          renderProperty(entry)
        )}
      />
      {styleConfigsByCategory.map((entry) => renderProperty(entry))}
    </>
  );
};

const layouts = new Map([
  ["none", null],
  ["block", null],
  ["inline-block", null],
  ["flex", LayoutSectionFlex],
  ["inline-flex", LayoutSectionFlex],
  ["grid", null],
  ["inline-grid", null],
]);
