import { definitionSyntax, type DSNode } from "css-tree";
import properties from "mdn-data/css/properties.json";
import units from "mdn-data/css/units.json";
import syntaxes from "mdn-data/css/syntaxes.json";
import type { StyleValue } from "../src/css";
import { popularityIndex } from "./popularity-index";

import camelCase from "camelcase";
import * as fs from "fs";
import * as path from "path";

type Property = keyof typeof properties;
type Value = typeof properties[Property] & { alsoAppliesTo?: Array<string> };

const inheritValue = {
  type: "keyword",
  value: "inherit",
} as const;

const autoValue = {
  type: "keyword",
  value: "auto",
} as const;

// Normalize browser dependant properties.
const normalizedValues = {
  "font-family": inheritValue,
  "font-size": inheritValue,
  "line-height": inheritValue,
  color: inheritValue,
  // https://github.com/mdn/data/issues/554
  // @todo remove once fixed in mdn data
  appearance: {
    type: "keyword",
    value: "none",
  },
  // https://github.com/mdn/data/issues/555
  // @todo remove once fixed
  "background-position-x": {
    type: "unit",
    value: 0,
    unit: "%",
  },
  // https://github.com/mdn/data/issues/555
  // @todo remove once fixed
  "background-position-y": {
    type: "unit",
    value: 0,
    unit: "%",
  },
  // https://github.com/mdn/data/issues/556
  // @todo remove once fixed
  "background-size": autoValue,
  "text-size-adjust": autoValue,
} as const;

type FilteredProperties = { [property in Property]: Value };

const filteredProperties: FilteredProperties = (() => {
  // A list of properties we don't want to show
  const ignoreProperties = [
    "all",
    "-webkit-line-clamp",
    "--*",
    "background-position",
  ];
  let property: Property;
  const result = {} as FilteredProperties;
  for (property in properties) {
    const config = properties[property];
    const isSupportedStatus =
      config.status === "standard" || config.status === "experimental";
    if (
      isSupportedStatus === false ||
      // Skipping the complex values, since we want to use the expanded once.
      Array.isArray(config.initial) ||
      ignoreProperties.includes(property) === true
    ) {
      continue;
    }
    result[property as Property] = config;
  }
  return result;
})();

const propertiesData: {
  // It's string because we camel-cased it
  [property: string]: {
    inherited: boolean;
    initial: StyleValue;
    popularity: number;
    appliesTo: string;
  };
} = {};

let property: Property;

for (property in filteredProperties) {
  const config = filteredProperties[property];
  let initial: StyleValue;

  // Our default values hardcoded because no single standard
  if (property in normalizedValues) {
    initial = normalizedValues[property as keyof typeof normalizedValues];
  } else {
    // @todo use css-tree instead of this custom logic which is likely wrong
    // Complex initial values like "50% 50% 0" can't be parsed to a number
    const number =
      typeof config.initial === "string"
        ? config.initial.includes(" ")
          ? NaN
          : parseFloat(config.initial)
        : NaN;

    if (isNaN(number) && typeof config.initial === "string") {
      initial = {
        type: "keyword",
        value: config.initial,
      };
    } else {
      initial = {
        type: "unit",
        unit: "px",
        value: number,
      };
    }
  }

  propertiesData[camelCase(property)] = {
    inherited: config.inherited,
    initial,
    popularity:
      popularityIndex.find((data) => data.property === property)
        ?.dayPercentage || 0,
    appliesTo: config.appliesto,
  };
}

const targetDir = path.join(process.cwd(), process.argv.pop() as string);

const writeToFile = (fileName: string, constant: string, data: unknown) => {
  const autogeneratedHint = "// This file was generated by yarn mdn-data\n";
  const content =
    autogeneratedHint +
    `export const ${constant} = ` +
    JSON.stringify(data, null, 2) +
    " as const;";

  fs.writeFileSync(path.join(targetDir, fileName), content, "utf8");
};

const keywordValues = (() => {
  const result: { [prop: string]: Array<string> } = {};
  let property: Property;
  const parsedSyntaxes = new Map();

  const getKeywords = (node: DSNode): Set<string> => {
    let keywords: Set<string> = new Set();
    if (node.type === "Type" || (node.type === "Property" && node.name)) {
      const syntax =
        syntaxes[node.name as keyof typeof syntaxes]?.syntax ||
        properties[node.name as Property]?.syntax;

      // When there is syntax - there are keyword references
      if (syntax) {
        if (parsedSyntaxes.has(syntax)) return parsedSyntaxes.get(syntax);
        const ast = definitionSyntax.parse(syntax);
        definitionSyntax.walk(ast, (node) => {
          keywords = new Set([...keywords, ...getKeywords(node)]);
          parsedSyntaxes.set(syntax, keywords);
        });
      }
      return keywords;
    }

    if (node.type === "Keyword" && node.name) {
      keywords.add(node.name);
    }

    return keywords;
  };

  for (property in filteredProperties) {
    // if (property !== "flex-basis") continue;
    const ast = definitionSyntax.parse(filteredProperties[property].syntax);
    definitionSyntax.walk(ast, (node) => {
      const keywords = getKeywords(node);
      const camelCasedProperty = camelCase(property);
      if (keywords.size !== 0) {
        result[camelCasedProperty] = Array.from(
          new Set([...(result[camelCasedProperty] || []), ...keywords])
        );
      }
    });
  }

  return result;
})();

writeToFile("properties.ts", "properties", propertiesData);
// @todo % is somehow not in the units list
// https://github.com/mdn/data/issues/553
writeToFile("units.ts", "units", [...Object.keys(units), "%"]);
writeToFile("keyword-values.ts", "keywordValues", keywordValues);
