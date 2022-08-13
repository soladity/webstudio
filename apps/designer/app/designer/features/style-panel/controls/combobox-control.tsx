import { KeyboardEvent } from "react";
import type { StyleValue } from "@webstudio-is/react-sdk";
import {
  Flex,
  Grid,
  Text,
  Combobox,
  IconButton,
  TextField,
  Tooltip,
} from "@webstudio-is/design-system";
import { PropertyNameUtility } from "./property-name-utility";
import { getFinalValue } from "../shared/get-final-value";
import { useIsFromCurrentBreakpoint } from "../shared/use-is-from-current-breakpoint";
import { ControlProps } from "../style-sections";
import { RowGapIcon, ColumnGapIcon } from "@webstudio-is/icons";

const Unit = ({ value }: { value: StyleValue }) => {
  if (value.type !== "unit" || value.unit === "number") return null;
  return (
    <Text
      css={{
        fontSize: "$1",
        cursor: "default",
      }}
    >
      {value.unit}
    </Text>
  );
};

export const ComboboxControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
  category,
}: ControlProps) => {
  const isCurrentBreakpoint = useIsFromCurrentBreakpoint(styleConfig.property);

  const value = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });

  if (value === undefined) return null;

  const setValue = setProperty(styleConfig.property);

  // @todo abstract to a variant of the combobox component
  // this whole switch block is a stop-gap measure, because i worked on flex-controls before the combobox update
  // the combobox should be updated to supporting this rendered production
  switch (styleConfig.property) {
    case "rowGap":
    case "columnGap": {
      if (category == "layout") {
        if (String(currentStyle.display?.value).includes("flex") !== true)
          break;
        const Icon =
          styleConfig.property == "rowGap" ? RowGapIcon : ColumnGapIcon;
        return (
          <Grid
            css={{
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(1, 1fr)",
            }}
          >
            <Tooltip
              content={styleConfig.label}
              delayDuration={700}
              disableHoverableContent={true}
            >
              <IconButton
                variant="ghost"
                size="1"
                css={{
                  zIndex: 1,
                  gridArea: "1 / 1 / 2 / 2",
                  marginLeft: 2,
                  marginTop: 2,
                  borderRadius: 1,
                  height: "calc($sizes$5 - 4px)",
                  width: "calc($sizes$5 - 4px)",
                  "&:focus": {
                    boxShadow: "none",
                  },
                  ...(isCurrentBreakpoint && {
                    bc: "$colors$blue4",
                    "& svg *": {
                      fill: "$colors$blue11",
                    },
                  }),
                }}
              >
                <Icon />
              </IconButton>
            </Tooltip>
            <TextField
              type="number"
              // @todo as above fit into that as a better abstraction
              // was returning value with unit i.e 0px instead of 0, so we first stringify to satisfy the typechecker
              // then parseFloat for the value
              defaultValue={parseFloat(String(value.value)) || 0}
              // @todo looses input state and focus
              // onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value + "px")
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) =>
                event.key === "Enter" &&
                setValue(event.currentTarget.value + "px")
              }
              css={{
                fontWeight: "500",
                paddingLeft: "calc($5 + 6px)",
                gridArea: "1 / 1 / -1 / -1",
                cursor: "default",
              }}
            />
          </Grid>
        );
      }
    }
  }

  return (
    <Grid columns={2} align="center" gapX="1">
      {/* @todo needs icon variant */}
      <PropertyNameUtility
        property={styleConfig.property}
        label={styleConfig.label}
      />
      <Flex align="center" css={{ gridColumn: "2/4" }} gap="1">
        <Combobox
          name={styleConfig.property}
          label={styleConfig.property}
          items={styleConfig.items}
          value={{ label: String(value.value), name: value.type }}
          // @todo new combobox doesn't include any of these event handlers
          // state={value.type === "invalid" ? "invalid" : undefined}
          // onValueSelect={setValue}
          // onValueEnter={setValue}
          // onItemEnter={(value: unknown) => {
          //   setValue(value as string, { isEphemeral: true });
          // }}
          // onItemLeave={() => {
          //   setValue(String(value.value), { isEphemeral: true });
          // }}
        />
        <Unit value={value} />
      </Flex>
    </Grid>
  );
};
