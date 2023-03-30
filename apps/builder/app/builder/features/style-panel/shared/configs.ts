import type { StyleProperty, AppliesTo } from "@webstudio-is/css-data";
import { keywordValues, properties } from "@webstudio-is/css-data";
import { humanizeString } from "~/shared/string-utils";
import {
  IconRecords,
  AlignContentStartIcon,
  AlignContentEndIcon,
  AlignContentCenterIcon,
  AlignContentStretchIcon,
  AlignContentSpaceAroundIcon,
  AlignContentSpaceBetweenIcon,
  AlignItemsStartIcon,
  AlignItemsEndIcon,
  AlignItemsCenterIcon,
  AlignItemsBaselineIcon,
  AlignItemsStretchIcon,
  FlexDirectionRowIcon,
  FlexDirectionColumnIcon,
  FlexDirectionRowReverseIcon,
  FlexDirectionColumnReverseIcon,
  FlexWrapNowrapIcon,
  FlexWrapWrapIcon,
  FlexWrapWrapReverseIcon,
  JustifyContentStartIcon,
  JustifyContentEndIcon,
  JustifyContentCenterIcon,
  JustifyContentSpaceBetweenIcon,
  JustifyContentSpaceAroundIcon,
  JustifyItemsStartIcon,
  JustifyItemsEndIcon,
  JustifyItemsCenterIcon,
  RowGapIcon,
  ColumnGapIcon,
} from "@webstudio-is/icons";
import type * as Controls from "../controls";

type BaseStyleConfig = {
  label: string;
  property: StyleProperty;
  appliesTo: AppliesTo;
};

export type Control = keyof typeof Controls;

export type StyleConfig = BaseStyleConfig & {
  control: Control;
  items: Array<{ label: string; name: string }>;
};

type Property = keyof typeof keywordValues;

const getControl = (property: StyleProperty): Control => {
  if (property.toLocaleLowerCase().includes("color")) {
    return "ColorControl";
  }

  switch (property) {
    case "fontFamily": {
      return "FontFamilyControl";
    }
    case "backgroundImage": {
      // @todo implement image picker for background image
      return "ImageControl";
    }
    case "fontWeight": {
      return "FontWeightControl";
    }
  }

  return "TextControl";
};

const styleConfigCache = new Map<StyleProperty, StyleConfig>();

export const styleConfigByName = (propertyName: StyleProperty): StyleConfig => {
  const fromCache = styleConfigCache.get(propertyName);

  if (fromCache) {
    return fromCache;
  }

  // @todo propertyName is more narrow, only the props
  // in that category, we are widening the type to include all properties
  const property = propertyName as Property;

  const keywords = keywordValues[property] || [];
  const label = humanizeString(property);

  const result = {
    label,
    property,
    appliesTo: properties[property].appliesTo,
    control: getControl(property),
    items: keywords.map((keyword) => ({ label: keyword, name: keyword })),
  };

  styleConfigCache.set(propertyName, result);

  return result;
};

export const iconConfigs: IconRecords = {
  // layout
  alignContent: {
    normal: AlignContentStartIcon,
    start: AlignContentStartIcon,
    end: AlignContentEndIcon,
    center: AlignContentCenterIcon,
    stretch: AlignContentStretchIcon,
    "space-around": AlignContentSpaceAroundIcon,
    "space-between": AlignContentSpaceBetweenIcon,
  },
  alignItems: {
    normal: AlignItemsStartIcon,
    start: AlignItemsStartIcon,
    end: AlignItemsEndIcon,
    center: AlignItemsCenterIcon,
    baseline: AlignItemsBaselineIcon,
    stretch: AlignItemsStretchIcon,
  },
  flexDirection: {
    normal: FlexDirectionRowIcon,
    row: FlexDirectionRowIcon,
    column: FlexDirectionColumnIcon,
    "row-reverse": FlexDirectionRowReverseIcon,
    "column-reverse": FlexDirectionColumnReverseIcon,
  },
  flexWrap: {
    normal: FlexWrapNowrapIcon,
    nowrap: FlexWrapNowrapIcon,
    wrap: FlexWrapWrapIcon,
    "wrap-reverse": FlexWrapWrapReverseIcon,
  },
  justifyContent: {
    normal: JustifyContentStartIcon,
    start: JustifyContentStartIcon,
    end: JustifyContentEndIcon,
    center: JustifyContentCenterIcon,
    "space-between": JustifyContentSpaceBetweenIcon,
    "space-around": JustifyContentSpaceAroundIcon,
  },
  justifyItems: {
    normal: JustifyItemsStartIcon,
    start: JustifyItemsStartIcon,
    end: JustifyItemsEndIcon,
    center: JustifyItemsCenterIcon,
  },
  rowGap: {
    normal: RowGapIcon,
  },
  columnGap: {
    normal: ColumnGapIcon,
  },
  // // flex child
  // flexShrink: {
  //   normal: ColumnGapIcon,
  // },
  // flexGrow: {
  //   normal: ColumnGapIcon,
  // },
  // flexBasis: {
  //   normal: ColumnGapIcon,
  // },
  // // grid child
  // alignSelf: {
  //   normal: ColumnGapIcon,
  // },
  // order: {
  //   normal: ColumnGapIcon,
  // },
  // justifySelf: {
  //   normal: ColumnGapIcon,
  // },
  // // size
  // width: {
  //   normal: ColumnGapIcon,
  // },
  // height: {
  //   normal: ColumnGapIcon,
  // },
  // minWidth: {
  //   normal: ColumnGapIcon,
  // },
  // minHeight: {
  //   normal: ColumnGapIcon,
  // },
  // maxWidth: {
  //   normal: ColumnGapIcon,
  // },
  // maxHeight: {
  //   normal: ColumnGapIcon,
  // },
  // overflow: {
  //   normal: ColumnGapIcon,
  // },
  // objectFit: {
  //   normal: ColumnGapIcon,
  // },
  // // position
  // position: {
  //   normal: ColumnGapIcon,
  // },
  // float: {
  //   normal: ColumnGapIcon,
  // },
  // // typography
  // fontFamily: {
  //   normal: ColumnGapIcon,
  // },
  // fontWeight: {
  //   normal: ColumnGapIcon,
  // },
  // fontSize: {
  //   normal: ColumnGapIcon,
  // },
  // lineHeight: {
  //   normal: ColumnGapIcon,
  // },
  // color: {
  //   normal: ColumnGapIcon,
  // },
  // textAlign: {
  //   normal: ColumnGapIcon,
  // },
  // fontStyle: {
  //   normal: ColumnGapIcon,
  // },
  // textDecorationColor: {
  //   normal: ColumnGapIcon,
  // },
  // textDecorationLine: {
  //   normal: ColumnGapIcon,
  // },
  // textDecorationStyle: {
  //   normal: ColumnGapIcon,
  // },
  // textIndent: {
  //   normal: ColumnGapIcon,
  // },
  // letterSpacing: {
  //   normal: ColumnGapIcon,
  // },
  // columnCount: {
  //   normal: ColumnGapIcon,
  // },
  // columnRuleStyle: {
  //   normal: ColumnGapIcon,
  // },
  // columnRuleWidth: {
  //   normal: ColumnGapIcon,
  // },
  // columnRuleColor: {
  //   normal: ColumnGapIcon,
  // },
  // textTransform: {
  //   normal: ColumnGapIcon,
  // },
  // direction: {
  //   normal: ColumnGapIcon,
  // },
  // whiteSpace: {
  //   normal: ColumnGapIcon,
  // },
  // textShadow: {
  //   normal: ColumnGapIcon,
  // },
};
