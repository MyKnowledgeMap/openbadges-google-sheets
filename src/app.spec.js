/* global describe beforeEach jest expect it FormApp ScriptApp
PropertiesService Logger HtmlService Session MailApp UrlFetchApp  */

import { templates } from "./app";

describe("OpenBadges", () => {
  let app;

  beforeEach(() => {
    // Use require so reset modules works.
    app = require("./app").app; // eslint-disable-line

    global.Logger = {
      log: jest.fn()
    };
  });

  describe("onOpen", () => {
    beforeEach(() => {
      // Arrange
      global.FormApp = {
        getUi: jest.fn().mockReturnThis(),
        createAddonMenu: jest.fn().mockReturnThis(),
        addItem: jest.fn().mockReturnThis(),
        addToUi: jest.fn().mockReturnThis(),
        getActiveForm: jest.fn().mockReturnThis()
      };
    });

    it("should provide addon menu", () => {
      // Act
      app.onOpen();

      // Assert
      expect(FormApp.getUi).toBeCalled();
      expect(FormApp.createAddonMenu).toBeCalled();
      expect(FormApp.addItem).toBeCalledWith("Settings", "showConfigurationModal");
    });
  });

  describe("onInstall", () => {
    it("should be alias for onOpen", () => {
      // Arrange
      app.onOpen = jest.fn();

      // Act
      app.onInstall();

      // Assert
      expect(app.onOpen).toBeCalled();
    });
  });

  describe("onSaveConfiguration", () => {
    beforeEach(() => {
      // Arrange
      global.PropertiesService = {
        getDocumentProperties: jest.fn().mockReturnThis(),
        setProperties: jest.fn()
      };

      global.FormApp = {
        getActiveForm: jest.fn().mockReturnThis()
      };

      const trigger = {
        getHandlerFunction: () => "onFormSubmit"
      };

      global.ScriptApp = {
        getProjectTriggers: jest.fn().mockReturnValue([trigger]),
        newTrigger: jest.fn().mockReturnThis(),
        forForm: jest.fn().mockReturnThis(),
        onFormSubmit: jest.fn().mockReturnThis(),
        create: jest.fn().mockReturnThis()
      };
    });

    it("should access user properties", () => {
      // Act
      app.onSaveConfiguration({});

      // Assert
      expect(PropertiesService.getDocumentProperties).toBeCalled();
    });

    it("should save properties", () => {
      // Arrange
      const key = "1234567890";
      const config = { apiKey: key };

      // Act
      app.onSaveConfiguration(config);

      // Assert
      expect(PropertiesService.setProperties).toBeCalledWith({
        apiKey: key
      });
    });

    it("should add manual trigger for onFormSubmit", () => {
      const key = "1234567890";
      const config = { apiKey: key };
      global.ScriptApp.getProjectTriggers = jest.fn().mockReturnValue([]);
      // Act
      app.onSaveConfiguration(config);
      // Assert
      expect(ScriptApp.newTrigger).toBeCalledWith("onFormSubmit");
      expect(ScriptApp.forForm).toBeCalled();
      expect(FormApp.getActiveForm).toBeCalled();
      expect(ScriptApp.onFormSubmit).toBeCalled();
      expect(ScriptApp.create).toBeCalled();
    });
  });

  describe("onFormSubmit", () => {
    beforeEach(() => {
      // jest.resetAllMocks();
      app.onAuthorizationRequired = jest.fn();

      global.Logger = {
        log: jest.fn()
      };
    });

    describe("when not authorized", () => {
      it("should call onAuthorizationRequired", () => {
        // Arrange
        global.ScriptApp = {
          getAuthorizationInfo: jest.fn().mockReturnThis(),
          getAuthorizationStatus: jest.fn().mockReturnValue("REQUIRED"),
          AuthorizationStatus: {
            REQUIRED: "REQUIRED"
          },
          AuthMode: {
            FULL: "FULL"
          }
        };

        // Act
        app.onFormSubmit();

        // Assert
        expect(app.onAuthorizationRequired).toBeCalled();
      });
    });

    describe("when authorized", () => {
      beforeEach(() => {
        global.ScriptApp = {
          getAuthorizationInfo: jest.fn().mockReturnThis(),
          getAuthorizationStatus: jest.fn().mockReturnValue("NOT_REQUIRED"),
          AuthorizationStatus: {
            REQUIRED: "REQUIRED"
          },
          AuthMode: {
            FULL: "FULL"
          }
        };
      });

      describe("when missing required properties", () => {
        it("should stop processing and log message", () => {
          // Arrange
          const props = { apiUrl: "Value1", NotRequired: "Value2" };
          global.PropertiesService = {
            getDocumentProperties: jest.fn().mockReturnThis(),
            getProperties: jest.fn().mockReturnValue(props)
          };

          // Act
          const result = app.onFormSubmit();

          // Assert
          expect(result).toBe(false);
          expect(Logger.log).toBeCalled();
        });
      });

      describe("when all required properties exist", () => {
        let event;
        beforeEach(() => {
          // Arrange
          const props = {
            apiUrl: "Value1",
            apiToken: "Value2",
            apiKey: "Value3"
          };
          global.PropertiesService = {
            getDocumentProperties: jest.fn().mockReturnThis(),
            getProperties: jest.fn().mockReturnValue(props)
          };

          global.UrlFetchApp = {
            fetch: jest.fn().mockReturnValue(true)
          };
          event = {
            source: {
              shortenFormUrl: jest.fn(),
              getPublishedUrl: jest.fn()
            },
            response: {
              getTimestamp: jest.fn().mockReturnValue(new Date()),
              getRespondentEmail: jest.fn()
            }
          };
        });

        it("should consume event source form object", () => {
          // Act
          app.onFormSubmit(event);
          // Assert
          expect(event.source.getPublishedUrl).toBeCalled();
          expect(event.source.shortenFormUrl).toBeCalled();
        });
        it("should consume event response object", () => {
          // Act
          app.onFormSubmit(event);
          // Assert
          expect(event.response.getTimestamp).toBeCalled();
          expect(event.response.getRespondentEmail).toBeCalled();
        });
        it("should make request to activity event API", () => {
          // Act
          app.onFormSubmit(event);
          // Assert
          expect(UrlFetchApp.fetch).toBeCalled();
        });
      });
    });
  });

  describe("onAuthorizationRequired", () => {
    describe("when mail app daily quota is 0", () => {
      it("should log error", () => {
        // Arrange
        global.Logger = {
          log: jest.fn()
        };

        global.MailApp = {
          getRemainingDailyQuota: () => 0
        };

        // Act
        app.onAuthorizationRequired();

        // Assert
        expect(Logger.log).toBeCalled();
      });
    });
    describe("when lastAuthEmailDate is today", () => {
      it("should update lastAuthEmailDate", () => {
        // Arrange
        global.MailApp = {
          getRemainingDailyQuota: () => 1
        };
        const properties = {
          getProperty: key => properties[key],
          setProperty: (key, value) => (properties[key] = value),
          lastAuthEmailDate: new Date().toDateString()
        };
        global.PropertiesService = {
          getDocumentProperties: () => properties
        };

        // Act
        const result = app.onAuthorizationRequired();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("when lastAuthEmailDate is not today", () => {
      it("should send reauthorization email", () => {
        // Arrange
        global.MailApp = {
          sendEmail: jest.fn(),
          getRemainingDailyQuota: () => 1
        };
        const properties = {
          getProperty: key => properties[key],
          setProperty: (key, value) => (properties[key] = value),
          lastAuthEmailDate: (d => new Date(d.setDate(d.getDate() - 1)).toDateString())(new Date())
        };
        global.PropertiesService = {
          getDocumentProperties: () => properties
        };

        const authInfo = {
          getAuthorizationUrl: jest.fn()
        };

        const html = {
          getContent: jest.fn()
        };

        const template = {
          evaluate: jest.fn().mockReturnValue(html)
        };

        global.HtmlService = {
          createTemplate: jest.fn().mockReturnValue(template)
        };

        global.Session = {
          getEffectiveUser: jest.fn().mockReturnThis(),
          getEmail: jest.fn().mockReturnValue("email@email.com")
        };

        // Act
        const result = app.onAuthorizationRequired(authInfo);

        // Assert
        expect(result).toBe(true);
        expect(HtmlService.createTemplate).toBeCalledWith(templates.authorizationEmail);
        expect(Session.getEmail).toBeCalled();
        expect(MailApp.sendEmail.mock.calls[0].length).toBe(4);
        expect(properties.lastAuthEmailDate).toBe(new Date().toDateString());
      });
    });
  });

  describe("showConfigurationModal", () => {
    let template;

    beforeEach(() => {
      // Arrange
      template = {
        evaluate: jest.fn().mockReturnThis(),
        setHeight: jest.fn().mockReturnThis(),
        setWidth: jest.fn().mockReturnThis(),
        setTitle: jest.fn().mockReturnThis()
      };

      global.PropertiesService = {
        getDocumentProperties: jest.fn().mockReturnThis(),
        getProperties: jest.fn().mockReturnValue({})
      };

      global.HtmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      };

      global.FormApp = {
        getUi: jest.fn().mockReturnThis(),
        showSidebar: jest.fn()
      };

      // Act
      app.showConfigurationModal();
    });

    it("should use configuration modal template", () => {
      // Assert
      expect(HtmlService.createTemplate).toBeCalledWith(templates.configurationModal);
    });

    it("should create html output from template", () => {
      // Assert
      expect(template.evaluate).toBeCalled();
      expect(template.setHeight).toBeCalled();
      expect(template.setWidth).toBeCalled();
      expect(template.setTitle).toBeCalled();
    });

    it("should show configuration modal", () => {
      // Assert
      expect(FormApp.getUi).toBeCalled();
      expect(FormApp.showSidebar).toBeCalled();
    });
  });

  describe("hasRequiredProperties", () => {
    describe("when missing provided property names", () => {
      it("should return false", () => {
        const properties = {
          A: "1",
          B: "2"
        };
        const required = ["A", "B", "C"];
        const result = app.hasRequiredProperties(properties, required);
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
        const result = app.hasRequiredProperties(properties, required);
        expect(result).toBe(true);
      });
    });
  });

  describe("bindPropertiesToTemplate", () => {
    const template = {};
    let boundTemplate;
    describe("when properties not set", () => {
      it("should set template bindings as empty strings", () => {
        // Arrange
        global.PropertiesService = {
          getDocumentProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue({})
        };

        // Act
        boundTemplate = app.bindPropertiesToTemplate(template);

        // Assert
        expect(boundTemplate.apiKey).toBe("");
        expect(boundTemplate.apiToken).toBe("");
        expect(boundTemplate.apiUrl).toBe("");
        expect(boundTemplate.activityId).toBe("");
        expect(boundTemplate.text1).toBe("");
        expect(boundTemplate.int1).toBe("");
        expect(boundTemplate.int2).toBe("");
        expect(boundTemplate.date1).toBe("");
      });
    });

    describe("when properties set", () => {
      it("should set template bindings as the property value", () => {
        // Arrange
        const props = {
          apiKey: "Test",
          apiToken: "Test",
          apiUrl: "Test",
          activityId: "Test",
          activityTime: "Test",
          userId: "Test",
          text1: "Test",
          text2: "Test",
          firstName: "Test",
          lastName: "Test",
          int1: "Test",
          int2: "Test",
          date1: "Test",
          email: "Test"
        };
        global.PropertiesService = {
          getDocumentProperties: jest.fn().mockReturnThis(),
          getProperties: jest.fn().mockReturnValue(props)
        };

        // Act
        boundTemplate = app.bindPropertiesToTemplate(template);

        // Assert
        expect(boundTemplate.apiKey).toBe("Test");
        expect(boundTemplate.apiToken).toBe("Test");
        expect(boundTemplate.apiUrl).toBe("Test");
        expect(boundTemplate.activityId).toBe("Test");
        expect(boundTemplate.text1).toBe("Test");
        expect(boundTemplate.int1).toBe("Test");
        expect(boundTemplate.int2).toBe("Test");
        expect(boundTemplate.date1).toBe("Test");
      });
    });
  });
});
