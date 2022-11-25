import {
  Button,
  Flex,
  InputErrorsTooltip,
  Label,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverPortal,
  PopoverTrigger,
  TextArea,
  TextField,
} from "@webstudio-is/design-system";
import { PlusIcon } from "@webstudio-is/icons";
import { type FormEvent, useState, useEffect } from "react";
import { createValueContainer, useValue } from "react-nano-state";
import type { Publish } from "~/shared/pubsub";
import { CollapsibleSection } from "../inspector";
import { groups } from "./groups";
import type { DesignToken } from "./schema";
import { filterByType, findByName } from "./utilts";

const tokensContainer = createValueContainer<Array<DesignToken>>([]);

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
  const [tokens] = useValue(tokensContainer);
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] =
    useState<ReturnType<typeof validate>>(initialErrors);
  const isNew = name === undefined;

  useEffect(() => {
    if (isOpen === false && errors.hasErrors) {
      setErrors(initialErrors);
    }
  }, [isOpen]);

  const handleChangeOrSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);
    const errors = validate(tokens, data);

    if (errors.hasErrors && event.type === "submit") {
      setErrors(errors);
    }

    if (errors.hasErrors === false && event.type === "submit") {
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
          <form onChange={handleChangeOrSubmit} onSubmit={handleChangeOrSubmit}>
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

const TokenItem = ({ token }: { token: DesignToken }) => {
  return <div>{token.value}</div>;
};

export const DesignTokensManager = ({ publish }: { publish: Publish }) => {
  const [tokens, setTokens] = useValue(tokensContainer);

  return (
    <>
      {groups.map(({ group, type }) => {
        return (
          <CollapsibleSection
            label={group}
            key={group}
            rightSlot={
              <TokenEditor
                group={group}
                type={type}
                onChangeComplete={(token) => {
                  setTokens([...tokens, token]);
                }}
              />
            }
          >
            <>
              {filterByType(tokens, type).map((token) => {
                return <TokenItem token={token} key={token.name} />;
              })}
            </>
          </CollapsibleSection>
        );
      })}
    </>
  );
};
