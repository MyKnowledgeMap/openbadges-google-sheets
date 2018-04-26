import * as module from "./sheets";

interface IGlobal {
  SpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
  PropertiesService: GoogleAppsScript.Properties.PropertiesService;
  HtmlService: GoogleAppsScript.HTML.HtmlService;
  UrlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp;
  Logger: GoogleAppsScript.Base.Logger;
}
declare const global: IGlobal;

describe("Functions", () => {
  describe("_addMenu", () => {
    it("should add menu", () => {
      // Arrange
      const sheet = { addMenu: jest.fn() };
      global.SpreadsheetApp = {
        getActiveSpreadsheet: jest.fn().mockReturnValue(sheet)
      } as any;

      // Act
      module._addMenu();

      // Assert
      expect(sheet.addMenu).toBeCalled();
      expect(sheet.addMenu).toBeCalledWith(
        expect.any(String),
        expect.any(Array)
      );
    });
  });

  describe("_convertStringToNumber", () => {
    // Arrange
    const testCases = [
      { input: "A", output: 1 },
      { input: "B", output: 2 },
      { input: "Z", output: 26 },
      { input: "AA", output: 27 },
      { input: "AZ", output: 52 }
    ];

    // Act => Assert
    for (const { input, output } of testCases) {
      it(`should return ${output} for ${input}`, () => {
        expect(module._convertStringToNumber(input)).toBe(output);
      });
    }
  });

  describe("_getDynamicColumns", () => {
    describe("when no dynamic", () => {
      it("should return empty", () => {
        expect(module._getDynamicColumns({} as any).length).toBe(0);
      });
    });
    describe("when dynamic", () => {
      // Arrange
      const props = { text1: "{{B}}" } as any;

      // Act
      const result = module._getDynamicColumns(props);

      it("should return all dynamic", () => {
        expect(result.length).toBe(1);
      });

      it("should have column key as number", () => {
        expect(result[0].column).toBe(2);
      });

      it("should have property key", () => {
        expect(result[0].key).toBe("text1");
      });

      it("should have clean property value", () => {
        expect(result[0].value).toBe("B");
      });
    });
  });

  describe("_getDynamicPayloads", () => {
    // Arrange
    const rows = [
      ["a", "b", "c", "d"],
      ["e", "f", "g", "h"]
    ] as IGetValuesResult;
    const range = {
      getValues: jest.fn().mockReturnValue(rows)
    };
    const sheet = {
      getRange: jest.fn().mockReturnValue(range),
      getLastColumn: jest.fn(),
      getLastRow: jest.fn()
    } as any;
    const props = {
      email: "{{A}}",
      text1: "{{B}}",
      text2: "{{C}}"
    } as any;
    const payloadsFromProps = module._getDynamicPayloads(props);

    // Act
    const payloads = payloadsFromProps(sheet);

    it("should return curried function", () => {
      expect(typeof payloadsFromProps).toBe("function");
    });

    it("should return payloads for rows", () => {
      expect(payloads.length).toBe(2);
    });

    it("should return payload with dynamic values", () => {
      expect(payloads[0].email).toBe("a");
      expect(payloads[0].text1).toBe("b");
      expect(payloads[0].text2).toBe("c");
      expect(payloads[1].email).toBe("e");
      expect(payloads[1].text1).toBe("f");
      expect(payloads[1].text2).toBe("g");
    });
  });

  describe("_getModelsUsingRows", () => {
    const columns = [
      { column: 1, key: "email" },
      { column: 2, key: "text1" },
      { column: 3, key: "text2" }
    ];
    const modelBuilder = module._getModelsUsingRows(columns);
    const cells = ["a", "b", "c", "d"];

    const result = modelBuilder([], cells, 0);
    it("should add model to array", () => {
      expect(result.length).toBe(1);
    });
    it("should build model using column and key", () => {
      expect(result[0].email).toBe("a");
      expect(result[0].text1).toBe("b");
      expect(result[0].text2).toBe("c");
    });
  });

  describe("_getModelUsingCells", () => {
    const date = new Date();
    const columns = [
      { column: 1, key: "text1" },
      { column: 2, key: "text1" },
      { column: 3, key: "text1" },
      { column: 4, key: "text1" }
    ];
    const model = {} as any;
    const modelBuilder = module._getModelUsingCells(columns);

    const modelWithString = modelBuilder(model, "a", 0);
    const modelWithNumber = modelBuilder(model, 1, 1);
    const modelWithBoolean = modelBuilder(model, true, 2);
    const modelWithDate = modelBuilder(model, date, 2);

    it("should not mutate provided model", () => {
      expect(model.text1).toBeUndefined();
    });

    it("should add string value", () => {
      expect(modelWithString.text1).toBe("a");
    });

    it("should add number value", () => {
      expect(modelWithNumber.text1).toBe("1");
    });

    it("should add boolean value", () => {
      expect(modelWithBoolean.text1).toBe("true");
    });

    it("should add date value", () => {
      expect(modelWithDate.text1).toBe(date.toUTCString());
    });
  });

  describe("_getPayloads", () => {
    // Arrange
    const props = { email: "{{A}}", text1: "z" } as any;
    const payloadBuilder = module._getPayloads(props);

    const rows = [
      ["a", "b", "c", "d"],
      ["e", "f", "g", "h"]
    ] as IGetValuesResult;
    const range = {
      getValues: jest.fn().mockReturnValue(rows)
    };
    const sheet = {
      getRange: jest.fn().mockReturnValue(range),
      getLastColumn: jest.fn(),
      getLastRow: jest.fn()
    } as any;

    // Act
    const payloads = payloadBuilder(sheet);

    it("should return payload for each row", () => {
      expect(payloads.length).toBe(2);
    });
    it("should use static properties", () => {
      expect(payloads[0].text1).toBe("z");
    });
    it("should use dynamic properties", () => {
      expect(payloads[0].email).toBe("a");
      expect(payloads[1].email).toBe("e");
    });
  });

  describe("_getPrettyError", () => {
    const shortResponse: IApiResponseErrorModel = {
      message: "error"
    };
    const longResponse: IApiResponseErrorModel = {
      message: "error",
      errors: [
        {
          property: "property",
          message: "message"
        }
      ]
    };
    const short = module._getPrettyError(shortResponse);
    const long = module._getPrettyError(longResponse);

    it("should return errror message", () => {
      expect(typeof short).toBe("string");
      expect(typeof long).toBe("string");
    });

    it("should have more detailed message for detailed responses", () => {
      expect(long.length).toBeGreaterThan(short.length);
    });
  });

  describe("_isDynamicValue", () => {
    it("should return false when not dynamic", () => {
      expect(module._isDynamicValue(["text1", "a"])).toBe(false);
    });
    it("should return true when dynamic", () => {
      expect(module._isDynamicValue(["text1", "{{a}}"])).toBe(true);
    });
  });

  describe("_isIssued", () => {
    it("should return false when issued is undefined", () => {
      expect(module._isIssued({} as any)).toBe(false);
    });
    // Worth checking as not sure if GAS uses undefined or null for empty.
    it("should return false when issued is null", () => {
      expect(module._isIssued({ issued: null } as any)).toBe(false);
    });
    it("should return false when issued is letter other than y", () => {
      expect(module._isIssued({ issued: "a" })).toBe(false);
    });
    it("should return true when issued is lowercase y", () => {
      expect(module._isIssued({ issued: "y" })).toBe(true);
    });
    it(`should return true when issued is uppercase 'Y'`, () => {
      expect(module._isIssued({ issued: "Y" })).toBe(true);
    });
  });

  describe("_isVerified", () => {
    it("should return false when verified is undefined", () => {
      expect(module._isVerified({} as any)).toBe(false);
    });
    // Worth checking as not sure if GAS uses undefined or null for empty.
    it("should return false when verified is null", () => {
      expect(module._isVerified({ verified: null } as any)).toBe(false);
    });
    it("should return false when verified is letter other than y", () => {
      expect(module._isVerified({ verified: "a" })).toBe(false);
    });
    it("should return true when verified is lowercase y", () => {
      expect(module._isVerified({ verified: "y" })).toBe(true);
    });
    it("should return true when verified is uppercase y", () => {
      expect(module._isVerified({ verified: "Y" })).toBe(true);
    });
  });

  describe("_objectEntries", () => {
    it("should return array of arrays containing key and value", () => {
      const obj = {
        key: "value"
      };
      const result = module._objectEntries(obj);
      expect(result[0][0]).toBe("key");
      expect(result[0][1]).toBe("value");
    });
  });

  describe("_objectEntries", () => {
    it("should return array of values", () => {
      const obj = {
        key: "value"
      };
      const result = module._objectValues(obj);
      expect(result[0]).toBe("value");
    });
  });

  describe("_toDynamicColumn", () => {
    const input: any = ["text1", "{{A}}"];
    const result = module._toDynamicColumn(input);
    it("should remove brackets from value", () => {
      expect(result.value).toBe("A");
    });
    it("should contain column number", () => {
      expect(result.column).toBe(1);
    });
    it("should return key for model", () => {
      expect(result.key).toBe(input[0]);
    });
  });

  describe("_updateIssuedColumnForSheet", () => {
    const values = [[undefined], [null], [""], ["N"], ["Y"], ["N"]];
    const range = {
      getValues: jest.fn().mockReturnValue(values),
      setValues: jest.fn()
    };
    const sheet = {
      getLastRow: jest.fn(),
      getRange: jest.fn().mockReturnValue(range)
    } as any;
    const payloads = [{ rowIndex: 1 }, { rowIndex: 2 }, { rowIndex: 3 }] as any;
    const updateBuilder = module._updateIssuedColumnForSheet(sheet)(payloads);

    // Act
    updateBuilder({
      column: 1
    });

    const call = range.setValues.mock.calls[0][0];

    it("should not mutate values", () => {
      expect(values[1][0]).toEqual(null);
    });

    it("should update matching row index values", () => {
      expect(call[1]).toEqual(["Y"]);
      expect(call[2]).toEqual(["Y"]);
      expect(call[3]).toEqual(["Y"]);
    });

    it("should not update non matching row index values", () => {
      expect(call[0]).toEqual([undefined]);
      expect(call[5]).toEqual(["N"]);
    });
  });

  describe("_withStaticData", () => {
    const props = {
      apiKey: "a",
      text1: "b",
      text2: "c"
    } as any;
    const payloadBuilder = module._withStaticData(props);

    const payload = {
      text1: "exists"
    } as any;

    const result = payloadBuilder(payload);

    it("should not mutate provided payload", () => {
      expect(payload.text2).toBeUndefined();
      expect(result).not.toBe(payload);
    });

    it("should ignore api prefixed keys", () => {
      expect((result as any).apiKey).toBeUndefined();
    });

    it("should ignore existing values", () => {
      expect(result.text1).toBe("exists");
    });

    it("should update values using props", () => {
      expect(result.text2).toBe("c");
    });
  });

  describe("_valueOrDefault", () => {
    const run = (
      input: any,
      init: any,
      assert: <T extends {}>(value: T) => any
    ) => {
      const value = module._valueOrDefault(input, init);
      assert(value);
    };

    const valueCases = [
      { input: {}, init: { default: 1 } },
      { input: [], init: ["default"] },
      { input: true, init: false },
      { input: "input", init: "default" },
      { input: 5, init: 1 }
    ];

    for (const { input, init } of valueCases) {
      it(`should return value: ${JSON.stringify(
        input
      )} for input: ${JSON.stringify(input)}`, () => {
        run(input, init, (value) => {
          expect(init).not.toBe(value);
          expect(input).toBe(value);
        });
      });
    }

    const defaultCases = [
      { input: undefined, init: { default: 1 } },
      { input: null, init: ["default"] },
      { input: false, init: true },
      { input: "", init: "default" },
      { input: 0, init: 5 }
    ];

    for (const { input, init } of defaultCases) {
      it(`should return default value: ${JSON.stringify(
        init
      )} for input: ${JSON.stringify(input)}`, () => {
        run(input, init, (value) => {
          expect(input).not.toBe(value);
          expect(init).toBe(value);
        });
      });
    }
  });

  describe("_appendError", () => {
    // Arrange
    const input = "test";
    const error: IApiResponseError = {
      message: "12345",
      property: "67890"
    };

    // Act
    const result = module._appendError(input, error);

    // Assert
    it("should not mutate message", () => {
      expect(result).not.toBe(input);
    });
    it("should return new message using error", () => {
      expect(result).toContain("12345");
      expect(result).toContain("67890");
    });
  });
});

