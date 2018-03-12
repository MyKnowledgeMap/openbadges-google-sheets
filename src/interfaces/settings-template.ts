/**
 * Interface for Settings Template.
 * @interface SettingsTemplate
 * @extends {GoogleAppsScript.HTML.HtmlTemplate}
 */
interface FormsSettingsTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  int1: string;
  int2: string;
  date1: string;
}

interface SheetsSettingsTemplate extends FormsSettingsTemplate {
  timestamp: string;
}
