import { MouseEvent, FormEvent } from "react";
import { Suspense, lazy, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  type Instance,
  type CSS,
  type OnChangeChildren,
  useUserProps,
  renderWrapperComponentChildren,
  components,
} from "@webstudio-is/react-sdk";
import { useTextEditingInstanceId } from "~/shared/nano-states";
import { useCss } from "./use-css";
import noop from "lodash.noop";
import { useSelectedElement } from "~/canvas/shared/nano-states";

const TextEditor = lazy(() => import("../text-editor"));

const ContentEditable = ({
  Component,
  elementRef,
  ...props
}: {
  // eslint-disable-next-line
  Component: any;
  elementRef: (element: null | HTMLElement) => void;
}) => {
  const [editor] = useLexicalComposerContext();

  const ref = useCallback(
    (rootElement: null | HTMLElement) => {
      editor.setRootElement(rootElement);
      elementRef(rootElement);
    },
    [editor, elementRef]
  );

  return <Component ref={ref} {...props} contentEditable={true} />;
};

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
  const className = useCss({ css });
  const [editingInstanceId] = useTextEditingInstanceId();
  const [, setSelectedElement] = useSelectedElement();

  const refCallback = useCallback(
    (element) => {
      // When entering text editing we unmount the instance element, so we need to update the reference, otherwise we have a detached element referenced and bounding box will be wrong.
      if (element !== null) setSelectedElement(element);
    },
    [setSelectedElement]
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

  const instanceElement = (
    <Component {...props}>{renderWrapperComponentChildren(children)}</Component>
  );

  if (editingInstanceId !== instance.id) {
    return instanceElement;
  }

  return (
    <Suspense fallback={instanceElement}>
      <TextEditor
        instance={instance}
        contentEditable={
          <ContentEditable
            {...props}
            elementRef={refCallback}
            Component={Component}
          />
        }
        onChange={(updates) => {
          onChangeChildren({ instanceId: instance.id, updates });
        }}
      />
    </Suspense>
  );
};
