import { and, convertStringToNumber, valueOrDefault } from "./helpers";

describe("and", () => {
  const predicateTests: ReadonlyArray<any> = [
    {
      description:
        "should return true when property is undefined and predicate is property underfined.",
      predicates: [(x: any) => x.issued === undefined],
      obj: {},
      result: true
    },
    {
      description:
        "should return false when property is undefined and predicate is property null.",
      predicates: [(x: any) => x.issued === null],
      obj: {},
      result: false
    },
    {
      description: "should return true when property is matching predicate.",
      predicates: [
        (x: { readonly issued: string }) => x.issued.toUpperCase() === "Y"
      ],
      obj: { issued: "y" },
      result: true
    },
    {
      description:
        "should return true when property is matching predicate exact.",
      predicates: [(x: { readonly issued: string }) => x.issued === "Y"],
      obj: { issued: "Y" },
      result: true
    },
    {
      description:
        "should return false when property is matching predicate but not exact.",
      predicates: [(x: { readonly issued: string }) => x.issued === "Y"],
      obj: { issued: "y" },
      result: false
    },
    {
      description:
        "should return true when property is matching multiple predicates.",
      predicates: [
        (x: { readonly issued: string }) => x.issued === "Y",
        (x: { readonly verified: string }) => x.verified === "Y"
      ],
      obj: { issued: "Y", verified: "Y" },
      result: true
    }
  ];

  for (const testCase of predicateTests) {
    const { description, predicates, obj, result } = testCase;
    it(description, () => {
      expect(and(predicates)(obj)).toBe(result);
    });
  }
});

describe("valueOrDefault", () => {
  const run = (
    input: any,
    init: any,
    assert: <T extends {}>(value: T) => any
  ) => {
    const value = valueOrDefault(input, init);
    return assert(value);
  };

  const valueCases = [
    { input: {}, init: { default: 1 } },
    { input: [], init: ["default"] },
    { input: true, init: false },
    { input: "input", init: "default" },
    { input: 5, init: 1 }
  ] as any;

  for (const { input, init } of valueCases) {
    it(`should return value: ${JSON.stringify(
      input
    )} for input: ${JSON.stringify(input)}`, () =>
      run(input, init, value => {
        expect(init).not.toBe(value);
        expect(input).toBe(value);
      }));
  }

  const defaultCases = [
    { input: undefined, init: { default: 1 } },
    { input: null, init: ["default"] },
    { input: false, init: true },
    { input: "", init: "default" },
    { input: 0, init: 5 }
  ] as any;

  for (const { input, init } of defaultCases) {
    it(`should return default value: ${JSON.stringify(
      init
    )} for input: ${JSON.stringify(input)}`, () =>
      run(input, init, value => {
        expect(input).not.toBe(value);
        expect(init).toBe(value);
      }));
  }
});

describe("convertStringToNumber", () => {
  // Arrange
  const testCases: ReadonlyArray<any> = [
    { input: "a", output: 1 },
    { input: "b", output: 2 },
    { input: "z", output: 26 },
    { input: "aa", output: 27 },
    { input: "az", output: 52 },
    { input: "Az", output: 52 },
    { input: "AZ", output: 52 }
  ];

  // Act => Assert
  for (const { input, output } of testCases) {
    it(`should return ${output} for ${input}`, () => {
      expect(convertStringToNumber(input)).toBe(output);
    });
  }
});
