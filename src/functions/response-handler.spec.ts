// tslint:disable:no-expression-statement

import { responseHandler } from ".";
import { Global } from "../__mocks__/global.mock";

declare const global: Global;

describe("responseHandler", () => {
  describe("when success", () => {
    describe("when payloads.length <= 1", () => {
      it("should display singular message", () => {
        // Arrange
        const ui = {
          alert: jest.fn()
        };
        global.SpreadsheetApp = {
          getUi: jest.fn().mockReturnValue(ui)
        } as any;
        const payloads: ReadonlyArray<any> = [1];
        const { success } = responseHandler([] as any)({} as any)(payloads);

        // Act
        success();

        // Assert
        expect(ui.alert).toBeCalledWith("Sent 1 row.");
      });
    });

    describe("when payloads.length > 1", () => {
      it("should display singular message", () => {
        // Arrange
        const ui = {
          alert: jest.fn()
        };
        global.SpreadsheetApp = {
          getUi: jest.fn().mockReturnValue(ui)
        } as any;
        const payloads: ReadonlyArray<any> = [1, 2];
        const { success } = responseHandler([] as any)({} as any)(payloads);

        // Act
        success();

        // Assert
        expect(ui.alert).toBeCalledWith("Sent 2 rows.");
      });
    });
  });

  describe("when error", () => {
    it("should display message", () => {
      // Arrange
      const ui = {
        alert: jest.fn()
      };
      global.SpreadsheetApp = {
        getUi: jest.fn().mockReturnValue(ui)
      } as any;
      const payloads: ReadonlyArray<any> = [1];
      const { error } = responseHandler([] as any)({} as any)(payloads);
      const response = {
        getContentText: () =>
          JSON.stringify({
            message: "error"
          })
      } as any;

      // Act
      error(response);

      // Assert
      expect(ui.alert).toBeCalled();
    });
  });
});
