import { getModelsUsingDynamicProperties } from "./model-builder";

describe("getModelsUsingRows", () => {
  const date = new Date();
  const dynamicProps = [
    { columnIndex: 1, key: "firstName" },
    { columnIndex: 2, key: "lastName" },
    { columnIndex: 3, key: "text1" },
    { columnIndex: 4, key: "date1" }
  ] as any;
  const modelBuilder = getModelsUsingDynamicProperties(dynamicProps);
  const cells: ReadonlyArray<any> = ["a", 1, true, date];

  it("should not mutate input", () => {
    const input: ReadonlyArray<any> = [];
    const result = modelBuilder(input, cells, 0);
    expect(input).not.toBe(result);
  });

  it("should add model to array", () => {
    const result = modelBuilder([], cells, 0);
    expect(result.length).toBe(1);
  });

  it("should add string value", () => {
    const result = modelBuilder([], cells, 0);
    expect(result[0].firstName).toBe("a");
  });

  it("should add number value", () => {
    const result = modelBuilder([], cells, 0);
    expect(result[0].lastName).toBe("1");
  });

  it("should add boolean value", () => {
    const result = modelBuilder([], cells, 0);
    expect(result[0].text1).toBe("true");
  });

  it("should add date value", () => {
    const result = modelBuilder([], cells, 0);
    expect(result[0].date1).toBe(date.toUTCString());
  });
});
