import {
  getComponentMetaProps,
  type Instance,
  type UserProp,
} from "@webstudio-is/react-sdk";

import { type Publish } from "~/shared/pubsub";
import { Control } from "./control";
import { CollapsibleSection, ComponentInfo } from "~/designer/shared/inspector";
import type { SelectedInstanceData } from "@webstudio-is/project";
import {
  Box,
  Button,
  Grid,
  TextField,
  Tooltip,
  useCombobox,
  ComboboxPopper,
  ComboboxPopperContent,
  ComboboxPopperAnchor,
  ComboboxListbox,
  ComboboxListboxItem,
  IconButton,
} from "@webstudio-is/design-system";
import {
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@webstudio-is/icons";
import { usePropsLogic } from "./use-props-logic";
import type { Asset } from "@webstudio-is/asset-uploader";

type ComboboxProps = {
  isReadonly: boolean;
  isInvalid: boolean;
  items: Array<string>;
  value: string;
  onItemSelect: (value: string | null) => void;
  onSubmit: (value: string) => void;
};

const Combobox = ({
  isReadonly,
  isInvalid,
  items: itemsProp,
  value,
  onItemSelect,
  onSubmit,
}: ComboboxProps) => {
  const {
    items,
    getInputProps,
    getComboboxProps,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
    isOpen,
  } = useCombobox({
    items: itemsProp,
    value,
    itemToString: (item) => item ?? "",
    onItemSelect,
  });

  return (
    <ComboboxPopper>
      <Box {...getComboboxProps()}>
        <ComboboxPopperAnchor>
          <TextField
            {...getInputProps({
              onKeyPress: (event) => {
                if (event.key === "Enter") {
                  onSubmit(event.currentTarget.value);
                }
              },
            })}
            name="prop"
            placeholder="Property"
            readOnly={isReadonly}
            state={isInvalid ? "invalid" : undefined}
            suffix={
              <IconButton {...getToggleButtonProps()}>
                <ChevronDownIcon />
              </IconButton>
            }
          />
        </ComboboxPopperAnchor>
        <ComboboxPopperContent align="start" sideOffset={5}>
          <ComboboxListbox {...getMenuProps()}>
            {isOpen &&
              items.map((item, index) => {
                return (
                  <ComboboxListboxItem
                    {...getItemProps({ item, index })}
                    key={index}
                  >
                    {item}
                  </ComboboxListboxItem>
                );
              })}
          </ComboboxListbox>
        </ComboboxPopperContent>
      </Box>
    </ComboboxPopper>
  );
};

type PropertyProps = {
  userProp: UserProp;
  component: Instance["component"];
  onChangePropName: (name: string, defaultValue: string | boolean) => void;
  onChangePropValue: (value: string | boolean, asset?: Asset) => void;
  onDelete: (id: UserProp["id"]) => void;
};

const Property = ({
  userProp,
  component,
  onChangePropName,
  onChangePropValue,
  onDelete,
}: PropertyProps) => {
  const meta = getComponentMetaProps(component);

  const argType = meta[userProp.prop as keyof typeof meta];
  const isInvalid =
    userProp.prop != null &&
    userProp.prop.length > 0 &&
    typeof argType === "undefined" &&
    !userProp.prop.match(/^data-(.)+/);

  const allProps = Object.keys(meta);

  return (
    <>
      <Combobox
        items={allProps}
        value={userProp.prop}
        onItemSelect={(name) => {
          if (name != null) {
            const argType = meta[name as keyof typeof meta];

            const defaultValue =
              argType?.defaultValue ??
              (argType?.type === "boolean" ? false : "");

            onChangePropName(name, defaultValue);
          }
        }}
        onSubmit={(name) => {
          const argType = meta[name as keyof typeof meta];

          const defaultValue =
            argType?.defaultValue ?? (argType?.type === "boolean" ? false : "");

          onChangePropName(name, defaultValue);
        }}
        isInvalid={isInvalid}
        isReadonly={userProp.required ?? false}
      />
      {isInvalid ? (
        <Tooltip content={`Invalid property name: ${userProp.prop}`}>
          <ExclamationTriangleIcon width={12} height={12} />
        </Tooltip>
      ) : (
        // requires matching complex union
        // skip for now and fix types later
        <Control
          component={component}
          userProp={userProp}
          onChangePropValue={onChangePropValue}
        />
      )}
      {userProp.required !== true && (
        <Button
          ghost
          onClick={() => {
            onDelete(userProp.id);
          }}
        >
          <TrashIcon />
        </Button>
      )}
    </>
  );
};

type PropsPanelProps = {
  publish: Publish;
  selectedInstanceData: SelectedInstanceData;
};

export const PropsPanel = ({
  selectedInstanceData,
  publish,
}: PropsPanelProps) => {
  const {
    userProps,
    addEmptyProp,
    handleChangePropName,
    handleChangePropValue,
    handleDeleteProp,
  } = usePropsLogic({ selectedInstanceData, publish });

  const addButton = (
    <Button
      ghost
      onClick={(event) => {
        event.preventDefault();
        addEmptyProp();
      }}
    >
      <PlusIcon />
    </Button>
  );

  return (
    <Box>
      <Box css={{ p: "$spacing$9" }}>
        <ComponentInfo selectedInstanceData={selectedInstanceData} />
      </Box>
      <CollapsibleSection
        label="Properties"
        rightSlot={addButton}
        isOpenDefault
      >
        <Grid
          gap={1}
          css={{
            gridTemplateColumns: "1fr minmax(0, 1fr) auto",
            alignItems: "center",
          }}
        >
          {userProps.map((userProp) => (
            <Property
              key={userProp.id}
              userProp={userProp}
              component={selectedInstanceData.component}
              onChangePropName={(name, defaultValue) =>
                handleChangePropName(userProp.id, name, defaultValue)
              }
              onChangePropValue={(value, asset) =>
                handleChangePropValue(userProp.id, value, asset)
              }
              onDelete={handleDeleteProp}
            />
          ))}
        </Grid>
      </CollapsibleSection>
    </Box>
  );
};
