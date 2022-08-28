import {
  Flex,
  IconButton,
  __DEPRECATED__Text,
} from "@webstudio-is/design-system";
import { Separator } from "@webstudio-is/design-system";
import { Cross1Icon } from "@webstudio-is/icons";

type HeaderProps = {
  title: string;
  isClosable?: boolean;
  onClose?: () => void;
};

export const Header = ({ title, isClosable = true, onClose }: HeaderProps) => {
  return (
    <>
      <Flex
        css={{ height: 40, paddingLeft: "$3" }}
        align="center"
        justify="between"
      >
        <__DEPRECATED__Text size="1" css={{ fontWeight: "bold" }}>
          {title}
        </__DEPRECATED__Text>
        {isClosable && (
          <IconButton
            onClick={() => onClose?.()}
            size="1"
            css={{ marginRight: "$2" }}
            aria-label="Close"
          >
            <Cross1Icon />
          </IconButton>
        )}
      </Flex>
      <Separator />
    </>
  );
};
