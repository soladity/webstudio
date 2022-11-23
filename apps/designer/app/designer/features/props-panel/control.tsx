import {
  componentsMeta,
  type Instance,
  type UserProp,
} from "@webstudio-is/react-sdk";
import warnOnce from "warn-once";
import {
  Flex,
  Label,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
} from "@webstudio-is/design-system";
import { isFeatureEnabled } from "~/shared/feature-flags";
import { ValuePickerPopover } from "../style-panel/shared/value-picker-popover";
import { ImageManager } from "~/designer/shared/image-manager";

import { Checkbox } from "@webstudio-is/design-system";
import { Asset } from "@webstudio-is/asset-uploader";

const textControlTypes = [
  "text",
  "array",
  "color",
  "date",
  "file",
  "number",
  "object",
] as const;

type TextControlProps = {
  type: typeof textControlTypes[number];
  value: string;
  onChange: (value: string) => void;
};

const TextControl = ({ value, type, onChange }: TextControlProps) => (
  <TextField
    type={type}
    placeholder="Value"
    name="value"
    value={value}
    onChange={(event) => {
      onChange(event.target.value);
    }}
  />
);

const checkboxControlTypes = ["check", "inline-check", "multi-select"] as const;

type CheckboxControlProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<string>;
  type: typeof checkboxControlTypes[number];
};

const CheckboxControl = ({
  value,
  options,
  onChange,
}: CheckboxControlProps) => (
  <RadioGroup
    css={{ flexDirection: "column" }}
    name="value"
    value={value}
    onValueChange={onChange}
  >
    {options.map((option) => (
      <Flex align="center" gap="1" key={option}>
        <Checkbox value={option} />
        <Label>{option}</Label>
      </Flex>
    ))}
  </RadioGroup>
);

const radioControlTypes = ["radio", "inline-radio"] as const;

type RadioControlProps = {
  value: string;
  onChange: (value: string) => void;

  options: Array<string>;
  type: typeof radioControlTypes[number];
};

const RadioControl = ({
  value,
  options,

  onChange,
}: RadioControlProps) => (
  <RadioGroup
    css={{ flexDirection: "column" }}
    name="value"
    value={value}
    onValueChange={onChange}
  >
    {options.map((value) => (
      <Flex align="center" gap="1" key={value}>
        <Radio value={value} id={value} />
        <Label htmlFor={value}>{value}</Label>
      </Flex>
    ))}
  </RadioGroup>
);

const selectControlTypes = ["select"] as const;
type SelectControlProps = {
  value: string;
  onChange: (value: string) => void;

  options: Array<string>;
  type: typeof selectControlTypes[number];
};

const SelectControl = ({
  value,
  options,

  onChange,
}: SelectControlProps) => (
  <Select name="value" value={value} options={options} onChange={onChange} />
);

type BooleanControlProps = {
  defaultValue?: boolean;
  value: boolean;
  onChange: (value: boolean) => void;
};

const BooleanControl = ({
  value,
  defaultValue,
  onChange,
}: BooleanControlProps) => (
  <Switch
    name="value"
    defaultChecked={Boolean(defaultValue)}
    checked={value === true}
    onCheckedChange={onChange}
  />
);

type ImageControlProps = {
  asset: Asset | null;
  onChange: (asset: Asset) => void;
};

const ImageControl = ({ asset, onChange }: ImageControlProps) => {
  return (
    <ValuePickerPopover
      title="Images"
      content={<ImageManager onChange={onChange} />}
    >
      <TextField defaultValue={asset?.name ?? " - "} />
    </ValuePickerPopover>
  );
};

const NotImplemented = () => <div />;

const includes = <T extends string>(arr: readonly T[], v: string): v is T => {
  return arr.includes(v as never);
};

const assertUnreachable = (_arg: never, errorMessage: string) => {
  throw new Error(errorMessage);
};

type ControlProps = {
  component: Instance["component"];
  userProp: UserProp;
  onChangePropValue: (value: string | boolean, asset?: Asset) => void;
};

// eslint-disable-next-line func-style
export function Control({
  component,
  userProp,
  onChangePropValue,
}: ControlProps) {
  const meta = componentsMeta[component];
  const argType = meta[userProp.prop as keyof typeof meta];

  const defaultValue = argType.defaultValue;
  const type = argType.type;

  if (type == null) {
    warnOnce(
      true,
      `No control type for prop "${userProp.prop}" component "${component}" found`
    );
    return <NotImplemented />;
  }

  if (typeof type !== "string") {
    warnOnce(
      true,
      `Control type "${typeof type}" for prop "${
        userProp.prop
      }" component "${component}" is not a string`
    );

    return <NotImplemented />;
  }

  if (isFeatureEnabled("assets")) {
    if (component === "Image" && userProp.prop === "src") {
      const asset = userProp.asset ?? null;

      return (
        <ImageControl
          asset={asset}
          onChange={(asset) => onChangePropValue(asset.path, asset)}
        />
      );
    }
  }

  if (includes(textControlTypes, type)) {
    const value = `${userProp.value}`;

    return (
      <TextControl value={value} onChange={onChangePropValue} type={type} />
    );
  }

  if (type === "boolean") {
    const value = Boolean(userProp.value);

    return (
      <BooleanControl
        value={value}
        onChange={onChangePropValue}
        defaultValue={Boolean(defaultValue)}
      />
    );
  }

  if (
    argType.type === "radio" ||
    argType.type === "inline-radio" ||
    argType.type === "check" ||
    argType.type === "inline-check" ||
    argType.type === "multi-select" ||
    argType.type === "select"
  ) {
    const options = argType.options;

    const value = `${userProp.value}`;

    warnOnce(
      options == null,
      `options is not an array of strings for prop: ${userProp.prop} component: ${component}`
    );

    const DEFAULT_OPTIONS: string[] = [];

    if (includes(radioControlTypes, type)) {
      return (
        <RadioControl
          value={value}
          onChange={onChangePropValue}
          options={options ?? DEFAULT_OPTIONS}
          type={type}
        />
      );
    }

    if (includes(checkboxControlTypes, type)) {
      return (
        <CheckboxControl
          value={value}
          onChange={onChangePropValue}
          options={options ?? DEFAULT_OPTIONS}
          type={type}
        />
      );
    }

    if (includes(selectControlTypes, type)) {
      return (
        <SelectControl
          value={value}
          onChange={onChangePropValue}
          options={options ?? DEFAULT_OPTIONS}
          type={type}
        />
      );
    }

    assertUnreachable(type, `Unknown control type ${type}`);
  }

  warnOnce(
    true,
    `Control type "${type}" is not implemented for prop: "${userProp.prop}" in component "${component}"`
  );

  return <NotImplemented />;
}
