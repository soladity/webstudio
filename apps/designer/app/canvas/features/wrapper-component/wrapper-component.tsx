import { useCallback, MouseEvent, FormEvent, useMemo } from "react";
import {
  type Instance,
  type CSS,
  type OnChangeChildren,
  toCss,
  useUserProps,
  renderWrapperComponentChildren,
  components,
} from "@webstudio-is/react-sdk";
import { useBreakpoints, useTextEditingInstanceId } from "~/shared/nano-states";
import { useCss } from "./use-css";
import { useEnsureFocus } from "./use-ensure-focus";
import { Editor } from "./text-editor";
import noop from "lodash.noop";
import { useSelectedElement } from "~/canvas/shared/nano-states";

type WrapperComponentDevProps = {
  instance: Instance;
  css: CSS;
  children: Array<JSX.Element | string>;
  onChangeChildren?: OnChangeChildren;
};

export const WrapperComponentDev = ({
  instance,
  css,
  children,
  onChangeChildren = noop,
  ...rest
}: WrapperComponentDevProps) => {
  const className = useCss({ instance, css });
  const [editingInstanceId] = useTextEditingInstanceId();
  const [, setSelectedElement] = useSelectedElement();
  const focusRefCallback = useEnsureFocus();

  const refCallback = useCallback(
    (element) => {
      focusRefCallback(element);
      // When entering text editing we unmount the instance element, so we need to update the reference, otherwise we have a detached element referenced and bounding box will be wrong.
      if (element !== null) setSelectedElement(element);
    },
    [focusRefCallback, setSelectedElement]
  );

  const userProps = useUserProps(instance.id);
  const readonlyProps =
    instance.component === "Input" ? { readOnly: true } : undefined;

  const { Component } = components[instance.component];

  const props = {
    ...userProps,
    ...rest,
    ...readonlyProps,
    // @todo merge className with props
    className,
    tabIndex: 0,
    // @todo stop using id to free it up to the user
    // we should replace id, data-component and data-id with "data-ws"=instance.id and grab the rest always over the id
    // for this we need to also make search by id fast
    id: instance.id,
    "data-component": instance.component,
    "data-id": instance.id,
    ref: refCallback,
    onClick: (event: MouseEvent) => {
      if (instance.component === "Link") {
        event.preventDefault();
      }
    },
    onSubmit: (event: FormEvent) => {
      // Prevent submitting the form when clicking a button type submit
      event.preventDefault();
    },
  };

  if (editingInstanceId === instance.id) {
    return (
      <Editor
        instance={instance}
        renderEditable={(ref) => (
          <Component
            {...props}
            ref={(element: HTMLElement | null) => {
              props.ref(element);
              ref?.(element);
            }}
            contentEditable={true}
          />
        )}
        onChange={(updates) => {
          onChangeChildren({ instanceId: instance.id, updates });
        }}
      />
    );
  }

  return (
    <Component {...props}>{renderWrapperComponentChildren(children)}</Component>
  );
};

// Only used for instances inside text editor.
export const InlineWrapperComponentDev = ({
  instance,
  ...rest
}: {
  instance: Instance;
  children: string;
}) => {
  const [breakpoints] = useBreakpoints();
  const css = useMemo(
    () => toCss(instance.cssRules, breakpoints),
    [instance, breakpoints]
  );
  const className = useCss({ instance, css });
  const userProps = useUserProps(instance.id);
  const { Component } = components[instance.component];

  return (
    <Component
      {...rest}
      {...userProps}
      data-outline-disabled
      key={instance.id}
      // @todo stop using id to free it up to the user
      id={instance.id}
      // @todo merge className with props
      className={className}
    />
  );
};
