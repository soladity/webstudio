import { forwardRef, useMemo, type ComponentProps } from "react";
import {
  keymap,
  drawSelection,
  dropCursor,
  tooltips,
  highlightSpecialChars,
  highlightActiveLine,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { html } from "@codemirror/lang-html";
import { theme, textVariants, css } from "@webstudio-is/design-system";
import { CodeEditor, getMinMaxHeightVars } from "./code-editor";

const autocompletionStyle = css({
  "&.cm-tooltip.cm-tooltip-autocomplete": {
    ...textVariants.mono,
    border: "none",
    backgroundColor: "transparent",
    "& ul": {
      minWidth: 160,
      maxWidth: 260,
      width: "max-content",
      boxSizing: "border-box",
      borderRadius: theme.borderRadius[6],
      backgroundColor: theme.colors.backgroundMenu,
      border: `1px solid ${theme.colors.borderMain}`,
      boxShadow: `${theme.shadows.menuDropShadow}, inset 0 0 0 1px ${theme.colors.borderMenuInner}`,
      padding: theme.spacing[3],
      "& li": {
        ...textVariants.labelsTitleCase,
        textTransform: "none",
        position: "relative",
        display: "flex",
        alignItems: "center",
        color: theme.colors.foregroundMain,
        padding: theme.spacing[3],
        borderRadius: theme.borderRadius[3],
        "&[aria-selected]": {
          color: theme.colors.foregroundMain,
          backgroundColor: theme.colors.backgroundItemMenuItemHover,
        },
        "& .cm-completionLabel": {
          flexGrow: 1,
        },
        "& .cm-completionDetail": {
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontStyle: "normal",
          color: theme.colors.hint,
        },
      },
    },
  },
});

const wrapperStyle = css({
  position: "relative",
  // 1 line is 16px
  // set min 10 lines and max 20 lines
  ...getMinMaxHeightVars({ minHeight: "160px", maxHeight: "320px" }),
});

export const HtmlEditor = forwardRef<
  HTMLDivElement,
  Omit<ComponentProps<typeof CodeEditor>, "extensions">
>((props, ref) => {
  const extensions = useMemo(
    () => [
      highlightActiveLine(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      html({}),
      bracketMatching(),
      closeBrackets(),
      // render autocomplete in body
      // to prevent popover scroll overflow
      tooltips({ parent: document.body }),
      autocompletion({
        icons: false,
        tooltipClass: () => autocompletionStyle.toString(),
      }),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,
      ]),
    ],
    []
  );

  return (
    <div className={wrapperStyle()} ref={ref}>
      <CodeEditor {...props} extensions={extensions} />
    </div>
  );
});

HtmlEditor.displayName = "HtmlEditor";
