import React from "react";
import { ComponentStory } from "@storybook/react";
import { BrushIcon, ChevronDownIcon } from "@webstudio-is/icons";
import { Button } from "./button";
import { Flex } from "./flex";
import { IconButton } from "./icon-button";
import { TextField } from "./text-field";
import { Box } from "./box";

export default {
  component: TextField,
};

export const Default: ComponentStory<typeof TextField> = () => {
  return <TextField />;
};

export const NativeProps: ComponentStory<typeof TextField> = () => {
  return (
    <Flex direction="column" gap={3}>
      <TextField placeholder="This is a placeholder" />
      <TextField disabled placeholder="This is a disabled placeholder" />
      <TextField type="number" defaultValue={25} />
      <TextField type="search" placeholder="This is a search input" />
      <TextField readOnly value="Read-only" />
      <TextField disabled value="Disabled" />
    </Flex>
  );
};

export const Sizes: ComponentStory<typeof TextField> = () => {
  return (
    <Flex direction="column" gap={3}>
      <TextField size={1} />
      <TextField size={2} />
    </Flex>
  );
};

export const Variants: ComponentStory<typeof TextField> = () => {
  return (
    <Flex direction="column" gap={3}>
      <TextField />
      <TextField variant="ghost" />
    </Flex>
  );
};

export const State: ComponentStory<typeof TextField> = () => {
  return (
    <Flex direction="column" gap={3}>
      <TextField />
      <TextField state="invalid" />
      <TextField state="valid" />
    </Flex>
  );
};

export const PrefixSuffix: ComponentStory<typeof TextField> = () => {
  return (
    <Flex direction="column" gap={3}>
      <TextField
        prefix={<BrushIcon />}
        suffix={
          <IconButton>
            <ChevronDownIcon />
          </IconButton>
        }
      />
      <TextField
        state="invalid"
        prefix={<BrushIcon />}
        suffix={
          <IconButton>
            <ChevronDownIcon />
          </IconButton>
        }
      />
      <TextField
        size={2}
        prefix={<BrushIcon />}
        suffix={
          <IconButton size={2}>
            <ChevronDownIcon />
          </IconButton>
        }
      />
      <TextField
        disabled
        prefix={<BrushIcon />}
        suffix={
          <IconButton>
            <ChevronDownIcon />
          </IconButton>
        }
      />
    </Flex>
  );
};

export const Layout: ComponentStory<typeof TextField> = () => {
  return (
    <Flex direction="row" gap={2} css={{ justifyContent: "space-between" }}>
      <TextField
        value="Long content comes here and it doesn't wrap"
        prefix={<BrushIcon />}
        suffix={
          <IconButton>
            <ChevronDownIcon />
          </IconButton>
        }
        css={{
          flexGrow: 1,
          maxWidth: "25%",
        }}
      />
      <Box css={{ background: "$muted" }}>Content</Box>
      <TextField
        state="invalid"
        value="Long content comes here and it doesn't wrap"
      />
    </Flex>
  );
};

export const Interactive: ComponentStory<typeof TextField> = () => {
  const [value, setValue] = React.useState("");
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Flex direction="column" gap={3}>
      <TextField ref={wrapperRef} inputRef={inputRef} value={value} readOnly />
      <Button
        onClick={() => {
          // eslint-disable-next-line no-console
          setValue(JSON.stringify(wrapperRef.current?.getBoundingClientRect()));
        }}
      >
        Measure TextField
      </Button>
      <Button
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        Focus TextField
      </Button>
    </Flex>
  );
};
