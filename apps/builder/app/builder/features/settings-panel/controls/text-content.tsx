import { useId, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { computed } from "nanostores";
import { TextArea } from "@webstudio-is/design-system";
import type { DataSources, Instance } from "@webstudio-is/sdk";
import { $dataSources, $instances } from "~/shared/nano-states";
import { serverSyncStore } from "~/shared/sync";
import {
  BindingControl,
  BindingPopover,
} from "~/builder/shared/binding-popover";
import {
  type ControlProps,
  getLabel,
  useLocalValue,
  VerticalLayout,
  $selectedInstanceScope,
  Label,
  updateExpressionValue,
} from "../shared";
import { decodeDataSourceVariable } from "@webstudio-is/react-sdk";

const useInstance = (instanceId: Instance["id"]) => {
  const $store = useMemo(() => {
    return computed($instances, (instances) => instances.get(instanceId));
  }, [instanceId]);
  return useStore($store);
};

const updateChildren = (
  instanceId: Instance["id"],
  type: "text" | "expression",
  value: string
) => {
  serverSyncStore.createTransaction([$instances], (instances) => {
    const instance = instances.get(instanceId);
    if (instance === undefined) {
      return;
    }
    instance.children = [{ type, value }];
  });
};

const isVariableIdentifier = (expression: string, dataSources: DataSources) => {
  const potentialVariableId = decodeDataSourceVariable(expression);
  return (
    potentialVariableId !== undefined &&
    dataSources.get(potentialVariableId)?.type === "variable"
  );
};

export const TextContent = ({
  instanceId,
  meta,
  propName,
  computedValue,
}: ControlProps<"textContent">) => {
  const instance = useInstance(instanceId);
  // text content control is rendered only when empty or single child are present
  const child = instance?.children?.[0] ?? { type: "text", value: "" };
  const localValue = useLocalValue(String(computedValue ?? ""), (value) => {
    if (child.type === "expression") {
      updateExpressionValue(child.value, value);
    } else {
      updateChildren(instanceId, "text", value);
    }
  });
  const id = useId();
  const label = getLabel(meta, propName);

  const { scope, aliases } = useStore($selectedInstanceScope);
  let expression: undefined | string;
  if (child.type === "text") {
    expression = JSON.stringify(child.value);
  }
  if (child.type === "expression") {
    expression = child.value;
  }

  const dataSources = useStore($dataSources);
  // allow editiing single variable expression
  const readOnly =
    child.type === "expression" &&
    isVariableIdentifier(child.value, dataSources) === false;

  return (
    <VerticalLayout
      label={
        <Label htmlFor={id} description={meta.description} readOnly={readOnly}>
          {label}
        </Label>
      }
      deletable={false}
      onDelete={() => {}}
    >
      <BindingControl>
        <TextArea
          id={id}
          disabled={readOnly}
          autoGrow
          value={localValue.value}
          rows={1}
          onChange={localValue.set}
          onBlur={localValue.save}
          onSubmit={localValue.save}
        />
        {expression !== undefined && (
          <BindingPopover
            scope={scope}
            aliases={aliases}
            validate={(value) => {
              if (value !== undefined && typeof value !== "string") {
                return `${label} expects a string value`;
              }
            }}
            removable={child.type === "expression"}
            value={expression}
            onChange={(newExpression) => {
              updateChildren(instanceId, "expression", newExpression);
            }}
            onRemove={(evaluatedValue) =>
              updateChildren(instanceId, "text", String(evaluatedValue))
            }
          />
        )}
      </BindingControl>
    </VerticalLayout>
  );
};
