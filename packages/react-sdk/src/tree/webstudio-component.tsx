import { Fragment } from "react";
import type { Instance } from "@webstudio-is/project-build";
import type { Components } from "../components/components-utils";
import { useInstanceProps } from "../props";

const renderText = (text: string): Array<JSX.Element> => {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
};

export const renderWebstudioComponentChildren = (
  children: Array<JSX.Element | string> | undefined
): Array<JSX.Element | string | Array<JSX.Element | string>> | undefined => {
  // Some elements like input can't have children
  // @todo needs to be made impossible to drag element into input
  if (children === undefined || children.length === 0) {
    return;
  }
  return children.map((child) => {
    return typeof child === "string" ? renderText(child) : child;
  });
};

type WebstudioComponentProps = {
  instance: Instance;
  instanceSelector: Instance["id"][];
  children: Array<JSX.Element | string>;
  components: Components;
};

export const WebstudioComponent = ({
  instance,
  instanceSelector,
  children,
  components,
  ...rest
}: WebstudioComponentProps) => {
  const { [showAttribute]: show = true, ...instanceProps } = useInstanceProps(
    instance.id
  );
  const props = {
    ...instanceProps,
    ...rest,
    [idAttribute]: instance.id,
    [componentAttribute]: instance.component,
  };
  if (show === false) {
    return <></>;
  }
  const Component = components.get(instance.component);
  if (Component === undefined) {
    return <></>;
  }
  return (
    <Component {...props}>
      {renderWebstudioComponentChildren(children)}
    </Component>
  );
};

export const idAttribute = "data-ws-id";
export const componentAttribute = "data-ws-component";
export const showAttribute = "data-ws-show";
export const collapsedAttribute = "data-ws-collapsed";
