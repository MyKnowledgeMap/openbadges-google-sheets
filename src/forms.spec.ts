import * as module from "./forms";

interface IGlobal {
  FormApp: GoogleAppsScript.Forms.FormApp;
  PropertiesService: GoogleAppsScript.Properties.PropertiesService;
  HtmlService: GoogleAppsScript.HTML.HtmlService;
  UrlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp;
  Logger: GoogleAppsScript.Base.Logger;
  ScriptApp: GoogleAppsScript.Script.ScriptApp;
  Session: GoogleAppsScript.Base.Session;
}
declare const global: IGlobal;

enum AuthorizationStatus {
  REQUIRED,
  NOT_REQUIRED
}

enum AuthMode {
  NONE,
  CUSTOM_FUNCTION,
  LIMITED,
  FULL
}

describe("forms", () => {
  beforeAll(() => {
    global.Logger = {
      log: jest.fn()
    } as any;
  });

  describe("onInstall & onOpen", () => {
    // Setup the auth status for the test.
    const setupScriptApp = (status: AuthorizationStatus) => {
      const info: GoogleAppsScript.Script.AuthorizationInfo = {
        getAuthorizationStatus: jest.fn().mockReturnValue(status)
      } as any;
      global.ScriptApp = {
        getAuthorizationInfo: jest.fn().mockReturnValue(info),
        AuthorizationStatus,
        AuthMode
      } as any;
    };

    // Since onInstall calls onOpen they can be tested using the same asserts.
    const expectMenu = (
      fnUnderTest: () => void,
      [title, functionName]: string[]
    ) => {
      // Arrange
      const menu: GoogleAppsScript.Base.Menu = {
        addItem: jest.fn(),
        addToUi: jest.fn()
      } as any;

      const ui: GoogleAppsScript.Base.Ui = {
        createAddonMenu: () => menu
      } as any;

      global.FormApp = {
        getUi: () => ui
      } as any;

      // Act
      fnUnderTest();

      // Assert
      expect((menu.addItem as jest.Mock).mock.calls[0][0]).toBe(title);
      expect((menu.addItem as jest.Mock).mock.calls[0][1]).toBe(functionName);
      expect(menu.addToUi).toBeCalled();
    };

    describe("when authorization required", () => {
      const args = ["Authorize", "showAuthModal"];
      beforeAll(() => setupScriptApp(AuthorizationStatus.REQUIRED));
      it("onInstall should add authorize menu", () =>
        expectMenu(module.onInstall, args));
      it("onOpen should add authorize menu", () =>
        expectMenu(module.onOpen, args));
    });

    describe("when authorization not required", () => {
      const args = ["Settings", "showSettingsSidebar"];
      beforeAll(() => setupScriptApp(AuthorizationStatus.NOT_REQUIRED));
      it("onInstall should add settings menu", () =>
        expectMenu(module.onInstall, args));
      it("onOpen should add settings menu", () =>
        expectMenu(module.onOpen, args));
    });
  });

  describe("onSaveConfiguration", () => {
    // Setup the auth status for the test.
    const setupScriptApp = (status: AuthorizationStatus) => {
      const info: GoogleAppsScript.Script.AuthorizationInfo = {
        getAuthorizationStatus: jest.fn().mockReturnValue(status)
      } as any;
      global.ScriptApp = {
        getAuthorizationInfo: jest.fn().mockReturnValue(info),
        AuthorizationStatus,
        AuthMode
      } as any;
    };
    it("should set properties", () => {
      // Arrange
      const documentProperties: GoogleAppsScript.Properties.Properties = {
        setProperties: jest.fn()
      } as any;

      global.PropertiesService = {
        getDocumentProperties: jest.fn().mockReturnValue(documentProperties)
      } as any;

      const props = {} as any;

      setupScriptApp(AuthorizationStatus.REQUIRED);

      // Act
      module.onSaveConfiguration(props);

      // Assert
      expect(documentProperties.setProperties).toBeCalledWith(props);
    });
  });

  describe("createTriggerIfNotExists", () => {
    // Setup the auth status for the test.
    const setupScriptApp = (
      status: AuthorizationStatus,
      triggers?: GoogleAppsScript.Script.Trigger[]
    ) => {
      const info: GoogleAppsScript.Script.AuthorizationInfo = {
        getAuthorizationStatus: jest.fn().mockReturnValue(status)
      } as any;

      const formTriggerBuilder: GoogleAppsScript.Script.FormTriggerBuilder = {
        onFormSubmit: jest.fn().mockReturnThis(),
        create: jest.fn()
      } as any;

      const builder: GoogleAppsScript.Script.TriggerBuilder = {
        forForm: jest.fn().mockReturnValue(formTriggerBuilder)
      } as any;

      global.ScriptApp = {
        getAuthorizationInfo: jest.fn().mockReturnValue(info),
        getProjectTriggers: jest.fn().mockReturnValue(triggers),
        newTrigger: jest.fn().mockReturnValue(builder),
        AuthorizationStatus,
        AuthMode
      } as any;

      return formTriggerBuilder.create;
    };
    describe("when trigger does exist", () => {
      it("should not create new trigger", () => {
        // Arrange
        const trigger: GoogleAppsScript.Script.Trigger = {
          getHandlerFunction: jest.fn().mockReturnValue("onFormSubmit")
        } as any;
        setupScriptApp(AuthorizationStatus.NOT_REQUIRED, [trigger]);

        // Act
        module.createTriggerIfNotExist();

        // Assert
        expect(global.ScriptApp.newTrigger).not.toBeCalled();
      });
    });

    describe("when trigger does not exist", () => {
      it("should create new trigger", () => {
        // Arrange
        global.FormApp = {
          getActiveForm: jest.fn()
        } as any;

        const trigger: GoogleAppsScript.Script.Trigger = {
          getHandlerFunction: jest.fn().mockReturnValue("")
        } as any;
        const mock = setupScriptApp(AuthorizationStatus.NOT_REQUIRED, [
          trigger
        ]);

        // Act
        module.createTriggerIfNotExist();

        // Assert
        expect(mock).toBeCalled();
      });
    });
  });

  describe("onAuthorizationRequired", () => {
    describe("when last auth date is today", () => {
      it("should return false", () => {
        // Arrange
        const today = new Date().toDateString();
        const properties: GoogleAppsScript.Properties.Properties = {
          getProperty: jest.fn().mockReturnValue(today)
        } as any;

        // Act
        const result = module.onAuthorizationRequired({} as any, properties);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe("when last auth date is not today", () => {
      // Arrange
      const notToday = ((d: Date) => new Date(d.setDate(d.getDate() - 7)))(
        new Date()
      );
      const properties: GoogleAppsScript.Properties.Properties = {
        getProperty: jest.fn().mockReturnValue(notToday),
        setProperty: jest.fn()
      } as any;

      const html: GoogleAppsScript.HTML.HtmlOutput = {
        getContent: jest.fn()
      } as any;

      const template: IAuthTemplate = {
        evaluate: jest.fn().mockReturnValue(html)
      } as any;

      global.HtmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      } as any;

      const authUrl = "test";
      const authInfo: GoogleAppsScript.Script.AuthorizationInfo = {
        getAuthorizationUrl: jest.fn().mockReturnValue(authUrl)
      } as any;

      const user: GoogleAppsScript.Base.User = {
        getEmail: jest.fn()
      } as any;

      global.Session = {
        getEffectiveUser: jest.fn().mockReturnValue(user)
      } as any;

      // Act
      const result = module.onAuthorizationRequired(authInfo, properties);

      it("should set auth url on template", () => {
        // Assert
        expect(template.authUrl).toBe(authUrl);
      });

      it("should prepare email with user email", () => {
        // Assert
        expect(user.getEmail).toBeCalled();
      });

      it("should prepare email with html content", () => {
        // Assert
        expect(html.getContent).toBeCalled();
      });

      it("should update last auth email date property to today", () => {
        // Assert
        const args = (properties.setProperty as jest.Mock).mock.calls[0];
        expect(args[0]).toBe("lastAuthEmailDate");
        expect(args[1]).toBe(new Date().toDateString());
      });

      it("should return true", () => {
        // Assert
        expect(result).toBe(true);
      });
    });
  });
});
