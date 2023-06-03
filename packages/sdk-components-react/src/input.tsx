import { forwardRef, type ElementRef, type ComponentProps } from "react";

export const defaultTag = "input";

export const Input = forwardRef<
  ElementRef<typeof defaultTag>,
  ComponentProps<typeof defaultTag> & {
    type?: "text" | "email" | "password" | "number" | "tel" | "url";
  }
  // Make sure children are not passed down to an input, because this will result in error.
>(({ children: _children, ...props }, ref) => <input {...props} ref={ref} />);

Input.displayName = "Input";
