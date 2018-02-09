import { EventService } from "./event.service";
const extendGlobal = require('app-script-mock');

describe("EventService", () => {
  beforeAll(() => {
    extendGlobal(global);
  })
  let formApp;
  let scriptApp;
  let urlFetchApp;
  let propertiesService;
  let logger;
  let eventService;

  describe("onOpen", () => {
    beforeAll(() => {
      // Arrange
      formApp = {
        getUi: jest.fn().mockReturnThis(),
        createAddonMenu: jest.fn().mockReturnThis(),
        addItem: jest.fn().mockReturnThis(),
        addToUi: jest.fn().mockReturnThis(),
        getActiveForm: jest.fn().mockReturnThis()
      };
      scriptApp = {
        newTrigger: jest.fn().mockReturnThis(),
        forForm: jest.fn().mockReturnThis(),
        onFormSubmit: jest.fn().mockReturnThis(),
        create: jest.fn().mockReturnThis()
      };
      eventService = new EventService(formApp, scriptApp);

      // Act
      eventService.onOpen();
    });

    it("should provide addon menu", () => {
      // Assert
      expect(formApp.getUi).toBeCalled();
      expect(formApp.createAddonMenu).toBeCalled();
      expect(formApp.addItem).toBeCalledWith(
        "Settings",
        "showConfigurationModal"
      );
      expect(formApp.getActiveForm).toBeCalled();
    });

    it("should add manual trigger for onFormSubmit", () => {
      // Assert
      expect(scriptApp.newTrigger).toBeCalledWith("onFormSubmit");
      expect(scriptApp.forForm).toBeCalled();
      expect(scriptApp.onFormSubmit).toBeCalled();
      expect(scriptApp.create).toBeCalled();
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
      propertiesService = {
        getUserProperties: jest.fn().mockReturnThis(),
        setProperties: jest.fn()
      };

      eventService = new EventService(null, null, null, propertiesService);
    });

    it("should access user properties", () => {
      // Act
      eventService.onSaveConfiguration({});

      // Assert
      expect(propertiesService.getUserProperties).toBeCalled();
    });

    it("should save properties", () => {
      // Arrange
      const key = "1234567890";
      const config = { apiKey: key };

      // Act
      eventService.onSaveConfiguration(config);

      // Assert
      expect(propertiesService.setProperties).toBeCalledWith({
        OB_API_KEY: key
      });
    });
  });

  describe("onFormSubmit", () => {
    beforeEach(() => {
      logger = {
        log: jest.fn()
      };
    });

    describe("when missing required properties", () => {
      it("should stop processing and log message", () => {
        // Arrange
        const props = { OB_URL: "Value1", NotRequired: "Value2" };
        propertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };

        eventService = new EventService(
          null,
          null,
          null,
          propertiesService,
          logger
        );

        // Act
        const result = eventService.onFormSubmit();

        // Assert
        expect(result).toBe(false);
        expect(logger.log).toBeCalled();
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
        propertiesService = {
          getUserProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };

        urlFetchApp = {
          fetch: jest.fn().mockReturnValue(true)
        };

        eventService = new EventService(
          null,
          null,
          urlFetchApp,
          propertiesService,
          logger
        );

        // Act
        const result = eventService.onFormSubmit();

        // Assert
        expect(result).toBe(true);
      });
    });
  });

  describe("hasRequiredProperties", () => {
    eventService = new EventService();

    describe("when missing provided property names", () => {
      it("should return false", () => {
        const properties = {
          A: "1",
          B: "2"
        };
        const required = ["A", "B", "C"];
        const result = eventService.hasRequiredProperties(
          properties,
          required
        );
        expect(result).toBe(false);
      });
    });

    describe("when has provided property names", () => {
      it("should return true", () => {
        const properties = {
          A: "1",
          B: "2",
          C: "3"
        };
        const required = ["A", "B", "C"];
        const result = eventService.hasRequiredProperties(
          properties,
          required
        );
        expect(result).toBe(true);
      });
    });
  });
});
