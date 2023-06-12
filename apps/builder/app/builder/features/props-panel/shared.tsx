import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useRef,
  useState,
  useEffect,
} from "react";
import equal from "fast-deep-equal";
import type { WsComponentPropsMeta } from "@webstudio-is/react-sdk";
import type { Prop } from "@webstudio-is/project-build";
import type { Asset } from "@webstudio-is/asset-uploader";
import { SubtractIcon } from "@webstudio-is/icons";
import {
  SmallIconButton,
  Label as BaseLabel,
  useIsTruncated,
  Tooltip,
  Box,
  Flex,
  theme,
} from "@webstudio-is/design-system";
import { humanizeString } from "~/shared/string-utils";

export type PropMeta = WsComponentPropsMeta["props"][string];

export type PropValue = Prop extends infer T
  ? T extends { value: unknown; type: unknown }
    ? { value: T["value"]; type: T["type"] }
    : never
  : never;

// Weird code is to make type distributive
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type PropMetaByControl<Control> = Control extends string
  ? Extract<PropMeta, { control: Control }>
  : never;

type PropByType<Type> = Type extends string
  ? Extract<Prop, { type: Type }>
  : never;

export type ControlProps<Control, PropType> = {
  instanceId: string;
  meta: PropMetaByControl<Control>;
  // prop is optional because we don't have it when an intial prop is not set
  // and we don't want to show user something like a 0 for number when it's in fact not set to any value
  prop: PropByType<PropType> | undefined;
  propName: string;
  onChange: (value: PropValue, asset?: Asset) => void;
  onDelete?: () => void;

  // Should be called when we want to delete the prop,
  // but want to keep it in the list until panel is closed
  onSoftDelete: () => void;
};

export const getLabel = (meta: { label?: string }, fallback: string) =>
  meta.label || humanizeString(fallback);

export const RemovePropButton = (props: { onClick: () => void }) => (
  <SmallIconButton icon={<SubtractIcon />} variant="destructive" {...props} />
);

export const Label = ({
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof BaseLabel> & { children: string }) => {
  const ref = useRef<HTMLLabelElement>(null);
  const truncated = useIsTruncated(ref, children);

  const label = (
    <BaseLabel truncate {...rest} ref={ref}>
      {children}
    </BaseLabel>
  );

  return truncated ? <Tooltip content={children}>{label}</Tooltip> : label;
};

export const useLocalValue = <Type,>(
  savedValue: Type,
  onSave: (value: Type) => void
) => {
  const [localValue, setLocalValue] = useState(savedValue);

  // Not using an effect to avoid re-rendering
  // https://beta.reactjs.org/reference/react/useState#storing-information-from-previous-renders
  const [previousSavedValue, setPreviousSavedValue] = useState(savedValue);
  if (equal(previousSavedValue, savedValue) === false) {
    setLocalValue(savedValue);
    setPreviousSavedValue(savedValue);
  }

  const save = () => {
    if (equal(localValue, savedValue) === false) {
      onSave(localValue);
    }
  };

  // onBlur will not trigger if control is unmounted when props panel is closed or similar.
  // So we're saving at the unmount
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => () => saveRef.current(), []);

  return {
    /**
     * Contains:
     *  - either the latest `savedValue`
     *  - or the latest value set via `set()`
     * (whichever changed most recently)
     */
    value: localValue,
    /**
     * Should be called on onChange or similar event
     */
    set: setLocalValue,
    /**
     * Should be called on onBlur or similar event
     */
    save,
  };
};

type LayoutProps = {
  label: string;
  id?: string;
  onDelete?: () => void;
  children: ReactNode;
};

export const VerticalLayout = ({
  label,
  id,
  onDelete,
  children,
}: LayoutProps) => (
  <Box>
    <Flex align="center" gap="1" justify="between">
      <Label htmlFor={id}>{label}</Label>
      {onDelete && <RemovePropButton onClick={onDelete} />}
    </Flex>
    {children}
  </Box>
);

export const HorizontalLayout = ({
  label,
  id,
  onDelete,
  children,
}: LayoutProps) => (
  <Flex
    css={{ minHeight: theme.spacing[13] }}
    justify="between"
    align="center"
    gap="2"
  >
    <Label htmlFor={id}>{label}</Label>
    <Flex align="center" gap="2">
      {children}
      {onDelete && <RemovePropButton onClick={onDelete} />}
    </Flex>
  </Flex>
);
