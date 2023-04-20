import type { ComponentProps } from "react";
import type { AssetType } from "@webstudio-is/asset-uploader";
import {
  Flex,
  ScrollArea,
  SearchField,
  theme,
} from "@webstudio-is/design-system";
import { AssetUpload } from "./asset-upload";
import { NotFound } from "./not-found";
import { Separator } from "./separator";

type AssetsShellProps = {
  searchProps: ComponentProps<typeof SearchField>;
  children: JSX.Element;
  type: AssetType;
  accept?: string;
  isEmpty: boolean;
};

export const AssetsShell = ({
  searchProps,
  isEmpty,
  children,
  type,
  accept,
}: AssetsShellProps) => {
  return (
    <Flex
      direction="column"
      css={{
        overflow: "hidden",
        py: theme.spacing[5],
      }}
    >
      <Flex
        css={{ py: theme.spacing[5], px: theme.spacing[9] }}
        gap="2"
        direction="column"
        shrink={false}
      >
        <AssetUpload type={type} accept={accept} />
        <SearchField {...searchProps} autoFocus placeholder="Search" />
      </Flex>
      <Separator />
      {isEmpty && <NotFound />}
      <ScrollArea css={{ display: "flex", flexDirection: "column" }}>
        {children}
      </ScrollArea>
    </Flex>
  );
};
