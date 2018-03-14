import * as module from "./sheets";

declare var global: Global;
// tslint:disable-next-line:interface-name
export interface Global {
  SpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
  PropertiesService: GoogleAppsScript.Properties.PropertiesService;
  HtmlService: GoogleAppsScript.HTML.HtmlService;
}

describe("sheets", () => {
  describe("onInstall & onOpen", () => {
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
    it("onInstall should add menu", () => expectMenu(module.onInstall));
    it("onOpen should add menu", () => expectMenu(module.onOpen));
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
      module.onSaveConfiguration(props);

      // Assert
      expect(documentProperties.setProperties).toBeCalledWith(props);
    });
  });

  describe("showSettingsSidebar", () => {
    let output: GoogleAppsScript.HTML.HtmlOutput;
    let template: ISheetsSettingsTemplate;
    let props: ISheetsDocumentProperties;
    let documentProperties: GoogleAppsScript.Properties.Properties;
    let ui: GoogleAppsScript.Base.Ui;

    beforeAll(() => {
      // Setup the HTML template mock.
      output = {
        setTitle: jest.fn().mockReturnThis()
      } as any;
      template = {
        evaluate: jest.fn().mockReturnValue(output)
      } as any;
      global.HtmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      } as any;

      // Setup the properties mock.
      props = {
        apiKey: "test",
        apiUrl: undefined
      } as any;
      documentProperties = {
        getProperties: jest.fn().mockReturnValue(props)
      } as any;
      global.PropertiesService = {
        getDocumentProperties: () => documentProperties
      } as any;

      // Setup the SpreadsheetApp mock.
      ui = {
        showSidebar: jest.fn()
      } as any;
      global.SpreadsheetApp = {
        getUi: () => ui
      } as any;

      // Act
      module.showSettingsSidebar();
    });

    // Asserts
    it("should fetch template from module", () => {
      expect(global.HtmlService.createTemplate).toBeCalled();
    });
    it("should bind properties to template", () => {
      expect(template.apiKey).toBe(props.apiKey);
    });
    it("should bind undefined properties as empty string", () => {
      expect(template.apiUrl).toBe("");
    });
    it("should set the title of the html to 'Settings'", () => {
      expect(output.setTitle).toBeCalledWith("Settings");
    });
    it("should use the html to display sidebar", () => {
      expect(ui.showSidebar).toBeCalledWith(output);
    });
  });

  describe("onRun", () => {
    let props: ISheetsDocumentProperties;
    let documentProperties: GoogleAppsScript.Properties.Properties;
    it("should work", () => {
      // Arrange
      const sheet: GoogleAppsScript.Spreadsheet.Sheet = {
        getLastRow: jest.fn().mockReturnValue(10)
      } as any;
      global.SpreadsheetApp = {
        getActiveSheet: () => sheet
      } as any;

      props = {
        apiKey: "test",
        apiUrl: undefined
      } as any;
      documentProperties = {
        getProperties: jest.fn().mockReturnValue(props)
      } as any;
      global.PropertiesService = {
        getDocumentProperties: () => documentProperties
      } as any;
      // Act
      const result = module.onRun();

      expect(result.length).toBe(10);
    });
  });
});
