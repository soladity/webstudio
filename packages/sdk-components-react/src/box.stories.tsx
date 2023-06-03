import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { Box as BoxPrimitive } from "./box";

export default {
  title: "Components/Box",
  component: BoxPrimitive,
} as ComponentMeta<typeof BoxPrimitive>;

const Template: ComponentStory<typeof BoxPrimitive> = (args) => (
  <BoxPrimitive
    {...args}
    style={{ minHeight: 20, outline: "1px solid black" }}
  />
);

export const Box = Template.bind({});
Box.args = {};
