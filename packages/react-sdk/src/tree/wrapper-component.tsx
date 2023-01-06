import { Fragment } from "react";
import type { Instance } from "../db";
import { getComponent } from "../components";
import { useUserProps } from "../user-props/use-user-props";
import type { OnChangeChildren } from "./create-elements-tree";

const renderText = (text: string): Array<JSX.Element> => {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
};

export const renderWrapperComponentChildren = (
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

type WrapperComponentProps = {
  instance: Instance;
  children: Array<JSX.Element | string>;
  onChangeChildren?: OnChangeChildren;
};

export const WrapperComponent = ({
  instance,
  onChangeChildren, // prevent it from passing to sdk component
  children,
  ...rest
}: WrapperComponentProps) => {
  const Component = getComponent(instance.component);
  const userProps = useUserProps(instance.id);
  const props = {
    ...userProps,
    ...rest,
    [idAttribute]: instance.id,
    [componentAttribute]: instance.component,
  };
  return (
    <Component {...props}>{renderWrapperComponentChildren(children)}</Component>
  );
};

export const idAttribute = "data-ws-id";
export const componentAttribute = "data-ws-component";
