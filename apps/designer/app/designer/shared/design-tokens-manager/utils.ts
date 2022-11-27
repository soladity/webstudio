import type { Style } from "@webstudio-is/css-data";
import type { DesignToken } from "@webstudio-is/project";

export const filterByType = (tokens: Array<DesignToken>, type: string) =>
  tokens.filter((token) => token.type === type);

export const findByName = (tokens: Array<DesignToken>, name?: string) =>
  tokens.find((token) => token.name === name);

export const tokensToStyle = (tokens: Array<DesignToken>) => {
  const style: Style = {};
  for (const token of tokens) {
    style[`--token-${token.name}`] = {
      type: "keyword",
      value: token.value,
    };
  }
  return style;
};

export const updateOrAddTokenMutable = (
  tokens: Array<DesignToken>,
  token: DesignToken
) => {
  const found = findByName(tokens, token.name);
  if (found) {
    Object.assign(found, token);
    return;
  }
  tokens.push(token);
};

export const deleteTokenMutable = (
  tokens: Array<DesignToken>,
  name: DesignToken["name"]
) => {
  const index = tokens.findIndex((token) => token.name === name);
  tokens.splice(index, 1);
};
