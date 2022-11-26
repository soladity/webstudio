import { type FormEvent, useState, useEffect } from "react";
import {
  Button,
  Flex,
  InputErrorsTooltip,
  Label,
  List,
  ListItem,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverPortal,
  PopoverTrigger,
  TextArea,
  TextField,
  useList,
} from "@webstudio-is/design-system";
import { CheckIcon, PlusIcon } from "@webstudio-is/icons";
import type { DesignToken } from "@webstudio-is/project";
import { designTokensGroups } from "@webstudio-is/project";
import { useDesignTokens } from "~/shared/nano-states";
import type { Publish } from "~/shared/pubsub";
import { CollapsibleSection } from "../inspector";
import { filterByType, findByName } from "./utils";
import { useMenu } from "./item-menu";

declare module "~/shared/pubsub" {
  export interface PubsubMap {
    updateToken: DesignToken;
  }
}

const validate = (
  tokens: Array<DesignToken>,
  data: Partial<DesignToken>
): { name: Array<string>; value: Array<string>; hasErrors: boolean } => {
  const name = [];
  const value = [];

  if (String(data.name).trim() === "") name.push("Name is required");
  if (findByName(tokens, data?.name)) name.push("Name is already taken");
  if (String(data.value).trim() === "") value.push("Value is required");

  return {
    name,
    value,
    hasErrors: name.length !== 0 || value.length !== 0,
  };
};

const initialErrors = {
  name: [],
  value: [],
  hasErrors: false,
};

const getData = (event: FormEvent<HTMLFormElement>) => {
  const formData = new FormData(event.currentTarget);
  return Object.fromEntries(formData);
};

const TokenEditor = ({
  group,
  name,
  type,
  onChangeComplete,
}: {
  group: string;
  type: string;
  name?: string;
  onChangeComplete: (token: DesignToken) => void;
}) => {
  const [tokens] = useDesignTokens();
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] =
    useState<ReturnType<typeof validate>>(initialErrors);
  const isNew = name === undefined;

  useEffect(() => {
    if (isOpen === false && errors.hasErrors) {
      setErrors(initialErrors);
    }
  }, [isOpen, errors.hasErrors]);

  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    if (errors.hasErrors === false) return;
    const data = getData(event);
    const nextErrors = validate(tokens, data);
    setErrors(nextErrors);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = getData(event);
    const nextErrors = validate(tokens, data);
    setErrors(nextErrors);

    if (nextErrors.hasErrors === false) {
      onChangeComplete({ ...data, group, type } as DesignToken);
      setIsOpen(false);
    }
  };

  return (
    <Popover modal open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        aria-label={isNew ? "Create Token" : "Edit Token"}
      >
        <Button
          ghost
          onClick={(event) => {
            event.preventDefault();
            setIsOpen(true);
          }}
        >
          <PlusIcon />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent align="end" css={{ zIndex: "$zIndices$1" }}>
          <form onChange={handleChange} onSubmit={handleSubmit}>
            <Flex direction="column" gap="2" css={{ padding: "$spacing$7" }}>
              <Label htmlFor="name">Name</Label>
              <InputErrorsTooltip
                errors={errors.name}
                css={{ zIndex: "$zIndices$2" }}
              >
                <TextField id="name" name="name" />
              </InputErrorsTooltip>
              <Label htmlFor="value">Value</Label>
              <InputErrorsTooltip
                errors={errors.value}
                css={{ zIndex: "$zIndices$2" }}
              >
                <TextField id="value" name="value" />
              </InputErrorsTooltip>
              <Label htmlFor="description">Description</Label>
              <TextArea id="description" name="description" />
              {isNew && (
                <Button type="submit" variant="blue">
                  Create
                </Button>
              )}
            </Flex>
          </form>
          <PopoverHeader title={isNew ? "New Token" : name} />
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};

export const DesignTokensManager = ({ publish }: { publish: Publish }) => {
  const [tokens, setTokens] = useDesignTokens();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { getItemProps, getListProps } = useList({
    items: tokens,
    selectedIndex,
    currentIndex,
    onSelect: setSelectedIndex,
    onChangeCurrent: setCurrentIndex,
  });

  const { render: renderMenu, isOpen: isMenuOpen } = useMenu({
    selectedIndex,
    onSelect: setSelectedIndex,
    onDelete: () => {},
    onEdit: () => {},
  });

  const listProps = getListProps();

  let index = -1;

  return (
    <List
      {...listProps}
      onBlur={(event) => {
        if (isMenuOpen === false) {
          listProps.onBlur(event);
        }
      }}
    >
      {designTokensGroups.map(({ group, type }) => {
        return (
          <CollapsibleSection
            label={group}
            key={group}
            rightSlot={
              <TokenEditor
                group={group}
                type={type}
                onChangeComplete={(token) => {
                  publish({ type: "updateToken", payload: token });
                  // @todo update token when its an existing one
                  setTokens([...tokens, token]);
                }}
              />
            }
          >
            <>
              {filterByType(tokens, type).map((token) => {
                const itemProps = getItemProps({ index: ++index });
                return (
                  <ListItem
                    {...itemProps}
                    key={token.name}
                    prefix={itemProps.current ? <CheckIcon /> : undefined}
                    suffix={renderMenu(index)}
                  >
                    {token.name}
                  </ListItem>
                );
              })}
            </>
          </CollapsibleSection>
        );
      })}
    </List>
  );
};
