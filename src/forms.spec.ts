import * as module from "./forms";

interface IGlobal {
  FormApp: GoogleAppsScript.Forms.FormApp;
  PropertiesService: GoogleAppsScript.Properties.PropertiesService;
  HtmlService: GoogleAppsScript.HTML.HtmlService;
  UrlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp;
  Logger: GoogleAppsScript.Base.Logger;
  ScriptApp: GoogleAppsScript.Script.ScriptApp;
  Session: GoogleAppsScript.Base.Session;
  Utilities: GoogleAppsScript.Utilities.Utilities;
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
      beforeAll(() => setupScriptApp(AuthorizationStatus.REQUIRED));

      const args = ["Authorize", "showAuthModal"];

      it("onInstall should add authorize menu", () =>
        expectMenu(module.onInstall, args));

      it("onOpen should add authorize menu", () =>
        expectMenu(module.onOpen, args));
    });

    describe("when authorization not required", () => {
      beforeAll(() => setupScriptApp(AuthorizationStatus.NOT_REQUIRED));

      const args = ["Settings", "showSettingsSidebar"];

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
    const expectReturnFalse = (authInfo: any, properties: any) =>
      expect(module.onAuthorizationRequired(authInfo, properties)).toBe(false);

    // Helpers
    const today = new Date().toDateString();
    const notToday = ((d: Date) => new Date(d.setDate(d.getDate() - 7)))(
      new Date()
    );

    describe("when auth info is undefined", () =>
      it("should return false", () => expectReturnFalse(undefined, {})));

    describe("when properties is undefined", () =>
      it("should return false", () => expectReturnFalse({}, undefined)));

    describe("when last auth date is today", () => {
      it("should return false", () =>
        expectReturnFalse(
          {},
          {
            getProperty: jest.fn().mockReturnValue(today)
          }
        ));
    });

    describe("when last auth date is not today", () => {
      // Arrange
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

      it("should set auth url on template", () =>
        expect(template.authUrl).toBe(authUrl));

      it("should prepare email with user email", () =>
        expect(user.getEmail).toBeCalled());

      it("should prepare email with html content", () =>
        expect(html.getContent).toBeCalled());

      it("should update last auth email date property to today", () => {
        // Assert
        const args = (properties.setProperty as jest.Mock).mock.calls[0];
        expect(args[0]).toBe("lastAuthEmailDate");
        expect(args[1]).toBe(new Date().toDateString());
      });

      it("should return true", () => expect(result).toBe(true));
    });
  });

  describe("sendEmail", () => {
    const valid = {
      to: "to",
      subject: "subject",
      body: "body",
      contentType: "contentType"
    };

    const expectReturnFalse = (x: any) =>
      expect(module.sendEmail(x)).toBe(false);

    describe("when model.to is undefined", () => {
      const model = { ...valid, to: undefined };
      it("should return false", () => expectReturnFalse(model));
    });

    describe("when model.subject is undefined", () => {
      const model = { ...valid, subject: undefined };
      it("should return false", () => expectReturnFalse(model));
    });

    describe("when model.body is undefined", () => {
      const model = { ...valid, body: undefined };
      it("should return false", () => expectReturnFalse(model));
    });

    describe("when model.contentType is undefined", () => {
      const model = { ...valid, contentType: undefined };
      it("should return false", () => expectReturnFalse(model));
    });

    describe("when model is valid", () => {
      // Arrange
      const model = { ...valid };

      global.UrlFetchApp = {
        fetch: jest.fn()
      } as any;

      // Act
      const result = module.sendEmail(model);

      // Assert
      it("should make request", () => expect(UrlFetchApp.fetch).toBeCalled());

      it("should return true", () => expect(result).toBe(true));
    });
  });

  describe("onFormSubmit", () => {
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

    const setupProperties = (props?: any) => {
      let documentProperties: GoogleAppsScript.Properties.Properties;
      if (props !== undefined) {
        documentProperties = {
          getProperties: jest.fn().mockReturnValue(props)
        } as any;
      }

      global.PropertiesService = {
        getDocumentProperties: jest.fn().mockReturnValue(documentProperties!)
      } as any;
    };

    describe("when auth status is required", () => {
      it("should stop processing", () => {
        // Arrange
        setupScriptApp(AuthorizationStatus.REQUIRED);
        setupProperties();

        // Act
        const result = module.onFormSubmit({} as any);

        // Assert
        expect(result).toBe(false);
      });
    });

    const expectRequiredPropertyFalse = (key: string) => {
      // Arrange
      setupScriptApp(AuthorizationStatus.NOT_REQUIRED);

      const props = {} as any;
      props[key] = "value";
      setupProperties(props);

      // Act
      const result = module.onFormSubmit({} as any);

      // Assert
      expect(result).toBe(false);
    };

    describe("when required properties not set", () => {
      it("return false for missing api url", () =>
        expectRequiredPropertyFalse("apiUrl"));
      it("return false for missing api token", () =>
        expectRequiredPropertyFalse("apiToken"));
      it("return false for missing api key", () =>
        expectRequiredPropertyFalse("apiKey"));
    });

    describe("when required properties set", () => {
      // Arrange
      setupScriptApp(AuthorizationStatus.NOT_REQUIRED);
      setupProperties({ apiKey: "value", apiUrl: "value", apiToken: "value" });

      // Act
      const result = module.onFormSubmit({} as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("sendToApi", () => {
    const expectReturnFalse = (form: any, response: any, props: any) =>
      expect(module.sendToApi(form, response, props)).toBe(false);

    describe("when form is undefined", () =>
      it("should return false", () => expectReturnFalse(undefined, {}, {})));

    describe("when response is undefined", () =>
      it("should return false", () => expectReturnFalse({}, undefined, {})));

    describe("when props is undefined", () =>
      it("should return false", () => expectReturnFalse({}, {}, undefined)));

    const setupFormResponse = () => {
      const form: GoogleAppsScript.Forms.Form = {
        getId: jest.fn().mockReturnValue("id")
      } as any;
      const response: GoogleAppsScript.Forms.FormResponse = {
        getTimestamp: jest.fn().mockReturnValue(new Date()),
        getRespondentEmail: jest.fn().mockReturnValue("email")
      } as any;
      return { form, response };
    };

    let httpResponse: GoogleAppsScript.URL_Fetch.HTTPResponse;
    const setupUrlFetch = (statusCode: number) => {
      httpResponse = {
        getResponseCode: jest.fn().mockReturnValue(statusCode),
        getContentText: jest.fn()
      } as any;
      global.UrlFetchApp = {
        fetch: jest.fn().mockReturnValue(httpResponse)
      } as any;
    };

    describe("when request is successful", () => {
      // Arrange
      const { form, response } = setupFormResponse();
      setupUrlFetch(200);

      // Act
      const result = module.sendToApi(form, response, {} as any);

      it("should attach timestamp to payload", () =>
        expect(response.getTimestamp).toBeCalled());
      it("should attach form id to payload", () =>
        expect(form.getId).toBeCalled());
      it("should attach email to payload", () =>
        expect(response.getRespondentEmail).toHaveBeenCalledTimes(2));
      it("should return true", () => expect(result).toBe(true));
    });

    describe("when request is not successful", () => {
      // Arrange
      const { form, response } = setupFormResponse();
      setupUrlFetch(500);

      const user: GoogleAppsScript.Base.User = { getEmail: jest.fn() } as any;
      global.Session = {
        getEffectiveUser: jest.fn().mockReturnValue(user)
      } as any;

      global.Utilities = {
        sleep: jest.fn()
      } as any;

      global.Logger = {
        log: jest.fn()
      } as any;

      // Act
      const result = module.sendToApi(form, response, {} as any);

      // Assert
      it("should retry 3 times", () =>
        expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(3));
      it("should wait between each retry", () =>
        expect(Utilities.sleep).toBeCalledWith(expect.any(Number)));
      it("should build email if failed 3 times", () =>
        expect(httpResponse.getContentText).toBeCalled());
      it("should return false", () => expect(result).toBe(false));
    });
  });

  describe("setDynamicProperties", () => {
    const expectReturnFalse = (response: any, properties: any) => {
      expect(module.setDynamicProperties(response, properties)).toBe(false);
    };

    describe("when response is undefined", () =>
      it("should return false", () => expectReturnFalse({}, undefined)));

    describe("when properties is undefined", () =>
      it("should return false", () => expectReturnFalse(undefined, {})));

    describe("when no dynamic properties", () => {
      // Arrange
      const response = {} as any;
      const props: IFormsDocumentProperties = {
        text1: "value"
      } as any;
      const propsCopy = { ...props };

      // Act
      const result = module.setDynamicProperties(response, props);

      // Assert
      it("should not modify properties", () =>
        expect(props.text1).toBe(propsCopy.text1));

      it("should return true", () => expect(result).toBe(true));
    });

    const setupResponse = (title: string, body: string) => {
      const item: GoogleAppsScript.Forms.Item = {
        getTitle: jest.fn().mockReturnValue(title)
      } as any;

      const itemResponse: GoogleAppsScript.Forms.ItemResponse = {
        getResponse: jest.fn().mockReturnValue(body),
        getItem: jest.fn().mockReturnValue(item)
      } as any;

      const response: GoogleAppsScript.Forms.FormResponse = {
        getItemResponses: jest.fn().mockReturnValue([itemResponse])
      } as any;
      return response;
    };

    describe("when dyanmic property does not match title", () => {
      // Arrange
      const t = "title";
      const r = "response";
      const response = setupResponse(t, r);

      const props: IFormsDocumentProperties = {
        text1: "{{notTitle}}"
      } as any;

      // Act
      const result = module.setDynamicProperties(response, props);

      // Assert
      it("should update property with dynamic value", () =>
        expect(props.text1).not.toBe(r));
      it("should return true", () => expect(result).toBe(true));
    });

    describe("when dyanmic property matches title", () => {
      // Arrange
      const t = "title";
      const r = "response";
      const response = setupResponse(t, r);

      const props: IFormsDocumentProperties = {
        text1: "{{title}}"
      } as any;

      // Act
      const result = module.setDynamicProperties(response, props);

      // Assert
      it("should update property with dynamic value", () =>
        expect(props.text1).toBe(r));
      it("should return true", () => expect(result).toBe(true));
    });
  });

  describe("showSettingsSidebar", () => {
    let output: GoogleAppsScript.HTML.HtmlOutput;
    let template: IFormsSettingsTemplate;
    let props: IFormsDocumentProperties;
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
    };

    // Setup the spreadsheet ui mock.
    const setupSheetUi = () => {
      ui = {
        showSidebar: jest.fn()
      } as any;
      global.FormApp = {
        getUi: () => ui
      } as any;
    };

    beforeAll(() => {
      // Arrange
      setupHtml();
      setupProperties();
      setupSheetUi();

      // Act
      module.showSettingsSidebar();
    });

    it("should fetch template from module", () =>
      expect(global.HtmlService.createTemplate).toBeCalled());

    it("should set the html height", () =>
      expect(output.setTitle).toBeCalledWith(expect.any(String)));

    it("should use the html to display sidebar", () =>
      expect(ui.showSidebar).toBeCalledWith(output));

    describe("when property is defined", () =>
      it("should bind value to template", () =>
        expect(template.apiKey).toBe(props.apiKey)));

    describe("when property is undefined", () =>
      it("should bind value to template as empty string", () =>
        expect(template.apiUrl).toBe("")));
  });

  describe("showAuthModal", () => {
    let output: GoogleAppsScript.HTML.HtmlOutput;
    let template: IAuthTemplate;
    let authInfo: GoogleAppsScript.Script.AuthorizationInfo;
    let ui: GoogleAppsScript.Base.Ui;
    const authUrl = "url";

    // Setup the html mock.
    const setupHtml = () => {
      output = {
        setHeight: jest.fn().mockReturnThis(),
        setWidth: jest.fn().mockReturnThis()
      } as any;
      template = {
        evaluate: jest.fn().mockReturnValue(output)
      } as any;
      global.HtmlService = {
        createTemplate: jest.fn().mockReturnValue(template)
      } as any;
    };

    // Setup the script app mock.
    const setupScriptApp = () => {
      authInfo = {
        getAuthorizationUrl: jest.fn().mockReturnValue(authUrl)
      } as any;
      global.ScriptApp = {
        getAuthorizationInfo: jest.fn().mockReturnValue(authInfo),
        AuthMode
      } as any;
    };

    // Setup the spreadsheet ui mock.
    const setupSheetUi = () => {
      ui = {
        showModalDialog: jest.fn()
      } as any;
      global.FormApp = {
        getUi: () => ui
      } as any;
    };

    beforeAll(() => {
      // Arrange
      setupHtml();
      setupScriptApp();
      setupSheetUi();

      // Act
      module.showAuthModal();
    });

    it("should fetch template from module", () =>
      expect(global.HtmlService.createTemplate).toBeCalled());

    it("should set the html height", () =>
      expect(output.setHeight).toBeCalled());

    it("should set the html width", () => expect(output.setWidth).toBeCalled());

    it("should use the html to display modal", () =>
      expect(ui.showModalDialog).toBeCalledWith(output, expect.any(String)));

    it("should bind auth url to template", () =>
      expect(template.authUrl).toBe(authUrl));
  });

  it("should be true", () => expect(true).toBe(true));
});
