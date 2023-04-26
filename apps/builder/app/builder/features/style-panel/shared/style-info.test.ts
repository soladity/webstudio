import { test, expect } from "@jest/globals";
import type {
  Breakpoints,
  Instance,
  Instances,
  StyleDecl,
  StylesList,
} from "@webstudio-is/project-build";
import {
  getCascadedBreakpointIds,
  getCascadedInfo,
  getInheritedInfo,
  getPreviousSourceInfo,
} from "./style-info";

const breakpoints: Breakpoints = new Map([
  ["1", { id: "1", label: "1", minWidth: 0 }],
  ["2", { id: "2", label: "2", minWidth: 768 }],
  ["3", { id: "3", label: "3", minWidth: 1280 }],
  ["4", { id: "4", label: "4", minWidth: 1920 }],
]);

const selectedBreakpointId = "3";
const selectedInstanceSelector = ["3", "2", "1"];
const cascadedBreakpointIds = getCascadedBreakpointIds(
  breakpoints,
  selectedBreakpointId
);

const cascadingStylesByInstanceId = new Map<Instance["id"], StyleDecl[]>();
cascadingStylesByInstanceId.set(selectedInstanceSelector[0], [
  {
    breakpointId: "1",
    styleSourceId: "styleSourceId",
    property: "width",
    value: { type: "unit", value: 100, unit: "px" },
  },
  {
    breakpointId: "1",
    styleSourceId: "styleSourceId",
    property: "height",
    value: { type: "unit", value: 50, unit: "px" },
  },
  {
    breakpointId: "2",
    styleSourceId: "styleSourceId",
    property: "width",
    value: { type: "unit", value: 200, unit: "px" },
  },
  {
    breakpointId: "3",
    styleSourceId: "styleSourceId",
    // should not be computed because current breakpoint
    property: "height",
    value: { type: "unit", value: 150, unit: "px" },
  },
  {
    breakpointId: "4",
    styleSourceId: "styleSourceId",
    property: "width",
    value: { type: "unit", value: 400, unit: "px" },
  },
]);

const instances: Instances = new Map([
  [
    "1",
    {
      type: "instance",
      id: "1",
      component: "Body",
      children: [{ type: "id", value: "2" }],
    },
  ],
  [
    "2",
    {
      type: "instance",
      id: "2",
      component: "Box",
      children: [{ type: "id", value: "3" }],
    },
  ],
  [
    "3",
    {
      type: "instance",
      id: "3",
      component: "Box",
      children: [],
    },
  ],
]);

const inheritingStylesByInstanceId = new Map<Instance["id"], StyleDecl[]>();
inheritingStylesByInstanceId.set("1", [
  // should be inherited even from another breakpoint
  {
    breakpointId: "1",
    styleSourceId: "styleSourceId1",
    property: "fontSize",
    value: { type: "unit", value: 20, unit: "px" },
  },
]);
inheritingStylesByInstanceId.set("2", [
  // should not be inherited because width is not inheritable
  {
    breakpointId: "3",
    styleSourceId: "styleSourceId2",
    property: "width",
    value: { type: "unit", value: 100, unit: "px" },
  },
  // should be inherited from selected breakpoint
  {
    breakpointId: "3",
    styleSourceId: "styleSourceId2",
    property: "fontWeight",
    value: { type: "keyword", value: "600" },
  },
]);
inheritingStylesByInstanceId.set("3", [
  // should not show selected style as inherited
  {
    breakpointId: "3",
    styleSourceId: "styleSourceId3",
    property: "fontWeight",
    value: { type: "keyword", value: "500" },
  },
]);

test("compute cascaded styles", () => {
  expect(
    getCascadedInfo(
      cascadingStylesByInstanceId,
      selectedInstanceSelector[0],
      cascadedBreakpointIds
    )
  ).toMatchInlineSnapshot(`
    {
      "height": {
        "breakpointId": "1",
        "value": {
          "type": "unit",
          "unit": "px",
          "value": 50,
        },
      },
      "width": {
        "breakpointId": "2",
        "value": {
          "type": "unit",
          "unit": "px",
          "value": 200,
        },
      },
    }
  `);
});

test("compute inherited styles", () => {
  expect(
    getInheritedInfo(
      instances,
      inheritingStylesByInstanceId,
      selectedInstanceSelector,
      new Map([
        ["1", "body"],
        ["2", "div"],
        ["3", "div"],
      ]),
      cascadedBreakpointIds,
      selectedBreakpointId
    )
  ).toMatchInlineSnapshot(`
    {
      "fontFamily": {
        "instanceId": "1",
        "value": {
          "type": "keyword",
          "value": "Arial",
        },
      },
      "fontSize": {
        "instanceId": "1",
        "value": {
          "type": "unit",
          "unit": "px",
          "value": 20,
        },
      },
      "fontWeight": {
        "instanceId": "2",
        "value": {
          "type": "keyword",
          "value": "600",
        },
      },
      "lineHeight": {
        "instanceId": "1",
        "value": {
          "type": "unit",
          "unit": "number",
          "value": 1.5,
        },
      },
    }
  `);
});

test("compute styles from previous sources", () => {
  const styleSourceSelections = new Map([
    ["3", { instanceId: "3", values: ["1", "2", "3", "4"] }],
  ]);
  const selectedStyleSourceSelector = {
    styleSourceId: "3",
  };
  const stylesByInstanceId = new Map<Instance["id"], StylesList>([
    [
      "3",
      [
        {
          breakpointId: "bp",
          styleSourceId: "1",
          property: "width",
          value: { type: "unit", value: 100, unit: "px" },
        },
        {
          breakpointId: "bp",
          styleSourceId: "2",
          property: "width",
          value: { type: "unit", value: 200, unit: "px" },
        },
        {
          breakpointId: "bp",
          styleSourceId: "3",
          property: "width",
          value: { type: "unit", value: 300, unit: "px" },
        },
        {
          breakpointId: "bp",
          styleSourceId: "4",
          property: "width",
          value: { type: "unit", value: 400, unit: "px" },
        },
      ],
    ],
  ]);
  expect(
    getPreviousSourceInfo(
      styleSourceSelections,
      stylesByInstanceId,
      selectedInstanceSelector,
      selectedStyleSourceSelector
    )
  ).toMatchInlineSnapshot(`
    {
      "width": {
        "styleSourceId": "2",
        "value": {
          "type": "unit",
          "unit": "px",
          "value": 200,
        },
      },
    }
  `);
});
