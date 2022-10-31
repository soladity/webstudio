import {
  DropdownMenu,
  DropdownMenuTrigger,
  IconButton,
  DropdownMenuContent,
  DropdownMenuItem,
  Text,
  DropdownMenuPortal,
  styled,
} from "@webstudio-is/design-system";
import { DotsHorizontalIcon } from "@webstudio-is/icons";
import { type FocusEventHandler, useState } from "react";

const MenuButton = styled(IconButton, {
  color: "$hint",
  "&:hover, &:focus": {
    color: "$hiContrast",
  },
});

type ItemMenuProps = {
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onFocusTrigger?: FocusEventHandler;
  onBlurTrigger?: FocusEventHandler;
};

export const ItemMenu = ({
  onDelete,
  onOpenChange,
  onFocusTrigger,
  onBlurTrigger,
}: ItemMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        onOpenChange(open);
      }}
    >
      <DropdownMenuTrigger asChild>
        <MenuButton
          aria-label="Font menu"
          onFocus={onFocusTrigger}
          onBlur={onBlurTrigger}
          tabIndex={0}
          onClick={(event) => {
            // Prevent setting the current font to the item.
            event.stopPropagation();
          }}
        >
          <DotsHorizontalIcon />
        </MenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={(event) => {
              // Prevent setting the current font to the item.
              event.stopPropagation();
            }}
            onSelect={() => {
              onDelete();
            }}
          >
            <Text>Delete font</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
