import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

//#region Constants

// The default property model.
const DEFAULT_PROPS = Object.freeze({
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

// The menu used by the add-on.
const MENU = [
  { name: "Settings", functionName: "showSettingsSidebar" },
  { name: "Run", functionName: "onRun" }
];

//#endregion Constants

//#region Pure functions

/**
 * Object.values shim
 * @param {{ [key: string]: any }} input
 */
const _objectValues = (input: { [key: string]: any }) =>
  Object.keys(input).map((key) => input[key]);

/**
 * Object.entries shim
 * @param {{ [key: string]: any }} input
 */
const _objectEntries = (input: { [key: string]: any }) =>
  Object.keys(input).map((key) => [key, input[key]]) as Array<[string, any]>;

/**
 * Returns the value if truthy or returns the provided init value.
 * @template T
 * @param {T} input
 * @param {T} init
 */
const _valueOrDefault = <T extends {}>(input: T, init: T) =>
  !input ? init : input;

/**
 * Convert a string to numbers using the character code for each letter.
 * https://stackoverflow.com/a/29040784/6387935 🙌
 * @param {string} letters
 */
const _convertStringToNumber = (letters: string) =>
  letters
    .split("")
    .reduce(
      (acc: number, curr: string, index: number, arr: string[]) =>
        acc + (curr.charCodeAt(0) - 64) * Math.pow(26, arr.length - index - 1),
      0
    );

/**
 * Update the issued column for any rows which were sent to the API.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
const _updateIssuedColumnForSheet = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
) => (payloads: ICreateActivityEvent[]) => (issuedColumn: {
  column: number;
}) => {
  const numberOfRows = sheet.getLastRow();
  // Get the range for the issued column.
  const range = sheet.getRange(2, issuedColumn.column, numberOfRows - 1);
  const values = range.getValues();

  // Create the update from the existing values.
  const newValues = [...values];
  payloads.map((x) => x.rowIndex).forEach((i) => (newValues[i] = ["Y"]));

  // Execute the update.
  range.setValues(newValues);
};

/**
 * Add the menu to the active spreadsheet.
 */
const _addMenu = () =>
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", MENU);

/**
 * Add to the error message using the error model.
 * @param {string} message
 * @param {IApiResponseError} error
 * @returns
 */
const _appendError = (message: string, error: IApiResponseError) => {
  message += `
    Property: ${error.property}\n
    Reason: ${error.message}\n\n
  `;
  return message;
};

/**
 * Create a nicely formatted error message.
 * @param {IApiResponseErrorModel} response
 * @returns
 */
const _getPrettyError = (response: IApiResponseErrorModel) => {
  const { message, errors } = { ...response };
  return _valueOrDefault(errors!, []).reduce(
    _appendError,
    `An error occurred: ${message}\n\n`
  );
};

/**
 * Check whether the value is dynamic.
 * @param {[string, any]} [key, value]
 */
const _isDynamicValue = ([key, value]: [string, any]) => /{{.+}}/.test(value);

/**
 * Create a representation of a dynamic column object with values for key, value and column number.
 * @param {[string, any]} [key, value]
 */
const _toDynamicColumn = ([key, valueWithBrackets]: [string, any]) => {
  const value = valueWithBrackets.replace(/[{}]/g, "").toUpperCase();
  return {
    key,
    value,
    column: _convertStringToNumber(value)
  };
};

/**
 * Build a model for a row using the dynamic columns.
 * @param {Array<{ column: number; key: string }>} columns
 */
const _getModelUsingCells = (
  columns: Array<{ column: number; key: string }>
) => (
  acc: ICreateActivityEvent,
  cell: string | number | boolean | Date,
  index: number
) => {
  const model = { ...acc };
  const column = columns.filter((x) => x.column - 1 === index);
  const value = cell instanceof Date ? cell.toUTCString() : cell.toString();
  column.forEach((c) => (model[c.key] = value));
  return model;
};

/**
 * Build all the models for a sheet using the dyanmic columns.
 * @param {Array<{ column: number; key: string }>} columns
 */
const _getModelsUsingRows = (
  columns: Array<{ column: number; key: string }>
) => (
  models: ICreateActivityEvent[],
  cells: Array<string | number | boolean | Date>,
  index: number
) => {
  const model = cells.reduce(
    _getModelUsingCells(columns),
    {} as ICreateActivityEvent
  );
  model.rowIndex = index;
  models[index] = model;
  return models;
};

/**
 * Build the payloads using dynamic and static data from the sheet and props.
 * @param {ISheetsDocumentProperties} props
 */
const _getPayloads = (props: ISheetsDocumentProperties) => (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
) => _getDynamicPayloads(props)(sheet).map(_withStaticData(props));

/**
 * Populate the payloads with dynamic data from the sheet.
 * @param {ISheetsDocumentProperties} props
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
const _getDynamicPayloads = (props: ISheetsDocumentProperties) => (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
) => {
  const numberOfRows = sheet.getLastRow();
  const numberOfColumns = sheet.getLastColumn();
  const range = sheet.getRange(2, 1, numberOfRows - 1, numberOfColumns);
  const rows = range.getValues() as IGetValuesResult;
  const dynamicColumns = _getDynamicColumns(props);
  return rows.reduce(_getModelsUsingRows(dynamicColumns), []);
};

/**
 * Populate the payloads with static data from the properties.
 * @param {ISheetsDocumentProperties} props
 */
const _withStaticData = (props: ISheetsDocumentProperties) => (
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
 * Gets the columns which have been set as dynamic from properties.
 * @param {ISheetsDocumentProperties} props
 */
const _getDynamicColumns = (props: ISheetsDocumentProperties) =>
  _objectEntries(props)
    .filter(_isDynamicValue)
    .map(_toDynamicColumn);

/**
 * Whether the object is verified or not.
 * @param {({ verified: string | undefined })} e
 */
const _isVerified = (e: { verified: string | undefined }) =>
  !!e.verified && e.verified.toUpperCase() === "Y";

/**
 * Whether the object is issued or not.
 * @param {({ issued: string | undefined })} e
 */
const _isIssued = (e: { issued: string | undefined }) =>
  !!e.issued && e.issued.toUpperCase() === "Y";

export {
  _addMenu,
  _appendError,
  _convertStringToNumber,
  _getDynamicColumns,
  _getDynamicPayloads,
  _getModelsUsingRows,
  _getModelUsingCells,
  _getPayloads,
  _getPrettyError,
  _isDynamicValue,
  _isIssued,
  _isVerified,
  _objectEntries,
  _objectValues,
  _valueOrDefault,
  _toDynamicColumn,
  _updateIssuedColumnForSheet,
  _withStaticData
};

//#endregion Pure functions

//#region Triggers & events

/**
 * Runs when the spreadsheet is opened.
 */
function onOpen(): void {
  _addMenu();
}

/**
 * Runs when the add-on is installed to a spreadsheet..
 */
function onInstall(): void {
  _addMenu();
}

/**
 * Called by the settings template when the save button is clicked.
 * @param {ISheetsDocumentProperties} props
 */
function onSaveConfiguration(props: ISheetsDocumentProperties): void {
  PropertiesService.getDocumentProperties().setProperties(props);
}

/**
 * Start the sheet processing.
 * @returns
 */
function onRun(): void {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();
  const numberOfRows = sheet.getLastRow();

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as ISheetsDocumentProperties;

  // Populate the models with dynamic and static data.
  let payloads = _getPayloads(props)(sheet);

  // If the sheet uses issued, remove the payloads for events which
  // should not be issued OR have already been issued.
  const trackingColumns = _getDynamicColumns(props).filter(
    (col) => col.key === "issued" || "verified"
  );

  // Remove any payloads using the tracking columns if they have not been verified.
  const verifiedColumn = trackingColumns.filter((x) => x.key === "verified");
  verifiedColumn.forEach(() => {
    payloads = payloads.filter((x) => _isVerified(x));
  });

  // Remove any payloads using the tracking columns if they have already been issued.
  const issuedColumn = trackingColumns.filter((x) => x.key === "issued");
  issuedColumn.forEach(() => {
    payloads = payloads.filter((x) => !_isIssued(x));
  });

  // Create the request object.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${props.apiToken}`,
      ApiKey: props.apiKey
    },
    payload: JSON.stringify(payloads),
    muteHttpExceptions: true
  };

  // TODO: Placed somewhere better and tidy up.
  const _handleSuccess = () => {
    issuedColumn.forEach(_updateIssuedColumnForSheet(sheet)(payloads));
    const message = `
      Sent ${payloads.length} row${payloads.length > 1 ? "s" : ""}.
    `;
    SpreadsheetApp.getUi().alert(message);
  };

  // TODO: Placed somewhere better and tidy up.
  const _handleError = () => {
    const responseText = response.getContentText();
    Logger.log(`[onRun] Response body was ${responseText}`);
    const message = _getPrettyError(JSON.parse(responseText));
    SpreadsheetApp.getUi().alert(message);
  };

  // Make the request and handle the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);
  response.getResponseCode() === 200 ? _handleSuccess() : _handleError();
}

/**
 * Show the settings sidebar to the user so they can manage their settings and configuration.
 */
function showSettingsSidebar(): void {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplate(
    settingsSidebarTemplate
  ) as ISheetsSettingsTemplate;

  // Add the bound properties to the template.
  const documentProperties = PropertiesService.getDocumentProperties();
  const savedProps = documentProperties.getProperties() as ISheetsDocumentProperties;
  const props = { ...DEFAULT_PROPS, ...savedProps };
  _objectEntries(props).forEach(
    ([key, value]) => (template[key] = value || "")
  );

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate().setTitle("Settings");

  // Create the sidebar from the HTML.
  SpreadsheetApp.getUi().showSidebar(html);
}

export { onOpen, onInstall, onSaveConfiguration, onRun, showSettingsSidebar };

//#endregion Triggers & Events
