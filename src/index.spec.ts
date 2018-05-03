import { Global } from "./__mocks__/global.mock";
import {
  onInstall,
  onOpen,
  onRun,
  onSaveConfiguration,
  showSettingsSidebar
} from "./index";
// tslint:disable:no-expression-statement no-let
declare const global: Global;

describe("Triggers & Events", () => {
  beforeEach(() => {
    global.Logger = {
      log: jest.fn()
    } as any;
  });

  describe("onInstall & onOpen", () => {
    // Since onInstall calls onOpen they can be tested using the same asserts.
    const expectMenu = (fnUnderTest: () => void) => {
      // Arrange
      const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = {
        addMenu: jest.fn()
      } as any;

      global.SpreadsheetApp = {
        getActiveSpreadsheet: jest.fn().mockReturnValue(spreadsheet)
      } as any;

      // Act
      fnUnderTest();

      // Assert
      expect(spreadsheet.addMenu).toBeCalled();
    };

    it("onInstall should add menu", () => expectMenu(onInstall));
    it("onOpen should add menu", () => expectMenu(onOpen));
  });

  describe("onSaveConfiguration", () => {
    it("should set properties", () => {
      // Arrange
      const documentProperties: GoogleAppsScript.Properties.Properties = {
        setProperties: jest.fn()
      } as any;

      global.PropertiesService = {
        getDocumentProperties: jest.fn().mockReturnValue(documentProperties)
      } as any;

      const props = {} as any;

      // Act
      onSaveConfiguration(props);

      // Assert
      expect(documentProperties.setProperties).toBeCalledWith(props);
    });
  });

  describe("showSettingsSidebar", () => {
    let output: GoogleAppsScript.HTML.HtmlOutput;
    let template: SettingsHtmlTemplate;
    let props: DocumentProperties;
    let documentProperties: GoogleAppsScript.Properties.Properties;
    let ui: GoogleAppsScript.Base.Ui;

    // Setup the html mock.
    const setupHtml = () => {
      output = {
        setTitle: jest.fn().mockReturnThis()
      } as any;
      template = {
        evaluate: jest.fn().mockReturnValue(output)
      } as any;
      global.HtmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      } as any;
    };

    // Setup the properties mock.
    const setupProperties = () => {
      documentProperties = {
        getProperties: jest.fn().mockReturnValue(props),
        setProperties: jest.fn()
      } as any;
      global.PropertiesService = {
        getDocumentProperties: () => documentProperties
      } as any;
    };

    // Setup the spreadsheet ui mock.
    const setupSheetUi = () => {
      ui = {
        showSidebar: jest.fn()
      } as any;
      global.SpreadsheetApp = {
        getUi: () => ui
      } as any;
    };

    describe("when properties exist", () => {
      beforeAll(() => {
        // Arrange
        props = {
          apiKey: "test"
        } as any;
        setupHtml();
        setupProperties();
        setupSheetUi();

        // Act
        showSettingsSidebar();
      });

      it("should fetch template from module", () =>
        expect(global.HtmlService.createTemplate).toBeCalled());

      it("should set the html title", () =>
        expect(output.setTitle).toBeCalledWith("Settings"));

      it("should use the html to display sidebar", () =>
        expect(ui.showSidebar).toBeCalledWith(output));

      it("should bind value to template when property is defined", () =>
        expect(template.apiKey).toBe(props.apiKey));

      it("should bind value to template as empty string when property is not defined", () =>
        expect(template.apiUrl).toBe(""));
    });
  });

  describe("onRun", () => {
    let range: GoogleAppsScript.Spreadsheet.Range;
    const ui = { alert: jest.fn() };
    // Setup the spreadsheet mock.
    const setupSpreadsheet = (values: ReadonlyArray<ReadonlyArray<any>>) => {
      range = {
        getValues: jest.fn().mockReturnValue(values),
        setValues: jest.fn()
      } as any;
      const sheet: GoogleAppsScript.Spreadsheet.Sheet = {
        getLastRow: jest.fn().mockReturnValue(10),
        getLastColumn: jest.fn().mockReturnValue(10),
        getRange: jest.fn().mockReturnValue(range)
      } as any;

      global.SpreadsheetApp = {
        getActiveSheet: jest.fn().mockReturnValue(sheet),
        getUi: jest.fn().mockReturnValue(ui)
      } as any;
    };

    // Setup the properties mock.
    const setupProperties = (props: any) => {
      const documentProperties: GoogleAppsScript.Properties.Properties = {
        getProperties: jest.fn().mockReturnValue(props)
      } as any;
      global.PropertiesService = {
        getDocumentProperties: () => documentProperties
      } as any;
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
    };

    describe("when verified and issued are not used", () => {
      it("should not update sheet", () => {
        // Arrange
        const values: ReadonlyArray<any> = [["Y", ""]];
        setupSpreadsheet(values);
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
          setupSpreadsheet(values);
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
          setupSpreadsheet(values);
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
          setupSpreadsheet(values);
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
        setupSpreadsheet(values);
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
        const body = {
          message: "test",
          errors: [{ property: "int1", message: "not int" }]
        };
        beforeAll(() => {
          // Arrange
          setupSpreadsheet([]);
          setupProperties({});
          setupUrlFetch(500, JSON.stringify(body));
          // Act
          onRun();
        });
        it("should display error message", () =>
          expect(ui.alert).toBeCalledWith(
            expect.stringContaining(body.message)
          ));
        it("should handle additional errors", () =>
          expect(ui.alert).toBeCalledWith(
            expect.stringContaining(body.errors[0].message)
          ));
      });
      describe("when response body has no additional errors", () => {
        const body = {
          message: "test"
        };
        beforeAll(() => {
          // Arrange
          setupSpreadsheet([]);
          setupProperties({});
          setupUrlFetch(500, JSON.stringify(body));
          // Act
          onRun();
        });
        it("should display error message", () =>
          expect(ui.alert).toBeCalledWith(
            expect.stringContaining(body.message)
          ));
      });
    });
  });
});
