import React, { forwardRef, type ElementRef, type ComponentProps } from "react";

const defaultTag = "p";

export const Paragraph = forwardRef<
  ElementRef<typeof defaultTag>,
  ComponentProps<typeof defaultTag>
>((props, ref) => <p {...props} ref={ref} />);

Paragraph.displayName = "Paragraph";
