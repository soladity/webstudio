import { styled } from "../stitches.config";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

export const ToggleGroup = styled(ToggleGroupPrimitive.Root, {
  display: "inline-flex",
  borderRadius: "$spacing$3",
  boxShadow: `0 0 0 $spacing$1 $colors$slate7`,
  padding: 2,
});

export const ToggleGroupItem = styled(ToggleGroupPrimitive.Item, {
  // all: "unset", // @note weird bug, this somehow gets into weird specifity issues with how styles are inserted
  border: "none",
  backgroundColor: "$loContrast",
  color: "$hiContrast",
  display: "flex",
  whiteSpace: "nowrap",
  fontSize: "$fontSize$4",
  lineHeight: 1,
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 1,
  borderRadius: 2,
  height: "$spacing$11",
  "&": {
    px: "$spacing$3",
  },
  "&:first-child": {
    marginLeft: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  "&:last-child": { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  "&:hover": { backgroundColor: "$slateA3" },
  // @note because the outline is outside of the element others can end up covering it
  "&:focus": { boxShadow: "0 0 0 $spacing$2 $colors$blue10", zIndex: 1 },
  "&[data-state=on]": { backgroundColor: "$slate5" },
});
