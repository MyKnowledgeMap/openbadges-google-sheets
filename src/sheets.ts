import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

/* Helper functions */
const _objectValues = (input: { [key: string]: any }) =>
  Object.keys(input).map((key) => input[key]);

const _objectEntries = (input: { [key: string]: any }) =>
  Object.keys(input).map((key) => [key, input[key]]) as Array<[string, any]>;

/* Constants */
const DEFAULT_PROPS: ISheetsDocumentProperties = Object.freeze({
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
});

/**
 * Adds the OpenBadges menu to the toolbar
 */
const addMenu = () =>
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", [
    { name: "Settings", functionName: "showSettingsSidebar" },
    { name: "Run", functionName: "onRun" }
  ]);
const onOpen = addMenu;
const onInstall = addMenu;

/**
 * When the user has clicked the save button on the settings menu,
 * save the provided properties for use later.
 * @param {ISheetsDocumentProperties} props
 */
const onSaveConfiguration = (props: ISheetsDocumentProperties) =>
  PropertiesService.getDocumentProperties().setProperties(props);

/**
 * When the user has manually triggered the run event which will
 * try process the sheet and send the request.
 */
const onRun = () => {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();
  const numberOfRows = sheet.getLastRow();

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as ISheetsDocumentProperties;

  // Populate the models with dynamic and static data.
  let payloads = getDynamicPayloads(props)(sheet).map(getStaticPayloads(props));

  const dynamicColumns = getDynamicColumns(props);
  const issuedColumn = dynamicColumns.filter((x) => x.key === "issued")[0];
  if (issuedColumn !== undefined) {
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
    updateIssuedColumnForSheet(sheet)(issuedColumn)(payloads);
  }

  SpreadsheetApp.getUi().alert(
    `Sent ${payloads.length} row${payloads.length > 1 ? "s" : ""}.`
  );
  return true;
};

/**
 * If the sheet is using the issued column the issued column needs updating for any rows which were sent to the API.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
const updateIssuedColumnForSheet = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
) => (issuedColumn: { column: number }) => (
  payloads: ICreateActivityEvent[]
) => {
  const numberOfRows = sheet.getLastRow();
  // Get the range for the issued column.
  const issuedRange = sheet.getRange(2, issuedColumn.column, numberOfRows - 1);
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
};

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
    errors.forEach((error) => {
      info += `Property: ${error.property}`;
      info += "\n";
      info += `Reason: ${error.message}`;
      info += "\n\n";
    });
  }
  return info;
}

const getCharCodeTotal = (
  acc: number,
  curr: string,
  index: number,
  arr: string[]
) => acc + (curr.charCodeAt(0) - 64) * Math.pow(26, arr.length - index - 1);

/**
 * Converts column notation to a number.
 * https://stackoverflow.com/a/29040784/6387935 🙌
 * @param {string} letters
 * @returns {number}
 */
const convertColumnNotationToNumber = (letters: string): number =>
  letters.split("").reduce(getCharCodeTotal, 0);

/**
 * Check whether the value is dynamic.
 * @param {[string, any]} [key, value]
 */
const isDynamicValue = ([key, value]: [string, any]) => /{{.+}}/.test(value);

/**
 * Create a representation of a dynamic column object with values for key, value and column number.
 * @param {[string, any]} [key, value]
 */
const getDynamicColumn = ([key, value]: [string, any]) => ({
  key,
  value: value.replace(/[{}]/g, "").toUpperCase(),
  column: convertColumnNotationToNumber(value)
});

/**
 * Gets the columns which have been set as dynamic from properties.
 * @param {ISheetsDocumentProperties} props
 */
const getDynamicColumns = (props: ISheetsDocumentProperties) =>
  _objectEntries(props)
    .filter(isDynamicValue)
    .map(getDynamicColumn);

/**
 * Build a model for a row using the dynamic columns.
 * @param {Array<{ column: number; key: string }>} columns
 */
const getModelUsingCells = (
  columns: Array<{ column: number; key: string }>
) => (
  acc: ICreateActivityEvent,
  value: string | number | boolean | Date,
  index: number
) => {
  const column = columns.filter((x) => x.column - 1 === index)[0];
  if (column !== undefined) {
    if (value instanceof Date) {
      acc[column.key] = value.toUTCString();
    } else {
      acc[column.key] = value.toString();
    }
  }
  return acc;
};

/**
 * Build all the models for a sheet using the dyanmic columns.
 * @param {Array<{ column: number; key: string }>} columns
 */
const getModelsUsingRows = (
  columns: Array<{ column: number; key: string }>
) => (
  models: ICreateActivityEvent[],
  cells: Array<string | number | boolean | Date>,
  index: number
) => {
  const model = cells.reduce(
    getModelUsingCells(columns),
    {} as ICreateActivityEvent
  );
  model.rowIndex = index;
  models[index] = model;
  return models;
};

/**
 * Populate the payloads with dynamic data from the sheet.
 * @param {ISheetsDocumentProperties} props
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
const getDynamicPayloads = (props: ISheetsDocumentProperties) => (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
) => {
  const numberOfRows = sheet.getLastRow();
  const numberOfColumns = sheet.getLastColumn();
  const range = sheet.getRange(2, 1, numberOfRows - 1, numberOfColumns);
  const rows = range.getValues() as IGetValuesResult;
  const dynamicColumns = getDynamicColumns(props);
  return rows.reduce(getModelsUsingRows(dynamicColumns), []);
};

/**
 * Populate the payloads with static data from the properties.
 * @param {ISheetsDocumentProperties} props
 */
const getStaticPayloads = (props: ISheetsDocumentProperties) => (
  payload: ICreateActivityEvent
) => {
  const updated: { [key: string]: any } = {};
  _objectEntries(props)
    .filter(([key, value]) => !/(api)(\S+)/.test(key))
    .filter(([key, value]) => payload[key] === undefined)
    .forEach(([key, value]) => (updated[key] = value));
  return { ...payload, ...updated } as ICreateActivityEvent;
};

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
  const props = { ...DEFAULT_PROPS, ...savedProps };

  Logger.log(
    `[showSettingsSidebar] Default properties overwritten by user properties.`
  );

  _objectEntries(props).forEach(
    ([key, value]) => (template[key] = value || "")
  );
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
  getDynamicColumns
};
