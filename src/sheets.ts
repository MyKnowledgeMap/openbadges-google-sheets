import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

// Regex for checking {{dynamic properties}}.
const dynamicPropRgx = new RegExp(/{{.+}}/);
// Regex for checking properties starting with api such as apiKey apiToken etc.
const apiRgx = new RegExp(/(api)(\S+)/);

/**
 * Adds the OpenBadges menu to the toolbar
 */
function onOpen(): void {
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
function onRun(): void {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Create the payloads object and initilize row.
  const payloads: ICreateActivityEvent[] = [];
  for (let i = 0; i < lastRow - 1; i++) {
    payloads[i] = {} as ICreateActivityEvent;
  }

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as ISheetsDocumentProperties;

  // Find columns which we need to use the dynamic value for.
  Object.keys(props)
    .filter((key) => dynamicPropRgx.test(props[key]))
    .map((key) => ({
      key,
      value: props[key]
        .toLowerCase()
        .replace("{{", "")
        .replace("}}", "")
    }))
    // Loop through the dynamic columns and get all values for the column
    // and assign each value to their corresponding payload.
    .forEach((column) => {
      // Create the query for the current column using A1 notation.
      const query = `${column.value}2:${column.value}${lastRow}`;

      // Get all values for this column using the query.
      const values = (sheet.getRange(query).getValues() as IGetValuesResult)
        // GetValues returns an Object[row][column] and we only care about the first
        // column so project to the column.
        .map((value) => value[0])
        .forEach((value, rowIndex) => {
          // Dates have to be handled differently since toString() will
          // produce a value that the service cannot parse.
          if (value instanceof Date) {
            payloads[rowIndex][column.key] = value.toUTCString();
          } else {
            payloads[rowIndex][column.key] = value.toString();
          }
        });
    });

  // Set the static properties on the payload objects.
  Object.keys(props)
    .map((key) => ({ key, value: props[key] }))
    .filter((prop) => !apiRgx.test(prop.key))
    .forEach((prop) =>
      payloads
        .filter((payload) => payload[prop.key] === undefined)
        .forEach((payload) => (payload[prop.key] = prop.value))
    );

  // Build the request header.
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

  Logger.log(JSON.stringify(payloads));

  // Make the request and get the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);

  // If the response code is 200 Ok then we can stop processing as it was a successful request.
  if (response.getResponseCode() !== 200) {
    Logger.log(response.getContentText());
  }
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

export { onOpen, onInstall, onSaveConfiguration, onRun, showSettingsSidebar };
