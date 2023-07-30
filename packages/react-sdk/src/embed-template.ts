import { z } from "zod";
import { nanoid } from "nanoid";
import {
  Instance,
  type InstancesList,
  PropsList,
  StyleSourceSelectionsList,
  StyleSourcesList,
  StylesList,
  Breakpoint,
  DataSource,
} from "@webstudio-is/project-build";
import { StyleValue, type StyleProperty } from "@webstudio-is/css-data";
import type { Simplify } from "type-fest";
import { encodeDataSourceVariable, validateExpression } from "./expression";

const EmbedTemplateText = z.object({
  type: z.literal("text"),
  value: z.string(),
});

type EmbedTemplateText = z.infer<typeof EmbedTemplateText>;

const DataSourceVariableRef = z.object({
  type: z.literal("variable"),
  name: z.string(),
});

const DataSourceRef = z.union([
  DataSourceVariableRef,
  z.object({
    type: z.literal("expression"),
    name: z.string(),
    code: z.string(),
  }),
]);

const EmbedTemplateProp = z.union([
  z.object({
    type: z.literal("number"),
    name: z.string(),
    dataSourceRef: z.optional(DataSourceRef),
    value: z.number(),
  }),
  z.object({
    type: z.literal("string"),
    name: z.string(),
    dataSourceRef: z.optional(DataSourceRef),
    value: z.string(),
  }),
  z.object({
    type: z.literal("boolean"),
    name: z.string(),
    dataSourceRef: z.optional(DataSourceRef),
    value: z.boolean(),
  }),
  z.object({
    type: z.literal("string[]"),
    name: z.string(),
    dataSourceRef: z.optional(DataSourceRef),
    value: z.array(z.string()),
  }),
  z.object({
    type: z.literal("action"),
    name: z.string(),
    value: z.array(
      z.object({
        type: z.literal("execute"),
        args: z.optional(z.array(z.string())),
        code: z.string(),
      })
    ),
  }),
]);

type EmbedTemplateProp = z.infer<typeof EmbedTemplateProp>;

const EmbedTemplateStyleDeclRaw = z.object({
  // State selector, e.g. :hover
  state: z.optional(z.string()),
  property: z.string(),
  value: StyleValue,
});

export type EmbedTemplateStyleDecl = Simplify<
  Omit<z.infer<typeof EmbedTemplateStyleDeclRaw>, "property"> & {
    property: StyleProperty;
  }
>;

export const EmbedTemplateStyleDecl =
  EmbedTemplateStyleDeclRaw as z.ZodType<EmbedTemplateStyleDecl>;

export type EmbedTemplateInstance = {
  type: "instance";
  component: string;
  label?: string;
  props?: EmbedTemplateProp[];
  styles?: EmbedTemplateStyleDecl[];
  children: Array<EmbedTemplateInstance | EmbedTemplateText>;
};

export const EmbedTemplateInstance: z.ZodType<EmbedTemplateInstance> = z.lazy(
  () =>
    z.object({
      type: z.literal("instance"),
      component: z.string(),
      label: z.optional(z.string()),
      props: z.optional(z.array(EmbedTemplateProp)),
      styles: z.optional(z.array(EmbedTemplateStyleDecl)),
      children: WsEmbedTemplate,
    })
);

export const WsEmbedTemplate = z.lazy(() =>
  z.array(z.union([EmbedTemplateInstance, EmbedTemplateText]))
);

export type WsEmbedTemplate = z.infer<typeof WsEmbedTemplate>;

