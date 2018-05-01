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
import { SettingsHtmlTemplate } from "./models";
import { CreateActivityEvent } from "./models/create-activity-event";
import { DocumentProperties } from "./models/document-properties";

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
  addMenu();
}
global.onOpen = onOpen;

/**
 * Runs when the add-on is installed to a spreadsheet.
 * @export
 */
export function onInstall(): void {
  addMenu();
}
global.onInstall = onInstall;

/**
 * Called by the settings template when the save button is clicked.
 * @param {DocumentProperties} props
 * @export
 */
export function onSaveConfiguration(props: DocumentProperties): void {
  PropertiesService.getDocumentProperties().setProperties(props);
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

  // Populate the models with dynamic and static data.
  let payloads = getPayloads(props)(sheet);

  // If the sheet uses issued, remove the payloads for events which
  // should not be issued OR have already been issued.
  const trackingColumns = getDynamicProperties(props).filter(
    x => x.key === "issued" || "verified"
  );

  // Remove any payloads using the tracking columns if they have not been verified.
  const verifiedColumn = trackingColumns.filter(x => x.key === "verified");
  verifiedColumn.forEach(() => {
    const predicates: Array<Predicate<CreateActivityEvent>> = [
      x => !!x.verified,
      x => x.verified.toUpperCase() === "Y"
    ];
    payloads = payloads.filter(and(predicates));
  });

  // Remove any payloads using the tracking columns if they have already been issued.
  const issuedColumn = trackingColumns.filter(x => x.key === "issued");
  issuedColumn.forEach(() => {
    const predicates: Array<Predicate<CreateActivityEvent>> = [
      x => !x.issued,
      x => x.issued.toUpperCase() !== "Y"
    ];
    payloads = payloads.filter(and(predicates));
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
  const handleSuccess = () => {
    issuedColumn.forEach(updateIssuedColumnForSheet(sheet)(payloads));
    const message = `
      Sent ${payloads.length} row${payloads.length > 1 ? "s" : ""}.
    `;
    SpreadsheetApp.getUi().alert(message);
  };

  // TODO: Placed somewhere better and tidy up.
  const handleError = () => {
    const responseText = response.getContentText();
    Logger.log(`[onRun] Response body was ${responseText}`);
    const message = getPrettyError(JSON.parse(responseText));
    SpreadsheetApp.getUi().alert(message);
  };

  // Make the request and handle the response.
  const response = UrlFetchApp.fetch(props.apiUrl, options);
  response.getResponseCode() === 200 ? handleSuccess() : handleError();
}
global.onRun = onRun;

/**
 * Show the settings sidebar to the user so they can manage their settings and configuration.
 * @export
 */
export function showSettingsSidebar(): void {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplate(
    require("./templates/sheets-settings.sidebar.html")
  ) as SettingsHtmlTemplate;

  // Add the bound properties to the template.
  const documentProperties = PropertiesService.getDocumentProperties();
  const savedProps = documentProperties.getProperties() as DocumentProperties;

  // Use the default props as a base for the saved props so that they are all defined on the template.
  const props = { ...DEFAULT_PROPS, ...savedProps };

  // Bind the props to the template.
  Object.entries(props).forEach(([k, v]) => (template[k] = v || ""));

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate().setTitle("Settings");

  // Create the sidebar from the HTML.
  SpreadsheetApp.getUi().showSidebar(html);
}
global.showSettingsSidebar = showSettingsSidebar;
