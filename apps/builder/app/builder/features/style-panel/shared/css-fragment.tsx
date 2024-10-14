import { useMemo, useRef } from "react";
import { matchSorter, type RankingInfo } from "match-sorter";
import { EditorView, keymap, tooltips } from "@codemirror/view";
import { css } from "@codemirror/lang-css";
import {
  autocompletion,
  completionKeymap,
  type CompletionSource,
} from "@codemirror/autocomplete";
import { toValue } from "@webstudio-is/css-engine";
import { parseCss } from "@webstudio-is/css-data";
import { css as style } from "@webstudio-is/design-system";
import { isFeatureEnabled } from "@webstudio-is/feature-flags";
import {
  CodeEditorBase,
  getMinMaxHeightVars,
} from "~/builder/shared/code-editor-base";
import { $availableVariables } from "./model";

export const parseCssFragment = (css: string, fallbacks: string[]) => {
  let parsed = parseCss(`.styles{${css}}`, {
    customProperties: isFeatureEnabled("cssVars"),
  });
  if (parsed.length === 0) {
    for (const fallbackProperty of fallbacks) {
      parsed = parseCss(`.styles{${fallbackProperty}: ${css}}`, {
        customProperties: isFeatureEnabled("cssVars"),
      });
      parsed = parsed.filter((styleDecl) => styleDecl.value.type !== "invalid");
      if (parsed.length > 0) {
        break;
      }
    }
  }
  return new Map(
    parsed.map((styleDecl) => [styleDecl.property, styleDecl.value])
  );
};

const compareVariables = (left: RankingInfo, right: RankingInfo) => {
  return left.rankedValue.localeCompare(right.rankedValue, undefined, {
    numeric: true,
  });
};

const scopeCompletionSource: CompletionSource = (context) => {
  const word = context.matchBefore(/[-\w]+/);
  if (word === null || (word.from === word.to && false === context.explicit)) {
    return null;
  }
  const search = word.text;
  const availableVariables = $availableVariables.get();
  const options = availableVariables.map((varValue) => ({
    label: toValue(varValue),
    displayLabel: `--${varValue.value}`,
  }));
  const matches = matchSorter(options, search, {
    keys: ["label"],
    baseSort: compareVariables,
  });
  return {
    from: word.from,
    filter: false,
    options: matches,
  };
};

const wrapperStyle = style({
  position: "relative",
  ...getMinMaxHeightVars({ minHeight: "40px", maxHeight: "80px" }),
});

export const CssFragmentEditor = ({
  onKeyDown,
  ...props
}: {
  invalid?: boolean;
  value: string;
  onChange: (newValue: string) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
}) => {
  const onKeyDownRef = useRef(onKeyDown);
  onKeyDownRef.current = onKeyDown;
  const extensions = useMemo(() => {
    return [
      css(),
      // render autocomplete in body
      // to prevent popover scroll overflow
      tooltips({ parent: document.body }),
      autocompletion({
        override: [scopeCompletionSource],
        icons: false,
      }),
      keymap.of([...completionKeymap]),
      EditorView.domEventHandlers({
        keydown(event) {
          onKeyDownRef.current?.(event);
        },
      }),
    ];
  }, []);

  return (
    <div className={wrapperStyle()}>
      <CodeEditorBase {...props} extensions={extensions} />
    </div>
  );
};
