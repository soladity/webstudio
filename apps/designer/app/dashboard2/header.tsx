import { ChevronDownIcon, WebstudioIcon } from "@webstudio-is/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  Text,
  Flex,
  Avatar,
  css,
  rawTheme,
  theme,
  Button,
} from "@webstudio-is/design-system";
import { User as DbUser } from "@webstudio-is/prisma-client";
import { useNavigate } from "react-router-dom";
import { logoutPath } from "~/shared/router-utils";

const containerStyle = css({
  px: theme.spacing[13],
  bc: theme.colors.backgroundPanel,
  borderBottom: `${theme.spacing[1]} solid ${theme.colors.slate8}`,
  height: theme.spacing[17],
});

const getAvatarLetter = (user: User) => {
  return (user?.username || user?.email || "X").charAt(0).toLocaleUpperCase();
};

const Menu = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" aria-label="Menu Button">
          <Flex gap="1" align="center" css={{ height: theme.spacing[11] }}>
            <Avatar
              src={user?.image || undefined}
              fallback={getAvatarLetter(user)}
            />
            <ChevronDownIcon
              width={15}
              height={15}
              color={rawTheme.colors.foregroundMain}
            />
          </Flex>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user?.username || user?.email}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => navigate(logoutPath())}>
          <Text>Logout</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type User = Omit<DbUser, "createdAt"> & {
  createdAt: string;
};

export const Header = ({ user }: { user: User }) => {
  return (
    <Flex
      as="header"
      align="center"
      justify="between"
      className={containerStyle()}
    >
      <WebstudioIcon width={30} height={23} />
      <Flex gap="1" align="center">
        <Menu user={user} />
      </Flex>
    </Flex>
  );
};
