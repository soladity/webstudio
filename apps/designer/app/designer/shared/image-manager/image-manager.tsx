import { useState } from "react";
import { findNextListIndex, Grid } from "@webstudio-is/design-system";
import { AssetsShell, type ClientAsset, useAssets, useSearch } from "../assets";
import { useFilter } from "../assets/use-filter";
import { ImageThumbnail } from "./image-thumbnail";
import { matchSorter } from "match-sorter";

const filterItems = (search: string, items: Array<ClientAsset>) => {
  return matchSorter(items, search, {
    keys: [
      (item) =>
        item.status === "uploading" ? item.preview.name : item.asset.name,
    ],
  });
};

const useLogic = ({
  onChange,
}: {
  onChange?: (asset: ClientAsset) => void;
}) => {
  const { assets, handleDelete } = useAssets("image");

  const [selectedIndex, setSelectedIndex] = useState(-1);

  // @todo filter out deleting assets
  const { filteredItems, resetFilteredItems, setFilteredItems } = useFilter({
    items: assets,
    onReset() {
      searchProps.onCancel();
    },
  });

  const searchProps = useSearch({
    onCancel: resetFilteredItems,
    onSearch(search) {
      if (search === "") {
        return resetFilteredItems();
      }
      const items = filterItems(search, assets);
      setFilteredItems(items);
    },
    onSelect(direction) {
      if (direction === "current") {
        setSelectedIndex(selectedIndex);
        const asset = filteredItems[selectedIndex];
        if (asset?.status === "uploaded") {
          onChange?.(asset);
        }
        return;
      }
      const nextIndex = findNextListIndex(
        selectedIndex,
        filteredItems.length,
        direction
      );
      setSelectedIndex(nextIndex);
    },
  });

  const handleSelect = (clientAsset?: ClientAsset) => {
    const selectedIndex = filteredItems.findIndex(
      (item) =>
        (item.asset?.id ?? item.preview?.id) ===
        (clientAsset?.asset?.id ?? clientAsset?.preview?.id)
    );
    setSelectedIndex(selectedIndex);
  };

  return {
    searchProps,
    handleDelete,
    filteredItems,
    handleSelect,
    selectedIndex,
  };
};

type ImageManagerProps = {
  onChange?: (asset: ClientAsset) => void;
};

export const ImageManager = ({ onChange }: ImageManagerProps) => {
  const {
    handleDelete,
    handleSelect,
    filteredItems,
    searchProps,
    selectedIndex,
  } = useLogic({ onChange });

  return (
    <AssetsShell
      searchProps={searchProps}
      isEmpty={filteredItems.length === 0}
      type="image"
    >
      <Grid columns={3} gap={2}>
        {filteredItems.map((clientAsset, index) => (
          <ImageThumbnail
            key={clientAsset.asset?.id ?? clientAsset.preview?.id}
            asset={clientAsset}
            onDelete={handleDelete}
            onSelect={handleSelect}
            onChange={onChange}
            state={index === selectedIndex ? "selected" : undefined}
          />
        ))}
      </Grid>
    </AssetsShell>
  );
};
