import { expect, test } from "@jest/globals";
import type { Breakpoint } from "@webstudio-is/sdk";
import { generateCss, type CssConfig } from "./css";
import { descendantComponent } from "../core-components";
import { $, renderJsx } from "@webstudio-is/sdk/testing";

const toMap = <T extends { id: string }>(list: T[]) =>
  new Map(list.map((item) => [item.id, item] as const));

const generateAllCss = (config: Omit<CssConfig, "atomic">) => {
  const { cssText, classes } = generateCss({
    ...config,
    atomic: false,
  });
  const { cssText: atomicCssText, classes: atomicClasses } = generateCss({
    ...config,
    atomic: true,
  });
  return { cssText, atomicCssText, classes, atomicClasses };
};

test("generate css for one instance with two tokens", () => {
  const { cssText, atomicCssText, atomicClasses } = generateAllCss({
    assets: new Map(),
    instances: new Map(),
    props: new Map(),
    breakpoints: toMap<Breakpoint>([{ id: "base", label: "" }]),
    styleSourceSelections: new Map([
      ["box", { instanceId: "box", values: ["token", "local"] }],
    ]),
    styles: new Map([
      [
        "token:base:color",
        {
          styleSourceId: "local",
          breakpointId: "base",
          property: "color",
          value: { type: "keyword", value: "red" },
        },
      ],

      [
        "local:base:color",
        {
          styleSourceId: "token",
          breakpointId: "base",
          property: "color",
          value: { type: "keyword", value: "blue" },
        },
      ],
    ]),
    componentMetas: new Map(),
    assetBaseUrl: "",
  });
  expect(cssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  [data-ws-id="box"] {
    color: red
  }
}"
`);
  expect(atomicCssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  .cawkhls {
    color: red
  }
}"
`);
  expect(atomicClasses).toMatchInlineSnapshot(`
Map {
  "box" => [
    "cawkhls",
  ],
}
`);
});

test("generate descendant selector", () => {
  const { cssText, atomicCssText, atomicClasses } = generateAllCss({
    assets: new Map(),
    instances: toMap([
      {
        id: "root",
        type: "instance",
        component: "Body",
        children: [{ type: "id", value: "descendant" }],
      },
      {
        id: "descendant",
        type: "instance",
        component: descendantComponent,
        children: [],
      },
    ]),
    props: toMap([
      {
        id: "1",
        instanceId: "descendant",
        name: "selector",
        type: "string",
        value: " a",
      },
    ]),
    breakpoints: toMap<Breakpoint>([{ id: "base", label: "" }]),
    styleSourceSelections: new Map([
      ["root", { instanceId: "root", values: ["local"] }],
      ["descendant", { instanceId: "descendant", values: ["local"] }],
    ]),
    styles: new Map([
      [
        "local:base:color",
        {
          styleSourceId: "local",
          breakpointId: "base",
          property: "color",
          value: { type: "keyword", value: "blue" },
        },
      ],
      [
        "local:base:color::hover",
        {
          styleSourceId: "local",
          breakpointId: "base",
          state: ":hover",
          property: "color",
          value: { type: "keyword", value: "red" },
        },
      ],
    ]),
    componentMetas: new Map(),
    assetBaseUrl: "",
  });
  expect(cssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  [data-ws-id="root"] {
    color: blue
  }
  [data-ws-id="root"]:hover {
    color: red
  }
  [data-ws-id="root"] a {
    color: blue
  }
  [data-ws-id="root"] a:hover {
    color: red
  }
}"
`);
  expect(atomicCssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  .c17hlgoh {
    color: blue
  }
  .c92zrdl:hover {
    color: red
  }
  .chhpmat a {
    color: blue
  }
  .c32fhpn a:hover {
    color: red
  }
}"
`);
  expect(atomicClasses).toMatchInlineSnapshot(`
Map {
  "root" => [
    "c17hlgoh",
    "c92zrdl",
    "chhpmat",
    "c32fhpn",
  ],
}
`);
});

