import { Global } from "./../__mocks__/global.mock";
import { addMenu, updateIssuedColumnForSheet } from "./sheet-ui";
declare const global: Global;

describe("addMenu", () => {
  it("should add menu", () => {
    // Arrange
    const sheet = { addMenu: jest.fn() };
    global.SpreadsheetApp = {
      getActiveSpreadsheet: jest.fn().mockReturnValue(sheet)
    } as any;

    // Act
    addMenu();

    // Assert
    expect(sheet.addMenu).toBeCalled();
    expect(sheet.addMenu).toBeCalledWith(expect.any(String), expect.any(Array));
  });
});

describe("updateIssuedColumnForSheet", () => {
  const values = [[undefined], [null], [""], ["N"], ["Y"], ["N"]];
  const range = {
    getValues: jest.fn().mockReturnValue(values),
    setValues: jest.fn()
  };
  const sheet = {
    getLastRow: jest.fn(),
    getRange: jest.fn().mockReturnValue(range)
  } as any;
  const payloads = [{ rowIndex: 1 }, { rowIndex: 2 }, { rowIndex: 3 }] as any;
  const updateBuilder = updateIssuedColumnForSheet(sheet)(payloads);

  // Act
  updateBuilder({
    columnIndex: 1
  } as any);

  const call = range.setValues.mock.calls[0][0];

  it("should not mutate values", () => {
    expect(values[1][0]).toEqual(null);
  });

  it("should update matching row index values", () => {
    expect(call[1]).toEqual(["Y"]);
    expect(call[2]).toEqual(["Y"]);
    expect(call[3]).toEqual(["Y"]);
  });

  it("should not update non matching row index values", () => {
    expect(call[0]).toEqual([undefined]);
    expect(call[5]).toEqual(["N"]);
  });
});