const createInstancesFromTemplate = (
  treeTemplate: WsEmbedTemplate,
  instances: InstancesList,
  props: PropsList,
  dataSourceByRef: Map<string, DataSource>,
  styleSourceSelections: StyleSourceSelectionsList,
  styleSources: StyleSourcesList,
  styles: StylesList,
  defaultBreakpointId: Breakpoint["id"]
) => {
  const parentChildren: Instance["children"] = [];
  for (const item of treeTemplate) {
    if (item.type === "instance") {
      const instanceId = nanoid();

      // populate props
      if (item.props) {
        for (const prop of item.props) {
          const propId = nanoid();
          // action cannot be bound to data source
          if (prop.type === "action") {
            props.push({
              id: propId,
              instanceId,
              type: "action",
              name: prop.name,
              value: prop.value.map((value) => {
                const args = value.args ?? [];
                return {
                  type: "execute",
                  args,
                  // replace all references with variable names
                  code: validateExpression(value.code, {
                    effectful: true,
                    transformIdentifier: (ref) => {
                      // bypass arguments without changes
                      if (args.includes(ref)) {
                        return ref;
                      }
                      const id = dataSourceByRef.get(ref)?.id ?? ref;
                      return encodeDataSourceVariable(id);
                    },
                  }),
                };
              }),
            });
            continue;
          }
          if (prop.dataSourceRef === undefined) {
            props.push({ id: propId, instanceId, ...prop });
            continue;
          }
          let dataSource = dataSourceByRef.get(prop.dataSourceRef.name);
          if (dataSource === undefined) {
            const id = nanoid();
            const { name: propName, dataSourceRef, ...rest } = prop;
            if (dataSourceRef.type === "variable") {
              dataSource = {
                type: "variable",
                id,
                // the first instance where data source is appeared in becomes its scope
                scopeInstanceId: instanceId,
                name: dataSourceRef.name,
                value: rest,
              };
              dataSourceByRef.set(dataSourceRef.name, dataSource);
            } else if (dataSourceRef.type === "expression") {
              dataSource = {
                type: "expression",
                id,
                scopeInstanceId: instanceId,
                name: dataSourceRef.name,
                // replace all references with variable names
                code: validateExpression(dataSourceRef.code, {
                  transformIdentifier: (ref) => {
                    const id = dataSourceByRef.get(ref)?.id ?? ref;
                    return encodeDataSourceVariable(id);
                  },
                }),
              };
              dataSourceByRef.set(dataSourceRef.name, dataSource);
            } else {
              dataSourceRef satisfies never;
              continue;
            }
          }
          props.push({
            id: propId,
            instanceId,
            type: "dataSource",
            name: prop.name,
            value: dataSource.id,
          });
        }
      }

      // populate styles
      if (item.styles) {
        const styleSourceId = nanoid();
        styleSources.push({
          type: "local",
          id: styleSourceId,
        });
        styleSourceSelections.push({
          instanceId,
          values: [styleSourceId],
        });
        for (const styleDecl of item.styles) {
          styles.push({
            breakpointId: defaultBreakpointId,
            styleSourceId,
            state: styleDecl.state,
            property: styleDecl.property,
            value: styleDecl.value,
          });
        }
      }

      // populate instances
      const instance: Instance = {
        type: "instance",
        id: instanceId,
        label: item.label,
        component: item.component,
        children: [],
      };
      instances.push(instance);
      // traverse children after to preserve top down order
      instance.children = createInstancesFromTemplate(
        item.children,
        instances,
        props,
        dataSourceByRef,
        styleSourceSelections,
        styleSources,
        styles,
        defaultBreakpointId
      );
      parentChildren.push({
        type: "id",
        value: instanceId,
      });
    }

    if (item.type === "text") {
      parentChildren.push({
        type: "text",
        value: item.value,
      });
    }
  }
  return parentChildren;
};

export const generateDataFromEmbedTemplate = (
  treeTemplate: WsEmbedTemplate,
  defaultBreakpointId: Breakpoint["id"]
) => {
  const instances: InstancesList = [];
  const props: PropsList = [];
  const dataSourceByRef = new Map<string, DataSource>();
  const styleSourceSelections: StyleSourceSelectionsList = [];
  const styleSources: StyleSourcesList = [];
  const styles: StylesList = [];

  const children = createInstancesFromTemplate(
    treeTemplate,
    instances,
    props,
    dataSourceByRef,
    styleSourceSelections,
    styleSources,
    styles,
    defaultBreakpointId
  );

  return {
    children,
    instances,
    props,
    dataSources: Array.from(dataSourceByRef.values()),
    styleSourceSelections,
    styleSources,
    styles,
  };
};

export type EmbedTemplateData = ReturnType<
  typeof generateDataFromEmbedTemplate
>;

export const namespaceEmbedTemplateComponents = (
  template: WsEmbedTemplate,
  namespace: string,
  components: Set<EmbedTemplateInstance["component"]>
): WsEmbedTemplate => {
  return template.map((item) => {
    if (item.type === "text") {
      return item;
    }
    if (item.type === "instance") {
      const prefix = components.has(item.component) ? `${namespace}:` : "";
      return {
        ...item,
        component: `${prefix}${item.component}`,
        children: namespaceEmbedTemplateComponents(
          item.children,
          namespace,
          components
        ),
      };
    }
    item satisfies never;
    throw Error("Impossible case");
  });
};
