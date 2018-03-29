import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

// Regex for checking {{dynamic properties}}.
const dynamicPropRgx = new RegExp(/{{.+}}/);
// Regex for checking properties starting with api such as apiKey apiToken etc.
const apiRgx = new RegExp(/(api)(\S+)/);

/**
 * Adds the OpenBadges menu to the toolbar
 */
function onOpen(): void {
  Logger.log("[onOpen] Adding menu to active spreadsheet.");
  // Add the options to the menu.
  const menus = [
    { name: "Settings", functionName: "showSettingsSidebar" },
    { name: "Run", functionName: "onRun" }
  ];
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", menus);
  Logger.log("[onOpen] Menu added.");
}

/**
 * Triggers the onOpen event.
 */
function onInstall(): void {
  Logger.log("[onInstall] Add-on starting install.");
  onOpen();
  Logger.log("[onInstall] Add-on finished install.");
}

/**
 * When the user has clicked the save button on the settings menu,
 * save the provided properties for use later.
 * @param {SheetsUserProperties} props
 */
function onSaveConfiguration(props: ISheetsDocumentProperties): void {
  // Save the properties so they can be used later.
  PropertiesService.getDocumentProperties().setProperties(props);
  Logger.log("[onSaveConfiguration] Saved properties successfully.");
}

/**
 * When the user has manually triggered the run event which will
 * try process the sheet and send the request.
 */
function onRun(): boolean {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();
  const numberOfRows = sheet.getLastRow();
  Logger.log(
    `[onRun] Processing starting for sheet (${
      sheet.getSheetId
    }) with ${numberOfRows} row(s).`
  );

  // Create the payloads object and initilize row.
  let payloads: ICreateActivityEvent[] = [];
  for (let i = 0; i < numberOfRows - 1; i++) {
    payloads[i] = {} as ICreateActivityEvent;
  }

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as ISheetsDocumentProperties;

  // Populate the payloads with dynamic data from the sheet.
  populateDynamicPayloads(props, payloads, sheet);

  // Populate the payloads with static data from the properties.
  populateStaticPayloads(props, payloads);

  const dynamicColumns = getDynamicColumns(props);
  const issuedColumn = dynamicColumns.filter((x) => x.key === "issued")[0];
  if (issuedColumn !== undefined) {
    Logger.log("[onRun] Tracking columns are in use.");
    // Filter the payloads and remove events which should not be issued yet.
    payloads = payloads.filter((x) => {
      // If using verified, it must be verified.
      if (x.verified.toUpperCase() !== "Y") {
        return false;
      }

      // Empty issued values have not been issued.
      if (!x.issued) {
        return true;
      }

      // Issued values must not already be issued.
      return x.issued.toUpperCase() !== "Y";
    });
  }

  Logger.log("[onRun] Payloads populated successfully.");

  // Build the request headers.
  const headers = {
    Authorization: `Bearer ${props.apiToken}`,
    ApiKey: props.apiKey
  };

  // Use the request headers and payload to create the request params.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    headers,
    payload: JSON.stringify(payloads),
    muteHttpExceptions: true
  };

  // Make the request and get the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);
  Logger.log("[onRun] Request was sent to API.");

  // If the response code is 200 Ok then we can stop processing as it was a successful request.
  const responseCode = response.getResponseCode();
  Logger.log(`[onRun] Response code was ${responseCode}.`);

  // Handle response error by logging result and displaying an error alert.
  if (responseCode !== 200) {
    const responseText = response.getContentText();
    Logger.log(`[onRun] Response body was ${responseText}`);
    const errorMessage = getPrettyError(JSON.parse(responseText));
    SpreadsheetApp.getUi().alert(errorMessage);
    return false;
  }

  // If we need to update the issued column that should be done now.
  if (issuedColumn !== undefined) {
    // Get the range for the issued column.
    const issuedRange = sheet.getRange(
      2,
      issuedColumn.column,
      numberOfRows - 1
    );
    const values = issuedRange.getValues() as IGetValuesResult;

    // Check whether the row was sent in the final payloads array and update it's value if it was sent.
    for (let i = 0; i < numberOfRows - 1; i++) {
      const wasIssued = payloads.filter((y) => y.rowIndex === i)[0];
      if (wasIssued !== undefined) {
        values[i] = ["Y"];
      }
    }
    // Execute the update.
    issuedRange.setValues(values);
    Logger.log("[onRun] Issued column was updated.");
  }

  SpreadsheetApp.getUi().alert(
    `Sent ${payloads.length} row${payloads.length > 1 ? "s" : ""}.`
  );
  return true;
}

/**
 * Returns a nicely formatted error message.
 * @param {IApiResponseErrorModel} res
 * @returns
 */