test("generate component presets with multiple tags", () => {
  const { cssText, atomicCssText, classes, atomicClasses } = generateAllCss({
    assets: new Map(),
    instances: new Map(),
    props: new Map(),
    breakpoints: new Map(),
    styleSourceSelections: new Map([]),
    styles: new Map(),
    componentMetas: new Map([
      [
        "ListItem",
        {
          type: "container",
          icon: "",
          presetStyle: {
            div: [
              {
                property: "display",
                value: { type: "keyword", value: "block" },
              },
            ],
            a: [
              {
                property: "userSelect",
                value: { type: "keyword", value: "none" },
              },
            ],
          },
        },
      ],
    ]),
    assetBaseUrl: "",
  });
  expect(cssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  :where(div.w-list-item) {
    display: block
  }
  :where(a.w-list-item) {
    -webkit-user-select: none;
    user-select: none
  }
}
"
`);
  expect(cssText).toEqual(atomicCssText);
  expect(classes).toMatchInlineSnapshot(`Map {}`);
  expect(classes).toEqual(atomicClasses);
});

test("deduplicate component presets for similarly named components", () => {
  const { cssText, atomicCssText, classes, atomicClasses } = generateAllCss({
    assets: new Map(),
    instances: new Map(),
    props: new Map(),
    breakpoints: new Map(),
    styleSourceSelections: new Map([]),
    styles: new Map(),
    componentMetas: new Map([
      [
        "ListItem",
        {
          type: "container",
          icon: "",
          presetStyle: {
            div: [
              {
                property: "display",
                value: { type: "keyword", value: "block" },
              },
            ],
          },
        },
      ],
      [
        "@webstudio/radix:ListItem",
        {
          type: "container",
          icon: "",
          presetStyle: {
            div: [
              {
                property: "display",
                value: { type: "keyword", value: "flex" },
              },
            ],
          },
        },
      ],
      [
        "@webstudio/aria:ListItem",
        {
          type: "container",
          icon: "",
          presetStyle: {
            div: [
              {
                property: "display",
                value: { type: "keyword", value: "grid" },
              },
            ],
          },
        },
      ],
    ]),
    assetBaseUrl: "",
  });
  expect(cssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  :where(div.w-list-item) {
    display: block
  }
  :where(div.w-list-item-1) {
    display: flex
  }
  :where(div.w-list-item-2) {
    display: grid
  }
}
"
`);
  expect(cssText).toEqual(atomicCssText);
  expect(classes).toMatchInlineSnapshot(`Map {}`);
  expect(classes).toEqual(atomicClasses);
});

test("expose preset classes to instances", () => {
  const { atomicCssText, classes, atomicClasses } = generateAllCss({
    assets: new Map(),
    ...renderJsx(
      <$.Body ws:id="body">
        <$.Box ws:id="box"></$.Box>
      </$.Body>
    ),
    breakpoints: new Map(),
    styleSourceSelections: new Map([
      ["body", { instanceId: "body", values: ["localBody"] }],
      ["box", { instanceId: "box", values: ["localBox"] }],
    ]),
    styles: new Map([
      [
        "localBody:base:color",
        {
          styleSourceId: "localBody",
          breakpointId: "base",
          property: "color",
          value: { type: "keyword", value: "blue" },
        },
      ],
      [
        "localBox:base:color::hover",
        {
          styleSourceId: "localBox",
          breakpointId: "base",
          property: "color",
          value: { type: "keyword", value: "red" },
        },
      ],
    ]),
    componentMetas: new Map([
      [
        "Body",
        {
          type: "container",
          icon: "",
          presetStyle: {
            div: [
              {
                property: "display",
                value: { type: "keyword", value: "block" },
              },
            ],
          },
        },
      ],
      [
        "Box",
        {
          type: "container",
          icon: "",
          presetStyle: {
            div: [
              {
                property: "display",
                value: { type: "keyword", value: "flex" },
              },
            ],
          },
        },
      ],
    ]),
    assetBaseUrl: "",
  });
  expect(atomicCssText).toMatchInlineSnapshot(`
"html {margin: 0; display: grid; min-height: 100%}
@media all {
  :where(div.w-body) {
    display: block
  }
  :where(div.w-box) {
    display: flex
  }
}
"
`);
  expect(classes).toMatchInlineSnapshot(`
Map {
  "body" => [
    "w-body",
  ],
  "box" => [
    "w-box",
  ],
}
`);
  expect(atomicClasses).toMatchInlineSnapshot(`
Map {
  "body" => [
    "w-body",
    "c17hlgoh",
  ],
  "box" => [
    "w-box",
    "cawkhls",
  ],
}
`);
});
