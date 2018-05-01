import { getModelsUsingRows, getModelUsingCells } from "./model-builder";

describe("getModelsUsingRows", () => {
  const columns = [
    { columnIndex: 1, key: "email" },
    { columnIndex: 2, key: "text1" },
    { columnIndex: 3, key: "text2" }
  ] as any;
  const modelBuilder = getModelsUsingRows(columns);
  const cells: ReadonlyArray<any> = ["a", "b", "c", "d"];
  const input: ReadonlyArray<any> = [];
  const result = modelBuilder(input, cells, 0);

  it("should not mutate input", () => {
    expect(input).not.toBe(result);
  });

  it("should add model to array", () => {
    expect(result.length).toBe(1);
  });

  it("should build model using column and key", () => {
    expect(result[0].email).toBe("a");
    expect(result[0].text1).toBe("b");
    expect(result[0].text2).toBe("c");
  });
});

describe("getModelUsingCells", () => {
  const date = new Date();
  const data = [
    { columnIndex: 1, key: "text1" },
    { columnIndex: 2, key: "text1" },
    { columnIndex: 3, key: "text1" },
    { columnIndex: 4, key: "text1" }
  ] as any;
  const model = {} as any;
  const modelBuilder = getModelUsingCells(data);

  const modelWithString = modelBuilder(model, "a", 0);
  const modelWithNumber = modelBuilder(model, 1, 1);
  const modelWithBoolean = modelBuilder(model, true, 2);
  const modelWithDate = modelBuilder(model, date, 2);

  it("should not mutate provided model", () => {
    expect(model.text1).toBeUndefined();
  });

  it("should add string value", () => {
    expect(modelWithString.text1).toBe("a");
  });

  it("should add number value", () => {
    expect(modelWithNumber.text1).toBe("1");
  });

  it("should add boolean value", () => {
    expect(modelWithBoolean.text1).toBe("true");
  });

  it("should add date value", () => {
    expect(modelWithDate.text1).toBe(date.toUTCString());
  });
});
