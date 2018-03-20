import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

// Regex for checking {{dynamic properties}}.
const dynamicPropRgx = new RegExp(/{{.+}}/);
// Regex for checking properties starting with api such as apiKey apiToken etc.
const apiRgx = new RegExp(/(api)(\S+)/);

/**
 * Adds the OpenBadges menu to the toolbar
 */
function onOpen(): void {
  // Default the properties so the user
  // will always be able to open the settings menu.
  const documentProperties = PropertiesService.getDocumentProperties();
  let props = documentProperties.getProperties();
  if (Object.keys(props).length === 0) {
    props = {
      apiKey: "",
      apiUrl: "",
      apiToken: "",
      activityId: "",
      text1: "",
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
    documentProperties.setProperties(props);
  }

  // Add the options to the menu.
  const menus = [
    { name: "Settings", functionName: "showSettingsSidebar" },
    { name: "Run", functionName: "onRun" }
  ];
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", menus);
}

/**
 * Triggers the onOpen event.
 */
function onInstall(): void {
  onOpen();
}

/**
 * When the user has clicked the save button on the settings menu,
 * save the provided properties for use later.
 * @param {SheetsUserProperties} props
 */
function onSaveConfiguration(props: ISheetsDocumentProperties): void {
  // Save the properties so they can be used later.
  PropertiesService.getDocumentProperties().setProperties(props);
}

/**
 * When the user has manually triggered the run event which will
 * try process the sheet and send the request.
 */
function onRun(): boolean {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();
  const numberOfRows = sheet.getLastRow();

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
    // Filter the payloads and see if we're using verified and issued,
    // if so remove events which should not be issued yet.
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

    // Update the issued column using the payloads object.
    const issuedRange = sheet.getRange(
      2,
      issuedColumn.column,
      numberOfRows - 1
    );
    const values = issuedRange.getValues() as IGetValuesResult;
    for (let i = 0; i < numberOfRows - 1; i++) {
      const wasIssued = payloads.filter((y) => y.rowIndex === i)[0];
      if (wasIssued !== undefined) {
        values[i] = ["Y"];
      }
    }
    issuedRange.setValues(values);
  }

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

  if (responseCode === 200) {
    SpreadsheetApp.getUi().alert(`Sent ${payloads.length} events`);
    return true;
  }
  Logger.log(response.getContentText());
  return false;
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
    .map((key) => ({
      key,
      value: props[key]
        .toUpperCase()
        .replace("{{", "")
        .replace("}}", "")
    }))
    .map((prop) => ({
      key: prop.key,
      value: prop.value,
      column: convertLetterToNumber(prop.value)
    }));
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
  // const query = `A2:${lastColumn}${lastRow}`;
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

  // Add the bound properties to the template.
  const props = PropertiesService.getDocumentProperties().getProperties() as ISheetsDocumentProperties;
  Object.keys(props)
    .map((key) => ({ key, value: props[key] }))
    .forEach((prop) => {
      template[prop.key] = prop.value || "";
    });

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate().setTitle("Settings");

  // Create the sidebar from the HTML.
  SpreadsheetApp.getUi().showSidebar(html);
}

export {
  onOpen,
  onInstall,
  onSaveConfiguration,
  onRun,
  showSettingsSidebar,
  populateDynamicPayloads,
  populateStaticPayloads
};
