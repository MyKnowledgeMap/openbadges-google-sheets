import * as module from "./sheets";

interface IGlobal {
  SpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
  PropertiesService: GoogleAppsScript.Properties.PropertiesService;
  HtmlService: GoogleAppsScript.HTML.HtmlService;
  UrlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp;
  Logger: GoogleAppsScript.Base.Logger;
}
declare const global: IGlobal;

describe("sheets", () => {
  beforeAll(() => {
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
          apiKey: "test",
          apiUrl: undefined
        } as any;
        setupHtml();
        setupProperties();
        setupSheetUi();

        // Act
        module.showSettingsSidebar();
      });

      it("should fetch template from module", () =>
        expect(global.HtmlService.createTemplate).toBeCalled());

      it("should set the html title", () =>
        expect(output.setTitle).toBeCalledWith("Settings"));

      it("should use the html to display sidebar", () =>
        expect(ui.showSidebar).toBeCalledWith(output));

      it("should bind value to template when property is defined", () =>
        expect(template.apiKey).toBe(props.apiKey));

      it("should bind value to template as empty string when property is undefined", () =>
        expect(template.apiUrl).toBe(""));
    });

    describe("when properties do not exist", () => {
      beforeAll(() => {
        // Arrange
        props = {} as any;
        setupHtml();
        setupProperties();
        setupSheetUi();

        // Act
        module.showSettingsSidebar();
      });

      it("should set default values", () => {
        expect(documentProperties.setProperties).toBeCalledWith(
          expect.objectContaining({ apiKey: expect.any(String) })
        );
      });
    });
  });

  describe("onRun", () => {
    let range: GoogleAppsScript.Spreadsheet.Range;
    // Setup the spreadsheet mock.
    const setupSpreadsheet = (values: any[]) => {
      range = {
        getValues: jest.fn().mockReturnValue([values]),
        setValues: jest.fn()
      } as any;
      const sheet: GoogleAppsScript.Spreadsheet.Sheet = {
        getLastRow: jest.fn().mockReturnValue(10),
        getLastColumn: jest.fn().mockReturnValue(10),
        getRange: jest.fn().mockReturnValue(range)
      } as any;
      global.SpreadsheetApp = {
        getActiveSheet: () => sheet,
        getUi: () => ({ alert: jest.fn() })
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
    const setupUrlFetch = (code: number) => {
      const response: GoogleAppsScript.URL_Fetch.HTTPResponse = {
        getResponseCode: jest.fn().mockReturnValue(code),
        getContentText: jest.fn()
      } as any;
      global.UrlFetchApp = {
        fetch: jest.fn().mockReturnValue(response)
      } as any;
    };

    describe("when verified and issued are used", () => {
      describe("when is verified and issued is falsy", () => {
        it("should update issued column", () => {
          // Arrange
          const values = ["Y", ""];
          setupSpreadsheet(values);
          setupProperties({ verified: "{{A}}", issued: "{{B}}" });
          setupUrlFetch(200);
          // Act
          module.onRun();
          // Assert
          expect(range.setValues).not.toBeCalledWith([values]);
        });
      });
      describe("when is verified and not issued", () => {
        it("should update issued column", () => {
          // Arrange
          const values = ["Y", "N"];
          setupSpreadsheet(values);
          setupProperties({ verified: "{{A}}", issued: "{{B}}" });
          setupUrlFetch(200);
          // Act
          module.onRun();
          // Assert
          expect(range.setValues).not.toBeCalledWith([values]);
        });
      });
      describe("when is verified and issued", () => {
        it("should not update issued column", () => {
          // Arrange
          const values = ["Y", "Y"];
          setupSpreadsheet(values);
          setupProperties({ verified: "{{A}}", issued: "{{B}}" });
          setupUrlFetch(200);
          // Act
          module.onRun();
          // Assert
          expect(range.setValues).toBeCalledWith([values]);
        });
      });
    });

    describe("when request is successful", () => {
      it("should return true", () => {
        // Arrange
        setupSpreadsheet([]);
        setupProperties({});
        setupUrlFetch(200);
        // Act
        const result = module.onRun();
        // Assert
        expect(result).toBe(true);
      });
    });

    describe("when request is not successful", () => {
      it("should return false", () => {
        // Arrange
        setupSpreadsheet([]);
        setupProperties({});
        setupUrlFetch(500);
        // Act
        const result = module.onRun();
        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe("populateStaticPayloads", () => {
    describe("when key has api prefix", () => {
      it("should ignore property", () => {
        // Arrange
        const props = {
          apiKey: "1234567890"
        } as ISheetsDocumentProperties;

        const payloads = [{}] as ICreateActivityEvent[];

        // Act
        module.populateStaticPayloads(props, payloads);

        // Assert
        expect((payloads[0] as any).apiKey).toBeUndefined();
      });
    });

    describe("when key is already in use", () => {
      it("should ignore property", () => {
        // Arrange
        const props = {
          firstName: "Joe"
        } as ISheetsDocumentProperties;

        const payloads = [{ firstName: "Bob" }] as ICreateActivityEvent[];

        // Act
        module.populateStaticPayloads(props, payloads);

        // Assert
        expect(payloads[0].firstName).not.toBe(props.firstName);
      });
    });

    describe("when key is not already in use", () => {
      it("should use property", () => {
        // Arrange
        const props = {
          firstName: "Joe"
        } as ISheetsDocumentProperties;

        const payloads = [{}] as ICreateActivityEvent[];

        // Act
        module.populateStaticPayloads(props, payloads);

        // Assert
        expect(payloads[0].firstName).toBe(props.firstName);
      });
    });
  });

  describe("populateDynamicPayloads", () => {
    describe("when value not using template", () => {
      it("should ignore property", () => {
        // Arrange
        const props = {
          firstName: "{invalid}",
          lastName: "Bloggs"
        } as ISheetsDocumentProperties;

        const payloads = [{}] as ICreateActivityEvent[];

        const range: GoogleAppsScript.Spreadsheet.Range = {
          getValues: jest.fn().mockReturnValue([[]])
        } as any;
        const sheet = {
          getLastRow: () => 2,
          getLastColumn: () => 2,
          getRange: () => range
        } as any;

        // Act
        module.populateDynamicPayloads(props, payloads, sheet);

        // Assert
        expect(payloads[0].firstName).toBeUndefined();
      });
    });

    describe("when value using template with no matching column", () => {
      let value: number | string | boolean | Date;
      let payloads: ICreateActivityEvent[];
      let props: ISheetsDocumentProperties;
      let sheet: GoogleAppsScript.Spreadsheet.Sheet;

      // Setup the sheet mock with the provided value.
      const setupSheet = (v: number | string | boolean | Date) => {
        value = v;
        const range = {
          getValues: jest.fn().mockReturnValue([[value]])
        };
        sheet = {
          getLastRow: () => 2,
          getLastColumn: () => 2,
          getRange: jest.fn().mockReturnValue(range)
        } as any;
      };

      beforeAll(() => {
        props = {
          text1: "{{B}}"
        } as any;
        payloads = [{}] as any;
      });

      it("should ignore dynamic value", () => {
        // Arrange
        setupSheet("test");

        // Act
        module.populateDynamicPayloads(props, payloads, sheet);

        // Assert
        expect(payloads[0].text1).not.toBe(value.toString());
      });
    });

    describe("when value using template with matching column", () => {
      let value: number | string | boolean | Date;
      let payloads: ICreateActivityEvent[];
      let props: ISheetsDocumentProperties;
      let sheet: GoogleAppsScript.Spreadsheet.Sheet;

      // Setup the sheet mock with the provided value.
      const setupSheet = (v: number | string | boolean | Date) => {
        value = v;
        const range = {
          getValues: jest.fn().mockReturnValue([[value]])
        };
        sheet = {
          getLastRow: () => 2,
          getLastColumn: () => 2,
          getRange: jest.fn().mockReturnValue(range)
        } as any;
      };

      beforeAll(() => {
        props = {
          text1: "{{A}}"
        } as any;
        payloads = [{}] as any;
      });

      it("should toUTCString dynamic value if type is date", () => {
        // Arrange
        setupSheet(new Date());

        // Act
        module.populateDynamicPayloads(props, payloads, sheet);

        // Assert
        expect(payloads[0].text1).toBe((value as Date).toUTCString());
      });

      it("should toString dynamic value if type is boolean", () => {
        // Arrange
        setupSheet(true);

        // Act
        module.populateDynamicPayloads(props, payloads, sheet);

        // Assert
        expect(payloads[0].text1).toBe(value.toString());
      });

      it("should toString dynamic value if type is number", () => {
        // Arrange
        setupSheet(50);

        // Act
        module.populateDynamicPayloads(props, payloads, sheet);

        // Assert
        expect(payloads[0].text1).toBe(value.toString());
      });

      it("should toString dynamic value if type is string", () => {
        // Arrange
        setupSheet("test");

        // Act
        module.populateDynamicPayloads(props, payloads, sheet);

        // Assert
        expect(payloads[0].text1).toBe(value.toString());
      });
    });
  });

  describe("getDynamicColumns", () => {
    describe("when props are not dynamic", () => {
      it("should return empty array", () => {
        // Arrange
        const props: ISheetsDocumentProperties = {
          firstName: "not dynamic",
          lastName: "another value",
          text1: "{still not dynamic}"
        } as any;

        // Act
        const result = module.getDynamicColumns(props);

        // Assert
        expect(result.length).toBe(0);
      });
    });

    describe("when props are dynamic", () => {
      // Arrange
      const props: ISheetsDocumentProperties = {
        firstName: "{{A}}",
        lastName: "{{B}}",
        text1: "not dynamic"
      } as any;

      // Act
      const result = module.getDynamicColumns(props);

      // Assert
      it("should return array of dynamic properties", () =>
        expect(result.length).toBe(2));
      it("should strip dynamic template from value", () =>
        expect(result[0].value).toBe("A"));
    });
  });
});
