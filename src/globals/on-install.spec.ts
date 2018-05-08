import { Global } from "../__mocks__/global.mock";
import { onInstall } from "./on-install";

declare const global: Global;

describe("onInstall", () => {
  it("should add menu", () => {
    // Arrange
    const spreadsheet: Spreadsheet = {
      addMenu: jest.fn()
    } as any;

    global.SpreadsheetApp = {
      getActiveSpreadsheet: jest.fn().mockReturnValue(spreadsheet)
    } as any;

    // Act
    const result = onInstall();

    // Assert
    expect(result).toBeUndefined();
    expect(spreadsheet.addMenu).toBeCalled();
  });
});
