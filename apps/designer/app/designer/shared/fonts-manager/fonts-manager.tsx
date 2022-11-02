import {
  Flex,
  Separator as SeparatorPrimitive,
  SearchField,
  List,
  ListItem,
  useList,
  findNextListIndex,
  styled,
} from "@webstudio-is/design-system";
import { AssetUpload, useAssets } from "~/designer/shared/assets";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMenu } from "./item-menu";
import { CheckIcon } from "@webstudio-is/icons";
import {
  type Item,
  filterIdsByFamily,
  filterItems,
  groupItemsByType,
  toItems,
} from "./item-utils";
import { useSearch } from "./use-search";

const NotFound = () => {
  return (
    <Flex align="center" justify="center" css={{ height: 100 }}>
      Font not found
    </Flex>
  );
};

const useFilteredItems = ({ onReset }: { onReset: () => void }) => {
  const { assets } = useAssets("font");
  const fontItems = useMemo(() => toItems(assets), [assets]);
  const [filteredItems, setFilteredItems] = useState(fontItems);
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  const resetFilteredItems = useCallback(() => {
    setFilteredItems(fontItems);
  }, [fontItems]);

  useEffect(() => {
    setFilteredItems(fontItems);
    onResetRef.current();
  }, [fontItems]);

  return {
    filteredItems,
    resetFilteredItems,
    setFilteredItems,
  };
};

const useLogic = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const { assets, handleDelete: handleDeleteAssets } = useAssets("font");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { filteredItems, resetFilteredItems, setFilteredItems } =
    useFilteredItems({
      onReset() {
        searchProps.onCancel();
      },
    });
  const { uploadedItems, systemItems, groupedItems } = useMemo(
    () => groupItemsByType(filteredItems),
    [filteredItems]
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    groupedItems.findIndex((item) => item.label === value)
  );

  const handleChangeCurrent = (nextCurrentIndex: number) => {
    const item = groupedItems[nextCurrentIndex];
    if (item !== undefined) {
      setCurrentIndex(nextCurrentIndex);
      onChange(item.label);
    }
  };

  const { getItemProps, getListProps } = useList({
    items: groupedItems,
    selectedIndex,
    currentIndex,
    onSelect: setSelectedIndex,
    onChangeCurrent: handleChangeCurrent,
  });

  const handleDelete = (index: number) => {
    const family = groupedItems[index].label;
    const ids = filterIdsByFamily(family, assets);
    handleDeleteAssets(ids);
    if (index === currentIndex) {
      setCurrentIndex(-1);
    }
  };

  const searchProps = useSearch({
    onCancel: resetFilteredItems,
    onSearch(search) {
      if (search === "") {
        return resetFilteredItems();
      }
      const items = filterItems(search, groupedItems);
      setFilteredItems(items);
    },
    onSelect(direction) {
      if (direction === "current") {
        handleChangeCurrent(selectedIndex);
        return;
      }
      const nextIndex = findNextListIndex(
        selectedIndex,
        groupedItems.length,
        direction
      );
      setSelectedIndex(nextIndex);
    },
  });

  return {
    groupedItems,
    uploadedItems,
    systemItems,
    selectedIndex,
    handleDelete,
    handleSelect: setSelectedIndex,
    getItemProps,
    getListProps,
    searchProps,
  };
};

const Separator = styled(SeparatorPrimitive, {
  marginTop: "$1",
  marginBottom: "$2",
});

type FontsManagerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const FontsManager = ({ value, onChange }: FontsManagerProps) => {
  const {
    groupedItems,
    uploadedItems,
    systemItems,
    handleDelete,
    handleSelect,
    selectedIndex,
    getListProps,
    getItemProps,
    searchProps,
  } = useLogic({ onChange, value });

  const listProps = getListProps();
  const { render: renderMenu, isOpen: isMenuOpen } = useMenu({
    selectedIndex,
    onSelect: handleSelect,
    onDelete: handleDelete,
  });

  const renderItem = (item: Item, index: number) => {
    const itemProps = getItemProps({ index });
    return (
      <ListItem
        {...itemProps}
        prefix={itemProps.current ? <CheckIcon /> : undefined}
        suffix={item.type === "uploaded" ? renderMenu(index) : undefined}
      >
        {item.label}
      </ListItem>
    );
  };

  return (
    <Flex
      direction="column"
      css={{ overflow: "hidden", paddingTop: "$1", paddingBottom: "$3" }}
    >
      <Flex css={{ py: "$2", px: "$3" }} gap="2" direction="column">
        <AssetUpload type="font" />
        <SearchField {...searchProps} autoFocus placeholder="Search" />
      </Flex>
      <Separator />
      {groupedItems.length === 0 && <NotFound />}
      <Flex
        css={{
          flexDirection: "column",
          gap: "$3",
          px: "$3",
        }}
      >
        <List
          {...listProps}
          onBlur={(event) => {
            if (isMenuOpen === false) {
              listProps.onBlur(event);
            }
          }}
        >
          {uploadedItems.length !== 0 && (
            <ListItem state="disabled">{"Uploaded"}</ListItem>
          )}
          {uploadedItems.map(renderItem)}
          {systemItems.length !== 0 && (
            <>
              {uploadedItems.length !== 0 && <Separator />}
              <ListItem state="disabled">{"System"}</ListItem>
            </>
          )}
          {systemItems.map((item, index) =>
            renderItem(item, index + uploadedItems.length)
          )}
        </List>
      </Flex>
    </Flex>
  );
};
