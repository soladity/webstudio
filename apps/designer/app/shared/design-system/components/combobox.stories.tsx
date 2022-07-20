import { ComponentStory } from "@storybook/react";
import React from "react";
import { Combobox } from "~/shared/design-system";
import { TextField } from "./text-field";
import { Flex } from "./flex";
import { ChevronDownIcon } from "~/shared/icons";
import { IconButton } from "./icon-button";

export default {
  component: Combobox,
};

export const Simple: ComponentStory<typeof Combobox> = () => {
  const items = [{ label: "Apple" }, { label: "Banana" }, { label: "Orange" }];
  const [value, setValue] = React.useState(items[0]);
  return (
    <Combobox
      name="fruit"
      items={items}
      value={value}
      onItemSelect={setValue}
    />
  );
};
export const CustomInput: ComponentStory<typeof Combobox> = () => {
  const items = [
    { label: "Apple", value: "apple", disabled: true },
    { label: "Banana", value: "banana" },
    { label: "Orange", value: "orange" },
  ];
  const [value, setValue] = React.useState(items[0]);

  return (
    <Combobox
      name="fruit"
      items={items}
      value={value}
      onItemSelect={setValue}
      onItemHighlight={(item) => {
        console.log(item);
      }}
      disclosure={({ inputProps, toggleProps }) => (
        <Flex>
          <TextField
            {...inputProps}
            onKeyDown={(event) => {
              inputProps?.onKeyDown(event);
              switch (event.key) {
                case "Enter": {
                  console.log(inputProps.value);
                  break;
                }
              }
            }}
            onBlur={(event) => {
              inputProps?.onBlur(event);
              console.log(inputProps.value);
            }}
          />
          <IconButton variant="ghost" size="1" {...toggleProps}>
            <ChevronDownIcon />
          </IconButton>
        </Flex>
      )}
    />
  );
};
