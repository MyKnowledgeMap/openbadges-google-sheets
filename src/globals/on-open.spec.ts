import { Global } from "../__mocks__/global.mock";
import { onOpen } from "./on-open";

declare const global: Global;

describe("onOpen", () => {
  it("should add menu", () => {
    // Arrange
    const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = {
      addMenu: jest.fn()
    } as any;

    global.SpreadsheetApp = {
      getActiveSpreadsheet: jest.fn().mockReturnValue(spreadsheet)
    } as any;

    // Act
    const result = onOpen();

    // Assert
    expect(result).toBeUndefined();
    expect(spreadsheet.addMenu).toBeCalled();
  });
});
