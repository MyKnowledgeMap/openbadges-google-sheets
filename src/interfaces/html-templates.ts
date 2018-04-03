/**
 * Interface for Settings Template.
 * @interface SheetsSettingsTemplate
 * @extends {FormsSettingsTemplate}
 */
interface ISheetsSettingsTemplate extends GoogleAppsScript.HTML.HtmlTemplate {
  [key: string]: string | any;
  apiKey: string;
  apiUrl: string;
  apiToken: string;
  activityId: string;
  text1: string;
  text2: string;
  int1: string;
  int2: string;
  date1: string;
  activityTime: string;
  userId: string;
  firstName: string;
  lastName: string;
  verified: string;
  issued: string;
}
