import type { Instance, Breakpoint } from "@webstudio-is/project-build";
import type { StyleProperty, StyleValue } from "@webstudio-is/css-data";

export type StyleUpdate =
  | {
      operation: "delete";
      property: StyleProperty;
    }
  | {
      operation: "set";
      property: StyleProperty;
      value: StyleValue;
    };

export type StyleUpdates = {
  id: Instance["id"];
  updates: Array<StyleUpdate>;
  breakpoint: Breakpoint;
};
