import {
  type ComponentProps,
  type ForwardRefRenderFunction,
  forwardRef,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  CrossCircledFilledIcon,
  MagnifyingGlassIcon,
} from "@webstudio-is/icons";
import { TextField } from "./text-field";
import { IconButtonDeprecated } from "./icon-button-deprecated";
import { styled } from "../stitches.config";

const SearchIcon = styled(MagnifyingGlassIcon, {
  color: "$hint",
  padding: "$spacing$3",
});

const AbortButton = styled(IconButtonDeprecated, {
  marginRight: "$spacing$3",
});

const SearchFieldBase: ForwardRefRenderFunction<
  HTMLInputElement,
  ComponentProps<typeof TextField> & { onCancel?: () => void }
> = (props, ref) => {
  const {
    onChange,
    onCancel,
    value: propsValue = "",
    onKeyDown,
    ...rest
  } = props;
  const [value, setValue] = useState(String(propsValue));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue(String(propsValue));
  }, [propsValue]);
  return (
    <TextField
      {...rest}
      ref={ref}
      type="search"
      value={value}
      inputRef={inputRef}
      prefix={<SearchIcon />}
      suffix={
        value.length > 0 ? (
          <AbortButton
            aria-label="Reset search"
            title="Reset search"
            tabIndex={-1}
            onClick={() => {
              setValue("");
              onCancel?.();
            }}
          >
            <CrossCircledFilledIcon />
          </AbortButton>
        ) : null
      }
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event);
      }}
      onKeyDown={(event) => {
        // Make sure we clear the search on esc and preserve the default browser behavior
        if (event.key === "Escape" && value.length !== 0) {
          event.stopPropagation();
          return;
        }
        onKeyDown?.(event);
      }}
    />
  );
};

export const SearchField = forwardRef(SearchFieldBase);
