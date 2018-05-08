import { Global } from "../__mocks__/global.mock";
import { showSettingsSidebar } from "./show-settings-sidebar";

declare const global: Global;

describe("showSettingsSidebar", () => {
  // Setup the html mock.
  const setupHtml = () => {
    const output = {
      setTitle: jest.fn().mockReturnThis()
    };
    const template = {
      evaluate: jest.fn().mockReturnValue(output)
    } as any;
    global.HtmlService = {
      createTemplate: jest.fn().mockReturnValue(template)
    } as any;
    return { output, template };
  };

  // Setup the properties mock.
  const setupProperties = (props: any) => {
    const documentProperties = {
      getProperties: jest.fn().mockReturnValue(props),
      setProperties: jest.fn()
    } as any;
    global.PropertiesService = {
      getDocumentProperties: () => documentProperties
    } as any;
    return { documentProperties };
  };

  // Setup the spreadsheet ui mock.
  const setupSheetUi = () => {
    const ui = {
      showSidebar: jest.fn()
    } as any;
    global.SpreadsheetApp = {
      getUi: () => ui
    } as any;
    return { ui };
  };

  describe("when properties exist", () => {
    // Arrange
    const { output, template } = setupHtml();
    const props = { apiKey: "test" };
    setupProperties(props);
    const { ui } = setupSheetUi();

    // Act
    const result = showSettingsSidebar();

    // Assert
    it("should return void", () => expect(result).toBeUndefined());

    it("should fetch template from module", () =>
      expect(HtmlService.createTemplate).toBeCalled());

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
