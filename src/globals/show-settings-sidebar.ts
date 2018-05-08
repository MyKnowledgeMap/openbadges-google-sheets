import { DEFAULT_PROPS } from "../constants";

/**
 * Show the settings sidebar to the user so they can manage their settings and configuration.
 *
 * @export
 * @returns {void}
 */
export function showSettingsSidebar(): void {
  const props = {
    ...DEFAULT_PROPS,
    ...PropertiesService.getDocumentProperties().getProperties()
  };

  const template = HtmlService.createTemplate(
    require("./../templates/sheets-settings.sidebar.html")
  ) as SettingsHtmlTemplate;

  const html = Object.assign(template, props)
    .evaluate()
    .setTitle("Settings");

  return SpreadsheetApp.getUi().showSidebar(html);
}
