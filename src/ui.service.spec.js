import { UiService } from "./ui.service";

describe("UiService", () => {
  describe("showConfigurationModal", () => {
    let formApp;
    let template;
    let htmlService;
    let templateProvider;
    let ui;

    beforeEach(() => {
      // Arrange
      template = {
        evaluate: jest.fn().mockReturnThis(),
        setHeight: jest.fn().mockReturnThis(),
        setWidth: jest.fn().mockReturnThis()
      };

      htmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      };

      formApp = {
        getUi: jest.fn().mockReturnThis(),
        showModalDialog: jest.fn()
      };

      templateProvider = {
        configurationModal: ""
      };

      ui = new UiService(formApp, htmlService, templateProvider);
      ui.bindPropertiesToTemplate = jest.fn().mockReturnValue(template);

      // Act
      ui.showConfigurationModal();
    });

    it("should use configuration modal template", () => {
      // Assert
      expect(htmlService.createTemplate).toBeCalledWith(
        templateProvider.configurationModal
      );
    });

    it("should try bind properties to template", () => {
      // Assert
      expect(ui.bindPropertiesToTemplate).toBeCalled();
    });

    it("should create html output from template", () => {
      // Assert
      expect(template.evaluate).toBeCalled();
      expect(template.setHeight).toBeCalled();
      expect(template.setWidth).toBeCalled();
    });

    it("should show configuration modal", () => {
      // Assert
      expect(formApp.getUi).toBeCalled();
      expect(formApp.showModalDialog).toBeCalled();
    });
  });

  describe("bindPropertiesToTemplate", () => {
    const template = {};
    let ui;
    let propertiesService;
    let boundTemplate;

    describe("when properties not set", () => {
      it("should set template bindings as empty strings", () => {
        // Arrange
        propertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue({})
        };
        ui = new UiService(null, null, null, propertiesService);

        // Act
        boundTemplate = ui.bindPropertiesToTemplate(template);

        // Assert
        expect(boundTemplate.apiKey).toBe("");
        expect(boundTemplate.authToken).toBe("");
        expect(boundTemplate.openBadgesUrl).toBe("");
        expect(boundTemplate.activityId).toBe("");
        expect(boundTemplate.activityTime).toBe("");
        expect(boundTemplate.userId).toBe("");
        expect(boundTemplate.text1).toBe("");
        expect(boundTemplate.text2).toBe("");
        expect(boundTemplate.email).toBe("");
        expect(boundTemplate.firstName).toBe("");
        expect(boundTemplate.lastName).toBe("");
        expect(boundTemplate.int1).toBe("");
        expect(boundTemplate.int2).toBe("");
        expect(boundTemplate.date1).toBe("");
      });
    });

    describe("when properties set", () => {
      it("should set template bindings as the property value", () => {
        // Arrange
        const props = {
          OB_API_KEY: "Test",
          OB_AUTH_TOKEN: "Test",
          OB_URL: "Test",
          OB_ACTIVITY_ID: "Test",
          OB_ACTIVITY_TIME: "Test",
          OB_USER_ID: "Test",
          OB_TEXT_1: "Test",
          OB_TEXT_2: "Test",
          OB_FIRST_NAME: "Test",
          OB_LAST_NAME: "Test",
          OB_INT_1: "Test",
          OB_INT_2: "Test",
          OB_DATE_1: "Test",
          OB_EMAIL: "Test"
        };
        propertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };
        ui = new UiService(null, null, null, propertiesService);

        // Act
        boundTemplate = ui.bindPropertiesToTemplate(template);

        // Assert
        expect(boundTemplate.apiKey).toBe("Test");
        expect(boundTemplate.authToken).toBe("Test");
        expect(boundTemplate.openBadgesUrl).toBe("Test");
        expect(boundTemplate.activityId).toBe("Test");
        expect(boundTemplate.activityTime).toBe("Test");
        expect(boundTemplate.userId).toBe("Test");
        expect(boundTemplate.text1).toBe("Test");
        expect(boundTemplate.text2).toBe("Test");
        expect(boundTemplate.email).toBe("Test");
        expect(boundTemplate.firstName).toBe("Test");
        expect(boundTemplate.lastName).toBe("Test");
        expect(boundTemplate.int1).toBe("Test");
        expect(boundTemplate.int2).toBe("Test");
        expect(boundTemplate.date1).toBe("Test");
      });
    });
  });
});
