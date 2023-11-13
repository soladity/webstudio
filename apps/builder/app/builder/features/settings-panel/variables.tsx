import { useEffect, useId, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { computed } from "nanostores";
import { useStore } from "@nanostores/react";
import { isFeatureEnabled } from "@webstudio-is/feature-flags";
import {
  Button,
  CssValueListArrowFocus,
  CssValueListItem,
  Flex,
  FloatingPanelPopover,
  FloatingPanelPopoverClose,
  FloatingPanelPopoverContent,
  FloatingPanelPopoverTitle,
  FloatingPanelPopoverTrigger,
  InputErrorsTooltip,
  InputField,
  Label,
  ScrollArea,
  Separator,
  SmallIconButton,
  Text,
  Tooltip,
  theme,
} from "@webstudio-is/design-system";
import {
  DotIcon,
  MenuIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@webstudio-is/icons";
import type { DataSource, Prop } from "@webstudio-is/sdk";
import {
  PropMeta,
  decodeDataSourceVariable,
  encodeDataSourceVariable,
  validateExpression,
} from "@webstudio-is/react-sdk";
import {
  dataSourcesStore,
  propsStore,
  selectedInstanceSelectorStore,
} from "~/shared/nano-states";
import { serverSyncStore } from "~/shared/sync";
import { CodeEditor } from "./code-editor";
import type { PropValue } from "./shared";
import { getStartingValue } from "./props-section/use-props-logic";

type VariableDataSource = Extract<DataSource, { type: "variable" }>;

/**
 * convert value expression to js value
 * validating out accessing any identifier
 */
const parseVariableValue = (code: string) => {
  const result: { value?: unknown; error?: string } = {};
  const ids = new Set<string>();
  try {
    code = validateExpression(code, {
      optional: true,
      transformIdentifier: (id) => {
        ids.add(id);
        return id;
      },
    });
  } catch (error) {
    result.error = (error as Error).message;
    return result;
  }
  if (ids.size === 0) {
    try {
      // wrap with parentheses to treat {} as object instead of block
      result.value = eval(`(${code})`);
    } catch (error) {
      result.error = `Parse Error: ${(error as Error).message}`;
    }
  } else {
    const idsList = Array.from(ids).join(", ");
    result.error = `Cannot use variables ${idsList} as variable value`;
  }
  return result;
};

const saveVariable = (
  dataSourceId: string = nanoid(),
  name: string,
  valueString: string
): undefined | { error?: string } => {
  const { value, error } = parseVariableValue(valueString);
  if (error !== undefined) {
    return { error };
  }

  const instanceSelector = selectedInstanceSelectorStore.get();
  if (instanceSelector === undefined) {
    return;
  }
  const [instanceId] = instanceSelector;
  serverSyncStore.createTransaction([dataSourcesStore], (dataSources) => {
    let variableValue: VariableDataSource["value"] = { type: "json", value };
    if (typeof value === "string") {
      variableValue = { type: "string", value };
    }
    if (typeof value === "number") {
      variableValue = { type: "number", value };
    }
    if (typeof value === "boolean") {
      variableValue = { type: "boolean", value };
    }
    dataSources.set(dataSourceId, {
      id: dataSourceId,
      // preserve existing instance scope when edit
      scopeInstanceId:
        dataSources.get(dataSourceId)?.scopeInstanceId ?? instanceId,
      name,
      type: "variable",
      value: variableValue,
    });
  });
};

const VariablePanel = ({
  variable,
  onBack,
}: {
  variable?: VariableDataSource;
  onBack: () => void;
}) => {
  // variable value cannot have an access to other variables
  const variables = useMemo(() => new Map(), []);
  const nameId = useId();
  const [name, setName] = useState(variable?.name ?? "");
  const [nameErrors, setNameErrors] = useState<undefined | string[]>();
  const [value, setValue] = useState(
    JSON.stringify(variable?.value.value ?? "")
  );
  const [valueErrors, setValueErrors] = useState<undefined | string[]>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // prevent closing popover
        event.preventDefault();
        onBack();
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [onBack]);

  return (
    <ScrollArea
      css={{
        display: "flex",
        flexDirection: "column",
        width: theme.spacing[30],
      }}
    >
      <Flex
        direction="column"
        css={{
          overflow: "hidden",
          p: theme.spacing[9],
          gap: theme.spacing[5],
        }}
      >
        <Flex direction="column" css={{ gap: theme.spacing[3] }}>
          <Label htmlFor={nameId}>Name</Label>
          <InputErrorsTooltip errors={nameErrors}>
            <InputField
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </InputErrorsTooltip>
        </Flex>
        <Flex direction="column" css={{ gap: theme.spacing[3] }}>
          <Label>Value</Label>
          <InputErrorsTooltip errors={valueErrors}>
            <div>
              <CodeEditor
                variables={variables}
                defaultValue={value}
                onChange={setValue}
              />
            </div>
          </InputErrorsTooltip>
        </Flex>
        <Flex justify="end" css={{ gap: theme.spacing[5] }}>
          <Button color="neutral" onClick={onBack}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (name.length === 0) {
                setNameErrors([`Variable name is required`]);
                return;
              }
              const result = saveVariable(variable?.id, name, value);
              if (result?.error !== undefined) {
                setValueErrors([result.error]);
                return;
              }
              onBack();
            }}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </ScrollArea>
  );
};

