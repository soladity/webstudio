import { cssVars } from "@webstudio-is/css-vars";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DeprecatedText2,
  styled,
  Box,
  theme,
} from "@webstudio-is/design-system";
import { ChevronDownIcon } from "@webstudio-is/icons";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  forwardRef,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type FocusEvent,
  type ReactNode,
} from "react";

const menuTriggerVisibilityVar = cssVars.define("menu-trigger-visibility");
const menuTriggerVisibilityOverrideVar = cssVars.define(
  "menu-trigger-visibility-override"
);

export const menuCssVars = ({
  show,
  override = false,
}: {
  show: boolean;
  override?: boolean;
}) => {
  const property = override
    ? menuTriggerVisibilityOverrideVar
    : menuTriggerVisibilityVar;

  return {
    [property]: show ? "visible" : "hidden",
  };
};

const MenuTrigger = styled("button", {
  display: "inline-flex",
  border: "none",
  boxSizing: "border-box",
  minWidth: 0,
  alignItems: "center",
  position: "absolute",
  right: 0,
  top: 0,
  height: "100%",
  padding: 0,
  borderTopRightRadius: theme.borderRadius[4],
  borderBottomRightRadius: theme.borderRadius[4],
  color: theme.colors.foregroundContrastMain,
  visibility: cssVars.use(
    menuTriggerVisibilityOverrideVar,
    cssVars.use(menuTriggerVisibilityVar)
  ),
  background: "transparent",
  variants: {
    source: {
      local: {
        "&:hover": {
          background: theme.colors.backgroundButtonHover,
        },
      },
      token: {
        "&:hover": {
          background: theme.colors.backgroundButtonHover,
        },
      },
      tag: {
        "&:hover": {
          background: theme.colors.backgroundButtonHover,
        },
      },
    },
  },
});

const MenuTriggerGradient = styled(Box, {
  position: "absolute",
  top: 0,
  right: 0,
  width: theme.spacing[11],
  height: "100%",
  visibility: cssVars.use(
    menuTriggerVisibilityOverrideVar,
    cssVars.use(menuTriggerVisibilityVar)
  ),
  borderTopRightRadius: theme.borderRadius[4],
  borderBottomRightRadius: theme.borderRadius[4],
  pointerEvents: "none",
  variants: {
    source: {
      local: {
        background: theme.colors.backgroundStyleSourceGradientToken,
      },
      token: {
        background: theme.colors.backgroundStyleSourceGradientToken,
      },
      tag: {
        background: theme.colors.backgroundStyleSourceGradientTag,
      },
    },
  },
});

type MenuProps = {
  source: ItemSource;
  children: ReactNode;
};

const Menu = (props: MenuProps) => {
  return (
    <DropdownMenu modal>
      <MenuTriggerGradient source={props.source} />
      <DropdownMenuTrigger asChild>
        <MenuTrigger aria-label="Menu Button" source={props.source}>
          <ChevronDownIcon />
        </MenuTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {props.children}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

export type ItemSource = "token" | "tag" | "local";

const useEditableText = ({
  isEditable,
  isEditing,
  onChangeEditing,
  onChangeValue,
  onClick,
}: {
  isEditable: boolean;
  isEditing: boolean;
  onChangeEditing: (isEditing: boolean) => void;
  onChangeValue: (value: string) => void;
  onClick: () => void;
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>("");
  const getValue = () => elementRef.current?.textContent ?? "";

  useEffect(() => {
    if (elementRef.current === null) {
      return;
    }

    if (isEditing) {
      elementRef.current.setAttribute("contenteditable", "plaintext-only");
      elementRef.current.focus();
      getSelection()?.selectAllChildren(elementRef.current);
      lastValueRef.current = getValue();
      return;
    }

    elementRef.current?.removeAttribute("contenteditable");
  }, [isEditing]);

  const handleFinishEditing = (
    event: KeyboardEvent<Element> | FocusEvent<Element>
  ) => {
    event.preventDefault();
    if (isEditing) {
      onChangeEditing(false);
    }
    onChangeValue(getValue());
    lastValueRef.current = "";
  };

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (event.key === "Enter") {
      handleFinishEditing(event);
      return;
    }
    if (event.key === "Escape" && elementRef.current !== null) {
      elementRef.current.textContent = lastValueRef.current;
      handleFinishEditing(event);
    }
  };

  const handleDoubleClick = () => {
    if (isEditable) {
      onChangeEditing(true);
    }
  };

  const handlers = {
    onKeyDown: handleKeyDown,
    onBlur: handleFinishEditing,
    onClick,
    onDoubleClick: handleDoubleClick,
  };

  return { ref: elementRef, handlers };
};

type EditableTextProps = {
  label: string;
  isEditable: boolean;
  isEditing: boolean;
  onChangeEditing: (isEditing: boolean) => void;
  onChangeValue: (value: string) => void;
  onClick: () => void;
};

const EditableText = ({
  label,
  isEditable,
  isEditing,
  onChangeEditing,
  onChangeValue,
  onClick,
}: EditableTextProps) => {
  const { ref, handlers } = useEditableText({
    isEditable,
    isEditing,
    onChangeEditing,
    onChangeValue,
    onClick,
  });

  return (
    <DeprecatedText2
      truncate
      ref={ref}
      css={{
        outline: "none",
        textOverflow: isEditing ? "clip" : "ellipsis",
        userSelect: isEditing ? "auto" : "none",
        cursor: isEditing ? "auto" : "default",
      }}
      {...handlers}
    >
      {label}
    </DeprecatedText2>
  );
};

// Forces layout to recalc max-width when editing is done, because otherwise,
// layout will keep the value from before engaging contenteditable.
const useForceRecalcStyle = <Element extends HTMLElement>(
  property: string,
  calculate: boolean
) => {
  const ref = useRef<Element>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (calculate === false || element === null) {
      return;
    }
    element.style.setProperty(property, "initial");
    const restore = () => {
      element.style.removeProperty(property);
    };
    const requestId = requestAnimationFrame(restore);
    return () => {
      cancelAnimationFrame(requestId);
      restore();
    };
  }, [calculate, property]);
  return ref;
};

