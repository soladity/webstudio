import { Select } from "@webstudio-is/design-system";
import { FontWeight, fontWeights } from "@webstudio-is/fonts";
import { toValue } from "@webstudio-is/react-sdk";
import { useMemo } from "react";
import { useAssets } from "~/designer/shared/assets";
import { getFinalValue } from "../../shared/get-final-value";
import type { ControlProps } from "../../style-sections";

type FontWeightItem = {
  label: string;
  weight: FontWeight;
};

const allFontWeights: Array<FontWeightItem> = (
  Object.keys(fontWeights) as Array<FontWeight>
).map((weight) => ({
  label: `${fontWeights[weight].label} (${weight})`,
  weight,
}));

// All font weights for the current family
const useAvailableFontWeights = (
  currentFamily: string
): Array<FontWeightItem> => {
  const { assets } = useAssets("font");

  // Find all font weights that are available for the current font family.
  return useMemo(() => {
    const found = allFontWeights.filter((option) => {
      return assets.find((asset) => {
        return (
          "meta" in asset &&
          "family" in asset.meta &&
          asset.meta.family === currentFamily &&
          String(asset.meta.weight) === option.weight
        );
      });
    });
    return found.length === 0 ? allFontWeights : found;
  }, [currentFamily, assets]);
};

const useLabels = (
  availableFontWeights: Array<FontWeightItem>,
  currentWeight: string
) => {
  const labels = useMemo(
    () => availableFontWeights.map((option) => option.label),
    [availableFontWeights]
  );

  const selectedLabel = useMemo(() => {
    const selectedOption = availableFontWeights.find(
      (option) => option.weight == currentWeight
    );
    return selectedOption?.label;
  }, [currentWeight, availableFontWeights]);

  return { labels, selectedLabel };
};

export const FontWeightControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  // @todo show which instance we inherited the value from
  const fontWeight = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });

  // We need the font family to determine which font weights are available
  const fontFamily = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: "fontFamily",
  });

  const availableFontWeights = useAvailableFontWeights(
    toValue(fontFamily, { withFallback: false })
  );
  const { labels, selectedLabel } = useLabels(
    availableFontWeights,
    toValue(fontWeight)
  );

  if (fontWeight === undefined) return null;

  const setValue = setProperty(styleConfig.property);

  return (
    <Select
      options={labels}
      // We use a weight as a value, because there are only 9 weights and they are unique.
      value={selectedLabel}
      onChange={(label) => {
        const selected = availableFontWeights.find(
          (option) => option.label == label
        );
        if (selected) {
          setValue(selected.weight);
        }
      }}
      ghost
      css={{
        // @todo this shouldn't be in design system by default
        gap: "calc($sizes$1 / 2)",
        paddingLeft: "calc($sizes$4 / 2)",
        height: "calc($sizes$5 + $sizes$1)",
        boxShadow: "inset 0 0 0 1px $colors$slate7",
        textTransform: "capitalize",
        fontWeight: "inherit",
        "&:hover": { background: "none" },
      }}
    />
  );
};
