import { useCallback, MouseEvent, FormEvent } from "react";
import type { OnChangeChildren } from "~/shared/tree-utils";
import {
  type Instance,
  type CSS,
  useUserProps,
  renderWrapperComponentChildren,
} from "@webstudio-is/sdk";
import { primitives } from "~/shared/component";
import { useContentEditable } from "./editable";
import { useCss } from "./use-css";
import { useDraggable } from "./use-draggable";

type WrapperComponentDevProps = {
  id: Instance["id"];
  component: Instance["component"];
  css: CSS;
  children: Array<JSX.Element | string>;
  onChangeChildren?: OnChangeChildren;
};

export const WrapperComponentDev = ({
  id,
  component,
  css,
  children,
  onChangeChildren,
  ...rest
}: WrapperComponentDevProps) => {
  const className = useCss({ id, css, component });

  const {
    ref: contentEditableRef,
    isDisabled: isContentEditableDisabled,
    toolbar: editableToolbar,
    ...contentEditableProps
  } = useContentEditable({
    id,
    component,
    children,
    onChangeChildren,
  });

  const { dragRefCallback, ...draggableProps } = useDraggable({
    id,
    component,
    isDisabled: isContentEditableDisabled === false,
  });

  const refCallback = useCallback(
    (element) => {
      contentEditableRef.current = element;
      // We can't drag if we are editing text.
      dragRefCallback(element);
    },
    [contentEditableRef, dragRefCallback]
  );

  const userProps = useUserProps(id);
  const readonly = component === "Input" ? { readOnly: true } : undefined;

  const { Component } = primitives[component];
  return (
    <>
      {editableToolbar}
      <Component
        {...userProps}
        {...rest}
        {...contentEditableProps}
        {...draggableProps}
        {...readonly}
        className={className}
        id={id}
        tabIndex={0}
        data-component={component}
        data-label={primitives[component].label}
        data-id={id}
        ref={refCallback}
        onClick={(event: MouseEvent) => {
          if (component === "Link") {
            event.preventDefault();
          }
        }}
        onSubmit={(event: FormEvent) => {
          // Prevent submitting the form when clicking a button type submit
          event.preventDefault();
        }}
      >
        {renderWrapperComponentChildren(contentEditableProps.children)}
      </Component>
    </>
  );
};
