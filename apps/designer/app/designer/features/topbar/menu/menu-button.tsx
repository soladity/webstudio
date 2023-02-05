import {
  css,
  DropdownMenuTrigger,
  rawTheme,
  theme,
  ToolbarToggle,
} from "@webstudio-is/design-system";
import { HamburgerMenuIcon, WebstudioIcon } from "@webstudio-is/icons";

const innerContainerStyle = css({
  width: "100%",
  height: "100%",
  color: theme.colors.foregroundContrastMain,
  transformStyle: "preserve-3d",
  transition: "transform 200ms",
});

const faceStyle = css({
  background: theme.colors.backgroundTopbar,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  width: "100%",
  height: "100%",
  "&:hover": {
    background: theme.colors.backgroundButtonHover,
  },
});

const size = rawTheme.spacing[10];

export const MenuButton = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <DropdownMenuTrigger asChild>
      <ToolbarToggle aria-label="Menu Button" css={{ position: "relative" }}>
        <span
          className={innerContainerStyle()}
          style={{
            transform: isOpen
              ? `translateZ(-${size}) rotateY(-90deg)`
              : `translateZ(-${size}) rotateY(0deg)`,
          }}
        >
          <span
            className={faceStyle()}
            style={{ transform: `rotateY(0deg) translateZ(${size})` }}
          >
            <WebstudioIcon width="22" height="22" />
          </span>
          <span
            className={faceStyle()}
            style={{
              transform: `rotateY(90deg) translateZ(${size})`,
            }}
          >
            <HamburgerMenuIcon />
          </span>
        </span>
      </ToolbarToggle>
    </DropdownMenuTrigger>
  );
};
