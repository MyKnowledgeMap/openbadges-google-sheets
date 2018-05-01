// Import polyfills / shims first.
import "core-js/fn/object/assign";
import "core-js/fn/object/entries";

// Import the add-on components.
import { DEFAULT_PROPS } from "./constants";
import {
  addMenu,
  and,
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
 * @export
 */
export function onOpen(): void {
  return addMenu();
}
global.onOpen = onOpen;

/**
 * Runs when the add-on is installed to a spreadsheet.
 * @export
 */
export function onInstall(): void {
  return addMenu();
}
global.onInstall = onInstall;

/**
 * Called by the settings template when the save button is clicked.
 * @param {DocumentProperties} props
 * @export
 */
export function onSaveConfiguration(props: DocumentProperties): Properties {
  return PropertiesService.getDocumentProperties().setProperties(props);
}
global.onSaveConfiguration = onSaveConfiguration;

/**
 * Start the sheet processing.
 * @export
 */
export function onRun(): void {
  // Get the current sheet and get total the number of rows.
  const sheet = SpreadsheetApp.getActiveSheet();

  // Get the document properties.
  const props = PropertiesService.getDocumentProperties().getProperties() as DocumentProperties;

  const verifiedPredicates: ReadonlyArray<Predicate<CreateActivityEvent>> = [
    x => !!x.verified,
    x => x.verified.toUpperCase() === "Y"
  ];

  const issuedPredicates: ReadonlyArray<Predicate<CreateActivityEvent>> = [
    x => !x.issued,
    x => x.issued.toUpperCase() !== "Y"
  ];

  // Populate the models with dynamic and static data.
  const payloads = getPayloads(props)(sheet)
    .filter(and(verifiedPredicates))
    .filter(and(issuedPredicates));

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
  // tslint:disable:no-expression-statement
  const handleSuccess = () => {
    getDynamicProperties(props)
      .filter(x => x.key === "issued")
      .forEach(updateIssuedColumnForSheet(sheet)(payloads));
    const message = `
      Sent ${payloads.length} row${payloads.length > 1 ? "s" : ""}.
    `;
    SpreadsheetApp.getUi().alert(message);
  };
  const handleError = () => {
    const responseText = response.getContentText();
    const message = getPrettyError(JSON.parse(responseText));
    SpreadsheetApp.getUi().alert(message);
  };
  // tslint:enable:no-expression-statement

  // Make the request and handle the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);
  return response.getResponseCode() === 200 ? handleSuccess() : handleError();
}
global.onRun = onRun;

/**
 * Show the settings sidebar to the user so they can manage their settings and configuration.
 * @export
 */
export function showSettingsSidebar(): void {
  // Create the app template from the HTML template.

  // Add the bound properties to the template.
  const documentProperties = PropertiesService.getDocumentProperties();
  const savedProps = documentProperties.getProperties() as DocumentProperties;

  // Use the default props as a base for the saved props so that they are all defined on the template.
  const props = { ...DEFAULT_PROPS, ...savedProps };

  const template = HtmlService.createTemplate(
    require("./templates/sheets-settings.sidebar.html")
  );

  const templateMutator = (prev: any, [key, value]: [string, string]) => ({
    ...prev,
    [key]: value || ""
  });

  // Create the sidebar from the HTML.
  return SpreadsheetApp.getUi().showSidebar(
    Object.assign(template, Object.entries(props).reduce(templateMutator, {}))
      .evaluate()
      .setTitle("Settings")
  );
}
global.showSettingsSidebar = showSettingsSidebar;
