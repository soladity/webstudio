import { type ComponentProps, Fragment } from "react";
import type { ReadableAtom } from "nanostores";
import { Scripts, ScrollRestoration } from "@remix-run/react";
import type { Assets } from "@webstudio-is/asset-uploader";
import type { Instance, Instances } from "@webstudio-is/project-build";
import type { Components } from "../components/components-utils";
import { ReactSdkContext, type Params } from "../context";
import type { Pages, PropsByInstanceId } from "../props";
import type { WebstudioComponent } from "./webstudio-component";

type InstanceSelector = Instance["id"][];

export const createElementsTree = ({
  renderer,
  imageBaseUrl,
  assetBaseUrl,
  instances,
  rootInstanceId,
  propsByInstanceIdStore,
  assetsStore,
  pagesStore,
  Component,
  components,
}: Params & {
  instances: Instances;
  rootInstanceId: Instance["id"];
  propsByInstanceIdStore: ReadableAtom<PropsByInstanceId>;
  assetsStore: ReadableAtom<Assets>;
  pagesStore: ReadableAtom<Pages>;
  Component: (props: ComponentProps<typeof WebstudioComponent>) => JSX.Element;
  components: Components;
}) => {
  const rootInstance = instances.get(rootInstanceId);
  if (rootInstance === undefined) {
    return null;
  }

  const rootInstanceSelector = [rootInstanceId];
  const children = createInstanceChildrenElements({
    instances,
    instanceSelector: rootInstanceSelector,
    Component,
    children: rootInstance.children,
    components,
  });
  const root = createInstanceElement({
    Component,
    instance: rootInstance,
    instanceSelector: rootInstanceSelector,
    children: [
      <Fragment key="children">
        {children}
        <ScrollRestoration />
        <Scripts />
      </Fragment>,
    ],
    components,
  });
  return (
    <ReactSdkContext.Provider
      value={{
        propsByInstanceIdStore,
        assetsStore,
        pagesStore,
        renderer,
        imageBaseUrl,
        assetBaseUrl,
      }}
    >
      {root}
    </ReactSdkContext.Provider>
  );
};

const createInstanceChildrenElements = ({
  instances,
  instanceSelector,
  children,
  Component,
  components,
}: {
  instances: Instances;
  instanceSelector: InstanceSelector;
  children: Instance["children"];
  Component: (props: ComponentProps<typeof WebstudioComponent>) => JSX.Element;
  components: Components;
}) => {
  const elements = [];
  for (const child of children) {
    if (child.type === "text") {
      elements.push(child.value);
      continue;
    }
    const childInstance = instances.get(child.value);
    if (childInstance === undefined) {
      continue;
    }
    const childInstanceSelector = [child.value, ...instanceSelector];
    const children = createInstanceChildrenElements({
      instances,
      instanceSelector: childInstanceSelector,
      children: childInstance.children,
      Component,
      components,
    });
    const element = createInstanceElement({
      instance: childInstance,
      instanceSelector: childInstanceSelector,
      Component,
      children,
      components,
    });
    elements.push(element);
  }
  return elements;
};

const createInstanceElement = ({
  Component,
  instance,
  instanceSelector,
  children = [],
  components,
}: {
  instance: Instance;
  instanceSelector: InstanceSelector;
  Component: (props: ComponentProps<typeof WebstudioComponent>) => JSX.Element;
  children?: Array<JSX.Element | string>;
  components: Components;
}) => {
  return (
    <Component
      key={instance.id}
      instance={instance}
      instanceSelector={instanceSelector}
      components={components}
    >
      {children}
    </Component>
  );
};
