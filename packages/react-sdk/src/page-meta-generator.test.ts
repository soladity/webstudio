import { expect, test } from "@jest/globals";
import { createScope } from "@webstudio-is/sdk";
import { generatePageMeta } from "./page-meta-generator";

const toMap = <T extends { id: string }>(list: T[]) =>
  new Map(list.map((item) => [item.id, item] as const));

test("generate minimal static page meta factory", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `"Page title"`,
        meta: {},
      },
      dataSources: new Map(),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  return {
    title: "Page title",
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: undefined,
    status: undefined,
    redirect: undefined,
    custom: [
    ],
  };
};
"
`);
});

test("generate complete static page meta factory", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `"Page title"`,
        meta: {
          description: `"Page description"`,
          excludePageFromSearch: "true",
          language: `"en-US"`,
          socialImageAssetId: "social-image-name",
          status: `302`,
          redirect: `"/new-path"`,
          custom: [
            { property: "custom-property-1", content: `"custom content 1"` },
            { property: "custom-property-2", content: `"custom content 2"` },
          ],
        },
      },
      dataSources: new Map(),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  return {
    title: "Page title",
    description: "Page description",
    excludePageFromSearch: true,
    language: "en-US",
    socialImageAssetId: "social-image-name",
    socialImageUrl: undefined,
    status: 302,
    redirect: "/new-path",
    custom: [
      {
        property: "custom-property-1",
        content: "custom content 1",
      },
      {
        property: "custom-property-2",
        content: "custom content 2",
      },
    ],
  };
};
"
`);
});

test("generate asset url instead of id", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `"Page title"`,
        meta: {
          socialImageUrl: `"https://my-image"`,
        },
      },
      dataSources: new Map(),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  return {
    title: "Page title",
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: "https://my-image",
    status: undefined,
    redirect: undefined,
    custom: [
    ],
  };
};
"
`);
});

test("generate custom meta ignoring empty property name", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `"Page title"`,
        meta: {
          custom: [
            { property: "custom-property", content: `"custom content 1"` },
            { property: "", content: `"custom content 2"` },
          ],
        },
      },
      dataSources: new Map(),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  return {
    title: "Page title",
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: undefined,
    status: undefined,
    redirect: undefined,
    custom: [
      {
        property: "custom-property",
        content: "custom content 1",
      },
    ],
  };
};
"
`);
});

test("generate page meta factory with variables", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `$ws$dataSource$variableId`,
        meta: {},
      },
      dataSources: toMap([
        {
          id: "variableId",
          scopeInstanceId: "body",
          name: "Variable Name",
          type: "variable",
          value: { type: "string", value: "" },
        },
      ]),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  let VariableName = ""
  return {
    title: VariableName,
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: undefined,
    status: undefined,
    redirect: undefined,
    custom: [
    ],
  };
};
"
`);
});

test("generate page meta factory with system", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `$ws$dataSource$systemId.params.slug`,
        meta: {},
        systemDataSourceId: "systemId",
      },
      dataSources: toMap([
        {
          id: "systemId",
          scopeInstanceId: "body",
          name: "system",
          type: "parameter",
        },
      ]),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  let system_1 = system
  return {
    title: system_1?.params?.slug,
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: undefined,
    status: undefined,
    redirect: undefined,
    custom: [
    ],
  };
};
"
`);
});

test("generate page meta factory with resources", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        title: `$ws$dataSource$resourceVariableId.data.title`,
        meta: {},
      },
      dataSources: toMap([
        {
          id: "resourceVariableId",
          scopeInstanceId: "body",
          name: "Cms Page",
          type: "resource",
          resourceId: "resourceId",
        },
      ]),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  let CmsPage = resources.CmsPage
  return {
    title: CmsPage?.data?.title,
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: undefined,
    status: undefined,
    redirect: undefined,
    custom: [
    ],
  };
};
"
`);
});

test("generate page meta factory without unused variables", () => {
  expect(
    generatePageMeta({
      globalScope: createScope(),
      page: {
        id: "",
        name: "",
        path: "",
        rootInstanceId: "",
        systemDataSourceId: "unusedSystemId",
        title: `$ws$dataSource$usedVariableId`,
        meta: {},
      },
      dataSources: toMap([
        {
          id: "usedVariableId",
          scopeInstanceId: "body",
          name: "Used Name",
          type: "variable",
          value: { type: "string", value: "" },
        },
        {
          id: "unusedVariableId",
          scopeInstanceId: "body",
          name: "Unused Name",
          type: "variable",
          value: { type: "string", value: "" },
        },
        {
          id: "unusedSystemId",
          scopeInstanceId: "body",
          name: "Unused System",
          type: "parameter",
        },
        {
          id: "unusedResourceVariableId",
          scopeInstanceId: "body",
          name: "Unused Cms Page",
          type: "resource",
          resourceId: "resourceId",
        },
      ]),
    })
  ).toMatchInlineSnapshot(`
"export const getPageMeta = ({
  system,
  resources,
}: {
  system: System;
  resources: Record<string, any>;
}): PageMeta => {
  let UsedName = ""
  return {
    title: UsedName,
    description: undefined,
    excludePageFromSearch: undefined,
    language: undefined,
    socialImageAssetId: undefined,
    socialImageUrl: undefined,
    status: undefined,
    redirect: undefined,
    custom: [
    ],
  };
};
"
`);
});
