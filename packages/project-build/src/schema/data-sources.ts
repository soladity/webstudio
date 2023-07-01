import { z } from "zod";

const DataSourceId = z.string();

export const DataSourceVariableValue = z.union([
  z.object({
    type: z.literal("number"),
    // initial value of variable store
    value: z.number(),
  }),
  z.object({
    type: z.literal("string"),
    value: z.string(),
  }),
  z.object({
    type: z.literal("boolean"),
    value: z.boolean(),
  }),
  z.object({
    type: z.literal("string[]"),
    value: z.array(z.string()),
  }),
]);

export const DataSource = z.union([
  z.object({
    type: z.literal("variable"),
    id: DataSourceId,
    scopeInstanceId: z.optional(z.string()),
    name: z.string(),
    value: DataSourceVariableValue,
  }),
  z.object({
    type: z.literal("expression"),
    id: DataSourceId,
    scopeInstanceId: z.optional(z.string()),
    name: z.string(),
    code: z.string(),
  }),
]);

export type DataSource = z.infer<typeof DataSource>;

export const DataSourcesList = z.array(DataSource);

export type DataSourcesList = z.infer<typeof DataSourcesList>;

export const DataSources = z.map(DataSourceId, DataSource);

export type DataSources = z.infer<typeof DataSources>;

export const parseDataSources = (dataSourcesString: string): DataSources => {
  const dataSourcesList = JSON.parse(dataSourcesString) as DataSourcesList;
  return new Map(
    dataSourcesList.map((dataSource) => [dataSource.id, dataSource])
  );
};

export const serializeDataSources = (dataSources: DataSources) => {
  const dataSourcesList: DataSourcesList = Array.from(dataSources.values());
  return JSON.stringify(dataSourcesList);
};
