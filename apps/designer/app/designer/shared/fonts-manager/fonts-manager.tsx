import type { Asset } from "@webstudio-is/asset-uploader";
import {
  Flex,
  Separator,
  SearchField,
  List,
  ListItem,
} from "@webstudio-is/design-system";
import { AssetUpload, PreviewAsset, useAssets } from "~/designer/shared/assets";
import { SYSTEM_FONTS } from "@webstudio-is/fonts";
import {
  type KeyboardEventHandler,
  type ChangeEventHandler,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { matchSorter } from "match-sorter";
import { ItemMenu } from "./item-menu";
import { CheckIcon } from "@webstudio-is/icons";

type Item = {
  label: string;
  type: "uploaded" | "system";
};

const toItems = (assets: Array<Asset | PreviewAsset>): Array<Item> => {
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
  return [...uploaded.values(), ...system];
};

const NotFound = () => {
  return (
    <Flex align="center" justify="center" css={{ height: 100 }}>
      Font not found
    </Flex>
  );
};

const filterIdsByFamily = (
  family: string,
  assets: Array<Asset | PreviewAsset>
) => {
  // One family may have multiple assets for different formats, so we need to find them all.
  return assets
    .filter(
      (asset) =>
        // @todo need to teach TS the right type from useAssets
        "meta" in asset &&
        "family" in asset.meta &&
        asset.meta.family === family
    )
    .map((asset) => asset.id);
};

const findNextIndex = (
  currentIndex: number,
  total: number,
  indexOrDirection: "next" | "previous"
) => {
  const nextIndex =
    indexOrDirection === "next"
      ? currentIndex + 1
      : indexOrDirection === "previous"
      ? currentIndex - 1
      : indexOrDirection;

  if (nextIndex < 0) {
    return total - 1;
  }
  if (nextIndex >= total) {
    return 0;
  }
  return nextIndex;
};

const groupItemsByType = (items: Array<Item>) => {
  const uploadedItems = items.filter((item) => item.type === "uploaded");
  const systemItems = items.filter((item) => item.type === "system");
  return { uploadedItems, systemItems };
};

const filter = (search: string, items: Array<Item>) => {
  return matchSorter(items, search, {
    keys: [(item) => item.label],
  });
};

const useLogic = ({ onChange }: { onChange: (value: string) => void }) => {
  const { assets, handleDelete } = useAssets("font");
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const fontItems = useMemo(() => toItems(assets), [assets]);
  const [filteredItems, setFilteredItems] = useState(fontItems);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const items = filter(search, fontItems);
    setFilteredItems(items);
  }, [fontItems, search]);

  const { uploadedItems, systemItems } = useMemo(
    () => groupItemsByType(filteredItems),
    [filteredItems]
  );

  const handleDeleteByLabel = (family: string) => {
    const ids = filterIdsByFamily(family, assets);
    handleDelete(ids);
    setFilteredItems(filteredItems.filter((item) => item.label !== family));
  };

  const handleCancelSearch = () => {
    setFilteredItems(fontItems);
  };

  const handleSelectItem = (indexOrDirection: number | "next" | "previous") => {
    if (typeof indexOrDirection === "number") {
      setSelectedItemIndex(indexOrDirection);
      return;
    }
    const nextIndex = findNextIndex(
      selectedItemIndex,
      filteredItems.length,
      indexOrDirection
    );
    setSelectedItemIndex(nextIndex);
  };

  const handleKeyDown: KeyboardEventHandler = (event) => {
    switch (event.code) {
      case "ArrowUp": {
        handleSelectItem("previous");
        break;
      }
      case "ArrowDown": {
        handleSelectItem("next");
        break;
      }
      case "Enter": {
        const item = filteredItems[selectedItemIndex];
        if (item !== undefined) onChange(item.label);
        break;
      }
    }
  };

  const handleSearch: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearch(event.currentTarget.value);
  };

  return {
    search,
    filteredItems,
    uploadedItems,
    systemItems,
    selectedItemIndex,
    handleDelete: handleDeleteByLabel,
    handleCancelSearch,
    handleSelectItem,
    handleKeyDown,
    handleSearch,
  };
};

type FontsManagerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const FontsManager = ({ value, onChange }: FontsManagerProps) => {
  const {
    search,
    filteredItems,
    uploadedItems,
    systemItems,
    handleSearch,
    handleDelete,
    handleCancelSearch,
    handleSelectItem,
    handleKeyDown,
    selectedItemIndex,
  } = useLogic({ onChange });
  const isMenuOpen = useRef(false);
  const isMenuTriggerFocused = useRef(false);

  return (
    <Flex direction="column" css={{ overflow: "hidden", py: "$1" }}>
      <Flex css={{ py: "$2", px: "$3" }} gap="2" direction="column">
        <AssetUpload type="font" />
        <SearchField
          value={search}
          autoFocus
          placeholder="Search"
          onCancel={handleCancelSearch}
          onKeyDown={handleKeyDown}
          onChange={handleSearch}
        />
      </Flex>
      <Separator css={{ my: "$1" }} />
      {filteredItems.length === 0 && <NotFound />}
      <Flex
        css={{
          flexDirection: "column",
          gap: "$3",
          px: "$3",
        }}
      >
        <List
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            const isFocusWithin = event.currentTarget.contains(
              event.relatedTarget
            );
            if (isFocusWithin === false && isMenuOpen.current === false) {
              handleSelectItem(-1);
            }
          }}
        >
          {uploadedItems.length !== 0 && (
            <ListItem state="disabled">{"Uploaded"}</ListItem>
          )}
          {uploadedItems.map((item, index) => {
            return (
              <ListItem
                key={index}
                state={selectedItemIndex === index ? "selected" : undefined}
                prefix={item.label === value ? <CheckIcon /> : undefined}
                current={item.label === value}
                suffix={
                  selectedItemIndex === index ||
                  isMenuOpen.current ||
                  isMenuTriggerFocused.current ? (
                    <ItemMenu
                      onOpenChange={(open) => {
                        isMenuOpen.current = open;
                        handleSelectItem(index);
                      }}
                      onDelete={() => {
                        handleDelete(item.label);
                      }}
                      onFocusTrigger={() => {
                        isMenuTriggerFocused.current = true;
                        handleSelectItem(-1);
                      }}
                      onBlurTrigger={() => {
                        isMenuTriggerFocused.current = false;
                      }}
                    />
                  ) : undefined
                }
                onFocus={(event) => {
                  const isItem = event.target === event.currentTarget;
                  // We need to ignore focus on a menu button inside
                  if (isItem) {
                    handleSelectItem(index);
                  }
                }}
                onMouseEnter={() => {
                  handleSelectItem(index);
                }}
                onClick={() => {
                  onChange(item.label);
                }}
              >
                {item.label}
              </ListItem>
            );
          })}
          {systemItems.length !== 0 && (
            <>
              {uploadedItems.length !== 0 && <Separator css={{ my: "$1" }} />}
              <ListItem state="disabled">{"System"}</ListItem>
            </>
          )}
          {systemItems.map((item, index) => {
            const globalIndex = uploadedItems.length + index;
            return (
              <ListItem
                key={globalIndex}
                state={
                  selectedItemIndex === globalIndex ? "selected" : undefined
                }
                prefix={item.label === value ? <CheckIcon /> : undefined}
                current={item.label === value}
                onFocus={(event) => {
                  const isItem = event.target === event.currentTarget;
                  // We need to ignore focus on a menu button inside
                  if (isItem) {
                    handleSelectItem(globalIndex);
                  }
                }}
                onMouseEnter={() => {
                  handleSelectItem(globalIndex);
                }}
                onClick={() => {
                  onChange(item.label);
                }}
              >
                {item.label}
              </ListItem>
            );
          })}
        </List>
      </Flex>
    </Flex>
  );
};