function getPrettyError(res: IApiResponseErrorModel) {
  const { message, errors } = res;
  let info = `An error occurred: ${message}`;
  if (errors !== undefined && errors.length > 0) {
    info += "\n\n";
    errors.forEach((x) => {
      info += `Property: ${x.property}`;
      info += "\n";
      info += `Reason: ${x.message}`;
      info += "\n\n";
    });
  }
  return info;
}

/**
 * Converts letters to a number.
 * https://stackoverflow.com/a/29040784/6387935 🙌
 * @param {string} letter
 * @returns {number}
 */
function convertLetterToNumber(letter: string): number {
  let out = 0;
  const len = letter.length;
  for (let pos = 0; pos < len; pos++) {
    out += (letter.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
  }
  return out;
}

/**
 * Gets the columns which have been set as dynamic from properties.
 * @param {ISheetsDocumentProperties} props
 */
function getDynamicColumns(props: ISheetsDocumentProperties) {
  return Object.keys(props)
    .filter((key) => dynamicPropRgx.test(props[key]))
    .map((key) => {
      const value = props[key].replace(/[{}]/g, "").toUpperCase();
      const column = convertLetterToNumber(value);
      return { key, value, column };
    });
}

/**
 * Populate the payloads with dynamic data from the sheet.
 * @param {ISheetsDocumentProperties} props
 * @param {ICreateActivityEvent[]} payloads
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function populateDynamicPayloads(
  props: ISheetsDocumentProperties,
  payloads: ICreateActivityEvent[],
  sheet: GoogleAppsScript.Spreadsheet.Sheet
) {
  const numberOfRows = sheet.getLastRow();
  const numberOfColumns = sheet.getLastColumn();
  const range = sheet.getRange(2, 1, numberOfRows - 1, numberOfColumns);
  const rows = range.getValues() as IGetValuesResult;
  const dynamicColumns = getDynamicColumns(props);

  rows.forEach((row, rowIndex) => {
    const model = {} as ICreateActivityEvent;
    row.forEach((cell, cellIndex) => {
      const column = dynamicColumns.filter(
        (x) => x.column - 1 === cellIndex
      )[0];
      if (column !== undefined) {
        if (cell instanceof Date) {
          model[column.key] = cell.toUTCString();
        } else {
          model[column.key] = cell.toString();
        }
      }
    });
    model.rowIndex = rowIndex;
    payloads[rowIndex] = model;
  });
}

/**
 * Populate the payloads with static data from the properties.
 * @param {ISheetsDocumentProperties} props
 * @param {ICreateActivityEvent[]} payloads
 */
function populateStaticPayloads(
  props: ISheetsDocumentProperties,
  payloads: ICreateActivityEvent[]
) {
  // Set the static properties on the payload objects.
  Object.keys(props)
    .map((key) => ({ key, value: props[key] }))
    .filter((prop) => !apiRgx.test(prop.key))
    .forEach((prop) =>
      payloads
        .filter((payload) => payload[prop.key] === undefined)
        .forEach((payload) => (payload[prop.key] = prop.value))
    );
}

/**
 * Show the settings sidebar to the user so they can manage their settings and configuration.
 */
function showSettingsSidebar(): void {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplate(
    settingsSidebarTemplate
  ) as ISheetsSettingsTemplate;
  Logger.log(`[showSettingsSidebar] Template created.`);

  // Add the bound properties to the template.
  const documentProperties = PropertiesService.getDocumentProperties();
  const savedProps = documentProperties.getProperties() as ISheetsDocumentProperties;

  const defaultProps = {
    apiKey: "",
    apiUrl: "",
    apiToken: "",
    activityId: "",
    text1: "",
    text2: "",
    int1: "",
    int2: "",
    date1: "",
    activityTime: "",
    userId: "",
    firstName: "",
    lastName: "",
    verified: "",
    issued: ""
  };

  const props: ISheetsDocumentProperties = Object.assign(
    {},
    defaultProps,
    savedProps
  );

  Logger.log(
    `[showSettingsSidebar] Default properties overwritten by user properties.`
  );

  Object.keys(props)
    .map((key) => ({ key, value: props[key] }))
    .forEach((prop) => {
      template[prop.key] = prop.value || "";
    });
  Logger.log(`[showSettingsSidebar] Properties bound to template.`);

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate().setTitle("Settings");
  Logger.log(`[showSettingsSidebar] Template evaluated as HTML.`);

  // Create the sidebar from the HTML.
  SpreadsheetApp.getUi().showSidebar(html);
  Logger.log(`[showSettingsSidebar] Sidebar displayed successfully.`);
}

export {
  onOpen,
  onInstall,
  onSaveConfiguration,
  onRun,
  showSettingsSidebar,
  populateDynamicPayloads,
  populateStaticPayloads,
  getDynamicColumns
};
