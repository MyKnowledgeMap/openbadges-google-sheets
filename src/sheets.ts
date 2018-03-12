import authEmailTemplate from "./templates/auth.email.html";
import authModalTemplate from "./templates/auth.modal.html";
import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

/**
 * The onOpen event function which runs when the document/sheet is opened.
 */
function onOpen(): void {
  const menus = [
    { name: "Settings", functionName: "showSettingsSidebar" },
    { name: "Run", functionName: "onTrigger" }
  ];
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", menus);
}

/**
 * The onInstall event function which runs when the app script is installed.
 */
function onInstall(): void {
  onOpen();
}

/**
 * The onSaveconfig event function which runs when the user has
 * saved their OpenBadges config within the google app.
 * @param {SheetsUserProperties} props
 */
function onSaveConfiguration(props: SheetsUserProperties): void {
  // TODO: Validate the provided config, throw errors if validation fails.

  // Save the properties so they can be used later.
  PropertiesService.getDocumentProperties().setProperties(props);
}

function onTrigger(): void {
  return;
}

/**
 * Send an email using the SendGrid API.
 * https://sendgrid.com/docs/API_Reference/api_v3.html
 * @param {string} to the email address the email should be sent to.
 * @param {string} subject the subject of the email.
 * @param {string} body the body of the email.
 * @param {string} contentType the content type of the email body.
 */
function sendEmail(
  to: string,
  subject: string,
  body: string,
  contentType: string
): void {
  // Create the header with the api key.
  const headers = {
    Authorization: "Bearer " + process.env.SENDGRID_KEY!
  };

  // Create the request payload.
  const payload = {
    personalizations: [
      {
        to: [
          {
            email: to
          }
        ],
        subject
      }
    ],
    from: {
      email: process.env.ERROR_EMAIL!
    },
    content: [
      {
        type: contentType,
        value: body
      }
    ]
  };

  // Create the URL request options.
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers,
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  // Make the request.
  const response = UrlFetchApp.fetch(process.env.SENDGRID_URL!, options);
}

/**
 * The showConfigurationModal user interface.
 */
function showSettingsSidebar(): void {
  // Create the app template from the HTML template.
  const template = HtmlService.createTemplate(
    settingsSidebarTemplate
  ) as SheetsSettingsTemplate;

  // Add the bound properties to the template.
  const props = PropertiesService.getDocumentProperties().getProperties() as SheetsUserProperties;
  template.apiKey = props.apiKey || "";
  template.apiToken = props.apiToken || "";
  template.apiUrl = props.apiUrl || "";
  template.activityId = props.activityId || "";
  template.text1 = props.text1 || "";
  template.int1 = props.int1 || "";
  template.int2 = props.int2 || "";
  template.date1 = props.date1 || "";
  template.timestamp = props.timestamp || "";

  // Evaluate the template to HTML so bindings are rendered.
  const html = template.evaluate().setTitle("Settings");

  // Create the sidebar from the HTML.
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * The showAuthModal user interface.
 */
function showAuthModal(): void {
  // Create the template.
  const template = HtmlService.createTemplate(
    authModalTemplate
  ) as AuthTemplate;

  // Add the auth URL to the template.
  const authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  template.authUrl = authInfo.getAuthorizationUrl();

  // Evaluate the template to HTML so bindings are rendered.
  const html = template
    .evaluate()
    .setHeight(200)
    .setWidth(300);

  // Create the modal from the HTML.
  SpreadsheetApp.getUi().showModalDialog(html, "Authorization required");
}
