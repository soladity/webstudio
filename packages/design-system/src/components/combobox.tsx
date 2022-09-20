import {
  useState,
  forwardRef,
  useCallback,
  type ComponentProps,
  type ForwardRefRenderFunction,
} from "react";
import { CheckIcon, ChevronDownIcon } from "@webstudio-is/icons";
import { Popper, PopperContent, PopperAnchor } from "@radix-ui/react-popper";
import { useCombobox, type UseComboboxGetItemPropsOptions } from "downshift";
import { matchSorter } from "match-sorter";
import { styled } from "../stitches.config";
import { IconButton } from "./icon-button";
import { itemCss } from "./menu";
import { panelStyles } from "./panel";
import { TextField } from "./text-field";
import { Box } from "./box";
import { Grid } from "./grid";

type Label = string;

type BaseItem = { label: Label; disabled?: boolean } | Label;

type ComboboxTextFieldProps<Item> = {
  inputProps: ComponentProps<typeof TextField>;
  toggleProps: ComponentProps<typeof IconButton>;
  highlightedItem?: Item;
};

const ComboboxTextFieldBase: ForwardRefRenderFunction<
  HTMLDivElement,
  ComboboxTextFieldProps<BaseItem>
> = ({ inputProps, toggleProps }, ref) => {
  return (
    <TextField
      ref={ref}
      suffix={
        <IconButton {...toggleProps}>
          <ChevronDownIcon />
        </IconButton>
      }
      {...inputProps}
    />
  );
};

export const ComboboxTextField = forwardRef(ComboboxTextFieldBase);

ComboboxTextField.displayName = "ComboboxTextField";

const Listbox = styled("ul", panelStyles, {
  padding: 0,
  margin: 0,
  overflow: "auto",
  // @todo need some non-hardcoded value
  maxHeight: 400,
  minWidth: 230,
});

const ListboxItem = styled("li", itemCss, {
  padding: 0,
  margin: 0,
});

type ListProps<Item> = {
  containerProps: ComponentProps<typeof Listbox>;
  items: ReadonlyArray<Item>;
  getItemProps: (
    options: UseComboboxGetItemPropsOptions<Item>
  ) => ComponentProps<typeof ListboxItem>;
  highlightedIndex: number;
  selectedItem: Item | null;
  itemToString: (item: Item | null) => string;
};

export const List = <Item extends BaseItem>({
  containerProps,
  items,
  getItemProps,
  highlightedIndex,
  selectedItem,
  itemToString,
}: ListProps<Item>) => {
  return (
    <Listbox {...containerProps}>
      {items.map((item, index) => {
        const itemProps: Record<string, unknown> = getItemProps({
          item,
          index,
          key: index,
          ...(typeof item === "object" && item.disabled
            ? { "data-disabled": true, disabled: true }
            : {}),
          ...(highlightedIndex === index ? { "data-found": true } : {}),
        });

        return (
          // eslint-disable-next-line react/jsx-key
          <ListboxItem {...itemProps}>
            <Grid align="center" css={{ gridTemplateColumns: "$4 1fr" }}>
              {selectedItem === item && <CheckIcon />}
              <Box css={{ gridColumn: 2 }}>{itemToString(item)}</Box>
            </Grid>
          </ListboxItem>
        );
      })}
    </Listbox>
  );
};

export const ComboboxPopperContent = PopperContent;

type ComboboxProps<Item> = {
  name: string;
  label?: string;
  items: ReadonlyArray<Item>;
  value?: Item;
  onItemSelect?: (value?: Item) => void;
  onItemHighlight?: (value?: Item) => void;
  itemToString?: (item?: Item | null) => string;
  renderTextField?: (
    props: ComponentProps<typeof ComboboxTextField>
  ) => JSX.Element;
  renderList?: (props: ListProps<Item>) => JSX.Element;
  renderPopperContent?: (
    props: ComponentProps<typeof ComboboxPopperContent>
  ) => JSX.Element;
};

export const Combobox = <Item extends BaseItem>({
  items,
  value,
  name,
  itemToString = (item) =>
    item != null && "label" in item ? item.label : item ?? "",
  onItemSelect,
  onItemHighlight,
  renderTextField = (props) => <ComboboxTextField {...props} />,
  // IMPORTANT! Without Item passed to list <List<Item> typescript is 10x slower!
  renderList = (props) => <List<Item> {...props} />,
  renderPopperContent = (props) => <ComboboxPopperContent {...props} />,
}: ComboboxProps<Item>) => {
  const [foundItems, setFoundItems] = useState(items);
  const stateReducer = useCallback((state, actionAndChanges) => {
    const { type, changes } = actionAndChanges;
    switch (type) {
      // on item selection.
      case useCombobox.stateChangeTypes.ItemClick:
      case useCombobox.stateChangeTypes.InputKeyDownEnter:
      case useCombobox.stateChangeTypes.InputBlur:
      case useCombobox.stateChangeTypes.ControlledPropUpdatedSelectedItem:
        return {
          ...changes,
          // if we had an item selected.
          ...(changes.selectedItem && {
            // we will set the input value to be empty since we display it using prefix
            inputValue: "",
          }),
        };
      // Clear input value on escape
      case useCombobox.stateChangeTypes.InputKeyDownEscape:
        return {
          ...changes,
          inputValue: "",
          selectedItem: null,
        };
      // Reset selectedItem when there is selection and we type something
      case useCombobox.stateChangeTypes.InputChange:
        return {
          ...changes,
          selectedItem: null,
        };
      default:
        return changes; // otherwise business as usual.
    }
  }, []);
  const {
    isOpen,
    getToggleButtonProps,
    // getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    items: foundItems as Item[],
    selectedItem: value ?? null, // Avoid downshift warning about switching controlled mode
    stateReducer,
    itemToString,
    onInputValueChange({ inputValue }) {
      const options =
        typeof items[0] === "object" && "label" in items[0]
          ? { keys: ["label"] }
          : undefined;
      const foundItems = matchSorter(items, inputValue ?? "", options);
      setFoundItems(foundItems);
    },
    onSelectedItemChange({ selectedItem }) {
      onItemSelect?.(selectedItem ?? undefined);
    },
    onHighlightedIndexChange({ highlightedIndex }) {
      if (highlightedIndex !== undefined) {
        onItemHighlight?.(items[highlightedIndex]);
      }
    },
  });

  const inputProps: Record<string, unknown> = getInputProps({
    name,
    onKeyDown: (event) => {
      // When we press Backspace and the input is empty,
      // we should to clear the selection
      // @todo: it would be much better to handle this in reducer but downshift doesn't handle this event
      if (event.key === "Backspace" && selectedItem !== null) {
        onItemSelect?.(undefined);
      }
    },
    prefix: itemToString?.(selectedItem ?? undefined),
  });
  const toggleProps: Record<string, unknown> = getToggleButtonProps();
  const comboboxProps: Record<string, unknown> = getComboboxProps();
  const menuProps: Record<string, unknown> = getMenuProps();
  const highlightedItem = foundItems[highlightedIndex];

  return (
    <Popper>
      <Box {...comboboxProps}>
        <PopperAnchor>
          {renderTextField({
            inputProps,
            toggleProps,
            highlightedItem,
          })}
        </PopperAnchor>
        {renderPopperContent({
          style: { zIndex: 1 },
          children: renderList({
            containerProps: menuProps,
            items: isOpen ? foundItems : [],
            getItemProps,
            highlightedIndex,
            selectedItem,
            itemToString,
          }),
        })}
      </Box>
    </Popper>
  );
};

Combobox.displayName = "Combobox";