const $selectedInstanceVariables = computed(
  [selectedInstanceSelectorStore, dataSourcesStore],
  (instanceSelector, dataSources) => {
    const matchedVariables: VariableDataSource[] = [];
    if (instanceSelector === undefined) {
      return matchedVariables;
    }
    for (const dataSource of dataSources.values()) {
      if (
        dataSource.type === "variable" &&
        dataSource.scopeInstanceId !== undefined &&
        instanceSelector.includes(dataSource.scopeInstanceId)
      ) {
        matchedVariables.push(dataSource);
      }
    }
    return matchedVariables;
  }
);

const EmptyList = ({ onAdd }: { onAdd: () => void }) => {
  return (
    <Flex direction="column" css={{ gap: theme.spacing[5] }}>
      <Flex justify="center" align="center" css={{ height: theme.spacing[13] }}>
        <Text variant="labelsSentenceCase">No variables yet</Text>
      </Flex>
      <Flex justify="center" align="center" css={{ height: theme.spacing[13] }}>
        <Button prefix={<PlusIcon />} onClick={onAdd}>
          Create variable
        </Button>
      </Flex>
    </Flex>
  );
};

const $usedVariables = computed([propsStore], (props) => {
  const usedVariables = new Set<DataSource["id"]>();
  for (const prop of props.values()) {
    if (prop.type === "expression") {
      try {
        validateExpression(prop.value, {
          transformIdentifier: (identifier) => {
            const id = decodeDataSourceVariable(identifier);
            if (id !== undefined) {
              usedVariables.add(id);
            }
            return identifier;
          },
        });
      } catch {
        // empty block
      }
    }
    if (prop.type === "action") {
      for (const value of prop.value) {
        try {
          validateExpression(value.code, {
            effectful: true,
            transformIdentifier: (identifier) => {
              const id = decodeDataSourceVariable(identifier);
              if (id !== undefined) {
                usedVariables.add(id);
              }
              return identifier;
            },
          });
        } catch {
          // empty block
        }
      }
    }
  }
  return usedVariables;
});

const deleteVariable = (variable: VariableDataSource) => {
  serverSyncStore.createTransaction([dataSourcesStore], (dataSources) => {
    dataSources.delete(variable.id);
  });
};

const ListItem = ({
  index,
  selected,
  deletable,
  variable,
  onSelect,
  onEdit,
}: {
  index: number;
  selected: boolean;
  deletable: boolean;
  variable: VariableDataSource;
  onSelect: (variableId: DataSource["id"]) => void;
  onEdit: (variable: VariableDataSource) => void;
}) => {
  return (
    <CssValueListItem
      label={
        <Label truncate>
          {variable.name}: {JSON.stringify(variable.value.value)}
        </Label>
      }
      id={variable.id}
      index={index}
      active={selected}
      buttons={
        <>
          <Tooltip content="Edit variable" side="bottom">
            <SmallIconButton
              tabIndex={-1}
              aria-label="Edit variable"
              icon={<MenuIcon />}
              onClick={() => onEdit(variable)}
            />
          </Tooltip>
          <Tooltip content="Delete variable" side="bottom">
            <SmallIconButton
              tabIndex={-1}
              disabled={deletable === false}
              aria-label="Delete variable"
              variant="destructive"
              icon={<MinusIcon />}
              onClick={() => deleteVariable(variable)}
            />
          </Tooltip>
        </>
      }
      onClick={() => onSelect(variable.id)}
    />
  );
};

