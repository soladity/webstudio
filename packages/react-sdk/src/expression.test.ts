import { expect, test } from "@jest/globals";
import {
  decodeDataSourceVariable,
  encodeDataSourceVariable,
  executeExpression,
  validateExpression,
} from "./expression";

test("allow literals and array expressions", () => {
  expect(
    validateExpression(`["", '', 0, true, false, null, undefined]`)
  ).toEqual(`["", '', 0, true, false, null, undefined]`);
});

test("allow object literals", () => {
  const ids: string[] = [];
  expect(
    validateExpression(
      `{param1: "", "param2": 0, ["param3"]: false, [a]: b }`,
      {
        transformIdentifier: (id) => {
          ids.push(id);
          return id;
        },
      }
    )
  ).toEqual(`{param1: "", "param2": 0, ["param3"]: false, [a]: b}`);
  expect(ids).toEqual(["a", "b"]);
});

test("expand shorthand properties in objects", () => {
  expect(validateExpression(`{a}`)).toEqual(`{a: a}`);
});

test("supports array of objects", () => {
  expect(
    validateExpression(`[{name: 'John'}, {name: 'Dave'}, {name: 'Oliver'}]`)
  ).toEqual(`[{name: 'John'}, {name: 'Dave'}, {name: 'Oliver'}]`);
});

test("allow unary and binary expressions", () => {
  expect(validateExpression(`[-1, 1 + 1]`)).toEqual(`[-1, 1 + 1]`);
});

test("optionally allow assignment expressions", () => {
  expect(() => {
    validateExpression(`a = 2`);
  }).toThrowError(/Cannot use assignment in this expression/);
  expect(validateExpression(`a = 2`, { effectful: true })).toEqual(`a = 2`);
});

test("allow member expressions", () => {
  const ids: string[] = [];
  expect(
    validateExpression("a.b.c", {
      transformIdentifier: (id) => {
        ids.push(id);
        return id;
      },
    })
  ).toEqual("a.b.c");
  expect(ids).toEqual(["a"]);
});

test("allow indexed member expressions", () => {
  const ids: string[] = [];
  expect(
    validateExpression(`a["b"][1]`, {
      transformIdentifier: (id) => {
        ids.push(id);
        return id;
      },
    })
  ).toEqual(`a["b"][1]`);
  expect(ids).toEqual(["a"]);
});

test("allow indexed member expressions with identifiers", () => {
  const ids: string[] = [];
  expect(
    validateExpression(`a[b]`, {
      transformIdentifier: (id) => {
        ids.push(id);
        return id;
      },
    })
  ).toEqual(`a[b]`);
  expect(ids).toEqual(["a", "b"]);
});

test("optionally transpile all member expressions into optional chaining", () => {
  expect(validateExpression(`a.b["c"][1]`, { optional: true })).toEqual(
    `a?.b?.["c"]?.[1]`
  );
});

test("forbid this expressions", () => {
  expect(() => {
    validateExpression("var1 + this");
  }).toThrowError(/"this" is not supported/);
});

test("forbid call expressions", () => {
  expect(() => {
    validateExpression("var1 + fn1()");
  }).toThrowError(/Cannot call "fn1"/);
  expect(() => {
    validateExpression("var1 + this.fn1()");
  }).toThrowError(/Cannot call "this.fn1"/);
});

test("forbid ternary", () => {
  expect(() => {
    validateExpression("var1 ? var2 : var3");
  }).toThrowError(/Ternary operator is not supported/);
});

test("forbid increment and decrement", () => {
  expect(() => {
    validateExpression("++var1");
  }).toThrowError(/"\+\+" operator is not supported/);
  expect(() => {
    validateExpression("var1++");
  }).toThrowError(/"\+\+" operator is not supported/);
  expect(() => {
    validateExpression("--var1");
  }).toThrowError(/"--" operator is not supported/);
  expect(() => {
    validateExpression("var1--");
  }).toThrowError(/"--" operator is not supported/);
});

test("forbid multiple expressions", () => {
  expect(() => {
    validateExpression("a b");
  }).toThrowError(/Cannot use multiple expressions/);
  expect(() => {
    validateExpression("a, b");
  }).toThrowError(/Cannot use multiple expressions/);
  expect(() => {
    validateExpression("a; b");
  }).toThrowError(/Cannot use multiple expressions/);
});

test("transform identifiers", () => {
  expect(
    validateExpression(`a + b`, {
      transformIdentifier: (id) => `$ws$${id}`,
    })
  ).toEqual(`$ws$a + $ws$b`);
});

test("encode/decode variable names", () => {
  expect(encodeDataSourceVariable("my--id")).toEqual(
    "$ws$dataSource$my__DASH____DASH__id"
  );
  expect(decodeDataSourceVariable(encodeDataSourceVariable("my--id"))).toEqual(
    "my--id"
  );
  expect(decodeDataSourceVariable("myVarName")).toEqual(undefined);
});

test("execute expression", () => {
  expect(executeExpression(undefined)).toEqual(undefined);
  expect(executeExpression("1 + 1")).toEqual(2);
  expect(executeExpression("someVariable + 1")).toEqual(undefined);
});
