import ObjectId from "bson-objectid";
import {
  type CssRule,
  type Instance,
  components,
} from "@webstudio-is/react-sdk";

export const createInstance = ({
  component,
  id,
  children,
  cssRules,
}: {
  component: Instance["component"];
  id?: Instance["id"];
  children?: Instance["children"];
  cssRules?: Array<CssRule>;
}): Instance => {
  const componentMeta = components[component];
  return {
    component,
    id: id === undefined ? ObjectId().toString() : id,
    cssRules: cssRules ?? [],
    children:
      children === undefined
        ? "children" in componentMeta
          ? componentMeta.children
          : []
        : children,
  };
};
