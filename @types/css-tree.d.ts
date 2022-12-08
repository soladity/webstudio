declare module "css-tree" {
  export function parse(
    text: string,
    options?: import("@types/css-tree").ParseOptions
  ): import("@types/css-tree").CssNode;

  type Match =
    | {
        syntax: { type: "Property"; name: string };
        match: Match[];
      }
    | {
        syntax: { type: "Type"; name: string };
        match: Match[];
      }
    | {
        syntax: { type: "Keyword"; name: string };
        token: string;
      }
    | { syntax: null };

  type MatchProperty =
    | {
        matched: null;
        error: { message: string };
      }
    // eslint-disable-next-line @typescript-eslint/ban-types
    | {
        matched: Match;
        error: null;
      };

  export declare const lexer: {
    matchProperty: (
      property: string,
      ast: import("@types/css-tree").CssNode
    ) => MatchProperty;
  };
}
