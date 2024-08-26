import { type ReactNode } from "react";
import type { StyleProperty, UnitValue } from "@webstudio-is/css-engine";
import { toValue } from "@webstudio-is/css-engine";
import {
  Box,
  Grid,
  NestedIconLabel,
  ToggleButton,
} from "@webstudio-is/design-system";
import { CssValueInputContainer } from "../../shared/css-value-input";
import { styleConfigByName } from "../../shared/configs";
import { getStyleSource } from "../../shared/style-info";
import type { SectionProps } from "../shared/section";
import { deleteAllProperties, rowCss, setAllProperties } from "./utils";
import { useSelectedInstanceKv } from "../../shared/instances-kv";
import { PropertyLabel } from "../../property-label";

const borderPropertyStyleValueDefault: UnitValue = {
  type: "unit",
  value: 0,
  unit: "number",
};

export const BorderProperty = ({
  currentStyle,
  setProperty,
  deleteProperty,
  createBatchUpdate,
  individualModeIcon,
  borderPropertyOptions,
  label,
  description,
}: Pick<
  SectionProps,
  "currentStyle" | "setProperty" | "deleteProperty" | "createBatchUpdate"
> & {
  individualModeIcon?: ReactNode;
  borderPropertyOptions: Partial<{
    [property in StyleProperty]: { icon?: ReactNode };
  }>;
  label: string;
  description: string;
}) => {
  const borderProperties = Object.keys(borderPropertyOptions) as [
    StyleProperty,
    ...StyleProperty[],
  ];

  const allPropertyValuesAreEqual =
    new Set(
      borderProperties.map(
        (property) =>
          toValue(currentStyle[property]?.value) ??
          toValue(borderPropertyStyleValueDefault)
      )
    ).size === 1;

  /**
   * We do not use shorthand properties such as borderWidth or borderRadius in our code.
   * However, in the UI, we can display a single field, and in that case, we can use any property
   * from the shorthand property set and pass it instead.
   **/
  const firstPropertyName = borderProperties[0];

  const [showIndividualMode, setShowIndividualMode] = useSelectedInstanceKv(
    `${firstPropertyName}-showIndividualMode`,
    allPropertyValuesAreEqual === false && individualModeIcon !== undefined
  );

  const { items: borderPropertyItems } = styleConfigByName(firstPropertyName);

  const borderWidthKeywords = borderPropertyItems.map((item) => ({
    type: "keyword" as const,
    value: item.name,
  }));

  /**
   * If the property is displayed in a non-individual mode, we need to provide a value for it.
   * In Webflow, an empty value is shown. In Figma, the "Mixed" keyword is shown.
   * We have decided to show the first defined value, as it is difficult to determine a maximum value
   * when there are keywords (such as "thin" or "thick") and different units involved.
   **/
  const borderWidthStyleInfo = borderProperties
    .map((property) => currentStyle[property]?.value)
    .find((styleValue) => {
      if (styleValue === undefined) {
        return false;
      }

      return (
        (styleValue.type === "unit" && styleValue.value > 0) ||
        styleValue.type === "keyword"
      );
    });

  const borderWidthStyleSource = getStyleSource(
    ...borderProperties.map((property) => currentStyle[property])
  );

  const deleteBorderProperties = deleteAllProperties(
    borderProperties,
    createBatchUpdate
  );

  const setBorderProperties = setAllProperties(
    borderProperties,
    createBatchUpdate
  )(firstPropertyName);

  return (
    <Grid gap={1}>
      <Grid css={rowCss}>
        <PropertyLabel
          label={label}
          description={description}
          properties={borderProperties}
        />

        <Box
          css={{
            visibility: showIndividualMode ? "hidden" : "visible",
            gridColumn: individualModeIcon ? `span 1` : `span 2`,
          }}
        >
          <CssValueInputContainer
            property={firstPropertyName}
            styleSource={borderWidthStyleSource}
            keywords={borderWidthKeywords}
            value={borderWidthStyleInfo}
            setValue={setBorderProperties}
            deleteProperty={deleteBorderProperties}
          />
        </Box>

        {individualModeIcon && (
          <ToggleButton
            pressed={showIndividualMode}
            onPressedChange={setShowIndividualMode}
          >
            {individualModeIcon}
          </ToggleButton>
        )}
      </Grid>
      {showIndividualMode && (
        <Grid columns={2} gap={1}>
          {borderProperties.map((property) => (
            <CssValueInputContainer
              icon={
                <NestedIconLabel>
                  {borderPropertyOptions[property]?.icon}
                </NestedIconLabel>
              }
              key={property}
              property={property}
              styleSource={getStyleSource(currentStyle[property])}
              keywords={borderWidthKeywords}
              value={
                currentStyle[property]?.value ?? borderPropertyStyleValueDefault
              }
              setValue={setProperty(property)}
              deleteProperty={deleteProperty}
            />
          ))}
        </Grid>
      )}
    </Grid>
  );
};
