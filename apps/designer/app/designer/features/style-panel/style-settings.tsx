import hyphenate from "hyphenate-style-name";
import {
  categories,
  type CssRule,
  type Category,
  type Style,
} from "@webstudio-is/react-sdk";

import { type StyleConfig, styleConfigs } from "./lib/configs";
import { CollapsibleSection } from "~/designer/shared/inspector";
import { renderProperty, renderCategory } from "./style-section";
import { dependencies } from "./lib/dependencies";
import { type InheritedStyle } from "./lib/get-inherited-style";
import { type SetProperty } from "./lib/use-style-data";
import { type SelectedInstanceData } from "~/shared/canvas-components";

// Finds a property/value by using any available form: property, label, value
const filterProperties = (properties: Array<string>, search: string) => {
  const searchParts = search.split(" ").map((part) => part.trim());
  const includes = (property: string) => {
    if (property.toLowerCase().includes(search)) return true;
    if (hyphenate(property).includes(search)) return true;
    // Enables "ba co" to match "backgorund color"
    return searchParts.every((searchPart) =>
      property.toLowerCase().includes(searchPart)
    );
  };
  return properties.filter((property) => {
    for (const styleConfig of styleConfigs) {
      if (styleConfig.property !== property) continue;
      if (includes(styleConfig.property)) return true;
      if (includes(styleConfig.label)) return true;
      for (const item of styleConfig.items) {
        if (includes(item.name) || includes(item.label)) {
          return true;
        }
      }
    }
    return false;
  });
};

const appliesTo = (styleConfig: StyleConfig, currentStyle: Style): boolean => {
  const { appliesTo } = styleConfig;
  if (appliesTo in dependencies) {
    const dependency = dependencies[appliesTo];
    if (dependency === undefined) return false;
    const currentValue = currentStyle[dependency.property]?.value;
    if (currentValue === undefined) return false;
    if (Array.isArray(dependency.values))
      return dependency.values.includes(String(currentValue));
    if (Array.isArray(dependency.notValues))
      return dependency.notValues.includes(String(currentValue)) === false;
  }

  return true;
};

const didRender = (category: Category, { property }: StyleConfig): boolean => {
  // We only want to render the first thing in spacing since the widget will be the way to set all margin and padding
  if (category === "spacing" && property !== categories.spacing.properties[0]) {
    return true;
  }
  return false;
};

type StyleSettingsProps = {
  currentStyle: Style;
  inheritedStyle: InheritedStyle;
  cssRule?: CssRule;
  setProperty: SetProperty;
  selectedInstanceData: SelectedInstanceData;
  search: string;
};

export const StyleSettings = ({
  currentStyle,
  search,
  ...rest
}: StyleSettingsProps) => {
  const isSearchMode = search.length !== 0;
  const all = [];
  let category: Category;
  for (category in categories) {
    // @todo seems like properties are the exact strings and styleConfig.property is not?
    const categoryProperties = filterProperties(
      categories[category].properties as unknown as Array<string>,
      search
    );
    const { moreFrom } = categories[category];
    const styleConfigsByCategory: Array<JSX.Element> = [];
    const moreStyleConfigsByCategory: Array<JSX.Element> = [];

    for (const styleConfig of styleConfigs) {
      const isInCategory = categoryProperties.includes(styleConfig.property);
      // We don't want to filter out inapplicable styles if user wants to apply them anyway
      const isApplicable = isSearchMode
        ? true
        : appliesTo(styleConfig, currentStyle);
      const isRendered = didRender(category, styleConfig);

      if (isInCategory && isApplicable && isRendered === false) {
        const element = renderProperty({
          ...rest,
          currentStyle,
          styleConfig,
          category,
        });

        // We are making a separate array of properties which come after the "moreFrom"
        // so we can make them collapsable
        if (
          (styleConfig.property === moreFrom ||
            moreStyleConfigsByCategory.length !== 0) &&
          isSearchMode === false
        ) {
          moreStyleConfigsByCategory.push(element);
          continue;
        }

        styleConfigsByCategory.push(element);
      }
    }

    if (styleConfigsByCategory.length === 0) continue;

    all.push(
      <CollapsibleSection
        isOpen={isSearchMode ? true : undefined}
        label={categories[category].label}
        key={category}
      >
        <>
          {renderCategory({
            category,
            styleConfigsByCategory,
            moreStyleConfigsByCategory,
          })}
        </>
      </CollapsibleSection>
    );
  }
  return <>{all}</>;
};