const getExpressionVariables = (expression: string) => {
  const variableIds = new Set<VariableDataSource["id"]>();
  if (expression === "") {
    return variableIds;
  }
  validateExpression(expression, {
    transformIdentifier: (identifier) => {
      const id = decodeDataSourceVariable(identifier);
      if (id !== undefined) {
        variableIds.add(id);
      }
      return identifier;
    },
  });
  return variableIds;
};

const setPropValue = ({
  propId,
  propName,
  propValue,
}: {
  propId: undefined | Prop["id"];
  propName: Prop["name"];
  propValue: PropValue;
}) => {
  const instanceSelector = selectedInstanceSelectorStore.get();
  if (instanceSelector === undefined) {
    return;
  }
  const [instanceId] = instanceSelector;

  serverSyncStore.createTransaction([propsStore], (props) => {
    let prop = propId === undefined ? undefined : props.get(propId);
    // create new prop or update existing one
    if (prop === undefined) {
      prop = { id: nanoid(), instanceId, name: propName, ...propValue };
    } else {
      prop = { ...prop, ...propValue };
    }
    props.set(prop.id, prop);
  });
};

const ListPanel = ({
  prop,
  onAdd,
  onEdit,
  onChange,
}: {
  prop: undefined | Prop;
  onAdd: () => void;
  onEdit: (variable: VariableDataSource) => void;
  onChange: (value: undefined | PropValue) => void;
}) => {
  const matchedVariables = useStore($selectedInstanceVariables);
  const editorVariables = useMemo(() => {
    const variables = new Map<string, string>();
    for (const variable of matchedVariables) {
      variables.set(encodeDataSourceVariable(variable.id), variable.name);
    }
    return variables;
  }, [matchedVariables]);
  const propExpression = prop?.type === "expression" ? prop?.value ?? "" : "";
  const exoressionVariables = useMemo(
    () => getExpressionVariables(propExpression),
    [propExpression]
  );
  const usedVariables = useStore($usedVariables);
  const [expression, setExpression] = useState<undefined | string>();

  return (
    <ScrollArea
      css={{
        display: "flex",
        flexDirection: "column",
        width: theme.spacing[30],
        padding: `${theme.spacing[5]} 0 ${theme.spacing[9]}`,
      }}
    >
      {matchedVariables.length === 0 ? (
        <EmptyList onAdd={onAdd} />
      ) : (
        <>
          <CssValueListArrowFocus>
            {matchedVariables.map((variable, index) => (
              <ListItem
                key={variable.id}
                index={index}
                variable={variable}
                // mark all variables used in expression as selected
                selected={exoressionVariables.has(variable.id)}
                deletable={usedVariables.has(variable.id) === false}
                onSelect={() =>
                  // convert variable to expression
                  onChange({
                    type: "expression",
                    value: encodeDataSourceVariable(variable.id),
                  })
                }
                onEdit={onEdit}
              />
            ))}
          </CssValueListArrowFocus>
          <Separator />
          <Flex
            direction="column"
            css={{
              padding: `${theme.spacing[5]} ${theme.spacing[9]} ${theme.spacing[9]}`,
              gap: theme.spacing[3],
            }}
          >
            <Label>Expression</Label>
            <CodeEditor
              // reset uncontrolled editor when saved expression is changed
              key={propExpression}
              variables={editorVariables}
              defaultValue={expression ?? propExpression}
              onChange={setExpression}
              onBlur={() => {
                // skip when expression is not changed
                if (expression === undefined) {
                  return;
                }

                if (expression.trim() === "") {
                  onChange(undefined);
                  setExpression(undefined);
                  return;
                }

                try {
                  validateExpression(expression);
                } catch (error) {
                  // @todo show errors
                  (error as Error).message;
                  return;
                }

                onChange({ type: "expression", value: expression });
                setExpression(undefined);
              }}
            />
          </Flex>
        </>
      )}
    </ScrollArea>
  );
};

