import { EventService } from "./event.service";

describe("EventService", () => {
  let eventService;

  describe("onOpen", () => {
    beforeAll(() => {
      // Arrange
      global.FormApp = {
        getUi: jest.fn().mockReturnThis(),
        createAddonMenu: jest.fn().mockReturnThis(),
        addItem: jest.fn().mockReturnThis(),
        addToUi: jest.fn().mockReturnThis(),
        getActiveForm: jest.fn().mockReturnThis()
      };
      global.ScriptApp = {
        newTrigger: jest.fn().mockReturnThis(),
        forForm: jest.fn().mockReturnThis(),
        onFormSubmit: jest.fn().mockReturnThis(),
        create: jest.fn().mockReturnThis()
      };
      eventService = new EventService();

      // Act
      eventService.onOpen();
    });

    it("should provide addon menu", () => {
      // Assert
      expect(FormApp.getUi).toBeCalled();
      expect(FormApp.createAddonMenu).toBeCalled();
      expect(FormApp.addItem).toBeCalledWith(
        "Settings",
        "showConfigurationModal"
      );
      expect(FormApp.getActiveForm).toBeCalled();
    });

    it("should add manual trigger for onFormSubmit", () => {
      // Assert
      expect(ScriptApp.newTrigger).toBeCalledWith("onFormSubmit");
      expect(ScriptApp.forForm).toBeCalled();
      expect(ScriptApp.onFormSubmit).toBeCalled();
      expect(ScriptApp.create).toBeCalled();
    });
  });

  describe("onInstall", () => {
    it("should be alias for onOpen", () => {
      // Arrange
      eventService = new EventService();
      eventService.onOpen = jest.fn();

      // Act
      eventService.onInstall();

      // Assert
      expect(eventService.onOpen).toBeCalled();
    });
  });

  describe("onSaveConfiguration", () => {
    beforeAll(() => {
      // Arrange
      global.PropertiesService = {
        getUserProperties: jest.fn().mockReturnThis(),
        setProperties: jest.fn()
      };

      eventService = new EventService();
    });

    it("should access user properties", () => {
      // Act
      eventService.onSaveConfiguration({});

      // Assert
      expect(PropertiesService.getUserProperties).toBeCalled();
    });

    it("should save properties", () => {
      // Arrange
      const key = "1234567890";
      const config = { apiKey: key };

      // Act
      eventService.onSaveConfiguration(config);

      // Assert
      expect(PropertiesService.setProperties).toBeCalledWith({
        OB_API_KEY: key
      });
    });
  });

  describe("onFormSubmit", () => {
    beforeEach(() => {
      global.Logger = {
        log: jest.fn()
      };
    });

    describe("when missing required properties", () => {
      it("should stop processing and log message", () => {
        // Arrange
        const props = { OB_URL: "Value1", NotRequired: "Value2" };
        global.PropertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };
        eventService = new EventService();

        // Act
        const result = eventService.onFormSubmit();

        // Assert
        expect(result).toBe(false);
        expect(Logger.log).toBeCalled();
      });
    });

    describe("when all required properties exist", () => {
      it("should make request to activity event API", () => {
        // Arrange
        const props = {
          OB_URL: "Value1",
          OB_AUTH_TOKEN: "Value2",
          OB_API_KEY: "Value3"
        };
        global.PropertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };

        global.UrlFetchApp = {
          fetch: jest.fn().mockReturnValue(true)
        };

        eventService = new EventService();

        // Act
        const result = eventService.onFormSubmit();

        // Assert
        expect(result).toBe(true);
      });
    });
  });
});
