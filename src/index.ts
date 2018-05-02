// Import the add-on components.
import { DEFAULT_PROPS } from "./constants";
import {
  addMenu,
  getDynamicProperties,
  getPayloads,
  getPrettyError,
  updateIssuedColumnForSheet
} from "./functions";

// Extend the global object so the top level functions can be assigned to it.
declare const global: {
  showSettingsSidebar: () => void;
  onRun: () => void;
  onSaveConfiguration: (props: DocumentProperties) => void;
  onInstall: () => void;
  onOpen: () => void;
};

/**
 * Runs when the spreadsheet is opened.
 *
 * @export
 * @returns {void}
 */
export function onOpen(): void {
  return addMenu();
}
global.onOpen = onOpen;

/**
 * Runs when the add-on is installed to a spreadsheet.
 *
 * @export
 * @returns {void}
 */
export function onInstall(): void {
  return addMenu();
}
global.onInstall = onInstall;

/**
 * Called by the settings template when the save button is clicked.
 *
 * @export
 * @param {DocumentProperties} props
 * @returns {Properties}
 */
export function onSaveConfiguration(props: DocumentProperties): Properties {
  return PropertiesService.getDocumentProperties().setProperties(props);
}
global.onSaveConfiguration = onSaveConfiguration;

/**
 * Start the sheet processing.
 *
 * @export
 * @returns {*}
 */
export function onRun(): any {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as DocumentProperties;

  // Get the payloads.
  const payloads = getPayloads(props)(sheet);

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

  // Make the request and handle the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);

  // Handle success response.
  const handleSuccess = () => {
    // TODO: This works fine but is a side-effect.
    // tslint:disable-next-line:no-expression-statement
    getDynamicProperties(props)
      .filter(x => x.key === "issued")
      .forEach(updateIssuedColumnForSheet(sheet)(payloads));

    return SpreadsheetApp.getUi().alert(
      `Sent ${payloads.length} row${payloads.length > 1 ? "s" : ""}.`
    );
  };

  // Handle error response.
  const handleError = () =>
    SpreadsheetApp.getUi().alert(
      getPrettyError(JSON.parse(response.getContentText()))
    );

  return response.getResponseCode() === 200 ? handleSuccess() : handleError();
}
global.onRun = onRun;

/**
 * Show the settings sidebar to the user so they can manage their settings and configuration.
 *
 * @export
 * @returns {void}
 */
export function showSettingsSidebar(): void {
  const savedProps = PropertiesService.getDocumentProperties().getProperties() as DocumentProperties;
  const props = { ...DEFAULT_PROPS, ...savedProps };

  const template = HtmlService.createTemplate(
    require("./templates/sheets-settings.sidebar.html")
  ) as SettingsHtmlTemplate;

  return SpreadsheetApp.getUi().showSidebar(
    Object.assign(template, props)
      .evaluate()
      .setTitle("Settings")
  );
}
global.showSettingsSidebar = showSettingsSidebar;