describe("Triggers & Events", () => {
  beforeEach(() => {
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
  });

  describe("onRun", () => {
    let range: GoogleAppsScript.Spreadsheet.Range;
    const ui = { alert: jest.fn() };
    // Setup the spreadsheet mock.
    const setupSpreadsheet = (values: any[][]) => {
      range = {
        getValues: jest.fn().mockReturnValue(values),
        setValues: jest.fn()
      } as any;
      const sheet: GoogleAppsScript.Spreadsheet.Sheet = {
        getLastRow: jest.fn().mockReturnValue(10),
        getLastColumn: jest.fn().mockReturnValue(10),
        getRange: jest.fn().mockReturnValue(range)
      } as any;

      global.SpreadsheetApp = {
        getActiveSheet: jest.fn().mockReturnValue(sheet),
        getUi: jest.fn().mockReturnValue(ui)
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
    const setupUrlFetch = (code: number, body?: string) => {
      const response: GoogleAppsScript.URL_Fetch.HTTPResponse = {
        getResponseCode: jest.fn().mockReturnValue(code),
        getContentText: jest.fn().mockReturnValue(body)
      } as any;
      global.UrlFetchApp = {
        fetch: jest.fn().mockReturnValue(response)
      } as any;
    };

    describe("when verified and issued are not used", () => {
      it("should not update sheet", () => {
        // Arrange
        const values = [["Y", ""]];
        setupSpreadsheet(values);
        setupProperties({});
        setupUrlFetch(200);
        // Act
        module.onRun();
        // Assert
        expect(range.setValues).not.toBeCalled();
      });
    });

    describe("when verified and issued are used", () => {
      describe("when is verified and issued is falsy", () => {
        it("should update issued column", () => {
          // Arrange
          const values = [["Y", ""]];
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
          const values = [["Y", "N"]];
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
          const values = [["Y", "Y"]];
          setupSpreadsheet(values);
          setupProperties({ verified: "{{A}}", issued: "{{B}}" });
          setupUrlFetch(200);
          // Act
          module.onRun();
          // Assert
          expect(range.setValues).toBeCalledWith(values);
        });
      });
    });

    describe("when request is successful", () => {
      it("should display success alert", () => {
        // Arrange
        const values = [["Y", ""], ["Y", ""]];
        setupSpreadsheet(values);
        setupProperties({ verified: "{{A}}", issued: "{{B}}" });
        setupUrlFetch(200);
        // Act
        module.onRun();
        // Assert
        expect(ui.alert).toBeCalledWith(expect.stringMatching("Sent 2 rows."));
      });
    });

    describe("when request is not successful", () => {
      describe("when response body has additional errors", () => {
        const body = {
          message: "test",
          errors: [{ property: "int1", message: "not int" }]
        };
        beforeAll(() => {
          // Arrange
          setupSpreadsheet([]);
          setupProperties({});
          setupUrlFetch(500, JSON.stringify(body));
          // Act
          module.onRun();
        });
        it("should display error message", () =>
          expect(ui.alert).toBeCalledWith(
            expect.stringContaining(body.message)
          ));
        it("should handle additional errors", () =>
          expect(ui.alert).toBeCalledWith(
            expect.stringContaining(body.errors[0].message)
          ));
      });
      describe("when response body has no additional errors", () => {
        const body = {
          message: "test"
        };
        beforeAll(() => {
          // Arrange
          setupSpreadsheet([]);
          setupProperties({});
          setupUrlFetch(500, JSON.stringify(body));
          // Act
          module.onRun();
        });
        it("should display error message", () =>
          expect(ui.alert).toBeCalledWith(
            expect.stringContaining(body.message)
          ));
      });
    });
  });
});
