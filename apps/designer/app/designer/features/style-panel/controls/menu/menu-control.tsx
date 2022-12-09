import { IconButtonWithMenu } from "@webstudio-is/design-system";
import { getFinalValue } from "../../shared/get-final-value";
import { useIsFromCurrentBreakpoint } from "../../shared/use-is-from-current-breakpoint";
import type { ControlProps } from "../../style-sections";
import { iconConfigs } from "../../shared/configs";

export const MenuControl = ({
  currentStyle,
  inheritedStyle,
  setProperty,
  styleConfig,
}: ControlProps) => {
  const value = getFinalValue({
    currentStyle,
    inheritedStyle,
    property: styleConfig.property,
  });
  const isFromCurrentBreakpoint = useIsFromCurrentBreakpoint(
    styleConfig.property
  );

  if (value === undefined) {
    return null;
  }

  const setValue = setProperty(styleConfig.property);
  const currentValue = value.value as string;

  const iconProps = iconConfigs[styleConfig.property];
  const iconStyle =
    styleConfig.property === "flexDirection"
      ? {}
      : {
          transform: `rotate(${
            currentStyle.flexDirection?.value === "column"
              ? 90 * (styleConfig.property === "alignItems" ? -1 : 1)
              : 0
          }deg)`,
        };
  const items = styleConfig.items
    .map((item) => {
      const ItemIcon = iconProps[item.name];
      return {
        ...item,
        icon: ItemIcon && <ItemIcon style={iconStyle} />,
      };
    })
    .filter((item) => item.icon);
  return (
    <IconButtonWithMenu
      icon={items.find(({ name }) => name === currentValue)?.icon}
      label={styleConfig.label}
      items={items}
      value={String(currentValue)}
      isActive={isFromCurrentBreakpoint}
      onChange={setValue}
      onHover={(value) => setValue(value, { isEphemeral: true })}
    />
  );
};
