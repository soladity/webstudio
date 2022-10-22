import type { Asset } from "@webstudio-is/asset-uploader";
import {
  Flex,
  TextField,
  IconButton,
  Text,
  useCombobox,
  Separator,
} from "@webstudio-is/design-system";
import { AssetUpload, PreviewAsset, useAssets } from "~/designer/shared/assets";
import { SYSTEM_FONTS } from "@webstudio-is/fonts";
import { MagnifyingGlassIcon } from "@webstudio-is/icons";
import { Fragment, useMemo } from "react";
import { ItemMenu } from "./item-menu";
import { Listbox, ListboxItem } from "./list";

type Item = {
  label: string;
  type: "uploaded" | "system" | "category";
};

const categoryItems = {
  uploaded: { label: "Uploaded", type: "category" },
  system: { label: "System", type: "category" },
};

const getItems = (assets: Array<Asset | PreviewAsset>): Array<Item> => {
  const system = Array.from(SYSTEM_FONTS.keys()).map((label) => ({
    label,
    type: "system",
  }));
  // We can have 2+ assets with the same family name, so we use a map to dedupe.
  const uploaded = new Map();
  for (const asset of assets) {
    // @todo need to teach ts the right type from useAssets
    if ("meta" in asset && "family" in asset.meta) {
      uploaded.set(asset.meta.family, {
        label: asset.meta.family,
        type: "uploaded",
      });
    }
  }
  return [
    categoryItems.uploaded,
    ...uploaded.values(),
    categoryItems.system,
    ...system,
  ];
};

const groupItems = (items: Array<Item>) => {
  const uploaded = items.filter((item) => item.type === "uploaded");
  const system = items.filter((item) => item.type === "system");
  const result = [];

  if (uploaded.length !== 0) {
    result.push(categoryItems.uploaded, ...uploaded);
  }

  if (system.length !== 0) {
    result.push(categoryItems.system, ...system);
  }

  return result;
};

const NotFound = () => {
  return (
    <Flex align="center" justify="center" css={{ height: 100 }}>
      Not Found
    </Flex>
  );
};

type FontsManagerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const FontsManager = ({ value, onChange }: FontsManagerProps) => {
  const { assets, handleDelete } = useAssets("font");

  const handleDeleteByLabel = (family: string) => {
    // One family may have multiple assets for different formats, so we need to delete them all.
    const ids = assets
      .filter(
        (asset) =>
          // @todo need to teach ts the right type from useAssets
          "meta" in asset &&
          "family" in asset.meta &&
          asset.meta.family === family
      )
      .map((asset) => asset.id);
    handleDelete(ids);
  };

  const fontItems = useMemo(() => getItems(assets), [assets]);
  const selectedItem =
    fontItems.find((item) => item.label === value) ?? fontItems[0];

  const {
    items: filteredItems,
    getComboboxProps,
    getMenuProps,
    getItemProps,
    getInputProps,
  } = useCombobox({
    items: fontItems,
    value: selectedItem,
    itemToString: (item) =>
      item?.type === "category" ? "" : item?.label ?? "",
    onItemSelect: (value) => {
      if (value !== null) {
        onChange(value.label);
      }
    },
  });

  const items = groupItems(filteredItems);

  return (
    <Flex direction="column" css={{ overflow: "hidden", py: "$1" }}>
      <Flex css={{ py: "$2", px: "$3" }} gap="2" direction="column">
        <AssetUpload type="font" />
        <TextField
          type="search"
          autoFocus
          placeholder="Search"
          prefix={
            <IconButton
              aria-label="Search"
              css={{ color: "$hint" }}
              tabIndex={-1}
            >
              <MagnifyingGlassIcon />
            </IconButton>
          }
          {...getInputProps()}
        />
      </Flex>
      <Separator css={{ my: "$1" }} />
      {items.length === 0 && <NotFound />}
      <Flex
        {...getComboboxProps()}
        css={{
          flexDirection: "column",
          gap: "$3",
          px: "$3",
        }}
      >
        <Listbox {...getMenuProps()}>
          {items.map((item, index) => {
            if (item.type === "category") {
              return (
                <Fragment key={index}>
                  {index !== 0 && <Separator css={{ my: "$1" }} />}
                  <ListboxItem {...getItemProps({ item, index })} disabled>
                    <Text variant="label" truncate>
                      {item.label}
                    </Text>
                  </ListboxItem>
                </Fragment>
              );
            }
            return (
              <ListboxItem {...getItemProps({ item, index })} key={index}>
                <Text variant="label" color="contrast" truncate>
                  {item.label}
                </Text>
                {item.type === "uploaded" && (
                  <ItemMenu
                    onDelete={() => {
                      handleDeleteByLabel(item.label);
                    }}
                  />
                )}
              </ListboxItem>
            );
          })}
        </Listbox>
      </Flex>
    </Flex>
  );
};
