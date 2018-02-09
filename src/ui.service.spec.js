import { UiService } from "./ui.service";
import { Templates } from "./templates";

describe("UiService", () => {
  describe("showConfigurationModal", () => {
    let template;
    let ui;

    beforeEach(() => {
      // Arrange
      template = {
        evaluate: jest.fn().mockReturnThis(),
        setHeight: jest.fn().mockReturnThis(),
        setWidth: jest.fn().mockReturnThis()
      };

      global.PropertiesService = {
        getUserProperties: jest.fn().mockReturnThis(),
        getProperties: jest.fn().mockReturnValue({})
      };

      global.HtmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      };

      global.FormApp = {
        getUi: jest.fn().mockReturnThis(),
        showModalDialog: jest.fn()
      };
      ui = new UiService();

      // Act
      ui.showConfigurationModal();
    });

    it("should use configuration modal template", () => {
      // Assert
      expect(HtmlService.createTemplate).toBeCalledWith(
        Templates.configurationModal
      );
    });

    it("should create html output from template", () => {
      // Assert
      expect(template.evaluate).toBeCalled();
      expect(template.setHeight).toBeCalled();
      expect(template.setWidth).toBeCalled();
    });

    it("should show configuration modal", () => {
      // Assert
      expect(FormApp.getUi).toBeCalled();
      expect(FormApp.showModalDialog).toBeCalled();
    });
  });
});
