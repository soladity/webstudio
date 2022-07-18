import React, { useMemo, Fragment } from "react";
import type { Instance } from "../db";
import * as components from "../components";
import { useUserProps } from "../user-props/use-user-props";
import { type CSS, css as createCss } from "../stitches";
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
  if (children === undefined || children.length === 0) return;
  return children.map((child) => {
    return typeof child === "string" ? renderText(child) : child;
  });
};

export type WrapperComponentProps = {
  instance: Instance;
  css: CSS;
  children: Array<JSX.Element | string>;
  onChangeChildren?: OnChangeChildren;
};

export const WrapperComponent = ({
  instance,
  css,
  onChangeChildren, // prevent it from passing to primitives
  children,
  ...rest
}: WrapperComponentProps) => {
  const className = useMemo(() => createCss(css)(), [css]);
  const Component = components[instance.component];
  const userProps = useUserProps(instance.id);
  return (
    <Component {...userProps} {...rest} id={instance.id} className={className}>
      {renderWrapperComponentChildren(children)}
    </Component>
  );
};