export const VariablesPanel = ({
  propId,
  propName,
  propMeta,
}: {
  propId: undefined | Prop["id"];
  propName: Prop["id"];
  propMeta: PropMeta;
}) => {
  // compute prop instead of using passed one
  // because data source props are converted into values
  const prop = useStore(
    useMemo(
      () =>
        computed(propsStore, (props) => {
          if (propId) {
            return props.get(propId);
          }
        }),
      [propId]
    )
  );

  const [view, setView] = useState<
    | { name: "list" }
    | { name: "add" }
    | { name: "edit"; variable: VariableDataSource }
  >({ name: "list" });
  if (view.name === "add") {
    return (
      <>
        <VariablePanel onBack={() => setView({ name: "list" })} />
        {/* put after content to avoid auto focusing "Close" button */}
        <FloatingPanelPopoverTitle>New Variable</FloatingPanelPopoverTitle>
      </>
    );
  }

  if (view.name === "edit") {
    return (
      <>
        <VariablePanel
          variable={view.variable}
          onBack={() => setView({ name: "list" })}
        />
        {/* put after content to avoid auto focusing "Close" button */}
        <FloatingPanelPopoverTitle>Edit Variable</FloatingPanelPopoverTitle>
      </>
    );
  }

  const removeExpression = () => {
    // reset prop with initial value from meta
    const propValue = getStartingValue(propMeta);
    if (propValue) {
      setPropValue({
        propId,
        propName,
        propValue,
      });
    } else if (propId !== undefined) {
      // delete prop when not possible to infer default value from meta
      serverSyncStore.createTransaction([propsStore], (props) => {
        props.delete(propId);
      });
    }
  };

  return (
    <>
      <ListPanel
        prop={prop}
        onAdd={() => setView({ name: "add" })}
        onEdit={(variable) => setView({ name: "edit", variable })}
        onChange={(propValue) => {
          if (propValue === undefined) {
            removeExpression();
          } else {
            setPropValue({ propId, propName, propValue });
          }
        }}
      />
      {/* put after content to avoid auto focusing "New variable" button */}
      <FloatingPanelPopoverTitle
        actions={
          <>
            {prop?.type === "expression" && (
              <Tooltip content="Remove expression" side="bottom">
                {/* automatically close popover when remove expression */}
                <FloatingPanelPopoverClose asChild>
                  <Button
                    aria-label="Remove expression"
                    prefix={<TrashIcon />}
                    color="ghost"
                    onClick={removeExpression}
                  />
                </FloatingPanelPopoverClose>
              </Tooltip>
            )}
            <Tooltip content="New variable" side="bottom">
              <Button
                aria-label="New variable"
                prefix={<PlusIcon />}
                color="ghost"
                onClick={() => setView({ name: "add" })}
              />
            </Tooltip>
          </>
        }
      >
        Variables
      </FloatingPanelPopoverTitle>
    </>
  );
};

export const VariablesButton = ({
  propId,
  propName,
  propMeta,
}: {
  propId: undefined | Prop["id"];
  propName: Prop["name"];
  propMeta: PropMeta;
}) => {
  if (isFeatureEnabled("bindings") === false) {
    return;
  }
  return (
    <FloatingPanelPopover modal>
      <FloatingPanelPopoverTrigger asChild>
        <SmallIconButton
          css={{
            position: "absolute",
            top: -10,
            left: -10,
          }}
          icon={<DotIcon />}
        />
      </FloatingPanelPopoverTrigger>
      <FloatingPanelPopoverContent side="left" align="start">
        <VariablesPanel
          propId={propId}
          propName={propName}
          propMeta={propMeta}
        />
      </FloatingPanelPopoverContent>
    </FloatingPanelPopover>
  );
};
