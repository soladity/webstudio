import { ChevronDownIcon } from "@radix-ui/react-icons";
import { type ComponentProps, useState, useEffect } from "react";
import {
  TextField,
  MenuAnchor,
  Menu,
  MenuContent,
  MenuItem,
  IconButton,
} from "~/shared/design-system";

type Item = { label: string };

type ComboboxProps = ComponentProps<typeof TextField> & {
  items: Array<Item>;
  onValueSelect: (value: string) => void;
  onValueEnter: (value: string) => void;
  onItemEnter: (value: string) => void;
  onItemLeave: (value: string) => void;
  value: string;
};

export const Combobox = ({
  items,
  onValueSelect,
  onValueEnter,
  onItemEnter,
  onItemLeave,
  value,
  css,
  ...rest
}: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <Menu open={isOpen} modal={true} onOpenChange={setIsOpen}>
      <MenuAnchor asChild>
        <TextField
          {...rest}
          value={currentValue}
          autoComplete="off"
          // @todo avoid hardcoding padding
          css={{ ...css, paddingRight: 30 }}
          onChange={(event) => {
            setCurrentValue(event.target.value);
          }}
          onKeyDown={(event) => {
            switch (event.key) {
              case "ArrowDown":
              case "ArrowUp": {
                setIsOpen(true);
                break;
              }
              case "Enter": {
                onValueEnter(event.currentTarget.value);
                break;
              }
            }
          }}
        />
      </MenuAnchor>
      <IconButton
        variant="ghost"
        size="1"
        // @todo avoid hardcoding margin
        css={{ marginLeft: -32 }}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <ChevronDownIcon />
      </IconButton>
      <MenuContent loop portalled asChild>
        <div>
          {items.map(({ label }, index) => {
            return (
              <MenuItem
                key={index}
                onMouseEnter={() => {
                  onItemEnter(label);
                }}
                onMouseLeave={() => {
                  onItemLeave(label);
                }}
                onFocus={() => {
                  onItemEnter(label);
                }}
                onSelect={() => {
                  onValueSelect(label);
                }}
              >
                {label}
              </MenuItem>
            );
          })}
        </div>
      </MenuContent>
    </Menu>
  );
};