const StyledSourceButton = styled(Box, {
  display: "inline-flex",
  borderRadius: theme.borderRadius[3],
  padding: theme.spacing[4],
  minWidth: theme.spacing[13],
  maxWidth: "100%",
  position: "relative",
  color: theme.colors.foregroundContrastMain,
  ...menuCssVars({ show: false }),
  "&:hover": menuCssVars({ show: true }),
  variants: {
    source: {
      local: {
        backgroundColor: theme.colors.backgroundStyleSourceToken,
      },
      token: {
        backgroundColor: theme.colors.backgroundStyleSourceToken,
      },
      tag: {
        backgroundColor: theme.colors.backgroundStyleSourceTag,
      },
    },
    selected: {
      true: {},
      false: {
        "&:not(:hover)": {
          backgroundColor: theme.colors.backgroundStyleSourceNeutral,
        },
      },
    },
    disabled: {
      true: {
        "&:not(:hover)": {
          backgroundColor: theme.colors.backgroundStyleSourceDisabled,
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    selected: false,
    disabled: false,
  },
});

type SourceButtonProps = {
  id: string;
  selected: boolean;
  disabled: boolean;
  source: ItemSource;
  children: Array<JSX.Element | boolean>;
};

const SourceButton = forwardRef<HTMLDivElement, SourceButtonProps>(
  ({ id, selected, disabled, source, children }, ref) => {
    return (
      <StyledSourceButton
        selected={selected}
        disabled={disabled}
        source={source}
        data-id={id}
        aria-current={selected}
        role="button"
        ref={ref}
      >
        {children}
      </StyledSourceButton>
    );
  }
);
SourceButton.displayName = "SourceButton";

type StyleSourceProps = {
  id: string;
  label: string;
  menuItems: ReactNode;
  selected: boolean;
  disabled: boolean;
  isEditing: boolean;
  isDragging: boolean;
  source: ItemSource;
  onSelect: () => void;
  onChangeValue: (value: string) => void;
  onChangeEditing: (isEditing: boolean) => void;
};

export const StyleSource = ({
  id,
  label,
  menuItems,
  selected,
  disabled,
  isEditing,
  isDragging,
  source,
  onChangeValue,
  onChangeEditing,
  onSelect,
}: StyleSourceProps) => {
  const ref = useForceRecalcStyle<HTMLDivElement>("max-width", isEditing);
  const showMenu = isEditing === false && isDragging === false;

  return (
    <SourceButton
      selected={selected}
      disabled={disabled}
      source={source}
      id={id}
      ref={ref}
    >
      <EditableText
        isEditable={source !== "local"}
        isEditing={isEditing}
        onChangeEditing={onChangeEditing}
        onClick={() => {
          if (disabled === false && isEditing === false) {
            onSelect();
          }
        }}
        onChangeValue={onChangeValue}
        label={label}
      />
      {showMenu && <Menu source={source}>{menuItems}</Menu>}
    </SourceButton>
  );
};
