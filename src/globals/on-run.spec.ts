// tslint:disable:no-expression-statement

import { Global } from "../__mocks__/global.mock";
import { onRun } from "./on-run";

declare const global: Global;

describe("onRun", () => {
  // Setup the spreadsheet mock.
  const setupSpreadsheet = (values: ReadonlyArray<ReadonlyArray<any>>) => {
    const range = {
      getValues: jest.fn().mockReturnValue(values),
      setValues: jest.fn()
    } as any;

    const ui = { alert: jest.fn() };

    const sheet: GoogleAppsScript.Spreadsheet.Sheet = {
      getLastRow: jest.fn().mockReturnValue(10),
      getLastColumn: jest.fn().mockReturnValue(10),
      getRange: jest.fn().mockReturnValue(range)
    } as any;

    global.SpreadsheetApp = {
      getActiveSheet: jest.fn().mockReturnValue(sheet),
      getUi: jest.fn().mockReturnValue(ui)
    } as any;

    return { range, ui, sheet };
  };

  // Setup the properties mock.
  const setupProperties = (props: any) => {
    const documentProperties: GoogleAppsScript.Properties.Properties = {
      getProperties: jest.fn().mockReturnValue(props)
    } as any;
    global.PropertiesService = {
      getDocumentProperties: () => documentProperties
    } as any;
    return { documentProperties };
  };

  // Setup the url fetch mock.
  const setupUrlFetch = (code: number, body?: string) => {
    const response: GoogleAppsScript.URL_Fetch.HTTPResponse = {
      getResponseCode: jest.fn().mockReturnValue(code),
      getContentText: jest.fn().mockReturnValue(body)
    } as any;
    global.UrlFetchApp = {
      fetch: jest.fn().mockReturnValue(response)
    } as any;
    return { response };
  };

  describe("when verified and issued are not used", () => {
    it("should not update sheet", () => {
      // Arrange
      const values: ReadonlyArray<any> = [["Y", ""]];
      const { range } = setupSpreadsheet(values);
      setupProperties({});
      setupUrlFetch(200);

      // Act
      onRun();

      // Assert
      expect(range.setValues).not.toBeCalled();
    });
  });

  describe("when verified and issued are used", () => {
    describe("when is verified and issued is falsy", () => {
      it("should update issued column", () => {
        // Arrange
        const values: ReadonlyArray<any> = [["Y", ""]];
        const { range } = setupSpreadsheet(values);
        setupProperties({ verified: "{{A}}", issued: "{{B}}" });
        setupUrlFetch(200);

        // Act
        onRun();

        // Assert
        expect(range.setValues).not.toBeCalledWith([values]);
      });
    });

    describe("when is verified and not issued", () => {
      it("should update issued column", () => {
        // Arrange
        const values: ReadonlyArray<any> = [["Y", "N"]];
        const { range } = setupSpreadsheet(values);
        setupProperties({ verified: "{{A}}", issued: "{{B}}" });
        setupUrlFetch(200);

        // Act
        onRun();

        // Assert
        expect(range.setValues).not.toBeCalledWith([values]);
      });
    });

    describe("when is verified and issued", () => {
      it("should not update issued column", () => {
        // Arrange
        const values: ReadonlyArray<any> = [["Y", "Y"]];
        const { range } = setupSpreadsheet(values);
        setupProperties({ verified: "{{A}}", issued: "{{B}}" });
        setupUrlFetch(200);

        // Act
        onRun();

        // Assert
        expect(range.setValues).toBeCalledWith(values);
      });
    });
  });

  describe("when request is successful", () => {
    it("should display success alert", () => {
      // Arrange
      const values: ReadonlyArray<any> = [["Y", ""], ["Y", ""]];
      const { ui } = setupSpreadsheet(values);
      setupProperties({ verified: "{{A}}", issued: "{{B}}" });
      setupUrlFetch(200);

      // Act
      onRun();

      // Assert
      expect(ui.alert).toBeCalledWith(expect.stringMatching("Sent 2 rows."));
    });
  });

  describe("when request is not successful", () => {
    describe("when response body has additional errors", () => {
      it("should display error message", () => {
        // Arrange
        const { ui } = setupSpreadsheet([]);
        setupProperties({});
        const body = {
          message: "test",
          errors: [{ property: "int1", message: "not int" }]
        };
        setupUrlFetch(500, JSON.stringify(body));

        // Act
        onRun();

        // Assert
        expect(ui.alert).toBeCalledWith(expect.stringContaining(body.message));
      });

      it("should handle additional errors", () => {
        // Arrange
        const { ui } = setupSpreadsheet([]);
        setupProperties({});
        const body = {
          message: "test",
          errors: [{ property: "int1", message: "not int" }]
        };
        setupUrlFetch(500, JSON.stringify(body));

        // Act
        onRun();

        // Assert
        expect(ui.alert).toBeCalledWith(
          expect.stringContaining(body.errors[0].message)
        );
      });
    });

    describe("when response body has no additional errors", () => {
      it("should display error message", () => {
        // Arrange
        const { ui } = setupSpreadsheet([]);
        setupProperties({});
        const body = {
          message: "test"
        };
        setupUrlFetch(500, JSON.stringify(body));

        // Act
        onRun();

        // Assert
        expect(ui.alert).toBeCalledWith(expect.stringContaining(body.message));
      });
    });
  });
});
