import authEmailTemplate from "./templates/auth.email.html";
import authModalTemplate from "./templates/auth.modal.html";
import settingsSidebarTemplate from "./templates/sheets-settings.sidebar.html";

function onOpen(): void {
  const menus = [
    { name: "Settings", functionName: "showSettingsSidebar" },
    { name: "Run", functionName: "onRun" }
  ];
  SpreadsheetApp.getActiveSpreadsheet()!.addMenu("OpenBadges", menus);
}

function onInstall(): void {
  onOpen();
}

function onSaveConfiguration(props: SheetsUserProperties): void {
  // TODO: Validate the provided config, throw errors if validation fails.
  // Save the properties so they can be used later.
  PropertiesService.getDocumentProperties().setProperties(props);
}

function onRun(): void {
  const camelCase = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

  const ss = SpreadsheetApp.getActiveSheet();
  const rows = ss
    .getRange(1, 1, ss.getLastRow(), ss.getLastColumn())
    .getValues();

  const headers = rows.splice(0, 1);
  const body: ActivityEventRequest[] = [];

  rows.forEach((row, index) => {
    const payload = {} as ActivityEventRequest;

    row.map((cell) => cell.toString()).forEach((cell) => {
      const key = headers[0][index].toString();
      payload[camelCase(key)] = cell;
    });
    body.push(payload);
  });

  return;
}

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
