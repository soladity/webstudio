import type { Style, StyleProperty, StyleValue } from "@webstudio-is/css-data";
import hyphenate from "hyphenate-style-name";
import { toValue } from "./to-value";

class StylePropertyMap {
  #styleMap: Map<StyleProperty, StyleValue | undefined> = new Map();
  #isDirty = false;
  #string = "";
  onChange?: () => void;
  set(property: StyleProperty, value?: StyleValue) {
    this.#styleMap.set(property, value);
    this.#isDirty = true;
    this.onChange?.();
  }
  has(property: StyleProperty) {
    return this.#styleMap.has(property);
  }
  keys() {
    return this.#styleMap.keys();
  }
  delete(property: StyleProperty) {
    this.#styleMap.delete(property);
    this.#isDirty = true;
    this.onChange?.();
  }
  clear() {
    this.#styleMap.clear();
    this.#isDirty = true;
    this.onChange?.();
  }
  toString() {
    if (this.#isDirty === false) {
      return this.#string;
    }
    const block: Array<string> = [];
    for (const [property, value] of this.#styleMap) {
      if (value === undefined) {
        continue;
      }
      block.push(`${hyphenate(property)}: ${toValue(value)}`);
    }
    this.#string = block.join("; ");
    this.#isDirty = false;
    return this.#string;
  }
}

export class StyleRule {
  styleMap;
  selectorText;
  onChange?: () => void;
  constructor(selectorText: string, style: Style) {
    this.styleMap = new StylePropertyMap();
    this.selectorText = selectorText;
    let property: StyleProperty;
    for (property in style) {
      this.styleMap.set(property, style[property]);
    }
    this.styleMap.onChange = this.#onChange;
  }
  #onChange = () => {
    this.onChange?.();
  };
  get cssText() {
    return `${this.selectorText} { ${this.styleMap} }`;
  }
}

export type MediaRuleOptions = {
  minWidth?: number;
  maxWidth?: number;
  mediaType?: "all" | "screen" | "print";
};

export class MediaRule {
  // Sort media rules by minWidth.
  // Needed to ensure that more specific media rules are inserted after less specific ones.
  // So that they get a higher specificity.
  static sort(mediaRules: Iterable<MediaRule>) {
    return Array.from(mediaRules).sort((ruleA, ruleB) => {
      return (
        (ruleA.options.minWidth ?? -Number.MAX_SAFE_INTEGER) -
        (ruleB.options.minWidth ?? -Number.MAX_SAFE_INTEGER)
      );
    });
  }
  options: MediaRuleOptions;
  rules: Array<StyleRule | PlaintextRule> = [];
  #mediaType;
  constructor(options: MediaRuleOptions = {}) {
    this.options = options;
    this.#mediaType = options.mediaType ?? "all";
  }
  insertRule(rule: StyleRule | PlaintextRule) {
    this.rules.push(rule);
    return rule;
  }
  get cssText() {
    if (this.rules.length === 0) {
      return "";
    }
    const rules = [];
    for (const rule of this.rules) {
      rules.push(`  ${rule.cssText}`);
    }
    let conditionText = "";
    const { minWidth, maxWidth } = this.options;
    if (minWidth !== undefined) {
      conditionText = `min-width: ${minWidth}px`;
    }
    if (maxWidth !== undefined) {
      conditionText = `max-width: ${maxWidth}px`;
    }
    if (conditionText) {
      conditionText = `and (${conditionText}) `;
    }
    return `@media ${this.#mediaType} ${conditionText}{\n${rules.join(
      "\n"
    )}\n}`;
  }
}

export class PlaintextRule {
  cssText;
  styleMap = new StylePropertyMap();
  constructor(cssText: string) {
    this.cssText = cssText;
  }
}

export type FontFaceOptions = {
  fontFamily: string;
  fontStyle: "normal" | "italic" | "oblique";
  fontWeight: number;
  fontDisplay: "swap" | "auto" | "block" | "fallback" | "optional";
  src: string;
};

export class FontFaceRule {
  options: FontFaceOptions;
  constructor(options: FontFaceOptions) {
    this.options = options;
  }
  get cssText() {
    const { fontFamily, fontStyle, fontWeight, fontDisplay, src } =
      this.options;
    return `@font-face {\n  font-family: ${fontFamily}; font-style: ${fontStyle}; font-weight: ${fontWeight}; font-display: ${fontDisplay}; src: ${src};\n}`;
  }
}

export type AnyRule = StyleRule | MediaRule | PlaintextRule | FontFaceRule;
